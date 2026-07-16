import { useEffect, useState } from "react";
import "../styles/Nav.css";
import logo from "../assets/logo1.png";

const LINKS = [
  { href: "#work", label: "Projects" },
  { href: "#process", label: "Process" },
  { href: "#contact", label: "Contact" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("work");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0px -35% 0px",
        threshold: 0.2,
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <header className={`nav ${scrolled ? "nav--scrolled" : ""}`}>
      <div className="container nav__inner">
        <a href="#top" className="nav__logo">
          <img src={logo} alt="JM Cajes Logo" className="nav__logo-image" />
        </a>
        <nav aria-label="Primary">
          <ul className="nav__links mono">
            {LINKS.map((l) => {
              const sectionId = l.href.replace("#", "");
              const isActive = activeSection === sectionId;

              return (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className={isActive ? "nav__link--active" : ""}
                  >
                    {l.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
        <a href="#contact" className="btn btn-ghost nav__cta">
          Let's talk
        </a>
      </div>
    </header>
  );
}
