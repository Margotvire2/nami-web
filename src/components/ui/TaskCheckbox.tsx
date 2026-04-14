"use client"

import { useState, useCallback } from "react"

// ─── MicroConfetti ────────────────────────────────────────────────────────────

function MicroConfetti() {
  const PARTICLES = [
    { angle: -60, color: "#5B4EC4", delay: 0 },
    { angle: -20, color: "#2BA89C", delay: 40 },
    { angle: 20,  color: "#5B4EC4", delay: 20 },
    { angle: 60,  color: "#E6993E", delay: 60 },
  ]

  return (
    <div style={{ position: "absolute", top: "50%", left: "50%", pointerEvents: "none", zIndex: 10 }}>
      <style>{`
        @keyframes confettiPop {
          0%   { opacity: 1; transform: translate(0, 0) scale(1) rotate(0deg) }
          80%  { opacity: 0.8 }
          100% { opacity: 0; transform: translate(var(--tx), var(--ty)) scale(0.4) rotate(180deg) }
        }
      `}</style>
      {PARTICLES.map((p, i) => {
        const rad = (p.angle * Math.PI) / 180
        const dist = 18 + i * 3
        const tx = Math.cos(rad) * dist
        const ty = Math.sin(rad) * dist - 8
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 4, height: 4,
              borderRadius: i % 2 === 0 ? "50%" : 1,
              background: p.color,
              top: -2, left: -2,
              animation: `confettiPop 500ms cubic-bezier(0.22,1,0.36,1) ${p.delay}ms both`,
              ["--tx" as string]: `${tx}px`,
              ["--ty" as string]: `${ty}px`,
            }}
          />
        )
      })}
    </div>
  )
}

// ─── TaskCheckbox ─────────────────────────────────────────────────────────────

interface TaskCheckboxProps {
  checked: boolean
  disabled?: boolean
  onComplete: () => void
  size?: number
}

export function TaskCheckbox({
  checked,
  disabled = false,
  onComplete,
  size = 18,
}: TaskCheckboxProps) {
  const [showConfetti, setShowConfetti] = useState(false)
  const [animating, setAnimating] = useState(false)

  const handleClick = useCallback(() => {
    if (checked || disabled) return
    setAnimating(true)
    setShowConfetti(true)
    onComplete()
    setTimeout(() => setShowConfetti(false), 600)
    setTimeout(() => setAnimating(false), 400)
  }, [checked, disabled, onComplete])

  const r = size * 0.42
  const c = size / 2
  const circumference = 2 * Math.PI * r

  // Check path — scaled for 18px: M5 9 l3 3 5-5
  const scale = size / 18
  const checkD = `M${4 * scale} ${9 * scale} l${3 * scale} ${3 * scale} l${5 * scale} ${-5 * scale}`

  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`
        @keyframes checkStroke {
          from { stroke-dashoffset: 20 }
          to   { stroke-dashoffset: 0 }
        }
        @keyframes circleGrow {
          from { stroke-dashoffset: ${circumference} }
          to   { stroke-dashoffset: 0 }
        }
        @keyframes checkBounce {
          0%   { transform: scale(1) }
          40%  { transform: scale(0.88) }
          70%  { transform: scale(1.12) }
          100% { transform: scale(1) }
        }
      `}</style>
      <button
        onClick={handleClick}
        disabled={disabled}
        title={checked ? "Terminée" : "Marquer comme terminée"}
        style={{
          background: "none", border: "none", padding: 0,
          cursor: checked || disabled ? "default" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          animation: animating ? "checkBounce 400ms cubic-bezier(0.22,1,0.36,1) forwards" : "none",
          outline: "none",
        }}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle */}
          <circle
            cx={c} cy={c} r={r}
            fill={checked ? "#EDF7F2" : "none"}
            stroke={checked ? "#4E9A7C" : "#ECEAF5"}
            strokeWidth={1.5}
            style={{
              transition: "fill 200ms, stroke 200ms",
              ...(animating ? {
                animation: `circleGrow 300ms ease forwards`,
                strokeDasharray: circumference,
                strokeDashoffset: 0,
              } : {}),
            }}
          />
          {/* Check mark — only when done */}
          {checked && (
            <path
              d={checkD}
              fill="none"
              stroke="#4E9A7C"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: 20,
                strokeDashoffset: 0,
                animation: animating ? "checkStroke 250ms cubic-bezier(0.22,1,0.36,1) forwards" : "none",
              }}
            />
          )}
        </svg>
      </button>
      {showConfetti && <MicroConfetti />}
    </div>
  )
}
