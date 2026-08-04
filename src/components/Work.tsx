import { motion } from "framer-motion";
import tmcImage from "../assets/Projects/TMC-Connect.png";
import wipeitgoodImage from "../assets/Projects/wipeitgood.png";
import votingImage from "../assets/Projects/voting-system.png";
import "../styles/Work.css";

const projects = [
  {
    number: "01",
    type: "Mobile + Web Application",
    title: "TMC Connect",
    summary:
      "A cross-platform campus hub replacing paper attendance with QR check-ins, GPS verification, event management, and live analytics.",
    stack: ["React Native", "TypeScript", "Firebase", "Expo"],
    image: tmcImage,
    link: "https://cajes-jm-tmc-connect.vercel.app/",
    featured: true,
  },
  {
    number: "02",
    type: "Web Application",
    title: "Wipe It Good Trading",
    summary:
      "A online ordering platform where users can browse products, place orders, and track purchases, while the admin manages products and orders efficiently.",
    stack: ["React", "Vite", "TypeScript", "Node.js", "Express"],
    image: wipeitgoodImage,
    link: "https://wipeitgoodtrading.vercel.app/",
  },
  {
    number: "03",
    type: "Full-stack Platform",
    title: "Digital Voting",
    summary:
      "A focused web voting system designed to make school elections more structured, accessible, and secure.",
    stack: ["C#", "ASP.NET", "HTML/CSS"],
    image: votingImage,
    link: "https://github.com/CajesJM/CajesJm-Voting-System",
  },
];

export default function Work() {
  return (
    <section id="work" className="work">
      <div className="container">
        <div className="work__header">
          <div>
            <span className="eyebrow">Selected work / 2024—26</span>
            <h2 className="section-heading work__heading">
              Projects with a goal.
            </h2>
          </div>
          <p>
            From student & listener to Lead Developer, I like building useful
            applications with a clear point of view.
          </p>
        </div>

        <div className="work__list">
          {projects.map((project, index) => (
            <motion.article
              className={`project ${project.featured ? "project--featured" : ""}`}
              key={project.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.65, delay: index * 0.08 }}
            >
              <a
                href={project.link}
                target="_blank"
                rel="noreferrer"
                aria-label={`View ${project.title}`}
              >
                <div className="project__image">
                  <img
                    src={project.image}
                    alt={`${project.title} interface preview`}
                  />
                  <span className="project__view mono">View project ↗</span>
                </div>
                <div className="project__meta">
                  <div>
                    <span className="mono">
                      {project.number} / {project.type}
                    </span>
                    <h3>{project.title}</h3>
                  </div>
                  <div className="project__details">
                    <p>{project.summary}</p>
                    <ul>
                      {project.stack.map((item) => (
                        <li className="mono" key={item}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </a>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
