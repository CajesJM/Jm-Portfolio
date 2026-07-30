import { motion } from "framer-motion";
import "../styles/Contact.css";

export default function Contact() {
  return (
    <footer id="contact" className="contact">
      <div className="container contact__inner">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
        >
          <span className="eyebrow">Have an idea?</span>
          <h2>Let’s make it<br /><em>work beautifully.</em></h2>
        </motion.div>
        <a className="contact__circle" href="mailto:markcajes24@gmail.com" aria-label="Email John Mark">
          <span className="mono">Start a conversation</span>
          <strong>↗</strong>
        </a>
      </div>
      <div className="container contact__bottom">
        <p className="mono">© 2026 JM Cajes</p>
        <div>
          <a className="mono" href="https://github.com/CajesJM" target="_blank" rel="noreferrer">GitHub ↗</a>
          <a className="mono" href="https://www.linkedin.com/in/john-mark-cajes-197020422/" target="_blank" rel="noreferrer">LinkedIn ↗</a>
          <a className="mono" href="#top">Back to top ↑</a>
        </div>
      </div>
    </footer>
  );
}
