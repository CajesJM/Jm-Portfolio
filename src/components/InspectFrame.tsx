import { useRef, useState, type ReactNode, type MouseEvent } from "react";
import "./InspectFrame.css";

export default function InspectFrame({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ w: 0, h: 0 });

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setCoords({
      x: Math.round(e.clientX - rect.left),
      y: Math.round(e.clientY - rect.top),
    });
    setSize({ w: Math.round(rect.width), h: Math.round(rect.height) });
  }

  return (
    <div
      ref={ref}
      className={`inspect-frame ${active ? "is-active" : ""}`}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onMouseMove={handleMove}
    >
      {children}

      {active && (
        <>
          <span className="inspect-frame__tag inspect-frame__tag--tl mono">
            {label}
          </span>
          <span className="inspect-frame__tag inspect-frame__tag--br mono">
            {size.w} × {size.h}
          </span>
          <span
            className="inspect-frame__cursor mono"
            style={{ left: coords.x, top: coords.y }}
          >
            {coords.x}, {coords.y}
          </span>
        </>
      )}
    </div>
  );
}
