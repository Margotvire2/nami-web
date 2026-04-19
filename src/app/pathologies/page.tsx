import type { Metadata } from "next"
import Link from "next/link"
import { PATHOLOGIES, CATEGORY_LABELS } from "@/lib/data/pathologies"
import { PublicNavbar } from "@/components/public/PublicNavbar"
import { PublicFooter } from "@/components/public/PublicFooter"

export const metadata: Metadata = {
  title: "Pathologies — Fiches cliniques et parcours de soins",
  description:
    "Fiches cliniques complètes : TCA (anorexie, boulimie, BED, ARFID), obésité, diabète, SOPK, NAFLD, dépression, anxiété. Critères diagnostiques, bilans, traitements. Sources HAS, FFAB, ESPGHAN.",
  openGraph: {
    title: "Pathologies — Fiches cliniques | Nami",
    description: "Fiches cliniques validées pour les parcours de soins complexes. TCA, obésité, métabolisme, pédiatrie, santé mentale.",
  },
}

export default function PathologiesPage() {
  const grouped = PATHOLOGIES.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = []
    acc[p.category].push(p)
    return acc
  }, {} as Record<string, typeof PATHOLOGIES>)

  const categoryOrder = ["tca", "metabolique", "psy", "cardio", "pediatrie", "rhumatologie", "endocrinologie", "pneumologie", "neurologie", "oncologie", "nephrologie", "infectieux"]

  // JSON-LD — ItemList of MedicalCondition
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Fiches cliniques — Pathologies | Nami",
    description: "Fiches cliniques complètes par pathologie : TCA, obésité, diabète, SOPK, NAFLD, dépression, anxiété. Critères diagnostiques, bilans, traitements. Sources HAS, FFAB, ESPGHAN.",
    url: "https://namipourlavie.com/pathologies",
    numberOfItems: PATHOLOGIES.length,
    itemListElement: PATHOLOGIES.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "MedicalWebPage",
        name: p.title,
        description: p.description,
        url: `https://namipourlavie.com/pathologies/${p.slug}`,
        about: {
          "@type": "MedicalCondition",
          name: p.shortTitle,
          ...(p.cim11 ? { code: { "@type": "MedicalCode", codeValue: p.cim11, codingSystem: "ICD-11" } } : {}),
        },
      },
    })),
    publisher: {
      "@type": "Organization",
      name: "Nami",
      url: "https://namipourlavie.com",
    },
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAF8", fontFamily: "var(--font-jakarta), system-ui, sans-serif" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <style>{`
        .patho-card {
          transition: transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s cubic-bezier(0.16,1,0.3,1), border-color 0.25s;
        }
        .patho-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(91,78,196,0.1);
          border-color: rgba(91,78,196,0.2) !important;
        }
        .patho-card:hover .patho-title {
          color: #5B4EC4;
        }
        .nami-pillar-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(91,78,196,0.1);
          border-color: rgba(91,78,196,0.2) !important;
        }
        .nami-pillar-card:hover h3 {
          color: #5B4EC4;
        }
        .nami-grad { background: linear-gradient(135deg,#5B4EC4,#2BA89C); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .stat-card { transition: transform 0.2s cubic-bezier(0.16,1,0.3,1); }
        .stat-card:hover { transform: translateY(-2px); }
        @media (max-width: 639px) {
          .patho-cta-btns { flex-direction: column !important; align-items: stretch !important; }
          .patho-cta-btns a { justify-content: center !important; }
        }
      `}</style>

      <PublicNavbar />

      {/* ── Hero ── */}
      <section style={{ padding: "120px 24px 80px", textAlign: "center", background: "linear-gradient(180deg,#FAFAF8 0%,#F5F3EF 100%)" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 16px", borderRadius: 100, border: "1px solid rgba(91,78,196,0.2)", background: "rgba(91,78,196,0.06)", marginBottom: 28 }}>
            <span style={{ color: "#5B4EC4", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Parcours de soins</span>
          </div>
          <h1 style={{ fontSize: "clamp(2.2rem,5vw,3.8rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.08, color: "#1A1A2E", marginBottom: 20 }}>
            Nami s&apos;adapte à<br />
            <span className="nami-grad">votre spécialité.</span>
          </h1>
          <p style={{ fontSize: "1.1rem", color: "#4A4A5A", lineHeight: 1.7, maxWidth: 520, margin: "0 auto 40px" }}>
            Des fiches cliniques validées et des parcours structurés pour chaque pathologie chronique.
            Sources HAS, FFAB, ESPGHAN, SFP.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, color: "#8A8A96", padding: "6px 14px", borderRadius: 100, background: "#fff", border: "1px solid rgba(26,26,46,0.08)" }}>{PATHOLOGIES.length} fiches disponibles</span>
            <span style={{ fontSize: 13, color: "#8A8A96", padding: "6px 14px", borderRadius: 100, background: "#fff", border: "1px solid rgba(26,26,46,0.08)" }}>CIM-11 référencées</span>
          </div>
        </div>
      </section>

      {/* ── Cards ── */}
      <section style={{ padding: "48px 24px 80px", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
          {categoryOrder.map((cat) => {
            const items = grouped[cat]
            if (!items?.length) return null
            const meta = CATEGORY_LABELS[cat]
            return (
              <div key={cat}>
                <h2 className="text-xs font-bold uppercase tracking-widest mb-4"
                  style={{ color: "#8A8A96", letterSpacing: "0.1em" }}>
                  {meta.label}
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                  {items.map((p) => (
                    <Link
                      key={p.slug}
                      href={`/pathologies/${p.slug}`}
                      className="nami-pillar-card group rounded-2xl border bg-white p-6 shadow-sm block"
                      style={{ borderColor: "rgba(26,26,46,0.07)", transition: "all 0.25s cubic-bezier(0.16,1,0.3,1)", textDecoration: "none" }}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{p.emoji}</span>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold mb-1"
                            style={{ color: "#1A1A2E" }}>
                            {p.shortTitle}
                          </h3>
                          <p className="text-xs leading-relaxed line-clamp-2"
                            style={{ color: "#4A4A5A" }}>
                            {p.description}
                          </p>
                          {p.cim11 && (
                            <span className="inline-block mt-2 text-[10px] font-mono px-1.5 py-0.5 rounded"
                              style={{ color: "#8A8A96", background: "#F5F3EF" }}>
                              CIM-11 : {p.cim11}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Stats section ── */}
      <section style={{ padding: "80px 24px", background: "#F5F3EF", borderTop: "1px solid rgba(26,26,46,0.06)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#B0B0BA", marginBottom: 48 }}>Pourquoi la coordination ?</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))", gap: 24 }}>
            {[
              { value: "269", label: "structures PCR Obésité\nen France", color: "#5B4EC4" },
              { value: "5+", label: "soignants par parcours\nen moyenne", color: "#2BA89C" },
              { value: "131", label: "parcours de soins\nstructurés dans Nami", color: "#5B4EC4" },
            ].map((s) => (
              <div key={s.label} className="stat-card" style={{ background: "#fff", borderRadius: 18, padding: "32px 20px", border: "1px solid rgba(26,26,46,0.07)", boxShadow: "0 1px 3px rgba(26,26,46,0.04)" }}>
                <div style={{ fontSize: "3rem", fontWeight: 800, letterSpacing: "-0.04em", color: s.color, lineHeight: 1, marginBottom: 12 }}>{s.value}</div>
                <p style={{ fontSize: 12, color: "#8A8A96", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "pre-line", lineHeight: 1.5 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "120px 24px", background: "#1A1A2E", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(91,78,196,0.15) 0%,transparent 60%)", filter: "blur(80px)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 560, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(2rem,5vw,3.2rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1, color: "#EEECEA", marginBottom: 18 }}>
            Prêt à structurer<br />
            <span className="nami-grad" style={{ WebkitTextFillColor: "transparent" }}>vos parcours ?</span>
          </h2>
          <p style={{ fontSize: "1rem", color: "rgba(238,236,234,0.5)", marginBottom: 40, lineHeight: 1.65 }}>
            Accès gratuit. Rejoignez les premiers soignants sur Nami.
          </p>
          <div className="patho-cta-btns" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/signup" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#5B4EC4", color: "#fff", fontSize: 15, fontWeight: 700, padding: "15px 38px", borderRadius: 100, textDecoration: "none", boxShadow: "0 4px 16px rgba(91,78,196,0.35)" }}>
              Créer un compte gratuit
            </Link>
            <Link href="/trouver-un-soignant" style={{ display: "inline-flex", alignItems: "center", border: "1.5px solid rgba(238,236,234,0.15)", color: "rgba(238,236,234,0.6)", fontSize: 14, fontWeight: 500, padding: "15px 28px", borderRadius: 100, textDecoration: "none" }}>
              Voir la démo
            </Link>
          </div>
        </div>
      </section>

      {/* ── Disclaimer ── */}
      <div style={{ padding: "32px 24px", textAlign: "center", background: "#FAFAF8" }}>
        <p style={{ fontSize: 11, color: "#B0B0BA", maxWidth: 600, margin: "0 auto", lineHeight: 1.6 }}>
          Ces fiches sont destinées aux professionnels de santé et basées sur les recommandations de la HAS, la FFAB, l&apos;ESPGHAN, la SFP et les sociétés savantes. Elles ne remplacent pas une consultation médicale.
        </p>
      </div>

      <PublicFooter />
    </div>
  )
}
