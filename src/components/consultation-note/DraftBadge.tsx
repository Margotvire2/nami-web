export function DraftBadge() {
  return (
    <span
      role="note"
      aria-label="Brouillon généré par IA — à vérifier par un professionnel de santé"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        background: "#FEF3C7",
        color: "#92400E",
        fontSize: "11px",
        fontWeight: 500,
        padding: "3px 9px",
        borderRadius: "20px",
        fontFamily: "'Inter', system-ui, sans-serif",
        whiteSpace: "nowrap",
        border: "1px solid rgba(146,64,14,0.15)",
        lineHeight: 1.4,
      }}
    >
      ⚡ Brouillon IA — à vérifier
    </span>
  );
}
