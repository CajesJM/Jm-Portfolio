import { useEffect, useState } from "react";
import "../styles/Nav.css";

const links = [
  { href: "#work", label: "Work" },
  { href: "#about", label: "About" },
  { href: "#album", label: "Moments" },
  { href: "#contact", label: "Contact" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [themeTransitioning, setThemeTransitioning] = useState(false);
  const [theme, setTheme] = useState<"paper" | "ink">(() => {
    if (typeof window === "undefined") return "paper";
    return window.localStorage.getItem("portfolio-theme") === "ink"
      ? "ink"
      : "paper";
  });

  function openContactModal() {
    window.dispatchEvent(new Event("open-contact-modal"));
  }

  async function toggleTheme(origin: { x: number; y: number }) {
    if (themeTransitioning) return;

    const nextTheme = theme === "paper" ? "ink" : "paper";
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      setTheme(nextTheme);
      return;
    }

    setThemeTransitioning(true);
    const radius = Math.hypot(
      Math.max(origin.x, window.innerWidth - origin.x),
      Math.max(origin.y, window.innerHeight - origin.y),
    );
    const reveal = document.createElement("div");
    reveal.className = "theme-reveal";
    reveal.setAttribute("aria-hidden", "true");
    reveal.style.setProperty(
      "--reveal-color",
      nextTheme === "ink" ? "rgba(241, 240, 235, 0.5)" : "rgba(17, 17, 15, 0.42)",
    );
    Object.assign(reveal.style, {
      left: `${origin.x}px`,
      top: `${origin.y}px`,
      width: `${radius * 2}px`,
      height: `${radius * 2}px`,
    });
    document.body.appendChild(reveal);
    document.documentElement.classList.add("theme-changing");

    try {
      setTheme(nextTheme);
      await reveal.animate(
        [
          { opacity: 0, transform: "translate(-50%, -50%) scale(0.02)" },
          { opacity: 0.68, offset: 0.2 },
          { opacity: 0.42, offset: 0.72 },
          { opacity: 0, transform: "translate(-50%, -50%) scale(1)" },
        ],
        { duration: 1100, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "forwards" },
      ).finished;
    } finally {
      reveal.remove();
      document.documentElement.classList.remove("theme-changing");
      setThemeTransitioning(false);
    }
  }

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme === "ink" ? "dark" : "light";
    window.localStorage.setItem("portfolio-theme", theme);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "ink" ? "#11110f" : "#efeee8");
  }, [theme]);

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
          <span className="nav__brand-mark">JM</span>
          <span className="nav__brand-name">Cajes</span>
        </a>
        <nav
          id="primary-navigation"
          className={open ? "is-open" : ""}
          aria-label="Primary navigation"
        >
          <ul className="nav__links">
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href} onClick={() => setOpen(false)}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="nav__actions">
          <div className="nav__theme-desktop">
            <ThemeToggle
              theme={theme}
              disabled={themeTransitioning}
              onToggle={toggleTheme}
            />
          </div>
          <button
            className="nav__availability"
            type="button"
            aria-haspopup="dialog"
            onClick={openContactModal}
          >
            <i />
            Available for work
          </button>
        </div>
        <button
          className="nav__menu"
          type="button"
          aria-expanded={open}
          aria-controls="primary-navigation"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>
    </header>
  );
}

function ThemeToggle({
  theme,
  disabled,
  onToggle,
}: {
  theme: "paper" | "ink";
  disabled: boolean;
  onToggle: (origin: { x: number; y: number }) => void;
}) {
  const nextTheme = theme === "paper" ? "Ink" : "Paper";

  return (
    <button
      className="theme-toggle"
      type="button"
      role="switch"
      aria-checked={theme === "ink"}
      aria-label={`Switch to ${nextTheme} theme`}
      title={`Switch to ${nextTheme} theme`}
      disabled={disabled}
      onClick={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        onToggle({
          x: bounds.left + bounds.width / 2,
          y: bounds.top + bounds.height / 2,
        });
      }}
    >
      <span className="theme-toggle__label">{theme}</span>
      <span className="theme-toggle__track" aria-hidden="true">
        <span />
      </span>
    </button>
  );
}
