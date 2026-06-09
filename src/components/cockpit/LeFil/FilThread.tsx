"use client";
import { useLayoutEffect, useRef, useCallback } from "react";

// Draws an animated SVG thread through all [data-fil-item] children of containerRef.
// Knot variants: data-fil-item="consult" (filled violet→teal) | "task" (dashed hollow).

export function FilThread({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  const build = useCallback(() => {
    const container = containerRef.current;
    const svg = svgRef.current;
    const path = pathRef.current;
    if (!container || !svg || !path) return;

    svg.querySelectorAll(".dyn-knot,.dyn-conn").forEach((n) => n.remove());

    const events = Array.from(container.querySelectorAll("[data-fil-item]")) as HTMLElement[];
    const totalH = container.scrollHeight;
    svg.style.height = `${totalH}px`;

    const pts = events.map((ev) => ({
      y: ev.offsetTop + Math.min(34, ev.offsetHeight / 2),
      kind: ev.dataset.filItem ?? "consult",
    }));

    if (!pts.length) return;

    const cx = 30;
    const sway = 12;
    let d = `M ${cx} 0`;
    let prevY = 0;
    pts.forEach((p, i) => {
      const dir = i % 2 === 0 ? 1 : -1;
      const midY = (prevY + p.y) / 2;
      d += ` C ${cx + dir * sway} ${midY}, ${cx - dir * sway} ${midY}, ${cx} ${p.y}`;
      prevY = p.y;
    });
    d += ` C ${cx + sway} ${prevY + 40}, ${cx - sway} ${prevY + 60}, ${cx} ${totalH}`;
    path.setAttribute("d", d);
    path.style.setProperty("--len", String(path.getTotalLength()));

    const ns = "http://www.w3.org/2000/svg";
    pts.forEach((p, i) => {
      const isTask = p.kind === "task";

      const conn = document.createElementNS(ns, "path");
      conn.setAttribute("class", "dyn-conn");
      conn.setAttribute("d", `M ${cx + 7} ${p.y} q 12 0 22 0`);
      conn.setAttribute("fill", "none");
      conn.setAttribute("stroke", "var(--line-2)");
      conn.setAttribute("stroke-width", "1.5");
      conn.setAttribute("stroke-dasharray", "2 4");

      const knot = document.createElementNS(ns, "circle");
      knot.setAttribute("class", "dyn-knot");
      knot.setAttribute("cx", String(cx));
      knot.setAttribute("cy", String(p.y));
      knot.setAttribute("r", isTask ? "5" : "7");
      knot.setAttribute("fill", isTask ? "var(--surface)" : "url(#nami-filgrad)");
      if (isTask) {
        knot.setAttribute("stroke", "var(--line-2)");
        knot.setAttribute("stroke-width", "2.5");
        knot.setAttribute("stroke-dasharray", "2.5 2.5");
      }
      knot.style.animationDelay = `${0.25 + i * 0.18}s`;

      svg.appendChild(conn);
      svg.appendChild(knot);
    });
  }, [containerRef]);

  useLayoutEffect(() => {
    build();
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(build);
    obs.observe(el);
    return () => obs.disconnect();
  }, [build]);

  return (
    <>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="nami-filgrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--violet)" />
            <stop offset="1" stopColor="var(--teal)" />
          </linearGradient>
        </defs>
      </svg>
      <svg
        ref={svgRef}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 62,
          overflow: "visible",
          zIndex: 2,
          pointerEvents: "none",
        }}
        aria-hidden="true"
      >
        <path
          ref={pathRef}
          fill="none"
          stroke="url(#nami-filgrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </>
  );
}
