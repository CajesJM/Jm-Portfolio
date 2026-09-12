const MAX_MESSAGE_LENGTH = 1000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTACT_COOLDOWN_SECONDS = 5 * 60;
const CONTACT_COOLDOWN_PREFIX = "contact:cooldown:";

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  message?: unknown;
  company?: unknown;
  startedAt?: unknown;
  turnstileToken?: unknown;
};

type TurnstileResult = {
  success?: boolean;
  hostname?: string;
  "error-codes"?: string[];
};

type RedisResponse = {
  result?: unknown;
  error?: string;
};

function json(
  data: object,
  status = 200,
  additionalHeaders: Record<string, string> = {},
) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...additionalHeaders,
    },
  });
}

function cleanSingleLine(value: unknown, maxLength: number) {
  return typeof value === "string"
    ? value
        .replace(/[\r\n]+/g, " ")
        .trim()
        .slice(0, maxLength)
    : "";
}

function getRedisConfig() {
  const url =
    process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

async function redisCommand(
  config: { url: string; token: string },
  command: Array<string | number>,
) {
  const response = await fetch(config.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
  });
  const payload = (await response.json()) as RedisResponse;

  if (!response.ok || payload.error) {
    throw new Error(payload.error || `Redis returned ${response.status}.`);
  }

  return payload.result;
}

async function createVisitorKey(request: Request, salt: string) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const visitorIp = forwardedFor?.split(",")[0]?.trim() || "unknown-ip";
  const userAgent = cleanSingleLine(
    request.headers.get("user-agent") || "unknown-agent",
    240,
  );
  const source = new TextEncoder().encode(`${salt}|${visitorIp}|${userAgent}`);
  const digest = await crypto.subtle.digest("SHA-256", source);

  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

async function reserveCooldown(
  config: { url: string; token: string },
  visitorKey: string,
) {
  const key = `${CONTACT_COOLDOWN_PREFIX}${visitorKey}`;
  const result = await redisCommand(config, [
    "SET",
    key,
    String(Date.now()),
    "EX",
    CONTACT_COOLDOWN_SECONDS,
    "NX",
  ]);

  if (result === "OK") return { allowed: true, key, retryAfter: 0 };

  const ttl = await redisCommand(config, ["TTL", key]);
  const retryAfter =
    typeof ttl === "number" && ttl > 0 ? ttl : CONTACT_COOLDOWN_SECONDS;
  return { allowed: false, key, retryAfter };
}

async function releaseCooldown(
  config: { url: string; token: string },
  key: string,
) {
  try {
    await redisCommand(config, ["DEL", key]);
  } catch (error) {
    console.error("Could not release contact cooldown:", error);
  }
}

export default {
  async fetch(request: Request) {
    if (request.method !== "POST") {
      return json({ message: "Method not allowed." }, 405);
    }

    const origin = request.headers.get("origin");
    if (origin && new URL(origin).host !== new URL(request.url).host) {
      return json({ message: "Request origin is not allowed." }, 403);
    }

    let body: ContactPayload;
    try {
      body = (await request.json()) as ContactPayload;
    } catch {
      return json({ message: "Invalid request." }, 400);
    }

    // Quietly accept bot submissions so automated senders do not retry.
    if (typeof body.company === "string" && body.company.trim()) {
      return json({ message: "Message sent." });
    }

    const name = cleanSingleLine(body.name, 80);
    const email = cleanSingleLine(body.email, 254).toLowerCase();
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const startedAt = typeof body.startedAt === "number" ? body.startedAt : 0;
    const completionTime = Date.now() - startedAt;

    if (name.length < 2) {
      return json({ message: "Please enter your name." }, 400);
    }
    if (!EMAIL_PATTERN.test(email)) {
      return json({ message: "Please enter a valid email address." }, 400);
    }
    if (message.length < 20 || message.length > MAX_MESSAGE_LENGTH) {
      return json(
        { message: "Your message must be between 20 and 1,000 characters." },
        400,
      );
    }
    if (completionTime < 2000 || completionTime > 2 * 60 * 60 * 1000) {
      return json({ message: "Please reopen the form and try again." }, 400);
    }

    const turnstileToken = cleanSingleLine(body.turnstileToken, 2048);
    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;

    if (!turnstileSecret) {
      console.error("Turnstile is not configured.");
      return json(
        { message: "Human verification is temporarily unavailable." },
        503,
      );
    }

    if (!turnstileToken) {
      return json({ message: "Please complete the human verification." }, 400);
    }

    const verificationBody = new URLSearchParams({
      secret: turnstileSecret,
      response: turnstileToken,
    });
    const forwardedFor = request.headers.get("x-forwarded-for");
    const visitorIp = forwardedFor?.split(",")[0]?.trim();
    if (visitorIp) verificationBody.set("remoteip", visitorIp);

    let turnstileResult: TurnstileResult;
    try {
      const verificationResponse = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: verificationBody,
        },
      );

      if (!verificationResponse.ok) {
        throw new Error(`Turnstile returned ${verificationResponse.status}.`);
      }

      turnstileResult = (await verificationResponse.json()) as TurnstileResult;
    } catch (error) {
      console.error("Turnstile verification request failed:", error);
      return json(
        { message: "Human verification is temporarily unavailable." },
        502,
      );
    }

    const requestHostname = new URL(request.url).hostname;
    const verifiedHostname = turnstileResult.hostname;
    const hostnameMatches =
      !verifiedHostname ||
      verifiedHostname === requestHostname ||
      verifiedHostname === "dummy-key-pass";
    if (
      !turnstileResult.success ||
      !hostnameMatches
    ) {
      console.warn(
        "Turnstile rejected a contact request:",
        turnstileResult["error-codes"] ?? [],
      );
      return json(
        { message: "Human verification failed. Please try again." },
        403,
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    const recipient = process.env.CONTACT_EMAIL;
    const sender =
      process.env.CONTACT_FROM_EMAIL || "JM Portfolio <onboarding@resend.dev>";

    if (!apiKey || !recipient) {
      console.error("Contact form environment variables are not configured.");
      return json(
        { message: "The contact form is temporarily unavailable." },
        503,
      );
    }

    const redisConfig = getRedisConfig();
    if (!redisConfig) {
      console.error("Persistent contact rate limiting is not configured.");
      return json(
        { message: "Message protection is temporarily unavailable." },
        503,
      );
    }

    let cooldown: Awaited<ReturnType<typeof reserveCooldown>>;
    try {
      const visitorKey = await createVisitorKey(request, turnstileSecret);
      cooldown = await reserveCooldown(redisConfig, visitorKey);
    } catch (error) {
      console.error("Contact rate-limit check failed:", error);
      return json(
        { message: "Message protection is temporarily unavailable." },
        503,
      );
    }

    if (!cooldown.allowed) {
      return json(
        {
          message: "Please wait before sending another message.",
          retryAfter: cooldown.retryAfter,
        },
        429,
        { "Retry-After": String(cooldown.retryAfter) },
      );
    }

    let emailResponse: Response;
    try {
      emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": crypto.randomUUID(),
          "User-Agent": "jm-cajes-portfolio/1.0",
        },
        body: JSON.stringify({
          from: sender,
          to: [recipient],
          reply_to: email,
          subject: `Portfolio inquiry from ${name}`,
          text: [
            "New portfolio inquiry",
            "",
            `Name: ${name}`,
            `Email: ${email}`,
            "",
            "Message:",
            message,
          ].join("\n"),
        }),
      });
    } catch (error) {
      console.error("Resend request failed:", error);
      await releaseCooldown(redisConfig, cooldown.key);
      return json(
        {
          message: "Your message could not be sent. Please try again shortly.",
        },
        502,
      );
    }

    if (!emailResponse.ok) {
      const providerMessage = await emailResponse.text();
      console.error(
        "Resend rejected the contact email:",
        emailResponse.status,
        providerMessage,
      );
      await releaseCooldown(redisConfig, cooldown.key);
      return json(
        {
          message: "Your message could not be sent. Please try again shortly.",
        },
        502,
      );
    }

    return json({
      message: "Message sent.",
      cooldownSeconds: CONTACT_COOLDOWN_SECONDS,
    });
  },
};
