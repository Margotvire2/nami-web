"use client";

import { useState } from "react";
import { ProtocoleRecherche } from "./ProtocoleRecherche";
import { RevueLitterature } from "./RevueLitterature";
import { GuideEntretien } from "./GuideEntretien";

const C = {
  primary: "#5B4EC4",
  teal: "#2BA89C",
  dark: "#1A1A2E",
  bg: "#FAFAF8",
  border: "rgba(26,26,46,0.06)",
};
const f = "'Plus Jakarta Sans',system-ui,sans-serif";
const m = "'Inter',system-ui,sans-serif";

type Tab = "protocole" | "revue" | "guide";

export function DUTCALayout() {
  const [active, setActive] = useState<Tab>("protocole");

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: f }}>
      {/* TOP NAV */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(250,250,248,0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: `1px solid ${C.border}`,
        padding: "0 20px",
      }}>
        <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", alignItems: "center", gap: 8, height: 52 }}>
          {/* Logo pill */}
          <div style={{ marginRight: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 26, height: 26, borderRadius: 8,
              background: `linear-gradient(135deg, ${C.primary}, ${C.teal})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, flexShrink: 0,
            }}>🎓</div>
            <span style={{ fontFamily: m, fontSize: 11, fontWeight: 700, color: C.dark, letterSpacing: 0.2 }}>
              DU TCA Enfant-Adolescent
            </span>
            <span style={{ fontFamily: m, fontSize: 10, color: `${C.dark}40` }}>·</span>
            <span style={{ fontFamily: m, fontSize: 10.5, color: `${C.dark}50` }}>Margot Vire</span>
          </div>

          {/* Tab switcher */}
          <div style={{
            display: "flex",
            background: `${C.dark}07`,
            borderRadius: 10,
            padding: 3,
            gap: 2,
          }}>
            {([
              { key: "protocole", label: "Protocole", icon: "🔬" },
              { key: "revue", label: "Revue", icon: "📚" },
              { key: "guide", label: "Guide", icon: "🎙️" },
            ] as { key: Tab; label: string; icon: string }[]).map((tab: { key: Tab; label: string; icon: string }) => (
              <button
                key={tab.key}
                onClick={() => setActive(tab.key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "5px 12px",
                  borderRadius: 7,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: m,
                  fontSize: 11.5,
                  fontWeight: active === tab.key ? 700 : 500,
                  color: active === tab.key ? C.primary : `${C.dark}60`,
                  background: active === tab.key
                    ? "#fff"
                    : "transparent",
                  boxShadow: active === tab.key ? "0 1px 4px rgba(26,26,46,0.08)" : "none",
                  transition: "all 0.2s",
                }}
              >
                <span style={{ fontSize: 12 }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT — swap without unmounting to keep scroll position per tab */}
      <div style={{ display: active === "protocole" ? "block" : "none" }}>
        <ProtocoleRecherche />
      </div>
      <div style={{ display: active === "revue" ? "block" : "none" }}>
        <RevueLitterature />
      </div>
      <div style={{ display: active === "guide" ? "block" : "none" }}>
        <GuideEntretien />
      </div>
    </div>
  );
}
