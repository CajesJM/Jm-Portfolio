import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ictCongress from "../assets/Album/Bohol ICT Student Congress 2026.jpg";
import campusMoment from "../assets/Album/photo_2026-08-12_09-54-13.jpg";
import spiderArchitect from "../assets/Album/spider-architect-champion2026.jpg";
import tmcPresentation from "../assets/Album/TmcConnect- Presentation.jpg";
import tmcApproved from "../assets/Album/TmcConnectApprove.jpg";
import runnerUp from "../assets/Album/photo_2026-08-12_09-43-08.jpg";
import gymFriendsOne from "../assets/Album/photo_2026-08-12_09-54-11 (4).jpg";
import gymFriendsTwo from "../assets/Album/photo_2026-08-12_09-54-11 (5).jpg";
import eveningPause from "../assets/Album/photo_2026-08-12_09-54-12.jpg";
import teamCelebration from "../assets/Album/photo_2026-08-12_09-54-12 (2).jpg";
import champions from "../assets/Album/photo_2026-08-12_09-54-12 (3).jpg";
import jerseyLineup from "../assets/Album/photo_2026-08-12_09-54-12 (4).jpg";
import ccsEsports from "../assets/Album/photo_2026-08-12_09-54-12 (5).jpg";
import "../styles/Album.css";

const moments = [
  {
    src: tmcApproved,
    title: "TMC Connect approved",
    meta: "Team milestone / 2026",
    alt: "TMC Connect team celebrating after the project was approved",
    className: "album-card--team",
  },
  {
    src: tmcPresentation,
    title: "Presenting TMC Connect",
    meta: "Product presentation / 2026",
    alt: "Students presenting the TMC Connect mobile application in a computer lab",
    className: "album-card--presentation",
  },
  {
    src: spiderArchitect,
    title: "Spider Architect champion",
    meta: "Recognition / 2026",
    alt: "Spider Architect team receiving an award on stage",
    className: "album-card--award",
  },
  {
    src: ictCongress,
    title: "Bohol ICT Student Congress",
    meta: "Community / 2026",
    alt: "Students and speakers gathered at the Bohol ICT Student Congress 2026",
    className: "album-card--congress",
  },
  {
    src: campusMoment,
    title: "Between the work",
    meta: "Campus life / 2026",
    alt: "John Mark Cajes sitting on a motorcycle on campus",
    className: "album-card--campus",
  },
  {
    src: runnerUp,
    title: "Intercollegiate runner-up",
    meta: "Mobile Legends / 2026",
    alt: "John Mark holding a first runner-up trophy and certificate",
    className: "album-card--extra",
  },
  {
    src: gymFriendsOne,
    title: "Training day",
    meta: "Off duty / 2026",
    alt: "John Mark and friends taking a mirror photo at the gym",
    className: "album-card--extra",
  },
  {
    src: gymFriendsTwo,
    title: "A break with friends",
    meta: "Off duty / 2026",
    alt: "Three friends posing for a mirror photo at the gym",
    className: "album-card--extra",
  },
  {
    src: eveningPause,
    title: "After hours",
    meta: "Everyday life / 2026",
    alt: "John Mark taking a quiet break at an outdoor table in the evening",
    className: "album-card--extra",
  },
  {
    src: teamCelebration,
    title: "The winning moment",
    meta: "Esports / 2026",
    alt: "Esports team celebrating together with their trophy",
    className: "album-card--extra",
  },
  {
    src: champions,
    title: "Champions together",
    meta: "Team milestone / 2026",
    alt: "Esports team posing together with medals and a championship trophy",
    className: "album-card--extra",
  },
  {
    src: jerseyLineup,
    title: "Apex Incarnate",
    meta: "The team / 2026",
    alt: "Six Apex Incarnate team members showing the backs of their jerseys",
    className: "album-card--extra album-card--wide",
  },
  {
    src: ccsEsports,
    title: "College of Computer Studies",
    meta: "Esports / 2026",
    alt: "College of Computer Studies esports team poster",
    className: "album-card--extra",
  },
];

export default function Album() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const closeAlbum = () => setActiveIndex(null);
  const showPrevious = () =>
    setActiveIndex((current) =>
      current === null ? null : (current - 1 + moments.length) % moments.length,
    );
  const showNext = () =>
    setActiveIndex((current) =>
      current === null ? null : (current + 1) % moments.length,
    );

  useEffect(() => {
    if (activeIndex === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeAlbum();
      if (event.key === "ArrowLeft") showPrevious();
      if (event.key === "ArrowRight") showNext();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex]);

  return (
    <section id="album" className="album">
      <div className="container">
        <div className="album__header">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
          >
            <span className="eyebrow">Moments / 2026</span>
            <h2 className="section-heading">Beyond the code.</h2>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: 0.1 }}
          >
            A few moments from projects, presentations, and the people I’m
            learning alongside.
          </motion.p>
        </div>

        <div className="album__grid">
          {moments.slice(0, 5).map((moment, index) => (
            <motion.article
              className={`album-card ${moment.className}`}
              key={moment.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: Math.min(index * 0.07, 0.24) }}
            >
              <button
                type="button"
                className="album-card__button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Open photo: ${moment.title}`}
              >
                <img
                  src={moment.src}
                  alt={moment.alt}
                  loading="lazy"
                  decoding="async"
                />
                <span className="album-card__index mono">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="album-card__open" aria-hidden="true">
                  ↗
                </span>
              </button>
              <div className="album-card__caption">
                <h3>{moment.title}</h3>
                <span className="mono">{moment.meta}</span>
              </div>
            </motion.article>
          ))}

          <div className="album__aside" aria-hidden="true">
            <span className="mono">A small record of</span>
            <p>Work, people, and everything around them.</p>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {showAll && (
            <motion.div
              id="album-more"
              className="album__more-grid"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              {moments.slice(5).map((moment, offset) => {
                const index = offset + 5;
                return (
                  <article
                    className={`album-card ${moment.className}`}
                    key={moment.title}
                  >
                    <button
                      type="button"
                      className="album-card__button"
                      onClick={() => setActiveIndex(index)}
                      aria-label={`Open photo: ${moment.title}`}
                    >
                      <img
                        src={moment.src}
                        alt={moment.alt}
                        loading="lazy"
                        decoding="async"
                      />
                      <span className="album-card__index mono">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="album-card__open" aria-hidden="true">
                        ↗
                      </span>
                    </button>
                    <div className="album-card__caption">
                      <h3>{moment.title}</h3>
                      <span className="mono">{moment.meta}</span>
                    </div>
                  </article>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="album__controls">
          <button
            type="button"
            className="button album__toggle"
            aria-expanded={showAll}
            aria-controls="album-more"
            onClick={() => setShowAll((current) => !current)}
          >
            {showAll ? "Show less" : `Show more · ${moments.length - 5} photos`}
            <span aria-hidden="true">{showAll ? "↑" : "↓"}</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {activeIndex !== null && (
          <motion.div
            className="album-viewer"
            role="dialog"
            aria-modal="true"
            aria-label={`Photo viewer: ${moments[activeIndex].title}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeAlbum();
            }}
          >
            <button
              ref={closeButtonRef}
              type="button"
              className="album-viewer__close mono"
              onClick={closeAlbum}
              aria-label="Close photo viewer"
            >
              Close <span aria-hidden="true">×</span>
            </button>

            <button
              type="button"
              className="album-viewer__arrow album-viewer__arrow--previous"
              onClick={showPrevious}
              aria-label="Previous photo"
            >
              ←
            </button>

            <motion.figure
              className="album-viewer__figure"
              key={moments[activeIndex].src}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.28 }}
            >
              <img
                src={moments[activeIndex].src}
                alt={moments[activeIndex].alt}
              />
              <figcaption>
                <span>{moments[activeIndex].title}</span>
                <span className="mono">
                  {String(activeIndex + 1).padStart(2, "0")} /{" "}
                  {String(moments.length).padStart(2, "0")}
                </span>
              </figcaption>
            </motion.figure>

            <button
              type="button"
              className="album-viewer__arrow album-viewer__arrow--next"
              onClick={showNext}
              aria-label="Next photo"
            >
              →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
