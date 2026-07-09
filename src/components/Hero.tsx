import { motion } from "framer-motion";
import InspectFrame from "./InspectFrame";
import "./Hero.css";

export default function Hero() {
  return (
    <section id="top" className="hero">
      <div className="container hero__grid">
        <div className="hero__copy">
          <motion.span
            className="eyebrow"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Available for new projects
          </motion.span>

          <motion.h1
            className="hero__title"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            I design interfaces
            <br />
            that hold up under <span className="hero__accent">inspection.</span>
          </motion.h1>

          <motion.p
            className="hero__sub"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Product designer focused on complex, data-heavy tools — where clarity
            under pressure matters more than decoration. Based in Manila, working
            with teams everywhere.
          </motion.p>

          <motion.div
            className="hero__actions"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <a href="#work" className="btn btn-primary">
              View selected work →
            </a>
            <a href="#contact" className="btn btn-ghost">
              Get in touch
            </a>
          </motion.div>
        </div>

        <motion.div
          className="hero__visual"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <InspectFrame label="hero/cover.fig">
            <div className="mock-frame" aria-hidden="true">
              <div className="mock-frame__bar">
                <span />
                <span />
                <span />
              </div>
              <div className="mock-frame__body">
                <div className="mock-frame__sidebar">
                  <div className="mock-line w-60" />
                  <div className="mock-line w-40" />
                  <div className="mock-line w-70" />
                  <div className="mock-line w-30" />
                </div>
                <div className="mock-frame__main">
                  <div className="mock-card" />
                  <div className="mock-card" />
                  <div className="mock-chart">
                    {[40, 65, 30, 80, 55, 90, 45].map((h, i) => (
                      <div key={i} className="mock-chart__bar" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </InspectFrame>
        </motion.div>
      </div>
    </section>
  );
}
