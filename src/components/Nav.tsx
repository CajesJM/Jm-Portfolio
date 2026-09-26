import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { flushSync } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import "../styles/Nav.css";

type Theme = "paper" | "ink";

type ThemeViewTransition = {
  finished: Promise<void>;
};

type ThemeViewTransitionDocument = Document & {
  startViewTransition?: (updateCallback: () => void) => ThemeViewTransition;
};

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme =
    theme === "ink" ? "dark" : "light";
  window.localStorage.setItem("portfolio-theme", theme);
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "ink" ? "#11110f" : "#efeee8");
}

const links = [
  { href: "#work", label: "Projects" },
  { href: "#about", label: "About" },
  { href: "#album", label: "Moments" },
  { href: "#contact", label: "Contact" },
];

export default function Nav() {
  const reduceMotion = useReducedMotion();
  const lastScrollY = useRef(0);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeHref, setActiveHref] = useState("");
  const [themeTransitioning, setThemeTransitioning] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "paper";
    return window.localStorage.getItem("portfolio-theme") === "ink"
      ? "ink"
      : "paper";
  });

  function openContactModal(event: ReactMouseEvent<HTMLButtonElement>) {
    setHidden(false);
    const trigger = event.currentTarget.getBoundingClientRect();
    window.dispatchEvent(
      new CustomEvent("open-contact-modal", {
        detail: {
          x: trigger.left + trigger.width / 2,
          y: trigger.top + trigger.height / 2,
          width: trigger.width,
          height: trigger.height,
        },
      }),
    );
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
    const root = document.documentElement;
    const radius = Math.hypot(
      Math.max(origin.x, window.innerWidth - origin.x),
      Math.max(origin.y, window.innerHeight - origin.y),
    );
    const revealColor = nextTheme === "ink" ? "#11110f" : "#efeee8";
    let fallbackReveal: HTMLDivElement | null = null;

    root.style.setProperty("--theme-origin-x", `${origin.x}px`);
    root.style.setProperty("--theme-origin-y", `${origin.y}px`);
    root.style.setProperty("--theme-reveal-radius", `${radius}px`);
    root.classList.add("theme-changing");

    try {
      const transitionDocument = document as ThemeViewTransitionDocument;

      if (transitionDocument.startViewTransition) {
        const transition = transitionDocument.startViewTransition(() => {
          applyTheme(nextTheme);
          flushSync(() => setTheme(nextTheme));
        });
        await transition.finished;
      } else {
        fallbackReveal = document.createElement("div");
        fallbackReveal.className = "theme-reveal";
        fallbackReveal.setAttribute("aria-hidden", "true");
        fallbackReveal.style.setProperty("--reveal-color", revealColor);
        document.body.appendChild(fallbackReveal);

        applyTheme(nextTheme);
        flushSync(() => setTheme(nextTheme));
        await fallbackReveal.animate(
          [
            {
              clipPath: `circle(0 at ${origin.x}px ${origin.y}px)`,
              opacity: 0.5,
            },
            {
              clipPath: `circle(${radius}px at ${origin.x}px ${origin.y}px)`,
              opacity: 0,
            },
          ],
          {
            duration: 680,
            easing: "cubic-bezier(0.16, 1, 0.3, 1)",
            fill: "forwards",
          },
        ).finished;
      }
    } finally {
      fallbackReveal?.remove();
      root.classList.remove("theme-changing");
      root.style.removeProperty("--theme-origin-x");
      root.style.removeProperty("--theme-origin-y");
      root.style.removeProperty("--theme-reveal-radius");
      setThemeTransitioning(false);
    }
  }

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    let frame = 0;

    const updateNavigation = () => {
      frame = 0;
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY.current;

      setScrolled(currentScrollY > 20);
      if (currentScrollY <= 80 || open) {
        setHidden(false);
      } else if (scrollDelta > 8) {
        setHidden(true);
      } else if (scrollDelta < -8) {
        setHidden(false);
      }
      lastScrollY.current = currentScrollY;

      const activationLine = currentScrollY + window.innerHeight * 0.32;
      let currentHref = "";

      for (const link of links) {
        const section = document.querySelector<HTMLElement>(link.href);
        if (!section) continue;

        const sectionTop = section.getBoundingClientRect().top + window.scrollY;
        if (sectionTop <= activationLine) currentHref = link.href;
      }

      const reachedPageEnd =
        window.innerHeight + currentScrollY >=
        document.documentElement.scrollHeight - 2;

      setActiveHref(reachedPageEnd ? (links.at(-1)?.href ?? "") : currentHref);
    };

    const requestNavigationUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateNavigation);
    };

    updateNavigation();
    window.addEventListener("scroll", requestNavigationUpdate, {
      passive: true,
    });
    window.addEventListener("resize", requestNavigationUpdate);

    return () => {
      window.removeEventListener("scroll", requestNavigationUpdate);
      window.removeEventListener("resize", requestNavigationUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [open]);

  return (
    <header
      className={`nav ${scrolled ? "nav--scrolled" : ""} ${hidden && !open ? "nav--hidden" : ""}`.trim()}
    >
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
                <a
                  href={link.href}
                  aria-current={
                    activeHref === link.href ? "location" : undefined
                  }
                  onClick={() => setOpen(false)}
                >
                  <span className="nav__link-label">
                    {link.label}
                    {activeHref === link.href && (
                      <motion.span
                        className="nav__active-line"
                        layoutId="nav-active-line"
                        initial={false}
                        transition={
                          reduceMotion
                            ? { duration: 0 }
                            : {
                                type: "spring",
                                stiffness: 420,
                                damping: 34,
                                mass: 0.45,
                              }
                        }
                        aria-hidden="true"
                      />
                    )}
                  </span>
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
            <span className="nav__availability-signal" aria-hidden="true">
              <i />
            </span>
            <span className="nav__availability-label">
              Open to new projects
            </span>
            <span className="nav__availability-arrow" aria-hidden="true">
              <svg viewBox="0 0 20 20" focusable="false">
                <path d="M5 15 15 5M7 5h8v8" />
              </svg>
            </span>
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
