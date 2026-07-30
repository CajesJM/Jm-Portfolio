import { motion } from "framer-motion";
import "../styles/Process.css";

const capabilities = [
  ["01", "Product thinking", "Turning a rough idea into a focused, usable product."],
  ["02", "UI/UX design", "Clear structure, expressive interfaces, and thoughtful interaction."],
  ["03", "Frontend development", "Responsive React experiences built with maintainable TypeScript."],
  ["04", "Mobile development", "Cross-platform experiences with React Native and Expo."],
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
          <h2 className="section-heading">Curious by nature.<br />Intentional by design.</h2>
        </motion.div>
        <div className="process__bio">
          <p className="process__lead">I’m an IT student at Trinidad Municipal College who enjoys the entire journey from sketching an interface to shipping the working product.</p>
          <p>I care about useful technology, strong visual systems, and learning by building. Right now I’m exploring web development, mobile products, interface motion, and practical uses of AI.</p>
          <a className="mono" href="https://github.com/CajesJM" target="_blank" rel="noreferrer">More on GitHub ↗</a>
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
        <div>React · TypeScript · Figma · Firebase · Expo · UI/UX · React Native ·</div>
        <div>React · TypeScript · Figma · Firebase · Expo · UI/UX · React Native ·</div>
      </div>
    </section>
  );
}
