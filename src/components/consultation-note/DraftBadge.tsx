import { Sparkles } from "lucide-react";

export function DraftBadge() {
  return (
    <span
      role="note"
      aria-label="Brouillon généré par IA — à vérifier par un professionnel de santé"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        background: "rgba(43,168,156,0.10)",
        color: "#2BA89C",
        fontSize: "11px",
        fontWeight: 600,
        padding: "3px 9px",
        borderRadius: "20px",
        fontFamily: "var(--font-data)",
        whiteSpace: "nowrap",
        border: "1px solid rgba(43,168,156,0.20)",
        lineHeight: 1.4,
      }}
    >
      <Sparkles size={10} aria-hidden="true" />
      Brouillon IA — à vérifier
    </span>
  );
}
