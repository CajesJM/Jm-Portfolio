import { useRef, useState, type CSSProperties } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import tmcImage from "../assets/Projects/TMC_Connect.webp";
import wipeitgoodImage from "../assets/Projects/wipeitgoodtrading.webp";
import ojtLogbookImage from "../assets/Projects/OJT_Logbook.webp";
import timgasMpcImage from "../assets/Projects/TIMGAS_MPC.webp";
import "../styles/Work.css";

const projects = [
  {
    number: "01",
    type: "Mobile + Web Application",
    title: "TMC Connect",
    summary:
      "A cross-platform campus hub replacing paper attendance with QR check-ins, GPS verification, event management, and live analytics—with radius-based attendance that only allows check-ins within the event’s designated location.",
    challenge: "Paper attendance was slow and difficult to verify.",
    role: "Full-stack dev · Mobile dev · UI/UX · API design",
    outcome:
      "Faster attendance without the long lines, just scan, verify, and go.",
    stack: ["React Native", "TypeScript", "Firebase", "Expo"],
    callouts: [
      {
        label: "Admin analytics",
        labelX: 78,
        labelY: 10,
        targetX: 52,
        targetY: 42,
      },
      {
        label: "Mobile app dashboard",
        labelX: 78,
        labelY: 80,
        targetX: 74,
        targetY: 73,
      },
    ],
    image: tmcImage,
    link: "https://cajes-jm-tmc-connect.vercel.app/",
    linkLabel: "View live project",
  },
  {
    number: "02",
    type: "Web Application",
    title: "Wipe It Good Trading",
    summary:
      "An online ordering platform where customers can browse products, place orders, and track purchases while administrators manage inventory and fulfillment.",
    challenge:
      "Customers may experience delays while waiting for seller responses and have limited ability to track their orders.",
    role: "Full-stack dev · Commerce UX · API design",
    outcome: "A clearer path from product discovery to order fulfillment.",
    stack: ["React", "Vite", "TypeScript", "Node.js", "Express"],
    callouts: [
      {
        label: "Product discovery",
        labelX: 78,
        labelY: 10,
        targetX: 37,
        targetY: 34,
      },
      {
        label: "Responsive storefront",
        labelX: 78,
        labelY: 80,
        targetX: 80,
        targetY: 55,
      },
    ],
    image: wipeitgoodImage,
    link: "https://wipeitgoodtrading.vercel.app/",
    linkLabel: "View live project",
  },
  {
    number: "03",
    type: "Responsive Web Application",
    title: "OJT Logbook Attendance",
    summary:
      "A digital logbook for tracking OJT attendance and generating reports for easier student submission and review.",
    challenge:
      "Students often struggle to track their OJT attendance and prepare their logbooks for submission. A digital OJT logbook makes it easier to monitor attendance and generate a ready-to-print format.",
    role: "Full-stack dev · Product UI · UI/UX · Offline data architecture",
    outcome:
      "Reliable attendance, progress records, and submission-ready exports.",
    stack: ["React", "TypeScript", "IndexedDB", "PDF/DOCX"],
    callouts: [
      {
        label: "Dashboard attendance analytics",
        labelX: 78,
        labelY: 10,
        targetX: 35,
        targetY: 49,
      },
      {
        label: "Landing page",
        labelX: 78,
        labelY: 80,
        targetX: 62,
        targetY: 78,
      },
    ],
    image: ojtLogbookImage,
    link: "https://ojtlogdance.vercel.app/",
    linkLabel: "View live project",
  },
  {
    number: "04",
    type: "Full-stack Cooperative Platform",
    title: "TIMGAS MPC Website",
    summary:
      "An official cooperative platform combining public updates, guided membership and loan applications, and a secure manager portal for reviewing submissions and publishing content.",
    challenge:
      "The organization has no public website for online access to its services. Members need a convenient way to access information and apply for membership and loans online.",
    role: "Full-stack dev · UI/UX · Content strategy · API design",
    outcome: "One trusted public site with a secure staff review workflow.",
    stack: ["React", "TypeScript", "Firebase", "Vite"],
    callouts: [
      {
        label: "Desktop homepage",
        labelX: 78,
        labelY: 10,
        targetX: 31,
        targetY: 46,
      },
      {
        label: "Mobile homepage",
        labelX: 78,
        labelY: 80,
        targetX: 74,
        targetY: 55,
      },
    ],
    image: timgasMpcImage,
    link: "https://www.timgasmpc.com",
    linkLabel: "View live project",
  },
] as const;

type Project = (typeof projects)[number];
const HANDOFF_VIEWPORTS = 0.6;
const PROJECT_EXIT_VIEWPORTS = 0.1;
const PROJECT_TIMELINE_END =
  (projects.length - 1) / (projects.length + HANDOFF_VIEWPORTS - 1);
const PROJECT_EXIT_END =
  (projects.length - 1 + PROJECT_EXIT_VIEWPORTS) /
  (projects.length + HANDOFF_VIEWPORTS - 1);

export default function Work() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const showcaseProgress = useTransform(scrollYProgress, (value) =>
    Math.min(value / PROJECT_TIMELINE_END, 1),
  );
  const railProgress = useSpring(showcaseProgress, {
    stiffness: 105,
    damping: 26,
    mass: 0.35,
  });
  const railMarkerTop = useTransform(railProgress, [0, 1], ["1%", "99%"]);
  const railMarkerRotation = useTransform(railProgress, [0, 1], [0, 540]);
  const showcaseY = useTransform(
    scrollYProgress,
    [PROJECT_TIMELINE_END, PROJECT_EXIT_END],
    ["0svh", "-10svh"],
  );

  useMotionValueEvent(showcaseProgress, "change", (latest) => {
    const nextIndex = Math.min(
      projects.length - 1,
      Math.max(0, Math.round(latest * (projects.length - 1))),
    );
    setActiveIndex((current) => (current === nextIndex ? current : nextIndex));
  });

  const sectionStyle = {
    "--project-count": projects.length,
  } as CSSProperties;
  const activeProject = projects[activeIndex];

  return (
    <section id="work" ref={sectionRef} className="work" style={sectionStyle}>
      <div className="work__desktop-showcase">
        <div className="work__sticky">
          <motion.div
            className="container work__stage"
            style={{ y: showcaseY }}
          >
            <div className="work__narrative">
              <WorkHeader />

              <div className="work__project-copy">
                <div className="work__project-content-stage">
                  {projects.map((project, projectIndex) => {
                    const isActive = projectIndex === activeIndex;
                    return (
                      <motion.div
                        className={`work__project-content ${isActive ? "is-active" : ""}`}
                        key={project.title}
                        initial={false}
                        animate={{
                          opacity: isActive ? 1 : 0,
                          y: isActive
                            ? 0
                            : projectIndex < activeIndex
                              ? -12
                              : 12,
                        }}
                        transition={{
                          opacity: { duration: reduceMotion ? 0 : 0.34 },
                          y: {
                            duration: reduceMotion ? 0 : 0.52,
                            ease: [0.16, 1, 0.3, 1],
                          },
                        }}
                        aria-hidden={!isActive}
                      >
                        <span className="work__project-type mono">
                          {project.type}
                        </span>
                        <h3>{project.title}</h3>
                        <p>{project.summary}</p>
                        <div className="work__stack-row">
                          <span className="mono">Built with</span>
                          <ul
                            className="work__stack"
                            aria-label="Technologies used"
                          >
                            {project.stack.map((item) => (
                              <li className="mono" key={item}>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <dl className="work__dossier">
                          <div>
                            <dt className="mono">Challenge</dt>
                            <dd>{project.challenge}</dd>
                          </div>
                          <div>
                            <dt className="mono">My role</dt>
                            <dd>{project.role}</dd>
                          </div>
                          <div>
                            <dt className="mono">Outcome</dt>
                            <dd>{project.outcome}</dd>
                          </div>
                        </dl>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="work__project-footer">
                  <div
                    className="work__project-progress"
                    aria-label={`Project ${activeProject.number} of ${projects.length}`}
                  >
                    <span className="mono">
                      Project {activeProject.number} / 0{projects.length}
                    </span>
                    <ol aria-hidden="true">
                      {projects.map((progressProject, index) => (
                        <li
                          key={progressProject.number}
                          className={index === activeIndex ? "is-active" : ""}
                        />
                      ))}
                    </ol>
                  </div>
                  <a
                    className="work__project-link mono"
                    href={activeProject.link}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${activeProject.linkLabel}: ${activeProject.title}`}
                  >
                    {activeProject.linkLabel} <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="work__reel" aria-label="Project preview filmstrip">
              <span className="work__reel-line" aria-hidden="true">
                <motion.span
                  className="work__reel-progress"
                  style={{ scaleY: railProgress }}
                />
                <motion.span
                  className="work__reel-marker"
                  style={{ top: railMarkerTop, rotate: railMarkerRotation }}
                >
                  <i />
                  <i />
                  <i />
                </motion.span>
              </span>
              {projects.map((project, index) => (
                <ProjectFrame
                  key={project.title}
                  project={project}
                  index={index}
                  activeIndex={activeIndex}
                  progress={showcaseProgress}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container work__mobile-showcase">
        <WorkHeader />
        <div className="work__mobile-list">
          {projects.map((project, index) => (
            <motion.article
              className="work__mobile-project"
              key={project.title}
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: reduceMotion ? 0 : 0.58,
                delay: reduceMotion ? 0 : index * 0.05,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <a href={project.link} target="_blank" rel="noreferrer">
                <div className="work__mobile-image">
                  <img
                    src={project.image}
                    alt={`${project.title} interface preview`}
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                  <span className="work__mobile-arrow" aria-hidden="true">
                    ↗
                  </span>
                </div>
                <div className="work__mobile-meta">
                  <span className="mono">{project.type}</span>
                  <h3>{project.title}</h3>
                  <p>{project.summary}</p>
                  <dl className="work__dossier work__dossier--mobile">
                    <div>
                      <dt className="mono">Challenge</dt>
                      <dd>{project.challenge}</dd>
                    </div>
                    <div>
                      <dt className="mono">My role</dt>
                      <dd>{project.role}</dd>
                    </div>
                    <div>
                      <dt className="mono">Outcome</dt>
                      <dd>{project.outcome}</dd>
                    </div>
                  </dl>
                  <ul className="work__stack" aria-label="Technologies used">
                    {project.stack.map((item) => (
                      <li className="mono" key={item}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </a>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkHeader() {
  return (
    <header className="work__header">
      <span className="eyebrow">Selected work / 2024—26</span>
      <h2 className="section-heading work__heading">Projects with a goal.</h2>
    </header>
  );
}

function ProjectFrame({
  project,
  index,
  activeIndex,
  progress,
}: {
  project: Project;
  index: number;
  activeIndex: number;
  progress: MotionValue<number>;
}) {
  const projectPosition = useTransform(
    progress,
    (value) => value * (projects.length - 1),
  );
  const y = useTransform(
    projectPosition,
    (position) => `${(position - index) * 48}vh`,
  );
  const x = useTransform(projectPosition, (position) => {
    const distance = Math.min(1.35, Math.abs(position - index));
    return `${distance * distance * 12}%`;
  });
  const rotate = useTransform(projectPosition, (position) => {
    const offset = position - index;
    return Math.max(-3.5, Math.min(3.5, offset * 3));
  });
  const opacity = useTransform(projectPosition, (position) => {
    const distance = Math.abs(position - index);
    if (distance <= 0.08) return 1;
    if (distance >= 1.35) return 0;
    return Math.max(0.1, 1 - distance * 0.84);
  });
  const scale = useTransform(projectPosition, (position) => {
    const distance = Math.min(1, Math.abs(position - index));
    return 1 - distance * 0.08;
  });
  const isActive = index === activeIndex;

  return (
    <motion.article
      className={`work__frame ${isActive ? "is-active" : ""}`}
      style={{ x, y, rotate, opacity, scale }}
      aria-hidden={!isActive}
    >
      <a
        href={project.link}
        target="_blank"
        rel="noreferrer"
        tabIndex={isActive ? 0 : -1}
        aria-label={`View ${project.title}`}
      >
        <img
          src={project.image}
          alt={`${project.title} interface preview`}
          loading={index === 0 ? "eager" : "lazy"}
        />
        <span className="work__callout-layer" aria-hidden="true">
          <svg className="work__callout-lines">
            {project.callouts.map((callout) => (
              <g key={callout.label}>
                <line
                  className="work__callout-halo"
                  x1={`${callout.targetX}%`}
                  y1={`${callout.targetY}%`}
                  x2={`${callout.labelX}%`}
                  y2={`${callout.labelY + 3}%`}
                />
                <line
                  x1={`${callout.targetX}%`}
                  y1={`${callout.targetY}%`}
                  x2={`${callout.labelX}%`}
                  y2={`${callout.labelY + 3}%`}
                />
                <circle
                  cx={`${callout.targetX}%`}
                  cy={`${callout.targetY}%`}
                  r="4"
                />
              </g>
            ))}
          </svg>
          {project.callouts.map((callout, calloutIndex) => (
            <span
              className="work__callout"
              style={{
                left: `${callout.labelX}%`,
                top: `${callout.labelY}%`,
              }}
              key={callout.label}
            >
              <b className="mono">0{calloutIndex + 1}</b>
              <em className="mono">{callout.label}</em>
            </span>
          ))}
        </span>
        <span className="work__frame-arrow" aria-hidden="true">
          ↗
        </span>
      </a>
    </motion.article>
  );
}
