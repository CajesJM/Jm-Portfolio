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

        <motion.div
          className="hero__visual-wrap"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
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
            </div>
            <div className="hero__card hero__card--role">
              <span className="mono">Current focus</span>
              <strong>React + TypeScript</strong>
            </div>
            <div className="hero__card hero__card--location">
              <span>↗</span>
              <p className="mono">
                Bohol
                <br />
                10.3° N
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
