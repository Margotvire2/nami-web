"use client"

import { useEffect, useRef, useState } from "react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface CompletenessPlantProps {
  /** 0–100 */
  percentage: number
  /** Taille du SVG en px */
  size?: number
  /** Items manquants pour le tooltip */
  missingItems?: string[]
  /** Show tooltip on hover */
  showTooltip?: boolean
}

// ─── Stage helper ─────────────────────────────────────────────────────────────

function getStage(pct: number): 0 | 1 | 2 | 3 | 4 {
  if (pct < 20) return 0
  if (pct < 40) return 1
  if (pct < 65) return 2
  if (pct < 85) return 3
  return 4
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CompletenessPlant({
  percentage,
  size = 48,
  missingItems = [],
  showTooltip = true,
}: CompletenessPlantProps) {
  const stage = getStage(percentage)
  const [visible, setVisible] = useState(false)
  const [tooltipOpen, setTooltipOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Fade-in on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  const s = size
  const cx = s / 2
  const groundY = s * 0.88
  const stemColor = "#2BA89C"
  const leafColor = "#2BA89C"
  const flowerColor = "#5B4EC4"
  const groundColor = "#E8ECF4"

  return (
    <div
      ref={ref}
      style={{ position: "relative", display: "inline-flex", flexShrink: 0 }}
      onMouseEnter={() => showTooltip && setTooltipOpen(true)}
      onMouseLeave={() => setTooltipOpen(false)}
    >
      <svg
        width={s} height={s}
        viewBox={`0 0 ${s} ${s}`}
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity 400ms ease",
          overflow: "visible",
        }}
      >
        {/* Ground line */}
        <line
          x1={cx - s * 0.2} y1={groundY}
          x2={cx + s * 0.2} y2={groundY}
          stroke={groundColor} strokeWidth={2} strokeLinecap="round"
        />

        {/* Stage 0 — graine */}
        {stage === 0 && (
          <ellipse
            cx={cx} cy={groundY - s * 0.04}
            rx={s * 0.07} ry={s * 0.05}
            fill="#C8A86B" opacity={0.8}
          />
        )}

        {/* Stage 1 — pousse */}
        {stage >= 1 && (
          <>
            {/* Tige principale */}
            <line
              x1={cx} y1={groundY}
              x2={cx} y2={groundY - s * 0.35}
              stroke={stemColor} strokeWidth={2} strokeLinecap="round"
            />
            {/* Deux petites feuilles */}
            <ellipse
              cx={cx - s * 0.1} cy={groundY - s * 0.2}
              rx={s * 0.08} ry={s * 0.05}
              fill={leafColor} opacity={0.7}
              transform={`rotate(-30 ${cx - s * 0.1} ${groundY - s * 0.2})`}
            />
            <ellipse
              cx={cx + s * 0.1} cy={groundY - s * 0.22}
              rx={s * 0.08} ry={s * 0.05}
              fill={leafColor} opacity={0.7}
              transform={`rotate(30 ${cx + s * 0.1} ${groundY - s * 0.22})`}
            />
          </>
        )}

        {/* Stage 2 — plante */}
        {stage >= 2 && (
          <>
            {/* Tige plus haute */}
            <line
              x1={cx} y1={groundY - s * 0.35}
              x2={cx} y2={groundY - s * 0.6}
              stroke={stemColor} strokeWidth={2} strokeLinecap="round"
            />
            {/* Branches latérales */}
            <line
              x1={cx} y1={groundY - s * 0.48}
              x2={cx - s * 0.18} y2={groundY - s * 0.58}
              stroke={stemColor} strokeWidth={1.5} strokeLinecap="round"
            />
            <line
              x1={cx} y1={groundY - s * 0.5}
              x2={cx + s * 0.18} y2={groundY - s * 0.6}
              stroke={stemColor} strokeWidth={1.5} strokeLinecap="round"
            />
            {/* Feuilles branches */}
            <ellipse
              cx={cx - s * 0.22} cy={groundY - s * 0.61}
              rx={s * 0.09} ry={s * 0.06}
              fill={leafColor} opacity={0.8}
              transform={`rotate(-40 ${cx - s * 0.22} ${groundY - s * 0.61})`}
            />
            <ellipse
              cx={cx + s * 0.22} cy={groundY - s * 0.63}
              rx={s * 0.09} ry={s * 0.06}
              fill={leafColor} opacity={0.8}
              transform={`rotate(40 ${cx + s * 0.22} ${groundY - s * 0.63})`}
            />
          </>
        )}

        {/* Stage 3 — plante dense */}
        {stage >= 3 && (
          <>
            {/* Tige encore plus haute */}
            <line
              x1={cx} y1={groundY - s * 0.6}
              x2={cx} y2={groundY - s * 0.78}
              stroke={stemColor} strokeWidth={2} strokeLinecap="round"
            />
            {/* Branches hautes */}
            <line
              x1={cx} y1={groundY - s * 0.7}
              x2={cx - s * 0.14} y2={groundY - s * 0.78}
              stroke={stemColor} strokeWidth={1.5} strokeLinecap="round"
            />
            <line
              x1={cx} y1={groundY - s * 0.72}
              x2={cx + s * 0.14} y2={groundY - s * 0.8}
              stroke={stemColor} strokeWidth={1.5} strokeLinecap="round"
            />
            {/* Feuilles haut */}
            <ellipse
              cx={cx - s * 0.17} cy={groundY - s * 0.8}
              rx={s * 0.08} ry={s * 0.055}
              fill={leafColor}
              transform={`rotate(-35 ${cx - s * 0.17} ${groundY - s * 0.8})`}
            />
            <ellipse
              cx={cx + s * 0.17} cy={groundY - s * 0.82}
              rx={s * 0.08} ry={s * 0.055}
              fill={leafColor}
              transform={`rotate(35 ${cx + s * 0.17} ${groundY - s * 0.82})`}
            />
          </>
        )}

        {/* Stage 4 — floraison 🌸 */}
        {stage === 4 && (
          <>
            {/* Fleurs */}
            {[
              { x: cx, y: groundY - s * 0.8, delay: 0 },
              { x: cx - s * 0.2, y: groundY - s * 0.66, delay: 100 },
              { x: cx + s * 0.2, y: groundY - s * 0.68, delay: 200 },
            ].map(({ x, y, delay }, i) => (
              <g key={i} style={{ animation: `plantFlower 400ms ${delay}ms both` }}>
                <style>{`
                  @keyframes plantFlower {
                    from { opacity: 0; transform-origin: ${x}px ${y}px; transform: scale(0) }
                    to   { opacity: 1; transform-origin: ${x}px ${y}px; transform: scale(1) }
                  }
                `}</style>
                {/* 5 petals */}
                {[0, 72, 144, 216, 288].map((angle) => (
                  <ellipse
                    key={angle}
                    cx={x + s * 0.055 * Math.cos((angle * Math.PI) / 180)}
                    cy={y + s * 0.055 * Math.sin((angle * Math.PI) / 180)}
                    rx={s * 0.055} ry={s * 0.03}
                    fill={flowerColor} opacity={0.85}
                    transform={`rotate(${angle} ${x + s * 0.055 * Math.cos((angle * Math.PI) / 180)} ${y + s * 0.055 * Math.sin((angle * Math.PI) / 180)})`}
                  />
                ))}
                {/* Center */}
                <circle cx={x} cy={y} r={s * 0.028} fill="#F9C74F" />
              </g>
            ))}
          </>
        )}
      </svg>

      {/* Tooltip */}
      {tooltipOpen && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#1A1A2E",
            color: "#FAFAF8",
            borderRadius: 10,
            padding: "8px 12px",
            fontSize: 11,
            whiteSpace: "nowrap",
            zIndex: 50,
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            pointerEvents: "none",
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: missingItems.length ? 4 : 0 }}>
            {percentage}% — indicateur de complétude
          </div>
          {missingItems.length > 0 && (
            <div style={{ color: "#8A8A96", fontSize: 10 }}>
              {missingItems.map((item, i) => <div key={i}>· {item}</div>)}
            </div>
          )}
          <div style={{ color: "#4A4A5A", fontSize: 9, marginTop: 4 }}>
            Indicateurs non cliniques, destinés à l'organisation du dossier
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Utility: compute percentage from CareCase data ───────────────────────────

export function computeCompleteness(data: {
  _count: { members: number; activities: number }
  status?: string
}): number {
  let score = 0
  if (data._count.activities > 0)  score += 15
  if (data._count.activities > 5)  score += 20
  if (data._count.activities > 15) score += 15
  if (data._count.members > 1)     score += 25
  if (data._count.members > 3)     score += 15
  if (data.status === "ACTIVE")    score += 10
  return Math.min(100, score)
}
