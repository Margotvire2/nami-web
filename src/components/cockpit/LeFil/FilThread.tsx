"use client";
import { useLayoutEffect, useRef, useCallback, useEffect } from "react";

export function FilThread({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const orbGroupRef = useRef<SVGGElement>(null);

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
      knot.setAttribute("r", isTask ? "4" : "6");
      knot.setAttribute("fill", isTask ? "var(--paper)" : "url(#nami-filgrad)");
      if (isTask) {
        knot.setAttribute("stroke", "var(--line-2)");
        knot.setAttribute("stroke-width", "2");
        knot.setAttribute("stroke-dasharray", "2 2");
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

  // Scroll-linked orb: moves along the thread path as user scrolls
  useEffect(() => {
    const scrollEl = containerRef.current?.closest("main") as HTMLElement | null;
    if (!scrollEl) return;

    const update = () => {
      const path = pathRef.current;
      const orbGroup = orbGroupRef.current;
      if (!path || !orbGroup) return;
      const totalLen = path.getTotalLength();
      if (totalLen === 0) return;

      const { scrollTop, scrollHeight, clientHeight } = scrollEl;
      const progress = scrollHeight > clientHeight ? scrollTop / (scrollHeight - clientHeight) : 0;
      const pt = path.getPointAtLength(Math.min(progress, 1) * totalLen);
      orbGroup.style.transform = `translate(${pt.x}px, ${pt.y}px)`;
    };

    scrollEl.addEventListener("scroll", update, { passive: true });
    // Delay initial call to ensure path is built
    const t = setTimeout(update, 60);
    return () => {
      scrollEl.removeEventListener("scroll", update);
      clearTimeout(t);
    };
  }, [containerRef]);

  return (
    <>
      {/* Defs: gradient + glow filter */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="nami-filgrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--violet)" />
            <stop offset="1" stopColor="var(--teal)" />
          </linearGradient>
          <filter id="nami-orb-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
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
        {/* Thread path */}
        <path
          ref={pathRef}
          fill="none"
          stroke="url(#nami-filgrad)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.5"
        />

        {/* Scroll-position orb */}
        <g
          ref={orbGroupRef}
          style={{ transition: "transform 0.55s cubic-bezier(0.16,1,0.3,1)" }}
        >
          {/* Outer breathing halo */}
          <circle
            r="20"
            fill="rgba(91,78,196,0.05)"
            style={{
              animation: "orb-breathe 3s ease-in-out infinite",
              transformOrigin: "0 0",
              transformBox: "fill-box",
            }}
          />
          {/* Spinning dashed ring */}
          <circle
            r="13"
            fill="none"
            stroke="url(#nami-filgrad)"
            strokeWidth="1.5"
            strokeDasharray="14 10"
            opacity="0.7"
            style={{
              animation: "orb-spin 6s linear infinite",
              transformOrigin: "0 0",
              transformBox: "fill-box",
            }}
          />
          {/* Core glow ball */}
          <circle r="7" fill="url(#nami-filgrad)" filter="url(#nami-orb-glow)" />
          {/* Bright inner dot */}
          <circle r="2.5" fill="rgba(255,255,255,0.85)" />
        </g>
      </svg>

      <style>{`
        @keyframes orb-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes orb-breathe {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%       { opacity: 0;   transform: scale(1.6); }
        }
      `}</style>
    </>
  );
}
