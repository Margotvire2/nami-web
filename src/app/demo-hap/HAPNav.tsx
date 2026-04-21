"use client"

import { usePathname } from "next/navigation"

export function HAPNav() {
  const pathname = usePathname()
  const isDemo = pathname === "/demo-hap"
  const isPitch = pathname.includes("/pitch")

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: "rgba(250,250,248,0.88)",
      backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(26,26,46,0.06)",
      padding: "14px 0",
    }}>
      <style>{`@media (max-width: 479px) { .hap-nav-discover { display: none !important; } }`}</style>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(20px,5vw,80px)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="/demo-hap" style={{ fontSize: "1.25rem", fontWeight: 900, color: "#5B4EC4", letterSpacing: "-0.03em", textDecoration: "none" }}>
          nami
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <a href="/demo-hap" style={{
            padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none",
            background: isDemo ? "rgba(91,78,196,0.08)" : "transparent",
            color: isDemo ? "#5B4EC4" : "#4A4A5A",
            transition: "all 0.15s ease",
          }}>
            La plateforme
          </a>
          <a href="/demo-hap/pitch" style={{
            padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none",
            background: isPitch ? "rgba(91,78,196,0.08)" : "transparent",
            color: isPitch ? "#5B4EC4" : "#4A4A5A",
            transition: "all 0.15s ease",
          }}>
            La vision
          </a>
        </div>
        <a href="https://namipourlavie.com" target="_blank" rel="noopener noreferrer" className="hap-nav-discover" style={{
          padding: "7px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600,
          color: "#5B4EC4", border: "1px solid rgba(91,78,196,0.2)", textDecoration: "none",
        }}>
          Découvrir le site →
        </a>
      </div>
    </nav>
  )
}
