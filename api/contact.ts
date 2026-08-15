const MAX_MESSAGE_LENGTH = 1000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  message?: unknown;
  company?: unknown;
  startedAt?: unknown;
};

function json(data: object, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
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

    const emailResponse = await fetch("https://api.resend.com/emails", {
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

    if (!emailResponse.ok) {
      const providerMessage = await emailResponse.text();
      console.error(
        "Resend rejected the contact email:",
        emailResponse.status,
        providerMessage,
      );
      return json(
        {
          message: "Your message could not be sent. Please try again shortly.",
        },
        502,
      );
    }

    return json({ message: "Message sent." });
  },
};
