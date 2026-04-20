"use client";

import { useEffect, useRef, useState } from "react";

export function HomeSticky() {
  const stickyRef = useRef<HTMLDivElement>(null);
  const [stickyProgress, setStickyProgress] = useState(0);

  useEffect(() => {
    const h = () => {
      const el = stickyRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, -rect.top / (el.offsetHeight - window.innerHeight)));
      setStickyProgress(p);
    };
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const panel = stickyProgress < 0.33 ? 0 : stickyProgress < 0.66 ? 1 : 2;

  return (
    <div ref={stickyRef} style={{ height: "320vh", position: "relative" }}>
      <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--nami-dark)" }}>
        <div className="landing-sticky-grid" style={{ maxWidth: 1100, width: "100%", padding: "0 48px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>

          {/* Left — text panels */}
          <div style={{ position: "relative", minHeight: 280 }}>
            {[
              {
                tag: "LE PROBLÈME",
                title: "Trois soignants.\nZéro coordination.",
                body: "Le médecin ne sait pas ce que la diét a dit. La psychologue ignore les dernières analyses. Les parents font le lien entre tous. Par SMS.",
                color: "#E06B6B",
              },
              {
                tag: "LA CONSÉQUENCE",
                title: "4 mois perdus.\nUn patient épuisé.",
                body: "Chaque consultation repart de zéro. Les informations se perdent. Le patient — ou ses parents — devient coordinateur de son propre parcours.",
                color: "#E69342",
              },
              {
                tag: "LA SOLUTION",
                title: "Nami transfère\ncette charge.",
                body: "Du patient vers les soignants. Un dossier partagé. Une activité du dossier commune. Une décision collective en quelques clics.",
                color: "#7B6FD4",
              },
            ].map((p, i) => (
              <div
                key={i}
                style={{
                  position: i === 0 ? "relative" : "absolute",
                  top: 0, left: 0, right: 0,
                  opacity: panel === i ? 1 : 0,
                  transform: panel === i ? "none" : panel > i ? "translateY(-20px)" : "translateY(20px)",
                  transition: "opacity 0.5s cubic-bezier(0.16,1,0.3,1), transform 0.5s cubic-bezier(0.16,1,0.3,1)",
                  pointerEvents: panel === i ? "auto" : "none",
                }}
              >
                <div style={{ display: "inline-block", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: p.color, textTransform: "uppercase", marginBottom: 20, padding: "5px 14px", border: `1px solid ${p.color}40`, borderRadius: 100, background: `${p.color}12` }}>{p.tag}</div>
                <h2 style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1, color: "#EEECEA", marginBottom: 20, whiteSpace: "pre-line" }}>{p.title}</h2>
                <p style={{ fontSize: "1.05rem", color: "rgba(238,236,234,0.55)", lineHeight: 1.7, maxWidth: 420 }}>{p.body}</p>
              </div>
            ))}
          </div>

          {/* Right — progress + visual card */}
          <div className="landing-sticky-right" style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: -28, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 10 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 3, height: panel === i ? 44 : 22, borderRadius: 2, background: panel === i ? "#7B6FD4" : "rgba(238,236,234,0.12)", transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)" }} />
              ))}
            </div>

            {panel === 0 && (
              <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 24, border: "1px solid rgba(255,255,255,0.08)", padding: 32 }}>
                <p style={{ color: "rgba(238,236,234,0.3)", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20 }}>Canal de coordination actuel</p>
                {[
                  "SMS 🩺 Médecin → Dr Suela : « bilan reçu ? »",
                  "Email Dr Suela → parents : « dernier poids ? »",
                  "SMS Parents → Psy : « on refait le point ? »",
                  "Email Psy → tous : réunion annulée 😔",
                ].map((msg, i) => (
                  <div key={i} style={{ padding: "11px 14px", borderRadius: 10, background: i < 3 ? "rgba(255,255,255,0.03)" : "rgba(224,107,107,0.08)", marginBottom: 8, fontSize: 13, color: i < 3 ? "rgba(238,236,234,0.55)" : "#E06B6B", border: i < 3 ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(224,107,107,0.2)" }}>
                    {msg}
                  </div>
                ))}
                <div style={{ marginTop: 14, padding: "9px 14px", borderRadius: 10, background: "rgba(224,107,107,0.08)", border: "1px solid rgba(224,107,107,0.2)", fontSize: 12, color: "#E06B6B", textAlign: "center", fontWeight: 600 }}>
                  4 mois de délai · 0 décision commune
                </div>
              </div>
            )}
            {panel === 1 && (
              <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 24, border: "1px solid rgba(255,255,255,0.08)", padding: 32 }}>
                <p style={{ color: "rgba(238,236,234,0.3)", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20 }}>Ce que chaque soignant ignore</p>
                {[
                  { who: "👩‍⚕️ Médecin", missing: "N'a pas vu la séance psy de lundi" },
                  { who: "🥗 Diét", missing: "Ne sait pas que le poids a évolué de 2 kg" },
                  { who: "🧠 Psychologue", missing: "Ignore les nouveaux bilans biologiques" },
                  { who: "👨‍👩‍👧 Parents", missing: "Répètent la même histoire à chaque RDV" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "11px 0", borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                    <span style={{ fontSize: 14, opacity: 0.8, whiteSpace: "nowrap" }}>{item.who}</span>
                    <span style={{ fontSize: 13, color: "#E69342", flex: 1 }}>← {item.missing}</span>
                  </div>
                ))}
              </div>
            )}
            {panel === 2 && (
              <div style={{ background: "rgba(91,78,196,0.1)", borderRadius: 24, border: "1px solid rgba(91,78,196,0.25)", padding: 32 }}>
                <p style={{ color: "#7B6FD4", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20 }}>Avec Nami</p>
                {[
                  "Dossier partagé — tout le monde voit tout",
                  "Activité du dossier centralisée",
                  "RCP virtuelle en 2 clics",
                  "Parents informés, pas coordinateurs",
                ].map((text, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "11px 0", borderBottom: i < 3 ? "1px solid rgba(91,78,196,0.12)" : "none" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="rgba(91,78,196,0.2)" /><path d="M8 12l3 3 5-5" stroke="#7B6FD4" strokeWidth="2" strokeLinecap="round" /></svg>
                    <span style={{ fontSize: 14, color: "rgba(238,236,234,0.8)" }}>{text}</span>
                  </div>
                ))}
                <div style={{ marginTop: 18, padding: "10px 14px", borderRadius: 10, background: "rgba(91,78,196,0.15)", border: "1px solid rgba(91,78,196,0.3)", fontSize: 13, color: "#7B6FD4", textAlign: "center", fontWeight: 700 }}>
                  Décision collective en 1 session
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
