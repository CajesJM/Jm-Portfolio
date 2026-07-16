import { motion } from "framer-motion";
import InspectFrame from "./InspectFrame";
import "../styles/Work.css";

import tmcImage from "../assets/Projects/TMC-Connect.png";
import ideastoneImage from "../assets/Projects/Ideastone.png";
import votingImage from "../assets/Projects/voting-system.png";

const PROJECTS = [
  {
    tag: "TMC Connect v2.0",
    title: "TMC Connect v2.0 — Campus Digital Hub",
    summary:
      "Attendance reimagined for campus life. Replaced paper-based attendance with QR code check-ins, GPS verification, and real-time analytics for Philippine campuses.",
    stack: ["React", "React Native", "Firebase", "Expo", "TypeScript"],
    wide: true,
    image: tmcImage,
    link: "https://jmx-tmc-connect.vercel.app/",
  },
  {
    tag: "Ideastone",
    title: "Ideastone — Brand & Design System",
    summary:
      "A modern brand identity and component library built with React, Vite, and TypeScript, focusing on scalable UI architecture.",
    stack: ["React", "Vite", "TypeScript"],
    wide: false,
    image: ideastoneImage,
    link: "https://github.com/CajesJM/ideastonebyjm.git",
  },
  {
    tag: "Secure Digital Voting System",
    title: "Secure Digital Voting System",
    summary:
      "A secure, full-stack web-based voting platform built with C#, ASP.NET, and a modern frontend stack.",
    stack: ["C#", "ASP.NET", "HTML/CSS"],
    wide: false,
    image: votingImage,
    link: "https://github.com/CajesJM/CajesJm-Voting-System.git",
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
          Selected projects
        </motion.span>
        <motion.h2
          className="work__heading"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Featured case studies.
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
                  <img
                    src={p.image}
                    alt={p.title}
                    className="work-card__thumb-image"
                  />
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
                <a
                  href={p.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="work-card__link mono"
                >
                  Visit →
                </a>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
