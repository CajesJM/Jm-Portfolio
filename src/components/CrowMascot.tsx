import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useReducedMotion } from "framer-motion";
import corvusCurious from "../assets/mascot/corvus-curious.webp";
import corvusError from "../assets/mascot/corvus-error.webp";
import corvusFlight01 from "../assets/mascot/corvus-flight-runtime.webp";
import corvusFlight02 from "../assets/mascot/corvus-flight-02-mid-downstroke-runtime.webp";
import corvusFlight03 from "../assets/mascot/corvus-flight-03-downstroke-runtime.webp";
import corvusFlight04 from "../assets/mascot/corvus-flight-04-mid-upstroke-runtime.webp";
import corvusIdle from "../assets/mascot/corvus-idle.webp";
import corvusListening from "../assets/mascot/corvus-listening.webp";
import corvusSleeping from "../assets/mascot/corvus-sleeping.webp";
import corvusSpeakingOpen from "../assets/mascot/corvus-speaking-open.webp";
import corvusSpeaking from "../assets/mascot/corvus-speaking.webp";
import corvusThinking from "../assets/mascot/corvus-thinking.webp";
import corvusWalk01 from "../assets/mascot/corvus-walk-01-contact-left-runtime.webp";
import corvusWalk02 from "../assets/mascot/corvus-walk-02-down-left-runtime.webp";
import corvusWalk03 from "../assets/mascot/corvus-walk-03-passing-left-runtime.webp";
import corvusWalk04 from "../assets/mascot/corvus-walk-04-contact-right-runtime.webp";
import corvusWalk05 from "../assets/mascot/corvus-walk-05-down-right-runtime.webp";
import corvusWalk06 from "../assets/mascot/corvus-walk-06-passing-right-runtime.webp";
import "../styles/CrowMascot.css";

export type CrowMascotState =
  | "idle"
  | "curious"
  | "listening"
  | "thinking"
  | "speaking"
  | "sleeping"
  | "error"
  | "flight";

const stateImages: Record<CrowMascotState, string> = {
  idle: corvusIdle,
  curious: corvusCurious,
  listening: corvusListening,
  thinking: corvusThinking,
  speaking: corvusSpeaking,
  sleeping: corvusSleeping,
  error: corvusError,
  flight: corvusFlight01,
};

const flightFrames = [
  corvusFlight01,
  corvusFlight02,
  corvusFlight03,
  corvusFlight04,
];

const speakingFrames = [corvusSpeaking, corvusSpeakingOpen];

const productionImages = [
  corvusCurious,
  corvusError,
  corvusListening,
  corvusSleeping,
  corvusSpeaking,
  corvusSpeakingOpen,
  corvusThinking,
];

const walkingFrames = [
  corvusWalk01,
  corvusWalk02,
  corvusWalk03,
  corvusWalk04,
  corvusWalk05,
  corvusWalk06,
];

const SLEEP_DELAY = 30_000;
const FLIGHT_DURATION = 2_300;
const FLIGHT_FRAME_DURATION = 125;
const WALK_FRAME_DURATION = 115;
const RETURN_WALK_FRAME_DURATION = 175;
const WALK_CYCLES = 2;
const MAX_CHAT_MESSAGE_LENGTH = 600;

const starterQuestions = [
  "What kind of developer is JM?",
  "Tell me about TMC Connect.",
  "Which projects use mobile technology?",
] as const;

type EntrancePhase = "preparing" | "flight" | "walking" | "settled";
type GroundMotion = "still" | "shuffle" | "hop" | "tilt";
type ReturnMode = "idle" | "dragging" | "flying" | "walking";
type ReturnDirection = "left" | "right";
type ChatPhase = "ready" | "listening" | "thinking" | "speaking" | "error";
type ChatMessage = {
  id: string;
  role: "user" | "model";
  text: string;
};

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  x: number;
  y: number;
  bounds: DOMRect;
};

const decodeImage = (source: string) =>
  new Promise<void>((resolve) => {
    const image = new Image();
    image.src = source;

    const finish = () => resolve();
    if (image.decode) {
      image.decode().then(finish).catch(finish);
      return;
    }

    image.onload = finish;
    image.onerror = finish;
  });

export default function CrowMascot() {
  const reduceMotion = useReducedMotion();
  const mascotRef = useRef<HTMLElement>(null);
  const birdRef = useRef<HTMLSpanElement>(null);
  const sleepTimer = useRef<number | undefined>(undefined);
  const groundMotionTimer = useRef<number | undefined>(undefined);
  const dragState = useRef<DragState | null>(null);
  const returnAnimation = useRef<Animation | null>(null);
  const suppressClick = useRef(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const requestController = useRef<AbortController | null>(null);
  const typingAnimationFrame = useRef<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isSleeping, setIsSleeping] = useState(false);
  const [entrancePhase, setEntrancePhase] = useState<EntrancePhase>(
    reduceMotion ? "settled" : "preparing",
  );
  const [flightFrame, setFlightFrame] = useState(0);
  const [walkFrame, setWalkFrame] = useState(0);
  const [speakingFrame, setSpeakingFrame] = useState(0);
  const [groundMotion, setGroundMotion] = useState<GroundMotion>("still");
  const [returnMode, setReturnMode] = useState<ReturnMode>("idle");
  const [returnDirection, setReturnDirection] =
    useState<ReturnDirection>("right");
  const [chatPhase, setChatPhase] = useState<ChatPhase>("ready");
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatError, setChatError] = useState("");
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const [revealedCharacters, setRevealedCharacters] = useState(0);

  const wakeCorvus = () => {
    setIsSleeping(false);
    if (sleepTimer.current) window.clearTimeout(sleepTimer.current);
    sleepTimer.current = window.setTimeout(
      () => setIsSleeping(true),
      SLEEP_DELAY,
    );
  };

  useEffect(() => {
    if (reduceMotion) {
      setEntrancePhase("settled");
      return;
    }

    let cancelled = false;
    Promise.all([...flightFrames, ...walkingFrames].map(decodeImage)).then(
      () => {
        if (cancelled) return;
        const brand = document.querySelector<HTMLElement>(".nav__brand");
        const mascot = mascotRef.current;
        const bird = birdRef.current;

        if (brand && mascot && bird) {
          const brandBounds = brand.getBoundingClientRect();
          const birdBounds = bird.getBoundingClientRect();
          const startX =
            brandBounds.left +
            brandBounds.width * 0.72 -
            (birdBounds.left + birdBounds.width * 0.5);
          const startY =
            brandBounds.top +
            brandBounds.height * 0.55 -
            (birdBounds.top + birdBounds.height * 0.5);

          mascot.style.setProperty("--flight-start-x", `${startX}px`);
          mascot.style.setProperty("--flight-start-y", `${startY}px`);
          mascot.style.setProperty("--flight-curve-x", `${startX * 0.48}px`);
          mascot.style.setProperty(
            "--flight-curve-y",
            `${startY * 0.72 - 48}px`,
          );
          mascot.style.setProperty("--flight-approach-x", `${startX * 0.1}px`);
          mascot.style.setProperty("--flight-approach-y", "-24px");
        }

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (!cancelled) setEntrancePhase("flight");
          });
        });
      },
    );

    return () => {
      cancelled = true;
    };
  }, [reduceMotion]);

  useEffect(() => {
    if (entrancePhase !== "flight") return;

    let animationFrame = 0;
    let previousFrameTime = performance.now();
    const animateWings = (currentTime: number) => {
      const elapsed = currentTime - previousFrameTime;
      if (elapsed >= FLIGHT_FRAME_DURATION) {
        previousFrameTime = currentTime - (elapsed % FLIGHT_FRAME_DURATION);
        setFlightFrame((frame) => (frame + 1) % flightFrames.length);
      }
      animationFrame = window.requestAnimationFrame(animateWings);
    };

    setFlightFrame(0);
    animationFrame = window.requestAnimationFrame(animateWings);
    const entryTimer = window.setTimeout(() => {
      setWalkFrame(0);
      setEntrancePhase("walking");
    }, FLIGHT_DURATION);
    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(entryTimer);
    };
  }, [entrancePhase]);

  useEffect(() => {
    if (entrancePhase !== "settled") return;

    const preloadTimer = window.setTimeout(() => {
      productionImages.forEach((source) => {
        const image = new Image();
        image.src = source;
      });
    }, 500);

    return () => window.clearTimeout(preloadTimer);
  }, [entrancePhase]);

  useEffect(() => {
    if (entrancePhase !== "walking") return;

    const finalFrame = walkingFrames.length * WALK_CYCLES;
    let nextFrame = 0;
    const frameTimer = window.setInterval(() => {
      nextFrame += 1;
      if (nextFrame >= finalFrame) {
        window.clearInterval(frameTimer);
        setEntrancePhase("settled");
        setWalkFrame(0);
        return;
      }
      setWalkFrame(nextFrame % walkingFrames.length);
    }, WALK_FRAME_DURATION);

    return () => window.clearInterval(frameTimer);
  }, [entrancePhase]);

  useEffect(() => {
    if (chatPhase !== "speaking" || reduceMotion) {
      setSpeakingFrame(0);
      return;
    }

    const frameTimer = window.setInterval(() => {
      setSpeakingFrame((frame) => (frame + 1) % speakingFrames.length);
    }, 210);

    return () => window.clearInterval(frameTimer);
  }, [chatPhase, reduceMotion]);

  useEffect(() => {
    if (returnMode !== "flying" && returnMode !== "walking") return;

    const frames = returnMode === "flying" ? flightFrames : walkingFrames;
    const frameDuration =
      returnMode === "flying"
        ? FLIGHT_FRAME_DURATION
        : RETURN_WALK_FRAME_DURATION;
    let animationFrame = 0;
    let previousFrameTime = performance.now();

    const animateReturn = (currentTime: number) => {
      const elapsed = currentTime - previousFrameTime;
      if (elapsed >= frameDuration) {
        previousFrameTime = currentTime - (elapsed % frameDuration);
        if (returnMode === "flying") {
          setFlightFrame((frame) => (frame + 1) % frames.length);
        } else {
          setWalkFrame((frame) => (frame + 1) % frames.length);
        }
      }
      animationFrame = window.requestAnimationFrame(animateReturn);
    };

    animationFrame = window.requestAnimationFrame(animateReturn);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [returnMode]);

  useEffect(() => {
    if (groundMotionTimer.current) {
      window.clearTimeout(groundMotionTimer.current);
    }

    const canMove =
      entrancePhase === "settled" &&
      !reduceMotion &&
      !isHovered &&
      !isOpen &&
      returnMode === "idle" &&
      !isSleeping;

    if (!canMove) {
      if (groundMotion !== "still") setGroundMotion("still");
      return;
    }

    if (groundMotion !== "still") {
      groundMotionTimer.current = window.setTimeout(
        () => setGroundMotion("still"),
        900,
      );
      return () => window.clearTimeout(groundMotionTimer.current);
    }

    const motions: Exclude<GroundMotion, "still">[] = [
      "shuffle",
      "hop",
      "tilt",
    ];
    const delay = 3_500 + Math.random() * 4_500;
    groundMotionTimer.current = window.setTimeout(() => {
      const nextMotion = motions[Math.floor(Math.random() * motions.length)];
      setGroundMotion(nextMotion);
    }, delay);

    return () => window.clearTimeout(groundMotionTimer.current);
  }, [
    entrancePhase,
    groundMotion,
    isHovered,
    isOpen,
    isSleeping,
    reduceMotion,
    returnMode,
  ]);

  useEffect(() => {
    wakeCorvus();

    const handleVisibility = () => {
      if (document.hidden) {
        if (sleepTimer.current) window.clearTimeout(sleepTimer.current);
      } else {
        wakeCorvus();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      if (sleepTimer.current) window.clearTimeout(sleepTimer.current);
    };
  }, []);

  useEffect(
    () => () => {
      returnAnimation.current?.cancel();
      requestController.current?.abort();
      if (typingAnimationFrame.current !== null) {
        window.cancelAnimationFrame(typingAnimationFrame.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (!isOpen) return;

    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 180);
    return () => window.clearTimeout(focusTimer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    transcriptRef.current?.scrollTo({
      top: transcriptRef.current.scrollHeight,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, [isOpen, messages, reduceMotion]);

  useEffect(() => {
    if (!typingMessageId) return;

    const message = messages.find(({ id }) => id === typingMessageId);
    if (!message) return;

    if (reduceMotion) {
      setRevealedCharacters(message.text.length);
      setTypingMessageId(null);
      setChatPhase("ready");
      return;
    }

    const duration = Math.min(
      4_800,
      Math.max(1_000, (message.text.length / 55) * 1_000),
    );
    const startedAt = performance.now();
    let previousCount = -1;

    const reveal = (timestamp: number) => {
      const progress = Math.min(1, (timestamp - startedAt) / duration);
      const count = Math.min(
        message.text.length,
        Math.max(1, Math.floor(progress * message.text.length)),
      );

      if (count !== previousCount) {
        previousCount = count;
        setRevealedCharacters(count);
        const transcript = transcriptRef.current;
        if (transcript) transcript.scrollTop = transcript.scrollHeight;
      }

      if (progress < 1) {
        typingAnimationFrame.current = window.requestAnimationFrame(reveal);
        return;
      }

      typingAnimationFrame.current = null;
      setTypingMessageId(null);
      setChatPhase("ready");
      window.setTimeout(() => inputRef.current?.focus(), 0);
    };

    typingAnimationFrame.current = window.requestAnimationFrame(reveal);
    return () => {
      if (typingAnimationFrame.current !== null) {
        window.cancelAnimationFrame(typingAnimationFrame.current);
        typingAnimationFrame.current = null;
      }
    };
  }, [messages, reduceMotion, typingMessageId]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setIsOpen(false);
      triggerRef.current?.focus();
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const state: CrowMascotState =
    entrancePhase === "flight"
      ? "flight"
      : isOpen && chatPhase === "thinking"
        ? "thinking"
        : isOpen && chatPhase === "speaking"
          ? "speaking"
          : isOpen && chatPhase === "error"
            ? "error"
            : isOpen
              ? "listening"
              : isHovered
                ? "curious"
                : isSleeping
                  ? "sleeping"
                  : "idle";
  const displayedImage =
    returnMode === "walking"
      ? walkingFrames[walkFrame]
      : returnMode === "flying"
        ? flightFrames[flightFrame]
        : entrancePhase === "walking"
          ? walkingFrames[walkFrame]
          : entrancePhase === "preparing" || entrancePhase === "flight"
            ? flightFrames[flightFrame]
            : state === "speaking"
              ? speakingFrames[speakingFrame]
              : stateImages[state];
  const chatStatusLabel =
    chatPhase === "thinking"
      ? "Searching"
      : chatPhase === "speaking"
        ? "Answering"
        : chatPhase === "error"
          ? "Retry ready"
          : "Online";

  const finishDrag = (event: ReactPointerEvent<HTMLSpanElement>) => {
    const drag = dragState.current;
    const mascot = mascotRef.current;
    if (!drag || !mascot || event.pointerId !== drag.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragState.current = null;

    const distance = Math.hypot(drag.x, drag.y);
    if (distance < 6) {
      mascot.style.removeProperty("transform");
      setReturnMode("idle");
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    suppressClick.current = true;

    const birdHeight = birdRef.current?.getBoundingClientRect().height ?? 180;
    const flightThreshold = Math.max(72, birdHeight * 0.42);
    const mode: ReturnMode = drag.y < -flightThreshold ? "flying" : "walking";
    const direction: ReturnDirection = drag.x < 0 ? "right" : "left";
    setReturnDirection(direction);
    setReturnMode(mode);
    setFlightFrame(0);
    setWalkFrame(0);

    if (reduceMotion) {
      mascot.style.removeProperty("transform");
      setReturnMode("idle");
      return;
    }

    const duration = Math.min(
      mode === "flying" ? 1_350 : 2_200,
      Math.max(
        mode === "flying" ? 720 : 1_050,
        distance * (mode === "flying" ? 1.7 : 2.35),
      ),
    );
    const keyframes: Keyframe[] =
      mode === "flying"
        ? [
            { transform: `translate3d(${drag.x}px, ${drag.y}px, 0)` },
            {
              offset: 0.62,
              transform: `translate3d(${drag.x * 0.48}px, ${Math.min(drag.y * 0.5 - 42, -36)}px, 0)`,
            },
            { transform: "translate3d(0, 0, 0)" },
          ]
        : [
            { transform: `translate3d(${drag.x}px, ${drag.y}px, 0)` },
            {
              offset: 0.24,
              transform: `translate3d(${drag.x * 0.78}px, 0, 0)`,
            },
            { transform: "translate3d(0, 0, 0)" },
          ];

    mascot.style.removeProperty("transform");
    returnAnimation.current?.cancel();
    const animation = mascot.animate(keyframes, {
      duration,
      easing:
        mode === "flying"
          ? "cubic-bezier(0.22, 0.68, 0.2, 1)"
          : "cubic-bezier(0.34, 0.66, 0.32, 1)",
      fill: "both",
    });
    returnAnimation.current = animation;

    animation.finished
      .then(() => {
        if (returnAnimation.current !== animation) return;
        animation.cancel();
        returnAnimation.current = null;
        setReturnMode("idle");
        setFlightFrame(0);
        setWalkFrame(0);
      })
      .catch(() => undefined);
  };

  const handleDragStart = (event: ReactPointerEvent<HTMLSpanElement>) => {
    if (
      event.button !== 0 ||
      entrancePhase !== "settled" ||
      isOpen ||
      returnMode !== "idle"
    ) {
      return;
    }

    const mascot = mascotRef.current;
    if (!mascot) return;

    event.stopPropagation();
    wakeCorvus();
    setIsHovered(false);
    setGroundMotion("still");
    suppressClick.current = false;
    returnAnimation.current?.cancel();
    returnAnimation.current = null;
    dragState.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      x: 0,
      y: 0,
      bounds: mascot.getBoundingClientRect(),
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setReturnMode("dragging");
  };

  const handleDragMove = (event: ReactPointerEvent<HTMLSpanElement>) => {
    const drag = dragState.current;
    const mascot = mascotRef.current;
    if (!drag || !mascot || event.pointerId !== drag.pointerId) return;

    event.preventDefault();
    event.stopPropagation();
    const rawX = event.clientX - drag.startX;
    const rawY = event.clientY - drag.startY;
    const horizontalInset = 44;
    const verticalInset = 38;
    drag.x = Math.min(
      window.innerWidth - drag.bounds.left - horizontalInset,
      Math.max(-drag.bounds.right + horizontalInset, rawX),
    );
    drag.y = Math.min(
      window.innerHeight - drag.bounds.top - verticalInset,
      Math.max(-drag.bounds.bottom + verticalInset, rawY),
    );

    if (Math.hypot(drag.x, drag.y) >= 6) suppressClick.current = true;
    mascot.style.transform = `translate3d(${drag.x}px, ${drag.y}px, 0)`;
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (dragState.current || reduceMotion || event.pointerType === "touch") {
      return;
    }
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    event.currentTarget.style.setProperty("--look-x", `${x * 5}px`);
    event.currentTarget.style.setProperty("--look-y", `${y * 3}px`);
  };

  const resetPointer = (event: ReactPointerEvent<HTMLButtonElement>) => {
    setIsHovered(false);
    event.currentTarget.style.removeProperty("--look-x");
    event.currentTarget.style.removeProperty("--look-y");
  };

  const closeChat = () => {
    setIsOpen(false);
    setChatPhase("ready");
    setChatError("");
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  };

  const submitMessage = async (text: string) => {
    const message = text.trim();
    if (
      !message ||
      message.length > MAX_CHAT_MESSAGE_LENGTH ||
      chatPhase === "thinking" ||
      chatPhase === "speaking"
    ) {
      return;
    }

    wakeCorvus();
    setDraft("");
    setChatError("");
    setChatPhase("thinking");

    const visitorMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: message,
    };
    setMessages((current) => [...current, visitorMessage]);

    requestController.current?.abort();
    const controller = new AbortController();
    requestController.current = controller;

    try {
      const response = await fetch("/api/corvus-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          history: messages.slice(-6).map(({ role, text: historyText }) => ({
            role,
            text: historyText,
          })),
        }),
        signal: controller.signal,
      });
      const payload = (await response.json()) as {
        answer?: unknown;
        message?: unknown;
        retryAfter?: unknown;
      };

      if (!response.ok || typeof payload.answer !== "string") {
        const fallback =
          response.status === 429
            ? "Corvus needs a short rest. Try again in a few minutes."
            : "Corvus could not answer right now. Please try again.";
        throw new Error(
          typeof payload.message === "string" ? payload.message : fallback,
        );
      }

      const answer = payload.answer;
      const responseId = crypto.randomUUID();
      setMessages((current) => [
        ...current,
        { id: responseId, role: "model", text: answer },
      ]);
      setRevealedCharacters(0);
      setTypingMessageId(responseId);
      setChatPhase("speaking");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setChatError(
        error instanceof Error
          ? error.message
          : "Corvus could not answer right now. Please try again.",
      );
      setChatPhase("error");
    } finally {
      if (requestController.current === controller) {
        requestController.current = null;
      }
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitMessage(draft);
  };

  return (
    <aside
      ref={mascotRef}
      className={`corvus corvus--${state} corvus--entrance-${entrancePhase} corvus--ground-${groundMotion} corvus--return-${returnMode} corvus--return-${returnDirection} ${isOpen ? "corvus--open" : ""}`}
      aria-label="Corvus portfolio guide"
    >
      {isOpen && (
        <section
          className="corvus__card"
          id="corvus-introduction"
          aria-labelledby="corvus-title"
        >
          <div className="corvus__card-meta">
            <span className="corvus__profile" aria-hidden="true">
              <img src={corvusCurious} alt="" />
            </span>
            <span className="corvus__identity">
              <strong>Corvus</strong>
              <small>Portfolio guide</small>
            </span>
            <span className="corvus__card-state">{chatStatusLabel}</span>
            <button
              type="button"
              onClick={closeChat}
              aria-label="Close Corvus chat"
            >
              Close
            </button>
          </div>

          <div
            ref={transcriptRef}
            className="corvus__transcript"
            role="log"
            aria-live="polite"
            aria-relevant="additions text"
          >
            <div className="corvus__welcome">
              <h2 id="corvus-title">Ask about JM&rsquo;s work.</h2>
              <p>
                I&rsquo;m Corvus. I can guide you through JM&rsquo;s projects,
                experience, and capabilities.
              </p>
            </div>

            {messages.length === 0 && (
              <div
                className="corvus__starters"
                aria-label="Suggested questions"
              >
                {starterQuestions.map((question) => (
                  <button
                    type="button"
                    key={question}
                    onClick={() => void submitMessage(question)}
                  >
                    {question}
                    <span aria-hidden="true">↗</span>
                  </button>
                ))}
              </div>
            )}

            {messages.map((message) => {
              const isTyping =
                message.role === "model" && message.id === typingMessageId;
              const visibleText = isTyping
                ? message.text.slice(0, revealedCharacters)
                : message.text;

              return (
                <article
                  className={`corvus__message corvus__message--${message.role}${isTyping ? " is-typing" : ""}`}
                  key={message.id}
                >
                  {message.role === "model" && (
                    <span className="corvus__message-avatar" aria-hidden="true">
                      <img src={corvusCurious} alt="" />
                    </span>
                  )}
                  <div className="corvus__message-content">
                    <span className="corvus__message-author">
                      {message.role === "user" ? "You" : "Corvus"}
                    </span>
                    <p>
                      {message.role === "model" ? (
                        <>
                          <span
                            className="corvus__typed-text"
                            aria-hidden="true"
                          >
                            {visibleText}
                          </span>
                          <span className="corvus__sr-only">
                            {message.text}
                          </span>
                          {isTyping && (
                            <span
                              className="corvus__typing-cursor"
                              aria-hidden="true"
                            />
                          )}
                        </>
                      ) : (
                        message.text
                      )}
                    </p>
                  </div>
                </article>
              );
            })}

            {chatPhase === "thinking" && (
              <div
                className="corvus__thinking"
                aria-label="Corvus is searching"
              >
                <span>Searching JM&rsquo;s field notes</span>
                <i aria-hidden="true" />
                <i aria-hidden="true" />
                <i aria-hidden="true" />
              </div>
            )}

            {chatError && (
              <p className="corvus__chat-error" role="alert">
                {chatError}
              </p>
            )}
          </div>

          <form className="corvus__composer" onSubmit={handleSubmit}>
            <label htmlFor="corvus-message">Ask Corvus</label>
            <div className="corvus__composer-row">
              <textarea
                ref={inputRef}
                id="corvus-message"
                value={draft}
                maxLength={MAX_CHAT_MESSAGE_LENGTH}
                rows={1}
                placeholder="Ask about a project or capability…"
                disabled={chatPhase === "thinking" || chatPhase === "speaking"}
                onChange={(event) => {
                  setDraft(event.target.value);
                  setChatError("");
                  if (chatPhase === "error") setChatPhase("listening");
                }}
                onFocus={() => {
                  wakeCorvus();
                  if (chatPhase === "ready") setChatPhase("listening");
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
              />
              <button
                type="submit"
                disabled={
                  !draft.trim() ||
                  chatPhase === "thinking" ||
                  chatPhase === "speaking"
                }
                aria-label="Send message to Corvus"
              >
                <span aria-hidden="true">↗</span>
              </button>
            </div>
            <span className="corvus__composer-note">
              Enter to send · Shift + Enter for a new line
            </span>
          </form>
        </section>
      )}

      <button
        ref={triggerRef}
        className="corvus__trigger"
        type="button"
        aria-expanded={isOpen}
        aria-controls="corvus-introduction"
        aria-label={
          isOpen
            ? "Close Corvus portfolio guide"
            : "Open Corvus portfolio guide"
        }
        onClick={(event) => {
          if (suppressClick.current || returnMode !== "idle") {
            event.preventDefault();
            suppressClick.current = false;
            return;
          }
          wakeCorvus();
          if (isOpen) {
            closeChat();
          } else {
            setIsOpen(true);
          }
        }}
        onFocus={() => {
          wakeCorvus();
          setIsHovered(true);
        }}
        onBlur={() => setIsHovered(false)}
        onPointerEnter={() => {
          wakeCorvus();
          setIsHovered(true);
        }}
        onPointerMove={handlePointerMove}
        onPointerLeave={resetPointer}
      >
        <span
          ref={birdRef}
          className="corvus__bird"
          aria-hidden="true"
          onPointerDown={handleDragStart}
          onPointerMove={handleDragMove}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
        >
          <img
            src={displayedImage}
            alt=""
            width={
              entrancePhase === "walking" || returnMode === "walking"
                ? 512
                : 768
            }
            height={512}
          />
        </span>
        <span className="corvus__sleep-symbols" aria-hidden="true">
          <span>Z</span>
          <span>Z</span>
          <span>Z</span>
        </span>
        <span className="corvus__question-mark" aria-hidden="true">
          ?
        </span>
        <span className="corvus__rail">
          <span className="corvus__rail-mark" aria-hidden="true" />
          <span className="corvus__rail-copy">
            <small>Portfolio guide</small>
            <strong>{isOpen ? "Close Corvus" : "Ask Corvus"}</strong>
          </span>
          <span className="corvus__rail-arrow" aria-hidden="true">
            ↗
          </span>
        </span>
      </button>
      <span className="corvus__announcement" aria-live="polite">
        {chatPhase === "thinking"
          ? "Corvus is searching the portfolio knowledge."
          : chatPhase === "speaking"
            ? "Corvus answered your question."
            : isOpen
              ? "Corvus portfolio guide opened."
              : ""}
      </span>
    </aside>
  );
}
