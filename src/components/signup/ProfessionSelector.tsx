"use client"

import { PROFESSIONS, type Profession } from "./professions"

interface Props {
  value:    Profession | ""
  onChange: (p: Profession) => void
}

export function ProfessionSelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5" role="radiogroup" aria-label="Profession">
      {PROFESSIONS.map((p) => {
        const selected = value === p.value
        return (
          <button
            key={p.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(p.value)}
            className="text-left rounded-xl p-3 border transition-all hover:scale-[1.01]"
            style={{
              borderColor: selected ? "#5B4EC4" : "rgba(26,26,46,0.1)",
              background:  selected ? "rgba(91,78,196,0.06)" : "#fff",
              boxShadow:   selected ? "0 0 0 2px rgba(91,78,196,0.15)" : "none",
            }}
          >
            <div className="text-xl mb-1.5" aria-hidden>{p.emoji}</div>
            <div
              className="text-sm font-semibold mb-0.5"
              style={{ color: selected ? "#5B4EC4" : "#1A1A2E" }}
            >
              {p.label}
            </div>
            <div className="text-[11px] leading-tight" style={{ color: "#6B7280" }}>
              {p.helper}
            </div>
          </button>
        )
      })}
    </div>
  )
}
