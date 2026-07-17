import { motion } from "framer-motion";
import "../styles/Hero.css";
import Lanyard from "./Lanyard-component/Lanyard";
import profilePic from "../assets/Profile_Portfolio.png";
import cardBack from "../assets/card-back.png";

export default function Hero() {
  return (
    <section id="top" className="hero">
      <div className="container hero__grid">
        <div className="hero__copy">
          <motion.span
            className="eyebrow"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Available for new projects
          </motion.span>

          <motion.h1
            className="hero__title"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            I build intelligent
            <br />
            software that solves{" "}
            <span className="hero__accent">real-world problems.</span>
          </motion.h1>

          <motion.p
            className="hero__sub"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Full-stack developer focused on AI-powered applications, machine
            learning, and scalable web systems. Passionate about building
            practical software—from intelligent assistants and automation tools
            to modern web platforms. Based in the Philippines, collaborating
            with teams worldwide.
          </motion.p>

          <motion.div
            className="hero__actions"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <a href="#work" className="btn btn-primary">
              View selected work →
            </a>
            <a href="#contact" className="btn btn-ghost">
              Get in touch
            </a>
          </motion.div>
        </div>

        <motion.div
          className="hero__visual"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className="hero__lanyard-wrapper">
            <Lanyard
              position={[0, 0, 12]}
              gravity={[0, -40, 0]}
              fov={20}
              frontImage={profilePic}
              backImage={cardBack}
              imageFit="cover"
              transparent
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
