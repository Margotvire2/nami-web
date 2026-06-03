"use client"

import { useMemo } from "react"
import {
  getProfession,
  IDENTIFIER_TYPE_LABEL,
  IDENTIFIER_TYPE_HINT,
  IDENTIFIER_PATTERNS,
  type Profession,
} from "./professions"

interface Props {
  profession: Profession | ""
  value:      string
  onChange:   (v: string) => void
}

// Champ d'identifiant pro adapté à la profession sélectionnée.
// Affiche en temps réel : label (RPPS / ADELI / DEAS), hint, format attendu,
// et un état visuel quand le format est valide.
export function ProIdentifierInput({ profession, value, onChange }: Props) {
  const meta = useMemo(() => getProfession(profession || ""), [profession])

  if (!meta) {
    return (
      <p className="text-sm" style={{ color: "#6B7280" }}>
        Sélectionnez d&apos;abord une profession pour saisir votre identifiant.
      </p>
    )
  }

  const idType    = meta.identifierType
  const label     = IDENTIFIER_TYPE_LABEL[idType]
  const hint      = IDENTIFIER_TYPE_HINT[idType]
  const pattern   = IDENTIFIER_PATTERNS[idType]
  const isValid   = value.length > 0 && pattern.test(value.trim())
  const isInvalid = value.length > 0 && !isValid

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "#374151" }}>
        Identifiant {label}
      </label>
      <input
        type="text"
        inputMode={idType === "DEAS" ? "text" : "numeric"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={hint}
        className="w-full h-11 rounded-xl border-2 px-4 text-sm focus:outline-none transition-colors"
        style={{
          background:  "#F5F3EF",
          borderColor: isInvalid ? "#DC2626" : isValid ? "#059669" : "transparent",
          color:       "#1A1A2E",
        }}
        aria-invalid={isInvalid}
        aria-describedby="proid-hint"
      />
      <div id="proid-hint" className="flex items-start gap-2 text-xs" style={{ color: "#6B7280" }}>
        <span aria-hidden>ⓘ</span>
        <span>{hint}</span>
      </div>
      {isInvalid && (
        <p className="text-xs font-medium" style={{ color: "#DC2626" }}>
          Format {label} invalide.
        </p>
      )}
      {idType === "DEAS" && (
        <p className="text-xs" style={{ color: "#6B7280" }}>
          Les aides-soignant·es n&apos;ont pas d&apos;identifiant national. Saisissez
          votre numéro de diplôme — il sera vérifié manuellement par l&apos;équipe Nami.
        </p>
      )}
    </div>
  )
}
