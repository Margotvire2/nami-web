"use client";

import { Smartphone } from "lucide-react";

export function SaisirMesuresCTA() {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(91,78,196,0.06), rgba(43,168,156,0.06))",
        border: "1px solid var(--nami-border)",
        borderRadius: 20,
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: "var(--nami-card)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--nami-primary)",
          flexShrink: 0,
        }}
      >
        <Smartphone size={22} strokeWidth={2} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--nami-dark)" }}>
          Saisir mes mesures
        </div>
        <div style={{ fontSize: 13, color: "var(--nami-text-muted)", marginTop: 2 }}>
          Notez votre humeur et votre énergie depuis l&apos;app mobile Nami.
        </div>
      </div>
      {/* TODO: brancher liens App Store / Play Store quand publiés */}
      <a
        href="#"
        aria-disabled
        style={{
          padding: "9px 16px",
          borderRadius: 10,
          background: "var(--nami-primary)",
          color: "#fff",
          fontSize: 13,
          fontWeight: 600,
          textDecoration: "none",
          boxShadow: "0 2px 8px rgba(91,78,196,0.25)",
          opacity: 0.6,
          pointerEvents: "none",
        }}
      >
        Bientôt
      </a>
    </div>
  );
}
