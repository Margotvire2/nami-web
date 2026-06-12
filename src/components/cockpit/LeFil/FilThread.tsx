"use client";
import { useLayoutEffect, useRef, useCallback, useEffect } from "react";

const CX = 30;           // thread center-x
const RING_R = 76;       // outer ring radius — bleeds into cards (behind them)
const RING2_R = 50;      // counter-rotating mid ring
const RING3_R = 34;      // inner static ring
const DEG_PER_PX = 0.36; // rotation sensitivity
const SCALE_MIN = 0.60;  // orb scale at page edges
const SCALE_MAX = 1.45;  // orb scale at page center

export function FilThread({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  // SVG thread
  const svgRef  = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  // Rings (SVG circles)
  const ring1Ref = useRef<SVGCircleElement>(null); // outer CW
  const ring2Ref = useRef<SVGCircleElement>(null); // mid CCW
  const haloRef  = useRef<SVGCircleElement>(null); // velocity halo

  // Scale wrappers (one per sticky layer)
  const ringSVGScaleRef = useRef<SVGSVGElement>(null); // ring layer SVG gets scale via transform
  const orbScaleRef     = useRef<HTMLDivElement>(null); // orb layer

  // Scroll state — all stored in refs to avoid React re-renders
  const rot1Ref       = useRef(0);
  const rot2Ref       = useRef(0);
  const lastScrollRef = useRef(0);
  const velRef        = useRef(0);
  const scaleRef      = useRef(1);
  const targetScRef   = useRef(1);
  const rafRef        = useRef<number>(0);
  const dirtyRef      = useRef(false);

  // ── Build thread path + event knots ─────────────────────────────────────
  const build = useCallback(() => {
    const container = containerRef.current;
    const svg = svgRef.current;
    const path = pathRef.current;
    if (!container || !svg || !path) return;

    svg.querySelectorAll(".dyn-knot,.dyn-conn").forEach((n) => n.remove());

    const events = Array.from(
      container.querySelectorAll("[data-fil-item]"),
    ) as HTMLElement[];
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
      knot.setAttribute("fill", isTask ? "var(--paper)" : "url(#fil-grad)");
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

  // ── Scroll → rotation + scale + velocity glow ────────────────────────────
  useEffect(() => {
    const scrollEl = containerRef.current?.closest("main") as HTMLElement | null;
    if (!scrollEl) return;

    lastScrollRef.current = scrollEl.scrollTop;

    const computeScale = (scrollTop: number): number => {
      const maxScroll = scrollEl.scrollHeight - scrollEl.clientHeight;
      if (maxScroll <= 0) return 1;
      const t = Math.max(0, Math.min(1, scrollTop / maxScroll));
      // Peak at t=0.5 (middle of document), taper to SCALE_MIN at edges
      return SCALE_MIN + (SCALE_MAX - SCALE_MIN) * Math.sin(t * Math.PI);
    };

    // Apply transform to both sticky layers using SVG viewBox trick
    // The ring SVG uses a transform attribute; the orb div uses style.transform
    const applyScale = (s: number) => {
      // Ring SVG: transform on the svg element itself, origin = (CX, 0)
      const rsvg = ringSVGScaleRef.current;
      if (rsvg) {
        rsvg.style.transformOrigin = `${CX}px 0px`;
        rsvg.style.transform = `scale(${s})`;
      }
      // Orb div
      const od = orbScaleRef.current;
      if (od) {
        od.style.transformOrigin = `${CX}px 0px`;
        od.style.transform = `scale(${s})`;
      }
    };

    const flush = () => {
      dirtyRef.current = false;

      // Ring rotations
      const r1 = ring1Ref.current;
      const r2 = ring2Ref.current;
      if (r1) r1.setAttribute("transform", `rotate(${rot1Ref.current} ${CX} 0)`);
      if (r2) r2.setAttribute("transform", `rotate(${rot2Ref.current} ${CX} 0)`);

      // Smooth lerp scale toward target
      const prev = scaleRef.current;
      const tgt = targetScRef.current;
      const next = prev + (tgt - prev) * 0.07;
      scaleRef.current = next;
      applyScale(next);

      // Velocity-driven halo pulse
      const h = haloRef.current;
      if (h) {
        const absV = Math.min(Math.abs(velRef.current), 40);
        const r = 22 + (absV / 40) * 28;
        const alpha = 0.04 + (absV / 40) * 0.20;
        h.setAttribute("r", String(r));
        h.setAttribute("fill", `rgba(90,71,201,${alpha.toFixed(3)})`);
      }

      // Keep ticking while scale still needs to settle
      if (Math.abs(next - tgt) > 0.002) {
        dirtyRef.current = true;
        rafRef.current = requestAnimationFrame(flush);
      }
    };

    const onScroll = () => {
      const current = scrollEl.scrollTop;
      const delta = current - lastScrollRef.current;
      lastScrollRef.current = current;

      // Velocity: decay toward 0 each tick
      velRef.current = velRef.current * 0.6 + delta * 0.4;

      rot1Ref.current += delta * DEG_PER_PX;
      rot2Ref.current -= delta * DEG_PER_PX * 0.55; // counter, slightly slower

      targetScRef.current = computeScale(current);

      if (!dirtyRef.current) {
        dirtyRef.current = true;
        rafRef.current = requestAnimationFrame(flush);
      }
    };

    // Seed initial scale
    const initScale = computeScale(scrollEl.scrollTop);
    scaleRef.current = initScale;
    targetScRef.current = initScale;
    applyScale(initScale);

    scrollEl.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      scrollEl.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [containerRef]);

  return (
    <>
      {/* ── Shared SVG defs ── */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="fil-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5A47C9" />
            <stop offset="100%" stopColor="#2BA89C" />
          </linearGradient>
          <linearGradient id="fil-grad-h" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#5A47C9" />
            <stop offset="100%" stopColor="#2BA89C" />
          </linearGradient>
          {/* Deep glow for orb */}
          <filter id="fil-glow-deep" x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="b1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b2" />
            <feMerge>
              <feMergeNode in="b1" />
              <feMergeNode in="b2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Soft ring glow */}
          <filter id="fil-ring-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
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
        style={{ position: "absolute", left: 0, top: 0, width: 62, overflow: "visible", zIndex: 2, pointerEvents: "none" }}
        aria-hidden="true"
      >
        <path
          ref={pathRef}
          fill="none"
          stroke="url(#fil-grad)"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.45"
        />
      </svg>

      {/*
       * RING LAYER — sticky z:2 (behind cards at z:3)
       * Large ring bleeds into the card area; lower z-index hides it behind cards.
       */}
      <div
        style={{ position: "sticky", top: "38vh", width: 62, height: 0, overflow: "visible", pointerEvents: "none", zIndex: 2 }}
      >
        <svg
          ref={ringSVGScaleRef}
          style={{ position: "absolute", left: 0, top: 0, overflow: "visible", willChange: "transform" }}
          width="1"
          height="1"
          aria-hidden="true"
        >
          {/* Velocity-driven halo (outermost, pulsing glow) */}
          <circle
            ref={haloRef}
            cx={CX}
            cy={0}
            r={22}
            fill="rgba(90,71,201,0.04)"
          />
          {/* Slow CSS breathe ring */}
          <circle
            cx={CX}
            cy={0}
            r={32}
            fill="rgba(90,71,201,0.04)"
            style={{ animation: "fil-breathe 3.8s ease-in-out infinite", transformOrigin: `${CX}px 0px` }}
          />
          {/* OUTER ring — large, CW, gradient stroke */}
          <circle
            ref={ring1Ref}
            cx={CX}
            cy={0}
            r={RING_R}
            fill="none"
            stroke="url(#fil-grad)"
            strokeWidth="1.5"
            strokeDasharray="30 18"
            opacity="0.32"
            filter="url(#fil-ring-glow)"
          />
          {/* MID ring — CCW, teal accent */}
          <circle
            ref={ring2Ref}
            cx={CX}
            cy={0}
            r={RING2_R}
            fill="none"
            stroke="rgba(43,168,156,0.28)"
            strokeWidth="1"
            strokeDasharray="10 24"
            opacity="0.9"
          />
          {/* INNER ring — static, violet ghost */}
          <circle
            cx={CX}
            cy={0}
            r={RING3_R}
            fill="none"
            stroke="rgba(90,71,201,0.14)"
            strokeWidth="0.75"
            strokeDasharray="4 10"
          />
        </svg>
      </div>

      {/*
       * ORB LAYER — sticky z:5 (above cards)
       * Core orb + plasma effect live here.
       */}
      <div
        style={{ position: "sticky", top: "38vh", width: 62, height: 0, overflow: "visible", pointerEvents: "none", zIndex: 5 }}
      >
        <div
          ref={orbScaleRef}
          style={{ position: "absolute", left: 0, top: 0, willChange: "transform" }}
        >
          {/* Plasma layer — pure CSS, Siri-style conic lava lamp */}
          <div
            className="fil-plasma"
            style={{ position: "absolute", left: CX - 18, top: -18, width: 36, height: 36 }}
          />

          <svg
            style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}
            width="1"
            height="1"
            aria-hidden="true"
          >
            {/* Deep glow halo */}
            <circle
              cx={CX}
              cy={0}
              r={11}
              fill="url(#fil-grad)"
              opacity="0.35"
              filter="url(#fil-glow-deep)"
            />
            {/* Main orb */}
            <circle
              cx={CX}
              cy={0}
              r={8}
              fill="url(#fil-grad)"
              filter="url(#fil-glow-deep)"
              opacity="0.92"
            />
            {/* Bright core dot */}
            <circle cx={CX} cy={0} r={3.2} fill="rgba(255,255,255,0.96)" />
            {/* Subtle shimmer ring */}
            <circle
              cx={CX}
              cy={0}
              r={5.5}
              fill="none"
              stroke="rgba(255,255,255,0.30)"
              strokeWidth="0.75"
            />
          </svg>
        </div>
      </div>

      <style>{`
        @keyframes fil-breathe {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%       { opacity: 0;   transform: scale(2.8); }
        }

        @property --fil-a {
          syntax: "<angle>";
          inherits: false;
          initial-value: 0deg;
        }

        /* Siri-style plasma orb — conic gradients + blur/contrast trick */
        .fil-plasma {
          border-radius: 50%;
          background:
            conic-gradient(
              from calc(var(--fil-a) * 1.4) at 38% 62%,
              rgba(90,71,201,0.95) 0deg,
              transparent 55deg 305deg,
              rgba(90,71,201,0.95) 360deg
            ),
            conic-gradient(
              from calc(var(--fil-a) * -0.9) at 62% 38%,
              rgba(43,168,156,0.90) 0deg,
              transparent 65deg 295deg,
              rgba(43,168,156,0.90) 360deg
            ),
            conic-gradient(
              from calc(var(--fil-a) * 2.2) at 55% 78%,
              rgba(130,90,210,0.80) 0deg,
              transparent 45deg 315deg,
              rgba(130,90,210,0.80) 360deg
            ),
            conic-gradient(
              from calc(var(--fil-a) * -1.6) at 28% 28%,
              rgba(60,180,160,0.70) 0deg,
              transparent 50deg 310deg,
              rgba(60,180,160,0.70) 360deg
            );
          filter: blur(6px) contrast(1.8) saturate(1.4);
          animation: fil-plasma-rot 7s linear infinite;
          opacity: 0.88;
          mix-blend-mode: screen;
        }

        @keyframes fil-plasma-rot {
          from { --fil-a: 0deg; }
          to   { --fil-a: 360deg; }
        }
      `}</style>
    </>
  );
}
