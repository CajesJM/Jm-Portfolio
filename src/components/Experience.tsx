import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "../styles/Experience.css";

const RESUME_PATH = "/JM-Cajes-Resume.pdf";
const RESUME_VIEWER_PATH = `${RESUME_PATH}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`;

export default function Experience() {
  const [resumeOpen, setResumeOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  function openResume() {
    setResumeOpen(true);
  }

  function closeResume() {
    setResumeOpen(false);
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  }

  useEffect(() => {
    if (!resumeOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (
        (event.ctrlKey || event.metaKey) &&
        ["p", "s"].includes(event.key.toLowerCase())
      ) {
        event.preventDefault();
        return;
      }

      if (event.key === "Escape") {
        closeResume();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          "button:not([disabled]), a[href], iframe",
        ),
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

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
  }, [resumeOpen]);

  return (
    <>
      <section id="experience" className="experience">
        <div className="container experience__header">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
          >
            <span className="eyebrow">Experience / 2025—26</span>
            <h2 className="section-heading">Built for real work.</h2>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: 0.1 }}
          >
            Applying development and visual thinking to client needs, not just
            classroom exercises.
          </motion.p>
        </div>

        <div className="container experience__list">
          <motion.article
            className="experience-item"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-70px" }}
            transition={{ duration: 0.65 }}
          >
            <div className="experience-item__index">
              <span className="mono">01 / Current</span>
              <span
                className="experience-item__status"
                aria-label="Current role"
              />
            </div>
            <div className="experience-item__title">
              <h3>Wipe It Good Trading</h3>
              <p className="mono">2025—2026 · Client work</p>
            </div>
            <div className="experience-item__details">
              <p className="experience-item__role">
                Web System Developer
                <br />
                <span>Product Photo Editor</span>
              </p>
              <p>
                Built and improved the company’s online ordering experience
                while maintaining clear product imagery and working directly
                with the client to turn business needs into practical features.
              </p>
              <ul className="experience-item__tags">
                <li className="mono">Full-stack development</li>
                <li className="mono">Client collaboration</li>
                <li className="mono">Product imagery</li>
              </ul>
            </div>
          </motion.article>

          <div className="experience__resume">
            <div>
              <span className="mono">The complete record</span>
              <p>Experience, projects, education, and skills in one place.</p>
            </div>
            <button
              ref={triggerRef}
              className="button experience__resume-button"
              type="button"
              aria-haspopup="dialog"
              onClick={openResume}
            >
              View résumé <span aria-hidden="true">↗</span>
            </button>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {resumeOpen && (
          <motion.div
            className="resume-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeResume();
            }}
          >
            <motion.div
              ref={dialogRef}
              className="resume-modal__panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="resume-modal-title"
              initial={{ opacity: 0, y: 24, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.985 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <header className="resume-modal__bar">
                <div>
                  <span className="mono">Résumé / PDF</span>
                  <strong id="resume-modal-title">John Mark Cajes</strong>
                </div>
                <div className="resume-modal__actions">
                  <button
                    ref={closeButtonRef}
                    type="button"
                    aria-label="Close résumé"
                    onClick={closeResume}
                  >
                    <span className="mono">Close</span>
                    <strong aria-hidden="true">×</strong>
                  </button>
                </div>
              </header>
              <div
                className="resume-modal__viewer"
                onContextMenu={(event) => event.preventDefault()}
              >
                <iframe
                  src={RESUME_VIEWER_PATH}
                  title="John Mark Cajes résumé — view only"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
