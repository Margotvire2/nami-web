"use client";

import { useEffect, useRef, useState } from "react";

function useCounter(target: number, duration = 1800) {
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setStarted(true); obs.unobserve(el); } },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  useEffect(() => {
    if (!started || !ref.current) return;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      ref.current!.textContent = Math.round(target * eased).toLocaleString("fr-FR");
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, target, duration]);
  return ref;
}

export function HomeStats() {
  const c1 = useCounter(60000);
  const c2 = useCounter(10);
  const c3 = useCounter(131);
  const c4 = useCounter(2362);

  return (
    <section style={{ padding: "110px 24px", background: "var(--nami-white)", borderTop: "1px solid rgba(26,26,46,0.06)", borderBottom: "1px solid rgba(26,26,46,0.06)" }}>
      <p style={{ textAlign: "center", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--nami-text-3)", textTransform: "uppercase", marginBottom: 60 }}>
        Infrastructure de coordination réelle — pas des mocks
      </p>
      <div className="landing-stats-grid" style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 40, textAlign: "center" }}>
        {[
          { ref: c1, suffix: "+", label: "Sources cliniques\nindexées", color: "var(--nami-primary)" },
          { ref: c2, suffix: "", label: "Référentiels\ninternationaux", color: "var(--nami-secondary)" },
          { ref: c3, suffix: "", label: "Parcours de\nsoin structurés", color: "var(--nami-primary)" },
          { ref: c4, suffix: "", label: "Étapes de\nparcours sourcées", color: "var(--nami-secondary)" },
        ].map((s, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: "clamp(2.6rem,5vw,4rem)", fontWeight: 800, letterSpacing: "-0.04em", color: s.color, lineHeight: 1 }}>
              <span ref={s.ref}>0</span>{s.suffix}
            </div>
            <p style={{ fontSize: 12, color: "var(--nami-text-3)", textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "pre-line", lineHeight: 1.5 }}>{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
