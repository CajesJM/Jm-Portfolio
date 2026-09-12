import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import TurnstileWidget from "./TurnstileWidget";
import "../styles/Contact.css";

type FormStatus = "idle" | "sending" | "success" | "error";
type ModalOrigin = { x: number; y: number; width: number; height: number };
type ContactResponse = {
  message?: string;
  cooldownSeconds?: number;
  retryAfter?: number;
};

const CONTACT_COOLDOWN_STORAGE_KEY = "jm-contact-cooldown-until";
const DEFAULT_CONTACT_COOLDOWN_SECONDS = 5 * 60;

function formatCooldown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function getElementCenter(element: HTMLElement): ModalOrigin {
  const bounds = element.getBoundingClientRect();
  return {
    x: bounds.left + bounds.width / 2,
    y: bounds.top + bounds.height / 2,
    width: bounds.width,
    height: bounds.height,
  };
}

export default function Contact() {
  const reduceMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const [modalOrigin, setModalOrigin] = useState<ModalOrigin>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaResetKey, setCaptchaResetKey] = useState(0);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const openedAt = useRef(Date.now());
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastTriggerRef = useRef<HTMLElement | null>(null);

  function beginCooldown(seconds: number) {
    const safeSeconds = Math.max(1, Math.ceil(seconds));
    const cooldownUntil = Date.now() + safeSeconds * 1000;
    setCooldownRemaining(safeSeconds);
    try {
      window.localStorage.setItem(
        CONTACT_COOLDOWN_STORAGE_KEY,
        String(cooldownUntil),
      );
    } catch {
      // Server-side enforcement remains authoritative if storage is unavailable.
    }
  }

  function openModal(origin?: ModalOrigin) {
    lastTriggerRef.current = document.activeElement as HTMLElement | null;
    setModalOrigin(
      origin ??
        (lastTriggerRef.current
          ? getElementCenter(lastTriggerRef.current)
          : {
              x: window.innerWidth / 2,
              y: window.innerHeight / 2,
              width: 0,
              height: 0,
            }),
    );
    openedAt.current = Date.now();
    setStatus("idle");
    setErrorMessage("");
    setMessage("");
    setCaptchaToken("");
    setCaptchaResetKey((current) => current + 1);
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
    window.setTimeout(() => lastTriggerRef.current?.focus(), 0);
  }

  const setDialogNode = useCallback(
    (node: HTMLDivElement | null) => {
      dialogRef.current = node;
      if (!node) return;

      const panel = node.getBoundingClientRect();
      node.style.transformOrigin = `${modalOrigin.x - panel.left}px ${modalOrigin.y - panel.top}px`;
    },
    [modalOrigin],
  );

  useEffect(() => {
    function syncCooldown() {
      try {
        const storedUntil = Number(
          window.localStorage.getItem(CONTACT_COOLDOWN_STORAGE_KEY),
        );
        const remaining = Number.isFinite(storedUntil)
          ? Math.max(0, Math.ceil((storedUntil - Date.now()) / 1000))
          : 0;
        setCooldownRemaining(remaining);
        if (remaining === 0) {
          window.localStorage.removeItem(CONTACT_COOLDOWN_STORAGE_KEY);
        }
      } catch {
        setCooldownRemaining(0);
      }
    }

    syncCooldown();
    const timer = window.setInterval(syncCooldown, 1000);
    window.addEventListener("storage", syncCooldown);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("storage", syncCooldown);
    };
  }, []);

  useEffect(() => {
    function handleOpenModal(event: Event) {
      openModal((event as CustomEvent<ModalOrigin>).detail);
    }

    window.addEventListener("open-contact-modal", handleOpenModal);
    return () =>
      window.removeEventListener("open-contact-modal", handleOpenModal);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeModal();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          "button:not([disabled]), input:not([disabled]), textarea:not([disabled]), a[href]",
        ),
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (cooldownRemaining > 0) {
      setStatus("error");
      setErrorMessage(
        `Please wait ${formatCooldown(cooldownRemaining)} before sending another message.`,
      );
      return;
    }

    if (!captchaToken) {
      setStatus("error");
      setErrorMessage("Please complete the human verification first.");
      return;
    }

    setStatus("sending");
    setErrorMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          message: formData.get("message"),
          company: formData.get("company"),
          startedAt: openedAt.current,
          turnstileToken: captchaToken,
        }),
      });

      const result = (await response.json()) as ContactResponse;

      if (!response.ok) {
        if (response.status === 429 && result.retryAfter) {
          beginCooldown(result.retryAfter);
        }
        throw new Error(result.message || "Your message could not be sent.");
      }

      beginCooldown(
        result.cooldownSeconds ?? DEFAULT_CONTACT_COOLDOWN_SECONDS,
      );
      form.reset();
      setMessage("");
      setStatus("success");
    } catch (error) {
      setCaptchaToken("");
      setCaptchaResetKey((current) => current + 1);
      setStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    }
  }

  const revealRadius =
    typeof window === "undefined"
      ? 0
      : Math.hypot(
          Math.max(modalOrigin.x, window.innerWidth - modalOrigin.x),
          Math.max(modalOrigin.y, window.innerHeight - modalOrigin.y),
        ) + 48;
  const closedClipPath = `ellipse(${modalOrigin.width / 2}px ${modalOrigin.height / 2}px at ${modalOrigin.x}px ${modalOrigin.y}px)`;
  const openClipPath = `ellipse(${revealRadius}px ${revealRadius}px at ${modalOrigin.x}px ${modalOrigin.y}px)`;

  return (
    <>
      <footer id="contact" className="contact">
        <div className="container contact__inner">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
          >
            <span className="eyebrow">Have a project in mind?</span>
            <h2>
              Let’s build something
              <br />
              <em>that works.</em>
            </h2>
          </motion.div>
          <button
            className="contact__circle"
            type="button"
            aria-haspopup="dialog"
            onClick={(event) =>
              openModal(getElementCenter(event.currentTarget))
            }
          >
            <span className="mono">Start a conversation</span>
            <strong aria-hidden="true">↗</strong>
          </button>
        </div>
        <div className="container contact__bottom">
          <div className="contact__bottom-links">
            <a
              className="mono contact__social-link"
              href="https://github.com/CajesJM"
              target="_blank"
              rel="noreferrer"
            >
              <svg
                className="contact__social-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 2C6.48 2 2 6.58 2 12.23c0 4.52 2.87 8.35 6.84 9.71.5.1.68-.22.68-.49 0-.24-.01-1.05-.01-1.9-2.78.62-3.37-1.2-3.37-1.2-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.62.07-.62 1 .08 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.64-1.36-2.22-.26-4.56-1.14-4.56-5.05 0-1.12.39-2.03 1.03-2.74-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 6.72a9.3 9.3 0 0 1 2.5.35c1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.71 1.03 1.62 1.03 2.74 0 3.92-2.34 4.79-4.57 5.04.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.59.69.49A10.25 10.25 0 0 0 22 12.23C22 6.58 17.52 2 12 2Z" />
              </svg>
              <span>GitHub</span>
              <span aria-hidden="true">↗</span>
            </a>
            <a
              className="mono contact__social-link"
              href="https://www.linkedin.com/in/john-mark-cajes-197020422/"
              target="_blank"
              rel="noreferrer"
            >
              <svg
                className="contact__social-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M5.34 7.67A2.17 2.17 0 1 0 5.34 3.33a2.17 2.17 0 0 0 0 4.34ZM3.48 20.67H7.2V9.33H3.48v11.34ZM9.43 9.33h3.57v1.55h.05c.5-.96 1.71-1.97 3.52-1.97 3.77 0 4.46 2.48 4.46 5.7v6.06h-3.72V15.3c0-1.28-.02-2.93-1.79-2.93-1.79 0-2.06 1.4-2.06 2.84v5.46H9.43V9.33Z" />
              </svg>
              <span>LinkedIn</span>
              <span aria-hidden="true">↗</span>
            </a>
            <a className="mono" href="#top">
              Back to top ↑
            </a>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="contact-modal"
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, clipPath: closedClipPath }
            }
            animate={
              reduceMotion
                ? { opacity: 1 }
                : { opacity: 1, clipPath: openClipPath }
            }
            exit={
              reduceMotion
                ? { opacity: 0 }
                : {
                    opacity: 0,
                    clipPath: closedClipPath,
                    transition: {
                      duration: 0.46,
                      ease: [0.4, 0, 0.2, 1],
                    },
                  }
            }
            transition={{
              duration: reduceMotion ? 0.16 : 0.58,
              ease: [0.16, 1, 0.3, 1],
            }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeModal();
            }}
          >
            <motion.div
              ref={setDialogNode}
              className="contact-modal__panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="contact-modal-title"
              initial={
                reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.06 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.06 }}
              transition={{
                duration: reduceMotion ? 0.16 : 0.38,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <div className="contact-modal__topbar">
                <span className="mono">New project inquiry</span>
                <button
                  ref={closeButtonRef}
                  className="contact-modal__close"
                  type="button"
                  aria-label="Close contact form"
                  onClick={closeModal}
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>

              {status === "success" ? (
                <div className="contact-modal__success" aria-live="polite">
                  <span
                    className="contact-modal__success-mark"
                    aria-hidden="true"
                  >
                    ✓
                  </span>
                  <p className="mono">Message received</p>
                  <h2 id="contact-modal-title">Thanks for reaching out.</h2>
                  <p>
                    I’ll read your message and reply to the email you provided.
                  </p>
                  {cooldownRemaining > 0 && (
                    <p
                      className="contact-modal__cooldown mono"
                      aria-live="polite"
                    >
                      Another message can be sent in{" "}
                      {formatCooldown(cooldownRemaining)}
                    </p>
                  )}
                  <button
                    className="contact-form__submit"
                    type="button"
                    onClick={closeModal}
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <div className="contact-modal__heading">
                    <span className="eyebrow">Let’s talk</span>
                    <h2 id="contact-modal-title">
                      Tell me about your project.
                    </h2>
                    <p>
                      Share a few details and I’ll get back to you by email.
                    </p>
                  </div>

                  <form className="contact-form" onSubmit={handleSubmit}>
                    <div className="contact-form__row">
                      <label>
                        <span className="mono">Your name</span>
                        <input
                          name="name"
                          type="text"
                          autoComplete="name"
                          minLength={2}
                          maxLength={80}
                          placeholder="Zhey M"
                          required
                        />
                      </label>
                      <label>
                        <span className="mono">Email address</span>
                        <input
                          name="email"
                          type="email"
                          autoComplete="email"
                          maxLength={254}
                          placeholder="zhey@example.com"
                          required
                        />
                      </label>
                    </div>

                    <label>
                      <span className="mono">Project details</span>
                      <textarea
                        name="message"
                        rows={6}
                        minLength={20}
                        maxLength={1000}
                        placeholder="What are you building, and how can I help?"
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        required
                      />
                      <span
                        className={`contact-form__counter mono ${
                          message.length >= 900 ? "is-near" : ""
                        }`}
                        aria-hidden="true"
                      >
                        {message.length} / 1000
                      </span>
                    </label>

                    <label
                      className="contact-form__honeypot"
                      aria-hidden="true"
                    >
                      Company website
                      <input
                        name="company"
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                      />
                    </label>

                    <div className="contact-form__verification-actions">
                      <div className="contact-form__verification">
                        <span className="mono">Human verification</span>
                        <TurnstileWidget
                          onTokenChange={setCaptchaToken}
                          resetKey={captchaResetKey}
                        />
                      </div>

                      <p
                        className={`contact-form__status ${status === "error" ? "is-error" : ""}`}
                        aria-live="polite"
                      >
                        {status === "error"
                          ? errorMessage
                          : cooldownRemaining > 0
                            ? `Another message can be sent in ${formatCooldown(cooldownRemaining)}.`
                          : captchaToken
                            ? "Verified. Your details are used only to respond to this inquiry."
                            : "Complete the verification before sending."}
                      </p>
                      <button
                        className={`contact-form__submit ${status === "sending" ? "is-sending" : ""} ${cooldownRemaining > 0 ? "is-cooling" : ""}`}
                        type="submit"
                        disabled={
                          status === "sending" ||
                          !captchaToken ||
                          cooldownRemaining > 0
                        }
                      >
                        {status === "sending"
                          ? "Sending…"
                          : cooldownRemaining > 0
                            ? `Send again in ${formatCooldown(cooldownRemaining)}`
                            : "Send message ↗"}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
