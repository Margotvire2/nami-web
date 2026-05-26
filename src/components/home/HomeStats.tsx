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

// Source : interne — comptages base documentaire Nami au 2026-05-25
// - 60 000+ sources : référentiel vectorisé (HAS, DSM-5, FFAB, Orphanet, BDPM, ICD-11)
// - 10 référentiels internationaux : HAS, NICE, OMS, DSM-5, ICD-11, MeSH, LOINC, Orphanet, BDPM, FFAB
// - 131 parcours structurés : templates DB pluridisciplinaires
// - 2 362 étapes : PathwayTemplateStep sourcées en DB (moyenne 18 étapes/parcours)
// Chiffres factuels, vérifiables — aucune promesse thérapeutique, aucun superlatif.
export function HomeStats() {
  const c1 = useCounter(60000);
  const c2 = useCounter(10);
  const c3 = useCounter(131);
  const c4 = useCounter(2362);

  const stats = [
    { ref: c1, suffix: "+", srValue: "Plus de soixante mille", label: "Sources cliniques\nindexées", srLabel: "sources cliniques indexées", color: "var(--nami-primary)" },
    { ref: c2, suffix: "", srValue: "Dix", label: "Référentiels\ninternationaux", srLabel: "référentiels internationaux", color: "var(--nami-secondary)" },
    { ref: c3, suffix: "", srValue: "Cent trente-et-un", label: "Parcours de\nsoin structurés", srLabel: "parcours de soin structurés", color: "var(--nami-primary)" },
    { ref: c4, suffix: "", srValue: "Deux mille trois cent soixante-deux", label: "Étapes de\nparcours sourcées", srLabel: "étapes de parcours sourcées", color: "var(--nami-secondary)" },
  ];

  return (
    <section
      role="region"
      aria-labelledby="home-stats-title"
      style={{ padding: "110px 24px", background: "var(--nami-white)", borderTop: "1px solid rgba(26,26,46,0.06)", borderBottom: "1px solid rgba(26,26,46,0.06)" }}
    >
      <h2 id="home-stats-title" className="sr-only">Chiffres clés Nami — base documentaire et parcours</h2>
      <p style={{ textAlign: "center", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--nami-text-3)", textTransform: "uppercase", marginBottom: 60 }} aria-hidden="true">
        Infrastructure de coordination réelle — pas des mocks
      </p>
      <ul
        role="list"
        className="landing-stats-grid"
        style={{ maxWidth: 1000, margin: "0 auto", padding: 0, listStyle: "none", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 40, textAlign: "center" }}
      >
        {stats.map((s, i) => (
          <li key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <div aria-hidden="true" style={{ fontSize: "clamp(2.6rem,5vw,4rem)", fontWeight: 800, letterSpacing: "-0.04em", color: s.color, lineHeight: 1 }}>
              <span ref={s.ref}>0</span>{s.suffix}
            </div>
            <span className="sr-only">{s.srValue} {s.srLabel}</span>
            <p aria-hidden="true" style={{ fontSize: 12, color: "var(--nami-text-3)", textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "pre-line", lineHeight: 1.5 }}>{s.label}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
