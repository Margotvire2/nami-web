const ITEMS = [
  {
    icon: "🇪🇺",
    title: "Hébergement européen",
    body: "Données hébergées en Europe sur infrastructure sécurisée. Migration HDS en cours.",
  },
  {
    icon: "🔒",
    title: "Chiffrement",
    body: "Chiffrement au repos et en transit. Accès strictement limité à l'équipe du patient.",
  },
  {
    icon: "👥",
    title: "Secret professionnel",
    body: "Architecture conçue pour Art. L.1110-4 et L.1110-12 CSP. Chaque soignant ne voit que ce qui le concerne.",
  },
  {
    icon: "🤖",
    title: "Transparence IA",
    body: "Toute sortie IA identifiée comme brouillon. Validation humaine obligatoire avant intégration. Aucun entraînement sur vos données.",
  },
  {
    icon: "📋",
    title: "Traçabilité",
    body: "Audit trail complet : qui a accédé à quoi, quand.",
  },
  {
    icon: "⚕️",
    title: "Pas un dispositif médical",
    body: "Nami est un outil de coordination, pas d'aide à la décision clinique. Les décisions restent entre les mains de l'équipe soignante.",
  },
]

export function SecurityGrid() {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: 16,
    }}>
      {ITEMS.map((item) => (
        <div key={item.title} style={{
          background: "#fff",
          borderRadius: 14,
          border: "1px solid rgba(26,26,46,0.07)",
          padding: "20px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          boxShadow: "0 2px 8px rgba(26,26,46,0.03)",
        }}>
          <div style={{ fontSize: 24, lineHeight: 1 }}>{item.icon}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1A2E", lineHeight: 1.3 }}>
            {item.title}
          </div>
          <div style={{ fontSize: 13, color: "#4A4A5A", lineHeight: 1.55 }}>
            {item.body}
          </div>
        </div>
      ))}
    </div>
  )
}
