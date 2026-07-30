import { useEffect, useState } from "react";
import "../styles/Nav.css";

const links = [
  { href: "#work", label: "Work" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`nav ${scrolled ? "nav--scrolled" : ""}`}>
      <div className="container nav__inner">
        <a className="nav__brand" href="#top" aria-label="JM Cajes, home">
          JM<span>®</span>
        </a>
        <button
          className="nav__menu"
          type="button"
          aria-expanded={open}
          aria-controls="primary-navigation"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Close" : "Menu"}
        </button>
        <nav id="primary-navigation" className={open ? "is-open" : ""} aria-label="Primary navigation">
          <ul className="nav__links">
            {links.map((link, index) => (
              <li key={link.href}>
                <a href={link.href} onClick={() => setOpen(false)}>
                  <span>0{index + 1}</span>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <a className="nav__availability" href="mailto:markcajes24@gmail.com">
          <i />
          Available for work
        </a>
      </div>
    </header>
  );
}
