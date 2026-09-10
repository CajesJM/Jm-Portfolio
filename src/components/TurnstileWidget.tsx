import { useEffect, useRef, useState } from "react";

const TURNSTILE_SCRIPT_ID = "cloudflare-turnstile-script";
const TURNSTILE_SCRIPT_URL =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      theme: "light" | "dark";
      size: "flexible";
      appearance: "always";
      callback: (token: string) => void;
      "expired-callback": () => void;
      "timeout-callback": () => void;
      "error-callback": (errorCode?: string) => boolean;
    },
  ) => string;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let turnstileLoader: Promise<TurnstileApi> | null = null;

function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (turnstileLoader) return turnstileLoader;

  turnstileLoader = new Promise<TurnstileApi>((resolve, reject) => {
    const resolveApi = () => {
      if (window.turnstile) resolve(window.turnstile);
      else reject(new Error("Turnstile did not initialize."));
    };

    const existingScript = document.getElementById(
      TURNSTILE_SCRIPT_ID,
    ) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener("load", resolveApi, { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Turnstile could not be loaded.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = TURNSTILE_SCRIPT_ID;
    script.src = TURNSTILE_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", resolveApi, { once: true });
    script.addEventListener(
      "error",
      () => reject(new Error("Turnstile could not be loaded.")),
      { once: true },
    );
    document.head.appendChild(script);
  });

  return turnstileLoader;
}

export default function TurnstileWidget({
  onTokenChange,
  resetKey,
}: {
  onTokenChange: (token: string) => void;
  resetKey: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onTokenChange);
  const [message, setMessage] = useState("");
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  callbackRef.current = onTokenChange;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!siteKey) {
      setMessage("Human verification is not configured.");
      callbackRef.current("");
      return;
    }

    let disposed = false;
    let widgetId = "";
    setMessage("");
    callbackRef.current("");

    loadTurnstile()
      .then((turnstile) => {
        if (disposed || !containerRef.current) return;

        widgetId = turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme:
            document.documentElement.dataset.theme === "ink"
              ? "dark"
              : "light",
          size: "flexible",
          appearance: "always",
          callback: (token) => {
            setMessage("");
            callbackRef.current(token);
          },
          "expired-callback": () => {
            setMessage("Verification expired. Please check the box again.");
            callbackRef.current("");
          },
          "timeout-callback": () => {
            setMessage("Verification timed out. Please try again.");
            callbackRef.current("");
          },
          "error-callback": () => {
            setMessage("Verification failed to load. Please try again.");
            callbackRef.current("");
            return true;
          },
        });
      })
      .catch(() => {
        if (disposed) return;
        setMessage("Verification is temporarily unavailable.");
        callbackRef.current("");
      });

    return () => {
      disposed = true;
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [resetKey, siteKey]);

  return (
    <div className="contact-form__verification-widget">
      <div ref={containerRef} />
      {message && (
        <p className="contact-form__verification-error" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
