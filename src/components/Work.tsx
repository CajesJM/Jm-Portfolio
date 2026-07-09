import { motion } from "framer-motion";
import InspectFrame from "./InspectFrame";
import "./Work.css";

const PROJECTS = [
  {
    tag: "case-study/01",
    title: "Redesigning a claims dashboard for insurance analysts",
    summary:
      "Cut average triage time by 38% by restructuring a dense, table-heavy workflow around task priority instead of raw data order.",
    stack: ["Figma", "Design systems", "User research"],
    wide: true,
  },
  {
    tag: "case-study/02",
    title: "Onboarding flow for a fintech API platform",
    summary: "Reduced time-to-first-integration from 3 days to 40 minutes.",
    stack: ["React", "Prototyping"],
    wide: false,
  },
  {
    tag: "case-study/03",
    title: "Design system for a healthcare scheduling tool",
    summary: "Unified 4 product teams under one component library.",
    stack: ["Tokens", "Storybook"],
    wide: false,
  },
];

export default function Work() {
  return (
    <section id="work" className="work">
      <div className="container">
        <motion.span
          className="eyebrow"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Selected work
        </motion.span>
        <motion.h2
          className="work__heading"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Three problems worth the depth.
        </motion.h2>

        <div className="work__grid">
          {PROJECTS.map((p, i) => (
            <motion.article
              key={p.tag}
              className={`work-card ${p.wide ? "work-card--wide" : ""}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <InspectFrame label={p.tag}>
                <div className="work-card__thumb" aria-hidden="true">
                  <div className="work-card__thumb-grid" />
                </div>
              </InspectFrame>

              <div className="work-card__body">
                <h3 className="work-card__title">{p.title}</h3>
                <p className="work-card__summary">{p.summary}</p>
                <ul className="work-card__stack mono">
                  {p.stack.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
                <a href="#" className="work-card__link mono">
                  Read case study →
                </a>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
