import { useEffect, useState } from "react";
import "./Nav.css";

const LINKS = [
  { href: "#work", label: "Work" },
  { href: "#process", label: "Process" },
  { href: "#contact", label: "Contact" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`nav ${scrolled ? "nav--scrolled" : ""}`}>
      <div className="container nav__inner">
        <a href="#top" className="nav__logo">
          Cajes<span style={{ color: "var(--accent)" }}>.</span>JM
        </a>
        <nav aria-label="Primary">
          <ul className="nav__links mono">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <a href="#contact" className="btn btn-ghost nav__cta">
          Let's talk
        </a>
      </div>
    </header>
  );
}
