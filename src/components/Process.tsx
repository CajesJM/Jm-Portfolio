import { motion } from "framer-motion";
import "./Process.css";

const STEPS = [
  {
    title: "Frame the real problem",
    body: "Sit with support tickets, analytics, and stakeholder interviews before opening Figma. Most 'redesigns' are actually the wrong problem stated confidently.",
  },
  {
    title: "Design in the material",
    body: "Prototype with real data and real edge cases, not lorem ipsum — messy states are where interfaces actually break.",
  },
  {
    title: "Ship, measure, revise",
    body: "Instrument the parts that matter, watch what people actually do, and treat the first release as a hypothesis, not a finish line.",
  },
];

export default function Process() {
  return (
    <section id="process" className="process">
      <div className="container">
        <span className="eyebrow">How I work</span>
        <h2 className="process__heading">A short, honest process.</h2>

        <div className="process__list">
          {STEPS.map((s, i) => (
            <motion.div
              className="process__step"
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <span className="process__index mono">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="process__title">{s.title}</h3>
                <p className="process__body">{s.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
