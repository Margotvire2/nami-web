"use client"

import { EXERCISE_MODES, type ExerciseMode } from "./professions"

interface Props {
  value:    ExerciseMode | ""
  onChange: (v: ExerciseMode) => void
}

export function ExerciseModeSelector({ value, onChange }: Props) {
  return (
    <div className="space-y-2.5" role="radiogroup" aria-label="Mode d'exercice">
      {EXERCISE_MODES.map((m) => {
        const selected = value === m.value
        return (
          <button
            key={m.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(m.value)}
            className="w-full text-left rounded-xl p-4 border transition-all hover:scale-[1.005]"
            style={{
              borderColor: selected ? "#5B4EC4" : "rgba(26,26,46,0.1)",
              background:  selected ? "rgba(91,78,196,0.06)" : "#fff",
              boxShadow:   selected ? "0 0 0 2px rgba(91,78,196,0.15)" : "none",
            }}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl" aria-hidden>{m.emoji}</div>
              <div className="flex-1">
                <div
                  className="text-sm font-semibold mb-0.5"
                  style={{ color: selected ? "#5B4EC4" : "#1A1A2E" }}
                >
                  {m.label}
                </div>
                <div className="text-xs leading-snug" style={{ color: "#6B7280" }}>
                  {m.description}
                </div>
              </div>
              {selected && (
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: "#5B4EC4", color: "#fff", fontSize: 12 }}
                  aria-hidden
                >
                  ✓
                </div>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
