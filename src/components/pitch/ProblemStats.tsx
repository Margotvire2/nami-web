"use client"

import { AnimatedCounter } from "@/components/ui/AnimatedCounter"
import { ScrollReveal } from "@/components/ui/ScrollReveal"

export type StatItem = {
  /** Displayed as-is when no animation (e.g. "5,2") */
  staticValue?: string
  /** Drives AnimatedCounter when provided */
  animated?: { target: number; prefix?: string; suffix?: string }
  label: string
  source: string
}

export function ProblemStats({ stats }: { stats: [StatItem, StatItem, StatItem] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
      {stats.map((s, i) => (
        <ScrollReveal key={i} variant="fade-up" delay={i * 0.12} duration={0.6}>
          <div style={{
            background: "#fff", borderRadius: 16,
            border: "1px solid rgba(26,26,46,0.08)",
            padding: "28px 24px",
            boxShadow: "0 2px 12px rgba(26,26,46,0.04)",
            display: "flex", flexDirection: "column", gap: 10,
          }}>
            <div style={{ fontSize: 48, fontWeight: 900, letterSpacing: "-0.04em", color: "#1A1A2E", lineHeight: 1, fontFamily: "var(--font-jakarta)" }}>
              {s.animated ? (
                <AnimatedCounter
                  target={s.animated.target}
                  prefix={s.animated.prefix}
                  suffix={s.animated.suffix}
                  duration={1800}
                />
              ) : (
                s.staticValue
              )}
            </div>
            <div style={{ fontSize: 14, color: "#4A4A5A", lineHeight: 1.5, fontWeight: 500 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: "#8A8A96", borderTop: "1px solid rgba(26,26,46,0.06)", paddingTop: 8, marginTop: 2 }}>
              {s.source}
            </div>
          </div>
        </ScrollReveal>
      ))}
    </div>
  )
}
