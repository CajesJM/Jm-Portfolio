import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "../styles/Contact.css";

type FormStatus = "idle" | "sending" | "success" | "error";

export default function Contact() {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const openedAt = useRef(Date.now());
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  function openModal() {
    openedAt.current = Date.now();
    setStatus("idle");
    setErrorMessage("");
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  }

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
          'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), a[href]',
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
        }),
      });

      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(result.message || "Your message could not be sent.");
      }

      form.reset();
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    }
  }

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
            ref={triggerRef}
            className="contact__circle"
            type="button"
            aria-haspopup="dialog"
            onClick={openModal}
          >
            <span className="mono">Start a conversation</span>
            <strong aria-hidden="true">↗</strong>
          </button>
        </div>
        <div className="container contact__bottom">
          <p className="mono">© 2026 JM Cajes</p>
          <div>
            <a
              className="mono"
              href="https://github.com/CajesJM"
              target="_blank"
              rel="noreferrer"
            >
              GitHub ↗
            </a>
            <a
              className="mono"
              href="https://www.linkedin.com/in/john-mark-cajes-197020422/"
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn ↗
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeModal();
            }}
          >
            <motion.div
              ref={dialogRef}
              className="contact-modal__panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="contact-modal-title"
              initial={{ opacity: 0, y: 28, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
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
                  <span className="contact-modal__success-mark" aria-hidden="true">✓</span>
                  <p className="mono">Message received</p>
                  <h2 id="contact-modal-title">Thanks for reaching out.</h2>
                  <p>I’ll read your message and reply to the email you provided.</p>
                  <button className="contact-form__submit" type="button" onClick={closeModal}>
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <div className="contact-modal__heading">
                    <span className="eyebrow">Let’s talk</span>
                    <h2 id="contact-modal-title">Tell me about your project.</h2>
                    <p>Share a few details and I’ll get back to you by email.</p>
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
                          placeholder="Jane Smith"
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
                          placeholder="jane@example.com"
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
                        maxLength={3000}
                        placeholder="What are you building, and how can I help?"
                        required
                      />
                    </label>

                    <label className="contact-form__honeypot" aria-hidden="true">
                      Company website
                      <input name="company" type="text" tabIndex={-1} autoComplete="off" />
                    </label>

                    <div className="contact-form__footer">
                      <p className={`contact-form__status ${status === "error" ? "is-error" : ""}`} aria-live="polite">
                        {status === "error"
                          ? errorMessage
                          : "Your details are used only to respond to this inquiry."}
                      </p>
                      <button className="contact-form__submit" type="submit" disabled={status === "sending"}>
                        {status === "sending" ? "Sending…" : "Send message ↗"}
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
