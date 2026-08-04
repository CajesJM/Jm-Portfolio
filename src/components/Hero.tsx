import { useEffect, useRef, useState, type MouseEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import heroCharacter from "../assets/Hero/jm-3d-hero.png";
import "../styles/Hero.css";

const GREETING = "Hello, I'm John Mark Cajes";

export default function Hero() {
  const visualRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [typedGreeting, setTypedGreeting] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (reduceMotion) {
      setTypedGreeting(GREETING);
      return;
    }

    let delay = isDeleting ? 45 : 85;

    if (!isDeleting && typedGreeting === GREETING) {
      delay = 1600;
    } else if (isDeleting && typedGreeting === "") {
      delay = 500;
    }

    const timeout = window.setTimeout(() => {
      if (!isDeleting && typedGreeting === GREETING) {
        setIsDeleting(true);
        return;
      }

      if (isDeleting && typedGreeting === "") {
        setIsDeleting(false);
        return;
      }

      const nextLength = typedGreeting.length + (isDeleting ? -1 : 1);
      setTypedGreeting(GREETING.slice(0, nextLength));
    }, delay);

    return () => window.clearTimeout(timeout);
  }, [isDeleting, reduceMotion, typedGreeting]);

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
            className="hero__intro mono"
            aria-label={GREETING}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span aria-hidden="true">{typedGreeting}</span>
            <span className="hero__typing-cursor" aria-hidden="true" />
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
            <span className="hero__orbit mono">
              UI · CODE · MOTION · PRODUCT ·
            </span>
            <div className="hero__portrait">
              <img
                src={heroCharacter}
                alt="3D illustrated portrait of John Mark Cajes holding a tablet"
              />
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

      <a className="hero__scroll mono" href="#work">
        Scroll to explore <span>↓</span>
      </a>
    </section>
  );
}
