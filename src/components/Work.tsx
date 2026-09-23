import {
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
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
    image: timgasMpcImage,
    link: "https://www.timgasmpc.com",
    linkLabel: "View live project",
  },
] as const;

type Project = (typeof projects)[number];

export default function Work() {
  const dragStart = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const moveToProject = (index: number) => {
    setActiveIndex((index + projects.length) % projects.length);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button, a")) {
      dragStart.current = null;
      return;
    }

    dragStart.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragStart.current === null) return;
    const distance = event.clientX - dragStart.current;
    dragStart.current = null;

    if (Math.abs(distance) >= 45) {
      moveToProject(activeIndex + (distance < 0 ? 1 : -1));
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const horizontalPosition = (event.clientX - bounds.left) / bounds.width;
    if (horizontalPosition < 0.35) moveToProject(activeIndex - 1);
    if (horizontalPosition > 0.65) moveToProject(activeIndex + 1);
  };

  return (
    <section id="work" className="work">
      <div className="container work__layout">
        <div className="work-gallery">
          <WorkHeader />
          <div
            className="work-carousel"
            role="region"
            aria-roledescription="carousel"
            aria-label="Selected projects"
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft") moveToProject(activeIndex - 1);
              if (event.key === "ArrowRight") moveToProject(activeIndex + 1);
            }}
          >
            <div
              className="work-carousel__stage"
              tabIndex={0}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerCancel={() => {
                dragStart.current = null;
              }}
            >
              {projects.map((project, index) => {
                let offset = index - activeIndex;
                if (offset > projects.length / 2) offset -= projects.length;
                if (offset < -projects.length / 2) offset += projects.length;
                return (
                  <ProjectSlide
                    project={project}
                    index={index}
                    offset={offset}
                    active={index === activeIndex}
                    onSelect={() => moveToProject(index)}
                    key={project.title}
                  />
                );
              })}
            </div>
          </div>
          <ProjectInformation project={projects[activeIndex]} />
        </div>
      </div>
    </section>
  );
}

function WorkHeader() {
  return (
    <header className="work__header">
      <div>
        <span className="eyebrow">Selected work / 2024—26</span>
      </div>
    </header>
  );
}

function ProjectSlide({
  project,
  index,
  offset,
  active,
  onSelect,
}: {
  project: Project;
  index: number;
  offset: number;
  active: boolean;
  onSelect: () => void;
}) {
  const distance = Math.abs(offset);
  const style = {
    "--slide-x": `${offset * 47}%`,
    "--slide-depth": `${distance * -240}px`,
    "--slide-rotate": `${offset * -22}deg`,
    "--slide-scale": Math.max(0.76, 1 - distance * 0.1),
    "--slide-opacity": Math.max(0.14, 0.58 - distance * 0.14),
    "--slide-blur": `${Math.max(0, distance - 1) * 1.5}px`,
    "--slide-origin": offset < 0 ? "right center" : "left center",
    "--slide-order": 10 - distance,
  } as CSSProperties;
  return (
    <article
      className={`project-slide${active ? " is-active" : ""}`}
      style={style}
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${projects.length}: ${project.title}`}
      aria-current={active ? "true" : undefined}
      onClick={!active ? onSelect : undefined}
    >
      <img
        src={project.image}
        alt={`${project.title} interface preview`}
        loading={index === 0 ? "eager" : "lazy"}
      />
    </article>
  );
}

function ProjectInformation({ project }: { project: Project }) {
  return (
    <article className="project-info" key={project.title} aria-live="polite">
      <span className="project-info__meta mono">{project.type}</span>
      <h3>{project.title}</h3>
      <p className="project-info__summary">{project.summary}</p>
      <ul className="project-info__stack" aria-label="Technologies used">
        {project.stack.map((item) => (
          <li className="mono" key={item}>
            {item}
          </li>
        ))}
      </ul>
      <dl className="project-info__dossier">
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
      <a
        className="project-info__link mono"
        href={project.link}
        target="_blank"
        rel="noreferrer"
      >
        <span className="project-info__link-signal" aria-hidden="true" />
        <span className="project-info__link-label">{project.linkLabel}</span>
        <span className="project-info__link-arrow" aria-hidden="true">
          <svg viewBox="0 0 20 20" focusable="false">
            <path d="M5 15 15 5M7 5h8v8" />
          </svg>
        </span>
      </a>
    </article>
  );
}
