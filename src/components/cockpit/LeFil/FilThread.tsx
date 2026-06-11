"use client";
import { useLayoutEffect, useRef, useCallback, useEffect } from "react";

const CX = 30;          // thread center-x in the SVG
const RING_R = 64;      // large ring radius — extends past the 60px left gutter into cards
const DEG_PER_PX = 0.32; // rotation sensitivity

export function FilThread({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const svgRef      = useRef<SVGSVGElement>(null);
  const pathRef     = useRef<SVGPathElement>(null);
  const ringRef     = useRef<SVGCircleElement>(null);
  const rotRef      = useRef(0);
  const lastScrollRef = useRef(0);
  const rafRef      = useRef<number>(0);
  const dirtyRef    = useRef(false);

  // ── Build thread path + event knots ────────────────────────────────────
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

    const sway = 12;
    let d = `M ${CX} 0`;
    let prevY = 0;
    pts.forEach((p, i) => {
      const dir = i % 2 === 0 ? 1 : -1;
      const midY = (prevY + p.y) / 2;
      d += ` C ${CX + dir * sway} ${midY}, ${CX - dir * sway} ${midY}, ${CX} ${p.y}`;
      prevY = p.y;
    });
    d += ` C ${CX + sway} ${prevY + 40}, ${CX - sway} ${prevY + 60}, ${CX} ${totalH}`;
    path.setAttribute("d", d);

    const ns = "http://www.w3.org/2000/svg";
    pts.forEach((p, i) => {
      const isTask = p.kind === "task";

      const conn = document.createElementNS(ns, "path");
      conn.setAttribute("class", "dyn-conn");
      conn.setAttribute("d", `M ${CX + 7} ${p.y} q 12 0 22 0`);
      conn.setAttribute("fill", "none");
      conn.setAttribute("stroke", "var(--line-2)");
      conn.setAttribute("stroke-width", "1.5");
      conn.setAttribute("stroke-dasharray", "2 4");

      const knot = document.createElementNS(ns, "circle");
      knot.setAttribute("class", "dyn-knot");
      knot.setAttribute("cx", String(CX));
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

  // ── Scroll → directional ring rotation ──────────────────────────────────
  useEffect(() => {
    const scrollEl = containerRef.current?.closest("main") as HTMLElement | null;
    if (!scrollEl) return;

    lastScrollRef.current = scrollEl.scrollTop;

    const flush = () => {
      dirtyRef.current = false;
      const ring = ringRef.current;
      if (!ring) return;
      // SVG rotate transform: rotate(angle, cx, cy) keeps centre stable
      ring.setAttribute("transform", `rotate(${rotRef.current} ${CX} 0)`);
    };

    const onScroll = () => {
      const current = scrollEl.scrollTop;
      const delta = current - lastScrollRef.current;
      lastScrollRef.current = current;
      rotRef.current += delta * DEG_PER_PX;
      if (!dirtyRef.current) {
        dirtyRef.current = true;
        rafRef.current = requestAnimationFrame(flush);
      }
    };

    scrollEl.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      scrollEl.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [containerRef]);

  return (
    <>
      {/* ── Shared defs (gradient + glow) ── */}
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

      {/* ── Thread path SVG ── */}
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
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.5"
        />
      </svg>

      {/*
       * ── RING — sticky anchor, zIndex 2 (renders BEHIND cards at zIndex 3) ──
       * position: sticky keeps it glued to the viewport; the large ring (r=64)
       * extends past the 60px left gutter into the card area but is hidden
       * behind cards thanks to the lower z-index.
       */}
      <div
        style={{
          position: "sticky",
          top: "38vh",
          width: 62,
          height: 0,
          overflow: "visible",
          pointerEvents: "none",
          zIndex: 2,
        }}
      >
        <svg
          style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}
          width="1"
          height="1"
          aria-hidden="true"
        >
          {/* Breathing outer halo */}
          <circle
            cx={CX}
            cy={0}
            r={28}
            fill="rgba(90,71,201,0.05)"
            style={{
              animation: "fil-breathe 3.5s ease-in-out infinite",
              transformOrigin: `${CX}px 0px`,
            }}
          />
          {/* Large dashed ring — scroll-driven rotation */}
          <circle
            ref={ringRef}
            cx={CX}
            cy={0}
            r={RING_R}
            fill="none"
            stroke="url(#nami-filgrad)"
            strokeWidth="1.5"
            strokeDasharray="24 14"
            opacity="0.28"
          />
          {/* Secondary inner ring (half size, opposite drift effect) */}
          <circle
            cx={CX}
            cy={0}
            r={36}
            fill="none"
            stroke="rgba(90,71,201,0.18)"
            strokeWidth="1"
            strokeDasharray="6 18"
            opacity="0.6"
          />
        </svg>
      </div>

      {/*
       * ── CORE ORB — sticky anchor, zIndex 5 (renders ABOVE cards at zIndex 3) ──
       * Same top as ring, so they visually overlap with core on top.
       */}
      <div
        style={{
          position: "sticky",
          top: "38vh",
          width: 62,
          height: 0,
          overflow: "visible",
          pointerEvents: "none",
          zIndex: 5,
        }}
      >
        <svg
          style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}
          width="1"
          height="1"
          aria-hidden="true"
        >
          {/* Glow ball */}
          <circle cx={CX} cy={0} r={9} fill="url(#nami-filgrad)" filter="url(#nami-orb-glow)" />
          {/* Bright inner dot */}
          <circle cx={CX} cy={0} r={3.5} fill="rgba(255,255,255,0.92)" />
        </svg>
      </div>

      <style>{`
        @keyframes fil-breathe {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50%       { opacity: 0;   transform: scale(2); }
        }
      `}</style>
    </>
  );
}
