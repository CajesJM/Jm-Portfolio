import { useEffect, useRef, useState, type MouseEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import heroCharacter from "../assets/Hero/hero-avatar-cutout.webp";
import sharinganOrbit from "../assets/Hero/sharingan-orbit-mask.webp";
import "../styles/Hero.css";

const GREETING_LABEL = "Hello, I'm John Mark Cajes";
const GREETING_PREFIX = "Hello,  I'm  ";
const GREETING_NAME = "John  Mark  Cajes";
const GREETING_DISPLAY = `${GREETING_PREFIX}${GREETING_NAME}`;
type GreetingPhase = "typing" | "flourish" | "hold" | "fade";
type CapabilityKind = "frontend" | "mobile" | "backend" | "product";

const capabilities: Array<{
  title: string;
  stack: string;
  kind: CapabilityKind;
  code: string;
}> = [
  {
    title: "Frontend systems",
    stack: "React + TypeScript",
    kind: "frontend",
    code: "TS",
  },
  {
    title: "Mobile products",
    stack: "React Native + Flutter",
    kind: "mobile",
    code: "FL",
  },
  {
    title: "Backend & data",
    stack: "Node.js + Firebase + SQL",
    kind: "backend",
    code: "DB",
  },
  {
    title: "Product UI",
    stack: "Figma + UI/UX",
    kind: "product",
    code: "UX",
  },
];

export default function Hero() {
  const visualRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [typedLength, setTypedLength] = useState(0);
  const [greetingPhase, setGreetingPhase] =
    useState<GreetingPhase>("typing");

  useEffect(() => {
    if (reduceMotion) {
      setTypedLength(GREETING_DISPLAY.length);
      setGreetingPhase("hold");
      return;
    }

    let delay = 76;

    if (greetingPhase === "typing") {
      delay = typedLength === 0 ? 260 : 76;
    } else if (greetingPhase === "flourish") {
      delay = 760;
    } else if (greetingPhase === "hold") {
      delay = 2600;
    } else {
      delay = 520;
    }

    const timeout = window.setTimeout(() => {
      if (greetingPhase === "typing") {
        if (typedLength < GREETING_DISPLAY.length) {
          setTypedLength((currentLength) => currentLength + 1);
          return;
        }

        setGreetingPhase("flourish");
        return;
      }

      if (greetingPhase === "flourish") {
        setGreetingPhase("hold");
        return;
      }

      if (greetingPhase === "hold") {
        setGreetingPhase("fade");
        return;
      }

      setTypedLength(0);
      setGreetingPhase("typing");
    }, delay);

    return () => window.clearTimeout(timeout);
  }, [greetingPhase, reduceMotion, typedLength]);

  const typedGreeting = GREETING_DISPLAY.slice(0, typedLength);
  const typedPrefix = typedGreeting.slice(0, GREETING_PREFIX.length);
  const typedName = typedGreeting.slice(GREETING_PREFIX.length);
  const signatureClassName = [
    "hero__signature",
    `hero__signature--${greetingPhase}`,
    reduceMotion ? "hero__signature--reduced" : "",
  ]
    .filter(Boolean)
    .join(" ");

  function handlePointerMove(event: MouseEvent<HTMLDivElement>) {
    if (reduceMotion || !visualRef.current) return;
    const bounds = visualRef.current.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    visualRef.current.style.setProperty("--rx", `${-y * 5}deg`);
    visualRef.current.style.setProperty("--ry", `${x * 7}deg`);
  }

  function resetTilt() {
    visualRef.current?.style.setProperty("--rx", "0deg");
    visualRef.current?.style.setProperty("--ry", "0deg");
  }

  return (
    <section id="top" className="hero">
      <div className="hero__ticker mono" aria-hidden="true">
        <span>
          Full stack developer · Mobile & Web Developer · Based in Bohol,
          Philippines ·
        </span>
        <span>
          Full stack developer · Mobile & Web Developer · Based in Bohol,
          Philippines ·
        </span>
      </div>

      <div className="container hero__grid">
        <div className="hero__copy">
          <motion.p
            className="hero__intro"
            aria-label={GREETING_LABEL}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className={signatureClassName} aria-hidden="true">
              <span>{typedPrefix}</span>
              <span className="hero__signature-name">
                {typedName}
                <span className="hero__signature-line" />
              </span>
              <span className="hero__typing-cursor" />
            </span>
          </motion.p>
          <motion.h1
            className="hero__headline"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.75,
              delay: 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <span>Full-stack developer</span>
            <span>focused on practical,</span>
            <em>well-built software.</em>
          </motion.h1>
          <motion.div
            className="hero__footer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.25 }}
          >
            <p>
              An IT student and full-stack developer building practical,
              reliable web and mobile applications.
            </p>
            <div className="hero__actions">
              <a className="button button--dark" href="#work">
                Explore my work <span>↘</span>
              </a>
              <a
                className="hero__text-link mono"
                href="https://github.com/CajesJM"
                target="_blank"
                rel="noreferrer"
              >
                GitHub ↗
              </a>
            </div>
          </motion.div>
        </div>

        <div className="hero__visual-stage">
          <motion.div
            className="hero__visual-wrap"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.9,
              delay: 0.15,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <div
              ref={visualRef}
              className="hero__visual"
              onMouseMove={handlePointerMove}
              onMouseLeave={resetTilt}
            >
              <span className="hero__orbit" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <div className="hero__portrait">
                <div className="hero__aperture" aria-hidden="true">
                  <span className="hero__aperture-ring hero__aperture-ring--outer" />
                  <span className="hero__aperture-ring hero__aperture-ring--inner" />
                  <img
                    className="hero__orbital-art"
                    src={sharinganOrbit}
                    alt=""
                  />
                  <span className="hero__aperture-node hero__aperture-node--one" />
                  <span className="hero__aperture-node hero__aperture-node--two" />
                  <span className="hero__aperture-node hero__aperture-node--three" />
                </div>
                <img
                  className="hero__portrait-image"
                  src={heroCharacter}
                  alt="3D illustrated portrait of John Mark Cajes framed by an orbital ink motif"
                />
                <span className="hero__portrait-baseline" aria-hidden="true" />
                <div className="hero__card hero__card--role">
                  <span className="mono">Current focus</span>
                  <strong>React + TypeScript</strong>
                </div>
              </div>
              <ul
                className="hero__capabilities"
                aria-label="Core development capabilities"
              >
                {capabilities.map((capability, index) => (
                  <motion.li
                    key={capability.title}
                    initial={reduceMotion ? false : { opacity: 0, x: -18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: reduceMotion ? 0 : 0.52,
                      delay: reduceMotion ? 0 : 0.48 + index * 0.09,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <div className="hero__capability-card">
                      <span className="hero__capability-icons" aria-hidden="true">
                        <CapabilityIcon kind={capability.kind} />
                        <i>{capability.code}</i>
                      </span>
                      <span className="hero__capability-copy">
                        <small className="mono">{capability.title}</small>
                        <strong>{capability.stack}</strong>
                      </span>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
          <motion.blockquote
            className="hero__manifesto"
            initial={reduceMotion ? false : { opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: reduceMotion ? 0 : 0.7,
              delay: reduceMotion ? 0 : 0.72,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <span className="hero__manifesto-quote" aria-hidden="true">
              “
            </span>
            <p>
              Turning ideas
              <br />
              into functional
              <br />
              experiences.
            </p>
            <span className="hero__manifesto-close" aria-hidden="true">
              ”
            </span>
            <span className="hero__manifesto-line" aria-hidden="true" />
            <svg
              className="hero__manifesto-arrow"
              viewBox="0 0 52 52"
              aria-hidden="true"
            >
              <path d="M4 47C6 26 18 12 43 8" />
              <path d="m36 4 8 4-5 7" />
            </svg>
          </motion.blockquote>
        </div>
      </div>
    </section>
  );
}

function CapabilityIcon({ kind }: { kind: CapabilityKind }) {
  if (kind === "frontend") {
    return (
      <svg viewBox="0 0 28 28" focusable="false">
        <circle cx="14" cy="14" r="1.8" />
        <ellipse cx="14" cy="14" rx="11" ry="4.3" />
        <ellipse
          cx="14"
          cy="14"
          rx="11"
          ry="4.3"
          transform="rotate(60 14 14)"
        />
        <ellipse
          cx="14"
          cy="14"
          rx="11"
          ry="4.3"
          transform="rotate(120 14 14)"
        />
      </svg>
    );
  }

  if (kind === "mobile") {
    return (
      <svg viewBox="0 0 28 28" focusable="false">
        <rect x="7" y="2.5" width="14" height="23" rx="2.5" />
        <path d="M11 6h6M12.5 22h3" />
        <path d="m11 17 3-6 3 6" />
      </svg>
    );
  }

  if (kind === "backend") {
    return (
      <svg viewBox="0 0 28 28" focusable="false">
        <path d="m14 2.5 10 5.7v11.6L14 25.5 4 19.8V8.2Z" />
        <path d="M9 10h10M9 14h10M9 18h6" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 28 28" focusable="false">
      <circle cx="10" cy="6" r="3.5" />
      <circle cx="18" cy="6" r="3.5" />
      <circle cx="10" cy="14" r="3.5" />
      <circle cx="18" cy="14" r="3.5" />
      <circle cx="10" cy="22" r="3.5" />
    </svg>
  );
}
