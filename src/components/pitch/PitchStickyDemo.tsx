"use client"

import { useEffect, useRef, useState } from "react"
import { PatientScene } from "./PatientScene"
import { useIsMobile } from "@/lib/hooks/useIsMobile"

const SCENE_LABELS = [
  { label: "Anorexie — Gabrielle", color: "#5B4EC4" },
  { label: "Obésité — Marc", color: "#2BA89C" },
  { label: "Épilepsie — Léo", color: "#2563EB" },
]

function BrowserFrame({ children, sceneLabel, sceneColor }: { children: React.ReactNode; sceneLabel: string; sceneColor: string }) {
  return (
    <div style={{
      width: "100%",
      display: "flex",
      flexDirection: "column",
      borderRadius: 16,
      overflow: "hidden",
      boxShadow: "0 24px 64px rgba(26,26,46,0.14), 0 4px 12px rgba(26,26,46,0.06)",
      border: "1px solid rgba(26,26,46,0.08)",
      background: "#fff",
    }}>
      {/* Browser bar */}
      <div style={{
        background: "#F1F3F5",
        padding: "9px 14px",
        display: "flex",
        alignItems: "center",
        gap: 8,
        borderBottom: "1px solid rgba(26,26,46,0.06)",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", gap: 5 }}>
          {["#FF6058", "#FFBC2E", "#29CA41"].map(c => (
            <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
          ))}
        </div>
        <div style={{
          flex: 1,
          background: "rgba(255,255,255,0.8)",
          borderRadius: 6,
          padding: "3px 10px",
          fontSize: 11,
          color: "#8A8A96",
          textAlign: "center",
        }}>
          app.namipourlavie.com
        </div>
      </div>
      {/* Scene label */}
      <div style={{ padding: "8px 14px", borderBottom: "1px solid rgba(26,26,46,0.05)", display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: sceneColor }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: sceneColor }}>{sceneLabel}</span>
      </div>
      {children}
    </div>
  )
}

export function PitchStickyDemo({ caption }: { caption?: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeScene, setActiveScene] = useState(0)
  const isMobile = useIsMobile(768)

  useEffect(() => {
    if (isMobile) return
    function onScroll() {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const scrollable = el.offsetHeight - window.innerHeight
      if (scrollable <= 0) return
      const progress = Math.max(0, Math.min(1, -rect.top / scrollable))
      const next = progress < 0.34 ? 0 : progress < 0.67 ? 1 : 2
      setActiveScene(prev => (prev !== next ? next : prev))
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [isMobile])

  /* ── Mobile: 3 stacked scenes ── */
  if (isMobile) {
    return (
      <div style={{ padding: "48px clamp(16px, 4vw, 40px)", background: "#FAFAF8", display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#5B4EC4", marginBottom: 4 }}>
          3 PATHOLOGIES · 1 OUTIL
        </div>
        {([0, 1, 2] as const).map((i) => (
          <BrowserFrame key={i} sceneLabel={SCENE_LABELS[i].label} sceneColor={SCENE_LABELS[i].color}>
            <PatientScene sceneIndex={i} isActive={true} />
          </BrowserFrame>
        ))}
        <div style={{ textAlign: "center", paddingTop: 8 }}>
          <span style={{ fontSize: 12, color: "#8A8A96" }}>
            22 308 sources cliniques · 425 pathologies · 121 parcours
          </span>
        </div>
      </div>
    )
  }

  /* ── Desktop: sticky scroll ── */
  return (
    <div ref={containerRef} style={{ height: "300vh", position: "relative" }}>
      <div style={{
        position: "sticky",
        top: 0,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        gap: 16,
        overflow: "hidden",
      }}>
        {/* Scene indicator dots */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {SCENE_LABELS.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{
                height: 8,
                width: i === activeScene ? 28 : 8,
                borderRadius: 100,
                background: i === activeScene ? s.color : "rgba(26,26,46,0.15)",
                transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
              }} />
              {i === activeScene && (
                <span style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: s.color,
                  opacity: 1,
                  transition: "opacity 0.3s ease",
                  whiteSpace: "nowrap",
                }}>
                  {s.label}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Browser chrome frame */}
        <div style={{
          width: "100%",
          maxWidth: 680,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 40px 100px rgba(26,26,46,0.16), 0 8px 24px rgba(26,26,46,0.08)",
          border: "1px solid rgba(26,26,46,0.08)",
          background: "#fff",
        }}>
          {/* Browser bar */}
          <div style={{
            background: "#F1F3F5",
            padding: "9px 14px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            borderBottom: "1px solid rgba(26,26,46,0.06)",
            flexShrink: 0,
          }}>
            <div style={{ display: "flex", gap: 5 }}>
              {["#FF6058", "#FFBC2E", "#29CA41"].map(c => (
                <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
              ))}
            </div>
            <div style={{
              flex: 1,
              background: "rgba(255,255,255,0.8)",
              borderRadius: 6,
              padding: "3px 10px",
              fontSize: 11,
              color: "#8A8A96",
              textAlign: "center",
            }}>
              app.namipourlavie.com/patients/gabriel
            </div>
          </div>

          {/* Scene container */}
          <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
            {([0, 1, 2] as const).map(i => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: i === activeScene ? 1 : 0,
                  transform: `translateY(${i === activeScene ? 0 : i < activeScene ? -16 : 16}px)`,
                  transition: "opacity 0.55s cubic-bezier(0.16,1,0.3,1), transform 0.55s cubic-bezier(0.16,1,0.3,1)",
                  pointerEvents: i === activeScene ? "auto" : "none",
                }}
              >
                <PatientScene sceneIndex={i} isActive={i === activeScene} />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom caption */}
        {caption ? (
          <div style={{ textAlign: "center" }}>{caption}</div>
        ) : (
          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: 12, color: "#8A8A96" }}>
              22 308 sources cliniques indexées · 425 pathologies · 121 parcours structurés
            </span>
          </div>
        )}

        {/* Scroll hint */}
        <div style={{
          position: "absolute",
          bottom: 24,
          right: 32,
          fontSize: 10,
          color: "#8A8A96",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}>
          Défiler pour explorer ↓
        </div>
      </div>
    </div>
  )
}
