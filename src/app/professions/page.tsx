import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Professions de santé — Coordination pluridisciplinaire | Nami",
  description:
    "Nami accompagne 26 professions de santé dans la coordination des parcours complexes. Diététicien, psychiatre, pédiatre, médecin généraliste, psychologue, kinésithérapeute et plus.",
  openGraph: {
    title: "Professions de santé | Nami",
    description: "Coordination pluridisciplinaire pour 26 professions : TCA, obésité, pédiatrie, maladies chroniques.",
  },
  alternates: { canonical: "/professions" },
}

const PROFESSIONS = [
  { slug: "dieteticien",           label: "Diététicien·ne",        icon: "🥗", desc: "TCA, obésité, dénutrition, nutrition thérapeutique" },
  { slug: "psychologue",           label: "Psychologue",            icon: "💭", desc: "TCA, obésité, thérapies comportementales" },
  { slug: "psychiatre",            label: "Psychiatre",             icon: "🧩", desc: "TCA, dépression, anxiété, addictions alimentaires" },
  { slug: "medecin-generaliste",   label: "Médecin généraliste",    icon: "🩺", desc: "Coordination, prévention, pathologies chroniques" },
  { slug: "pediatre",              label: "Pédiatre",               icon: "👶", desc: "Croissance, APLV, cassure de courbe, nutrition infantile" },
  { slug: "endocrinologue",        label: "Endocrinologue",         icon: "🧬", desc: "Diabète, SOPK, thyroïde, obésité hormonale" },
  { slug: "medecin-nutritionniste", label: "Médecin nutritionniste", icon: "🥦", desc: "Obésité complexe, dénutrition sévère, nutrition artificielle" },
  { slug: "chirurgien-bariatrique", label: "Chirurgien bariatrique", icon: "🔬", desc: "Sleeve gastrectomie, bypass gastrique, chirurgie de l'obésité" },
  { slug: "gastro-enterologue",    label: "Gastro-entérologue",     icon: "🫁", desc: "MICI, Crohn, RCH, colopathie fonctionnelle" },
  { slug: "kinesitherapeute",      label: "Kinésithérapeute",       icon: "💪", desc: "Réhabilitation, APA, troubles musculo-squelettiques" },
  { slug: "orthophoniste",         label: "Orthophoniste",          icon: "💬", desc: "Dysphagie, troubles de déglutition, retard de langage" },
  { slug: "infirmier",             label: "Infirmier·ère",          icon: "💉", desc: "Soins de coordination, suivi clinique, éducation thérapeutique" },
  { slug: "ergotherapeute",        label: "Ergothérapeute",         icon: "🤲", desc: "Handicap moteur, réhabilitation, adaptation environnement" },
  { slug: "neurologue",            label: "Neurologue",             icon: "🧠", desc: "Épilepsie, SEP, maladies neurodégénératives" },
  { slug: "cardiologue",           label: "Cardiologue",            icon: "❤️", desc: "Maladies cardiovasculaires, HTA, insuffisance cardiaque" },
  { slug: "rhumatologue",          label: "Rhumatologue",           icon: "🦴", desc: "Polyarthrite, ostéoporose, maladies inflammatoires" },
  { slug: "oncologue",             label: "Oncologue",              icon: "🎗️", desc: "Nutrition en oncologie, cachexie, support nutritionnel" },
  { slug: "pneumologue",           label: "Pneumologue",            icon: "💨", desc: "BPCO, mucoviscidose, nutrition respiratoire" },
  { slug: "nephrologue",           label: "Néphrologue",            icon: "🫘", desc: "Maladie rénale chronique, nutrition rénale" },
  { slug: "gynecologue",           label: "Gynécologue",            icon: "🌸", desc: "SOPK, ménopause, nutrition périnatale" },
  { slug: "sage-femme",            label: "Sage-femme",             icon: "🤱", desc: "Nutrition périnatale, grossesse, allaitement" },
  { slug: "geriatre",              label: "Gériatre",               icon: "👴", desc: "Dénutrition du sujet âgé, sarcopénie, polypathologie" },
  { slug: "allergologue",          label: "Allergologue",           icon: "🤧", desc: "Allergies alimentaires, asthme, dermatite atopique" },
  { slug: "dermatologue",          label: "Dermatologue",           icon: "🔍", desc: "Dermatite atopique, psoriasis, acné sévère" },
  { slug: "infectiologue",         label: "Infectiologue",          icon: "🦠", desc: "VIH, immunodépression, dénutrition associée" },
  { slug: "podologue",             label: "Podologue",              icon: "🦶", desc: "Pied diabétique, troubles podologiques, rhumatologie" },
]

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Professions de santé | Nami",
  description: "Nami accompagne 26 professions de santé dans la coordination des parcours complexes.",
  url: "https://namipourlavie.com/professions",
  numberOfItems: PROFESSIONS.length,
  itemListElement: PROFESSIONS.map((p, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "WebPage",
      name: p.label,
      description: p.desc,
      url: `https://namipourlavie.com/professions/${p.slug}`,
    },
  })),
  publisher: {
    "@type": "Organization",
    name: "Nami",
    url: "https://namipourlavie.com",
  },
}

export default function ProfessionsPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#FAFAF8", fontFamily: "var(--font-jakarta), system-ui, sans-serif" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <style>{`
        .prof-card {
          transition: transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s cubic-bezier(0.16,1,0.3,1), border-color 0.25s;
        }
        .prof-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(91,78,196,0.1);
          border-color: rgba(91,78,196,0.2) !important;
        }
        .prof-card:hover .prof-label {
          color: #5B4EC4;
        }
        .nami-grad { background: linear-gradient(135deg,#5B4EC4,#2BA89C); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
      `}</style>

      {/* ── Hero ── */}
      <section style={{ padding: "120px 24px 80px", textAlign: "center", background: "linear-gradient(180deg,#FAFAF8 0%,#F5F3EF 100%)" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 16px", borderRadius: 100, border: "1px solid rgba(91,78,196,0.2)", background: "rgba(91,78,196,0.06)", marginBottom: 28 }}>
            <span style={{ color: "#5B4EC4", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Coordination pluridisciplinaire</span>
          </div>
          <h1 style={{ fontSize: "clamp(2.2rem,5vw,3.8rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.08, color: "#1A1A2E", marginBottom: 20 }}>
            Nami s&apos;adapte à<br />
            <span className="nami-grad">votre profession.</span>
          </h1>
          <p style={{ fontSize: "1.1rem", color: "#4A4A5A", lineHeight: 1.7, maxWidth: 520, margin: "0 auto 40px" }}>
            Des parcours structurés, des fiches cliniques sourcées et un dossier de coordination
            partagé — pour chaque spécialité.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, color: "#8A8A96", padding: "6px 14px", borderRadius: 100, background: "#fff", border: "1px solid rgba(26,26,46,0.08)" }}>{PROFESSIONS.length} professions</span>
            <span style={{ fontSize: 13, color: "#8A8A96", padding: "6px 14px", borderRadius: 100, background: "#fff", border: "1px solid rgba(26,26,46,0.08)" }}>Accès gratuit</span>
          </div>
        </div>
      </section>

      {/* ── Grid ── */}
      <section style={{ padding: "48px 24px 100px", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {PROFESSIONS.map((p) => (
            <Link
              key={p.slug}
              href={`/professions/${p.slug}`}
              className="prof-card"
              style={{
                display: "block",
                background: "#fff",
                borderRadius: 18,
                border: "1px solid rgba(26,26,46,0.07)",
                padding: "24px 22px",
                textDecoration: "none",
                boxShadow: "0 1px 3px rgba(26,26,46,0.04)",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <span style={{ fontSize: 26, flexShrink: 0, lineHeight: 1 }}>{p.icon}</span>
                <div style={{ minWidth: 0 }}>
                  <p className="prof-label" style={{ fontSize: 14, fontWeight: 700, color: "#1A1A2E", marginBottom: 5, transition: "color 0.2s" }}>
                    {p.label}
                  </p>
                  <p style={{ fontSize: 12, color: "#8A8A96", lineHeight: 1.5 }}>{p.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "100px 24px", background: "#1A1A2E", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(91,78,196,0.15) 0%,transparent 60%)", filter: "blur(80px)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 520, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1, color: "#EEECEA", marginBottom: 16 }}>
            Rejoignez votre<br />
            <span className="nami-grad" style={{ WebkitTextFillColor: "transparent" }}>équipe de coordination.</span>
          </h2>
          <p style={{ fontSize: "1rem", color: "rgba(238,236,234,0.5)", marginBottom: 36, lineHeight: 1.65 }}>
            Accès gratuit. Aucune carte de crédit.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/signup" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#5B4EC4", color: "#fff", fontSize: 15, fontWeight: 700, padding: "14px 36px", borderRadius: 100, textDecoration: "none", boxShadow: "0 4px 16px rgba(91,78,196,0.35)" }}>
              Créer un compte gratuit
            </Link>
            <Link href="/trouver-un-soignant" style={{ display: "inline-flex", alignItems: "center", border: "1.5px solid rgba(238,236,234,0.15)", color: "rgba(238,236,234,0.6)", fontSize: 14, fontWeight: 500, padding: "14px 28px", borderRadius: 100, textDecoration: "none" }}>
              Voir l&apos;annuaire
            </Link>
          </div>
        </div>
      </section>

      {/* ── Disclaimer ── */}
      <div style={{ padding: "28px 24px", textAlign: "center", background: "#FAFAF8" }}>
        <p style={{ fontSize: 11, color: "#B0B0BA", maxWidth: 600, margin: "0 auto", lineHeight: 1.6 }}>
          Nami n&apos;est pas un dispositif médical. Ces pages sont destinées aux professionnels de santé.
        </p>
      </div>
    </div>
  )
}
