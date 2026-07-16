import { motion } from "framer-motion";
import "../styles/Process.css";

const STEPS = [
  {
    title: "Understand the context first",
    body: "I start by understanding the real user pain points—whether it's manual attendance tracking, confusing voting systems, or fragmented brand identities. I look at existing workflows, user feedback, and technical constraints before writing a single line of code.",
  },
  {
    title: "Build with real data",
    body: "Prototypes and MVPs should reflect reality. I use actual data structures, real edge cases, and practical constraints from the start—whether it's Firebase for real-time updates, C# for backend logic, or React Native for mobile experiences.",
  },
  {
    title: "Iterate based on feedback",
    body: "Shipping is just the beginning. I monitor how users actually interact with the system, gather feedback, and treat every release as a chance to improve. Features like QR check-ins, secure voting, and design systems all evolve through continuous iteration.",
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
              <span className="process__index mono">
                {String(i + 1).padStart(2, "0")}
              </span>
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
