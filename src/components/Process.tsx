import { motion } from "framer-motion";
import "../styles/Process.css";

const capabilities = [
  [
    "I",
    "Product thinking",
    "Turning a rough idea into a focused, usable product.",
  ],
  [
    "II",
    "UI/UX design",
    "Clear structure, expressive interfaces, and thoughtful interaction.",
  ],
  [
    "III",
    "Frontend development",
    "Responsive React experiences built with maintainable TypeScript.",
  ],
  [
    "IV",
    "Backend development",
    "APIs, databases, authentication, and server-side logic built for reliable applications.",
  ],
  [
    "V",
    "Mobile development",
    "Cross-platform experiences with Flutter, React Native and Expo.",
  ],
];

export default function Process() {
  return (
    <section id="about" className="process">
      <div className="container process__intro">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="eyebrow">About / Capabilities</span>
          <h2 className="section-heading">
            Clear thinking.
            <br />
            Dependable development.
          </h2>
        </motion.div>
        <div className="process__bio">
          <p className="process__lead">
            I’m an Information Technology student and full-stack developer with
            hands-on experience leading software projects and building
            applications for real users.
          </p>
          <p>
            Most of what I know comes from hands-on projects. I’m currently
            improving my skills in full-stack development, mobile applications,
            UI/UX design, and practical uses of AI.
          </p>
          <a
            className="mono"
            href="https://github.com/CajesJM"
            target="_blank"
            rel="noreferrer"
          >
            More on GitHub ↗
          </a>
        </div>
      </div>

      <div className="container process__capabilities">
        {capabilities.map(([number, title, body], index) => (
          <motion.div
            className="capability"
            key={title}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: index * 0.08 }}
          >
            <span className="mono">{number}</span>
            <h3>{title}</h3>
            <p>{body}</p>
            <span className="capability__arrow">↗</span>
          </motion.div>
        ))}
      </div>

      <div className="process__marquee" aria-hidden="true">
        <div>
          React · TypeScript · Figma · Firebase · Expo · UI/UX · React Native ·
          Flutter · SQL · Git · GitHub ·
        </div>
        <div>
          React · TypeScript · Figma · Firebase · Expo · UI/UX · React Native ·
          Flutter · SQL · Git · GitHub ·
        </div>
      </div>
    </section>
  );
}
