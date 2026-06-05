import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Fiche clinique — Anorexie mentale | Nami",
  description:
    "Fiche clinique complète de l'anorexie mentale : critères DSM-5/CIM-11, épidémiologie, parcours de soin, métriques, questionnaires, bilans, traitements, complications, règles d'alerte. Sources HAS, NICE, MARSIPAN, FFAB.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/fiche-anorexie-mentale" },
};

/* ── Tokens ────────────────────────────────────────────────────────────── */
const COLORS = {
  bg: "#FAFAF8",
  card: "#FFFFFF",
  border: "#E8ECF4",
  ink: "#1A1A2E",
  inkSoft: "#374151",
  muted: "#6B7280",
  faint: "#B0B0BA",
  primary: "#5B4EC4",
  primarySoft: "#EEEDFB",
  teal: "#2BA89C",
  critical: "#DC2626",
  high: "#D97706",
  info: "#2563EB",
  success: "#059669",
} as const;

/* ── Data — sections ──────────────────────────────────────────────────── */
const SECTIONS: { id: string; num: string; title: string }[] = [
  { id: "definition", num: "1", title: "Définition & classification" },
  { id: "epidemio", num: "2", title: "Épidémiologie" },
  { id: "parcours", num: "3", title: "Parcours de soin" },
  { id: "metriques", num: "4", title: "Métriques cliniques" },
  { id: "questionnaires", num: "5", title: "Questionnaires validés" },
  { id: "bilans", num: "6", title: "Bilans & examens" },
  { id: "traitements", num: "7", title: "Traitements" },
  { id: "complications", num: "8", title: "Complications" },
  { id: "alertes", num: "9", title: "Règles d'alerte Nami" },
  { id: "orientation", num: "10", title: "Orientation & adressage" },
  { id: "pediatrie", num: "11", title: "Spécificités pédiatriques" },
  { id: "reglementaire", num: "12", title: "Contexte réglementaire FR" },
  { id: "sources", num: "13", title: "Sources & références" },
];

/* ── Helpers — components ─────────────────────────────────────────────── */

type Severity = "critical" | "high" | "medium" | "low" | "ok";

function severityChip(level: Severity, label?: string) {
  const map: Record<Severity, { bg: string; fg: string; lbl: string }> = {
    critical: { bg: "#FEF2F2", fg: COLORS.critical, lbl: "Critique" },
    high: { bg: "#FEF3C7", fg: COLORS.high, lbl: "Élevée" },
    medium: { bg: "#EFF6FF", fg: COLORS.info, lbl: "Modérée" },
    low: { bg: "#F0FDF4", fg: COLORS.success, lbl: "Faible" },
    ok: { bg: "#F0FDF4", fg: COLORS.success, lbl: "OK" },
  };
  const v = map[level];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.04em",
        padding: "3px 9px",
        borderRadius: 100,
        background: v.bg,
        color: v.fg,
        textTransform: "uppercase",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: v.fg }} />
      {label ?? v.lbl}
    </span>
  );
}

function Section({
  num,
  id,
  title,
  intro,
  children,
}: {
  num: string;
  id: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} style={{ marginBottom: 72, scrollMarginTop: 24 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
        <span
          style={{
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            fontSize: 12,
            fontWeight: 700,
            color: COLORS.primary,
            letterSpacing: "0.08em",
          }}
        >
          §{num}
        </span>
        <span style={{ height: 1, flex: 1, background: COLORS.border }} />
      </div>
      <h2
        style={{
          fontSize: "clamp(1.6rem, 3vw, 2.1rem)",
          fontWeight: 800,
          letterSpacing: "-0.025em",
          color: COLORS.ink,
          marginBottom: intro ? 12 : 28,
          lineHeight: 1.15,
        }}
      >
        {title}
      </h2>
      {intro && (
        <p
          style={{
            fontSize: "1.02rem",
            color: COLORS.inkSoft,
            lineHeight: 1.7,
            marginBottom: 28,
            maxWidth: 720,
          }}
        >
          {intro}
        </p>
      )}
      {children}
    </section>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3
      style={{
        fontSize: "1.05rem",
        fontWeight: 700,
        color: COLORS.ink,
        letterSpacing: "-0.01em",
        margin: "32px 0 14px",
      }}
    >
      {children}
    </h3>
  );
}

function Card({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return (
    <div
      style={{
        background: COLORS.card,
        border: `1px solid ${COLORS.border}`,
        borderLeft: accent ? `3px solid ${accent}` : `1px solid ${COLORS.border}`,
        borderRadius: 14,
        padding: "20px 22px",
        boxShadow: "0 1px 3px rgba(26,26,46,0.04)",
      }}
    >
      {children}
    </div>
  );
}

function KeyValueGrid({ items }: { items: { label: string; value: React.ReactNode }[] }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 12,
        margin: "20px 0",
      }}
    >
      {items.map((it, i) => (
        <div
          key={i}
          style={{
            background: COLORS.card,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 12,
            padding: "14px 16px",
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: COLORS.muted,
              marginBottom: 6,
            }}
          >
            {it.label}
          </div>
          <div style={{ fontSize: 14, color: COLORS.ink, fontWeight: 600 }}>{it.value}</div>
        </div>
      ))}
    </div>
  );
}

function DataTable({
  headers,
  rows,
  firstColBold = true,
  caption,
}: {
  headers: string[];
  rows: (string | React.ReactNode)[][];
  firstColBold?: boolean;
  caption?: string;
}) {
  return (
    <div
      style={{
        margin: "20px 0",
        background: COLORS.card,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(26,26,46,0.04)",
      }}
    >
      {caption && (
        <div
          style={{
            padding: "12px 18px",
            borderBottom: `1px solid ${COLORS.border}`,
            fontSize: 12,
            fontWeight: 700,
            color: COLORS.muted,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            background: "#FBFAFD",
          }}
        >
          {caption}
        </div>
      )}
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            fontSize: 13.5,
            minWidth: headers.length > 4 ? 720 : "auto",
          }}
        >
          <thead>
            <tr style={{ background: "#FBFAFD" }}>
              {headers.map((h, i) => (
                <th
                  key={i}
                  style={{
                    textAlign: "left",
                    padding: "12px 16px",
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: COLORS.muted,
                    borderBottom: `1px solid ${COLORS.border}`,
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr
                key={ri}
                style={{
                  borderBottom:
                    ri === rows.length - 1 ? "none" : `1px solid ${COLORS.border}`,
                  background: ri % 2 === 1 ? "#FDFCFA" : "transparent",
                }}
              >
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    style={{
                      padding: "12px 16px",
                      color: ci === 0 ? COLORS.ink : COLORS.inkSoft,
                      fontWeight: firstColBold && ci === 0 ? 600 : 400,
                      verticalAlign: "top",
                      lineHeight: 1.55,
                    }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RuleBlock({
  name,
  severity,
  description,
  trigger,
  action,
}: {
  name: string;
  severity: Severity;
  description: string;
  trigger: string;
  action: string;
}) {
  return (
    <div
      style={{
        background: COLORS.card,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 12,
        padding: "16px 18px",
        marginBottom: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 10,
          flexWrap: "wrap",
        }}
      >
        <code
          style={{
            fontFamily: "var(--font-jetbrains, ui-monospace), monospace",
            fontSize: 12,
            color: COLORS.primary,
            background: COLORS.primarySoft,
            padding: "3px 8px",
            borderRadius: 6,
            fontWeight: 600,
          }}
        >
          {name}
        </code>
        {severityChip(severity)}
      </div>
      <div style={{ fontSize: 14, color: COLORS.ink, fontWeight: 600, marginBottom: 8 }}>
        {description}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: "4px 12px",
          fontSize: 12.5,
          color: COLORS.inkSoft,
          lineHeight: 1.5,
        }}
      >
        <span style={{ color: COLORS.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: 10 }}>
          Déclencheur
        </span>
        <span style={{ fontFamily: "var(--font-jetbrains, ui-monospace), monospace" }}>{trigger}</span>
        <span style={{ color: COLORS.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: 10 }}>
          Action
        </span>
        <span>{action}</span>
      </div>
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────────────────── */

export default function FicheAnorexieMentalePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.bg,
        fontFamily: "var(--font-jakarta), system-ui, sans-serif",
        color: COLORS.ink,
      }}
    >
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-section { break-inside: avoid; }
          body { background: #fff !important; }
        }
        .toc-link {
          display: flex;
          gap: 10px;
          align-items: baseline;
          padding: 6px 10px;
          border-radius: 8px;
          color: ${COLORS.muted};
          font-size: 13px;
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
          line-height: 1.4;
        }
        .toc-link:hover { background: ${COLORS.primarySoft}; color: ${COLORS.primary}; }
        .toc-num { font-size: 10.5px; font-weight: 700; color: ${COLORS.faint}; min-width: 14px; }
        .toc-link:hover .toc-num { color: ${COLORS.primary}; }
        .back-link { color: ${COLORS.muted}; font-size: 13px; text-decoration: none; transition: color 0.15s; }
        .back-link:hover { color: ${COLORS.primary}; }
        @media (max-width: 960px) {
          .layout-grid { grid-template-columns: 1fr !important; }
          .toc-aside { display: none !important; }
        }
      `}</style>

      {/* ── Top bar ── */}
      <header
        className="no-print"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(250,250,248,0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            padding: "14px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.teal})`,
                display: "inline-block",
              }}
            />
            <span style={{ fontWeight: 800, color: COLORS.ink, letterSpacing: "-0.02em" }}>Nami</span>
            <span style={{ color: COLORS.faint, fontSize: 12, marginLeft: 4 }}>· Fiche clinique</span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <Link href="/pathologies" className="back-link">
              ← Toutes les fiches
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section
        style={{
          padding: "64px 24px 40px",
          background: `linear-gradient(180deg, ${COLORS.bg} 0%, #F5F3EF 100%)`,
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 22, flexWrap: "wrap" }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: COLORS.primary,
                background: COLORS.primarySoft,
                padding: "5px 12px",
                borderRadius: 100,
              }}
            >
              TCA · Trouble du comportement alimentaire
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: COLORS.muted,
                background: COLORS.card,
                border: `1px solid ${COLORS.border}`,
                padding: "5px 12px",
                borderRadius: 100,
              }}
            >
              Fiche pro · KB v1
            </span>
          </div>
          <h1
            style={{
              fontSize: "clamp(2.4rem, 5vw, 3.8rem)",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
              color: COLORS.ink,
              marginBottom: 18,
            }}
          >
            Anorexie mentale
          </h1>
          <p
            style={{
              fontSize: "1.1rem",
              color: COLORS.inkSoft,
              lineHeight: 1.65,
              maxWidth: 680,
              marginBottom: 28,
            }}
          >
            Fiche clinique complète : critères diagnostiques, parcours, métriques de suivi,
            questionnaires validés, traitements, complications et règles d&apos;alerte.
            Sources : HAS 2010, NICE NG69, MARSIPAN, FFAB, DSM-5, CIM-11.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              { k: "CIM-11", v: "6B80" },
              { k: "DSM-5", v: "307.1 · F50.01 · F50.02" },
              { k: "ALD", v: "23" },
              { k: "Sections", v: "13" },
            ].map((b) => (
              <div
                key={b.k}
                style={{
                  background: COLORS.card,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 10,
                  padding: "8px 14px",
                  fontSize: 12.5,
                }}
              >
                <span style={{ color: COLORS.muted, fontWeight: 700, marginRight: 8 }}>{b.k}</span>
                <span style={{ color: COLORS.ink, fontWeight: 600, fontFamily: "var(--font-inter), monospace" }}>
                  {b.v}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Layout: TOC + Article ── */}
      <div
        className="layout-grid"
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "56px 24px 80px",
          display: "grid",
          gridTemplateColumns: "220px 1fr",
          gap: 56,
          alignItems: "start",
        }}
      >
        {/* ── TOC ── */}
        <aside
          className="toc-aside no-print"
          style={{
            position: "sticky",
            top: 88,
            alignSelf: "start",
            maxHeight: "calc(100vh - 110px)",
            overflowY: "auto",
            paddingRight: 8,
          }}
        >
          <div
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: COLORS.faint,
              marginBottom: 12,
              paddingLeft: 10,
            }}
          >
            Sommaire
          </div>
          <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {SECTIONS.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="toc-link">
                <span className="toc-num">{s.num}</span>
                <span>{s.title}</span>
              </a>
            ))}
          </nav>
        </aside>

        {/* ── Article ── */}
        <article style={{ minWidth: 0 }}>
          {/* ─────────────────────── §1 Définition ─────────────────────── */}
          <Section
            num="1"
            id="definition"
            title="Définition & classification"
            intro="Trouble du comportement alimentaire caractérisé par une restriction alimentaire volontaire conduisant à un poids significativement bas, une peur intense de prendre du poids et une perturbation de l'image corporelle (HAS 2010, DSM-5)."
          >
            <SubHeading>1.1 Sous-types</SubHeading>
            <KeyValueGrid
              items={[
                {
                  label: "AN restrictive (ANR)",
                  value: "Perte de poids par restriction alimentaire et/ou exercice excessif. Pas de crises ni de conduites purgatives dans les 3 derniers mois.",
                },
                {
                  label: "AN binge-purge (ANBP)",
                  value: "Épisodes récurrents de crises de boulimie et/ou conduites purgatives (vomissements, laxatifs, diurétiques) dans les 3 derniers mois.",
                },
                {
                  label: "AN atypique",
                  value: "DSM-5 « autre trouble spécifié ». Tous les critères remplis sauf le poids bas (peut être surpoids/normal avec perte significative).",
                },
              ]}
            />

            <SubHeading>1.2 Critères diagnostiques DSM-5</SubHeading>
            <Card accent={COLORS.primary}>
              <ol style={{ margin: 0, paddingLeft: 22, lineHeight: 1.7, color: COLORS.inkSoft, fontSize: 14 }}>
                <li>
                  <strong>A.</strong> Restriction des apports énergétiques par rapport aux besoins, conduisant
                  à un poids significativement bas compte tenu de l&apos;âge, du sexe, du stade de développement
                  et de la santé physique.
                </li>
                <li>
                  <strong>B.</strong> Peur intense de prendre du poids ou de devenir gros, ou comportement
                  persistant interférant avec la prise de poids, alors que le poids est significativement bas.
                </li>
                <li>
                  <strong>C.</strong> Altération de la perception du poids ou de la forme corporelle, influence
                  excessive du poids ou de la forme sur l&apos;estime de soi, ou manque de reconnaissance
                  persistant de la gravité de la maigreur actuelle.
                </li>
              </ol>
            </Card>

            <SubHeading>1.3 Sévérité DSM-5 (selon IMC adulte)</SubHeading>
            <DataTable
              headers={["Sévérité", "IMC adulte"]}
              rows={[
                ["Léger", "≥ 17"],
                ["Modéré", "16 – 16.99"],
                ["Sévère", "15 – 15.99"],
                ["Extrême", "< 15"],
              ]}
            />

            <SubHeading>1.4 Grille de sévérité multidimensionnelle</SubHeading>
            <DataTable
              headers={["Critère", "Léger", "Modéré", "Sévère", "Extrême / Critique"]}
              rows={[
                ["IMC adulte", "≥ 17", "16 – 16.99", "15 – 15.99", "< 15"],
                ["IMC ado", "> 3e perc.", "1er – 3e perc.", "< 1er perc.", "<< 1er perc."],
                ["FC repos", "> 50", "40 – 50", "< 40", "< 35"],
                ["Hypothermie", "Non", "< 36 °C", "< 35.5 °C", "< 35 °C"],
                ["PA systolique", "Normale", "< 90", "< 80", "< 70"],
                ["Potassium", "Normal", "3.0 – 3.5", "2.5 – 3.0", "< 2.5"],
              ]}
            />

            <SubHeading>1.5 Diagnostics différentiels à éliminer</SubHeading>
            <KeyValueGrid
              items={[
                { label: "Organiques", value: "Hyperthyroïdie, maladie cœliaque, Crohn, diabète T1, cancer, insuffisance surrénalienne, tumeur cérébrale." },
                { label: "Psychiatriques", value: "Dépression (anorexie symptôme), TOC, trouble psychotique, phobie alimentaire (ARFID)." },
                { label: "Endocrinologiques", value: "Panhypopituitarisme, syndrome de Turner." },
                { label: "Autres", value: "Mérycisme, potomanie." },
              ]}
            />

            <p style={{ fontSize: 13, color: COLORS.muted, marginTop: 16 }}>
              Scores validés : MUST (Malnutrition Universal Screening Tool), NRS-2002, MARSIPAN (UK, risque médical).
            </p>
          </Section>

          {/* ─────────────────────── §2 Épidémiologie ─────────────────────── */}
          <Section num="2" id="epidemio" title="Épidémiologie">
            <SubHeading>2.1 Prévalence & incidence</SubHeading>
            <KeyValueGrid
              items={[
                { label: "Prévalence vie entière", value: "0.9 – 1.5 % F · 0.1 – 0.3 % H" },
                { label: "France", value: "~40 000 cas actifs · 1 – 2 % des adolescentes" },
                { label: "Âge de début", value: "Pic 14–18 ans, 2e pic > 25 ans" },
                { label: "Sex-ratio", value: "9F/1H historique, 5–7F/1H récent" },
                { label: "Tendance", value: "AN sévère stable, formes atypiques en hausse" },
                { label: "Mortalité", value: "5 – 10 % à 10 ans (la + élevée des TCA)" },
              ]}
            />

            <SubHeading>2.2 Facteurs de risque</SubHeading>
            <DataTable
              headers={["Catégorie", "Facteurs"]}
              rows={[
                ["Génétiques", "Héritabilité 50–80 %. ATCD familiaux TCA, dépression, TOC. Polymorphismes sérotoninergiques."],
                ["Environnementaux", "Pression culturelle de minceur, réseaux pro-ana, sports à risque (danse, gym, athlétisme, mannequinat), harcèlement scolaire."],
                ["Comportementaux", "Perfectionnisme, restriction alimentaire précoce, diètes à l'adolescence, exercice excessif."],
                ["Psychologiques", "Faible estime de soi, anxiété précoce, traits obsessionnels, traumatismes (abus, négligence), difficulté à gérer les émotions."],
                ["Socio-économiques", "Tous les milieux (mythe de la « maladie de riche » contredit). Précarité = facteur via stress chronique."],
                ["Comorbidités favorisantes", "Diabète T1 (diabulimie), maladie cœliaque, allergies alimentaires multiples (restriction médicale → restriction psychique)."],
              ]}
            />

            <SubHeading>2.3 Facteurs protecteurs</SubHeading>
            <ul style={{ paddingLeft: 22, lineHeight: 1.8, color: COLORS.inkSoft, fontSize: 14 }}>
              <li>Repas familiaux réguliers</li>
              <li>Éducation aux médias et à l&apos;image corporelle</li>
              <li>Activité physique de loisir (vs compétition)</li>
              <li>Estime de soi soutenue</li>
              <li>Accès précoce aux soins</li>
            </ul>
          </Section>

          {/* ─────────────────────── §3 Parcours ─────────────────────── */}
          <Section
            num="3"
            id="parcours"
            title="Parcours de soin type"
            intro="De la suspicion à la rémission, en passant par les transitions et la prévention des rechutes."
          >
            <SubHeading>3.1 10 étapes du parcours patient</SubHeading>
            <DataTable
              headers={["Étape", "Détail"]}
              rows={[
                ["1. Suspicion / dépistage", "MG, pédiatre, gynéco, méd. scolaire, diététicien, dentiste (érosion). SCOFF-F ≥ 2, perte de poids inexpliquée, aménorrhée, restriction, hyperactivité, ritualisation."],
                ["2. Confirmation diagnostique", "Médecin formé TCA. Entretien structuré + critères DSM-5 + bilan somatique initial."],
                ["3. Bilan initial", "Clinique (poids, taille, IMC, FC, PA, T°, signes dénutrition) + biologique complet + ECG + DXA si aménorrhée > 6 mois ou IMC < 15."],
                ["4. Annonce diagnostique", "Bienveillance, sans banaliser ni dramatiser. Impliquer la famille si mineur. Pas d'ultimatum."],
                ["5. Mise en place du traitement", "Ambulatoire si stable, HDJ si échec ambu, hospitalisation si critères d'urgence (cf §8.4)."],
                ["6. Suivi rapproché (phase aiguë)", "Poids 1–2×/sem, bilan bio hebdo si IMC < 15, diét 1–2×/sem, psy ≥ 1×/sem, méd 1×/sem à 2×/mois."],
                ["7. Suivi au long cours", "Mensuel puis trimestriel après stabilisation. Min 12 mois post-rémission, idéalement 2–5 ans."],
                ["8. Transitions", "Ambu → HDJ si stagnation > 4 sem. HDJ → hosp si perte. Hosp → ambu si reprise stable ≥ 2 sem."],
                ["9. Rémission", "IMC > 18.5, retour des règles, alimentation variée, absence de conduites compensatoires, EDE-Q < 2.5."],
                ["10. Rechute", "Signes : perte > 1 kg/mois, restriction croissante, isolement, exercice excessif, arrêt règles. Intensification du suivi. HDJ/hosp si échec 4–6 sem."],
              ]}
            />

            <SubHeading>3.2 Équipe de soin type</SubHeading>
            <DataTable
              headers={["Professionnel", "Rôle", "Fréquence", "Indispensable"]}
              rows={[
                ["Médecin référent", "Coordination, suivi somatique, prescriptions", "Hebdo → mensuel", "Oui"],
                ["Psychiatre", "Diagnostic, comorbidités psy, psychotropes", "Mensuel → trimestriel", "Selon cas"],
                ["Psychologue (TCC / psychodyn.)", "Psychothérapie structurée", "Hebdo", "Oui"],
                ["Diététicien spécialisé TCA", "Rééducation alimentaire (pas de régime)", "1–2×/sem → mensuel", "Oui"],
                ["Infirmier (si hosp./HDJ)", "Accompagnement repas, pesées, surveillance", "Quotidien", "Si hosp."],
                ["Endocrinologue", "Aménorrhée, ostéoporose, croissance", "Sur adressage", "Non"],
                ["Cardiologue", "Bradycardie sévère, QTc allongé", "Sur adressage", "Non"],
                ["Gynécologue", "Aménorrhée, fertilité", "Sur adressage", "Non"],
                ["Assistante sociale", "Précarité, ALD, aménagements scolaires/pro", "Au besoin", "Non"],
              ]}
            />

            <SubHeading>3.3 Durée moyenne du parcours</SubHeading>
            <KeyValueGrid
              items={[
                { label: "Phase aiguë", value: "3 – 6 mois (hospitalisation : 3 – 12 sem.)" },
                { label: "Suivi moyen", value: "2 – 5 ans" },
                { label: "Cas complexes", value: "> 5 ans · formes chroniques > 10 ans" },
                { label: "Rémission complète", value: "50 – 60 % à 5–10 ans · 20 % chronicité · 5 – 10 % décès" },
              ]}
            />
          </Section>

          {/* ─────────────────────── §4 Métriques ─────────────────────── */}
          <Section
            num="4"
            id="metriques"
            title="Métriques cliniques à surveiller"
            intro="9 catégories de mesures pour structurer le suivi longitudinal et déclencher les indicateurs de complétude."
          >
            <SubHeading>4.1 Anthropométriques</SubHeading>
            <DataTable
              headers={["Métrique", "Code", "Unité", "Normal", "Alerte", "Critique", "Fréquence"]}
              rows={[
                ["Poids", "weight_kg", "kg", "variable", "perte > 0.5 kg/sem", "perte > 1 kg/sem", "1–2×/sem"],
                ["IMC", "bmi", "kg/m²", "18.5 – 24.9", "< 17", "< 15", "1×/sem"],
                ["Z-score IMC (péd.)", "bmi_zscore", "DS", "-2 à +2", "< -2", "< -3", "1×/sem"],
                ["Taille (péd.)", "height_cm", "cm", "courbe", "ralentissement", "cassure", "1×/mois"],
                ["Masse grasse", "body_fat_pct", "%", "20–25 F · 15–20 H", "< 15 F", "< 10 F", "1×/mois"],
              ]}
            />

            <SubHeading>4.2 Vitales</SubHeading>
            <DataTable
              headers={["Métrique", "Unité", "Normal", "Alerte", "Critique"]}
              rows={[
                ["FC repos", "bpm", "60 – 100", "< 50", severityChip("critical", "< 40")],
                ["PA systolique", "mmHg", "100 – 140", "< 90", severityChip("critical", "< 80")],
                ["Température", "°C", "36.5 – 37.5", "< 36", severityChip("critical", "< 35.5")],
                ["QTc (ECG)", "ms", "< 440", "> 440", severityChip("critical", "> 500")],
                ["Orthostatic drop", "mmHg", "< 20", "≥ 20", "≥ 30"],
              ]}
            />

            <SubHeading>4.3 Biologiques</SubHeading>
            <DataTable
              headers={["Métrique", "Unité", "Normal", "Alerte", "Critique", "Fréquence"]}
              rows={[
                ["Potassium", "mmol/L", "3.5 – 5.0", "< 3.0", severityChip("critical", "< 2.5"), "1×/sem si purge"],
                ["Sodium", "mmol/L", "135 – 145", "< 130", severityChip("critical", "< 125"), "1×/sem"],
                ["Phosphore", "mmol/L", "0.8 – 1.5", "< 0.5", severityChip("critical", "< 0.3 (SRI)"), "quot. si renutrition"],
                ["Magnésium", "mmol/L", "0.7 – 1.0", "< 0.5", "< 0.4", "1×/sem"],
                ["Glycémie", "g/L", "0.7 – 1.1", "< 0.6", severityChip("critical", "< 0.5"), "1×/sem"],
                ["Albumine", "g/L", "35 – 50", "< 30", severityChip("critical", "< 25"), "1×/mois"],
                ["Préalbumine", "mg/L", "200 – 400", "< 150", "< 110", "1×/sem si renut."],
                ["Créatinine", "µmol/L", "50 – 100", "variable", "IRC", "1×/mois"],
                ["CPK", "UI/L", "< 200", "> 500", "> 1000 (rhabdo)", "1×/mois si exercice"],
                ["NFS leucocytes", "G/L", "4 – 10", "< 2", severityChip("critical", "< 1"), "1×/mois"],
                ["Hémoglobine", "g/dL", "12 – 16", "< 10", "< 8", "1×/mois"],
                ["TSH", "mUI/L", "0.4 – 4.0", "basse adapt.", "—", "1×/3 mois"],
                ["Estradiol (F)", "pg/mL", "30 – 400", "< 30", "—", "1×/6 mois"],
                ["Cortisol 8h", "µg/dL", "5 – 25", "> 25 (stress)", "< 5 (ISA)", "1× initial"],
                ["Vitamine D", "ng/mL", "30 – 60", "< 20", "< 10", "1×/6 mois"],
                ["Zinc", "µmol/L", "11 – 23", "< 11", "—", "1×/6 mois"],
                ["Fer sérique", "µmol/L", "11 – 30", "< 11", "—", "1×/6 mois"],
                ["Ferritine", "ng/mL", "15 – 200", "< 15", "< 5", "1×/6 mois"],
              ]}
            />

            <SubHeading>4.4 Nutritionnelles</SubHeading>
            <DataTable
              headers={["Métrique", "Unité", "Normal", "Alerte", "Critique", "Fréquence"]}
              rows={[
                ["Apport calorique estimé", "kcal/j", "1800 – 2500", "< 1200", "< 800", "chaque consult diét."],
                ["Nombre de repas/j", "n", "3 – 4", "< 2", "< 1", "chaque consult diét."],
                ["Diversité alimentaire", "groupes", "≥ 6", "3 – 5", "< 3", "1×/mois"],
              ]}
            />

            <SubHeading>4.5 Comportementales</SubHeading>
            <DataTable
              headers={["Métrique", "Unité", "Normal", "Alerte"]}
              rows={[
                ["Épisodes restrictifs/sem", "n", "0", "≥ 3"],
                ["Vomissements/sem", "n", "0", "≥ 1"],
                ["Laxatifs/sem", "n", "0", "≥ 1"],
                ["Exercice excessif", "h/sem", "0 – 5", "> 7 ou compulsif"],
                ["Body checking/j", "n", "0 – 1", "≥ 5"],
                ["Pesée compulsive", "bool", "non", "oui"],
              ]}
            />

            <SubHeading>4.6 Psychologiques</SubHeading>
            <DataTable
              headers={["Métrique", "Outil", "Seuil d'alerte"]}
              rows={[
                ["Dépression", "PHQ-9", "≥ 10"],
                ["Anxiété", "GAD-7", "≥ 10"],
                ["Sévérité TCA", "EDE-Q", "≥ 4.0"],
                ["Idéation suicidaire", "C-SSRS", severityChip("critical", "≥ 1")],
                ["Image corporelle", "BSQ", "≥ 67"],
              ]}
            />

            <SubHeading>4.7 Fonctionnelles, compliance & pédiatriques</SubHeading>
            <DataTable
              headers={["Métrique", "Type", "Alerte"]}
              rows={[
                ["Score QdV (EQ-5D)", "Fonctionnelle", "< 0.5"],
                ["Absentéisme scolaire/pro", "Fonctionnelle", "≥ 5 j/mois"],
                ["Autonomie alimentaire (0–10)", "Fonctionnelle", "< 5"],
                ["Consultations manquées (3 mois)", "Compliance", "≥ 3"],
                ["Jours sans pesée prévue", "Compliance", "> 14"],
                ["Observance supplémentation", "Compliance", "< 80 %"],
                ["Vitesse de croissance", "Pédiatrique", "ralentissement"],
                ["Stade Tanner", "Pédiatrique", "retard pubertaire"],
                ["Âge osseux", "Pédiatrique", "retard > 2 ans"],
                ["Périmètre crânien (< 3 ans)", "Pédiatrique", "cassure courbe"],
              ]}
            />
          </Section>

          {/* ─────────────────────── §5 Questionnaires ─────────────────────── */}
          <Section num="5" id="questionnaires" title="Questionnaires validés">
            <SubHeading>5.1 Dépistage</SubHeading>
            <DataTable
              headers={["Questionnaire", "Items", "Temps", "Seuil", "FR", "Licence"]}
              rows={[
                ["SCOFF-F", "5", "2 min", "≥ 2", "Oui", "Libre"],
                ["EAT-26", "26", "10 min", "≥ 20", "Oui", "Libre"],
                ["ESP (Eating disorder Screen for Primary care)", "5", "2 min", "≥ 2", "Non", "Libre"],
              ]}
            />

            <SubHeading>5.2 Diagnostic / sévérité</SubHeading>
            <DataTable
              headers={["Questionnaire", "Items", "Temps", "Score", "FR", "Licence"]}
              rows={[
                ["EDE-Q (Eating Disorder Examination – Q.)", "28", "15 min", "Global 0–6 · ≥ 4 clinique", "Oui", "Libre"],
                ["EDI-3 (Eating Disorder Inventory)", "91", "25 min", "Sous-échelles", "Oui", "Payant (PAR)"],
                ["BITE (Bulimic Investigatory Test Edinburgh)", "33", "10 min", "Sympt. ≥ 20 · Sév. ≥ 10", "Oui", "Libre"],
                ["BES (Binge Eating Scale)", "16", "5 min", "≥ 27 sévère", "Oui", "Libre"],
              ]}
            />

            <SubHeading>5.3 Suivi, qualité de vie & comorbidités</SubHeading>
            <DataTable
              headers={["Questionnaire", "Cible", "Items", "Fréquence"]}
              rows={[
                ["EDE-Q", "Suivi TCA", "28", "Mensuel → trimestriel"],
                ["BSQ (Body Shape Questionnaire)", "Image corporelle", "34/16", "Trimestriel"],
                ["CIA (Clinical Impairment Assessment)", "Retentissement", "16", "Mensuel"],
                ["EQ-5D", "Qualité de vie", "6", "Trimestriel"],
                ["SF-36", "Qualité de vie globale", "36", "Semestriel"],
                ["EDQOL", "QdV spécifique TCA", "25", "Semestriel"],
                ["PHQ-9", "Dépression", "9", "Mensuel"],
                ["GAD-7", "Anxiété", "7", "Mensuel"],
                ["C-SSRS", "Risque suicidaire", "—", "À chaque consult psy"],
                ["CET (Compulsive Exercise Test)", "Exercice excessif", "24", "Trimestriel"],
              ]}
            />
          </Section>

          {/* ─────────────────────── §6 Bilans ─────────────────────── */}
          <Section num="6" id="bilans" title="Bilans & examens">
            <SubHeading>6.1 Bilan initial</SubHeading>
            <DataTable
              headers={["Examen", "Pourquoi", "Obligatoire"]}
              rows={[
                ["NFS", "Leucopénie, anémie", "Oui"],
                ["Ionogramme (K, Na, Cl, Ca, PO₄, Mg)", "Troubles électrolytiques", "Oui"],
                ["Glycémie à jeun", "Hypoglycémie", "Oui"],
                ["Bilan hépatique (ASAT, ALAT, GGT)", "Cytolyse (dénutrition ou renutrition)", "Oui"],
                ["Urée / créatinine / DFG", "Fonction rénale", "Oui"],
                ["Albumine / préalbumine", "État nutritionnel", "Oui"],
                ["CPK", "Rhabdomyolyse si exercice excessif", "Oui"],
                ["TSH", "Éliminer dysthyroïdie", "Oui"],
                ["Estradiol / testostérone", "Aménorrhée / hypogonadisme", "Oui"],
                ["Cortisol 8h", "Éliminer insuffisance surrénalienne", "Conditionnel"],
                ["Vitamine D (25-OH)", "Carence quasi systématique", "Oui"],
                ["Fer + ferritine", "Carence martiale", "Oui"],
                ["Zinc", "Carence (agueusie, peau)", "Conditionnel"],
                ["ECG", "QTc, bradycardie, troubles du rythme", "Oui"],
                ["DXA (ostéodensitométrie)", "Ostéoporose", "Si aménorrhée > 6 mois ou IMC < 15"],
                ["Échographie cardiaque", "Si FC < 40 ou signes d'IC", "Conditionnel"],
                ["IRM cérébrale", "Si signes neuro ou doute diagnostique", "Conditionnel"],
              ]}
            />

            <SubHeading>6.2 Bilan de suivi</SubHeading>
            <DataTable
              headers={["Examen", "Fréquence", "Déclencheur anticipé"]}
              rows={[
                ["Poids, FC, PA, T°", "1–2×/sem (phase aiguë) → mensuel", "Perte > 1 kg/sem"],
                ["Ionogramme", "Hebdo si IMC < 15 ou purge → mensuel", "Purge, renutrition"],
                ["NFS", "Mensuel → trimestriel", "Leucopénie initiale"],
                ["Albumine", "Mensuel → trimestriel", "< 30 initial"],
                ["ECG", "Mensuel si IMC < 15 → trimestriel", "Bradycardie < 40"],
                ["DXA", "Tous les 2 ans", "Aménorrhée persistante"],
              ]}
            />

            <SubHeading>6.3 Bilan de crise / urgence</SubHeading>
            <DataTable
              headers={["Examen", "Critère déclencheur"]}
              rows={[
                [<>Ionogramme <strong style={{ color: COLORS.critical }}>en urgence</strong></>, "K < 3.0, malaise, syncope"],
                ["Glycémie capillaire", "Malaise, confusion, sueurs"],
                [<>ECG <strong style={{ color: COLORS.critical }}>immédiat</strong></>, "FC < 40, malaise, douleur thoracique"],
                ["Gaz du sang", "Vomissements répétés (alcalose métabolique)"],
                ["CPK", "Douleurs musculaires, urines foncées"],
                ["Troponine", "Douleur thoracique, anomalie ECG"],
              ]}
            />
          </Section>

          {/* ─────────────────────── §7 Traitements ─────────────────────── */}
          <Section num="7" id="traitements" title="Traitements">
            <SubHeading>7.1 Non médicamenteux</SubHeading>
            <DataTable
              headers={["Approche", "Preuve", "Fréquence", "Durée", "Qui"]}
              rows={[
                ["TCC-TCA (TCC-E de Fairburn)", "Grade A", "1×/sem", "20 – 40 séances", "Psychologue TCC"],
                ["Thérapie familiale (FBT / Maudsley)", "Grade A (ado)", "1×/sem → 2×/mois", "12 – 18 mois", "Thérapeute familial"],
                ["Rééducation alimentaire non restrictive", "Expert", "1 – 2×/sem", "> 6 mois", "Diététicien TCA"],
                ["Remédiation cognitive (CRT)", "Grade B", "1×/sem", "10 séances", "Psychologue"],
                ["Thérapie motivationnelle", "Grade B", "Variable", "4 – 8 séances", "Psychologue"],
                ["APA adaptée", "Expert", "2 – 3×/sem", "Continu", "APA (sous contrôle)"],
              ]}
            />

            <SubHeading>7.2 Médicamenteux</SubHeading>
            <Card accent={COLORS.high}>
              <p style={{ margin: 0, fontSize: 14, color: COLORS.inkSoft, lineHeight: 1.65 }}>
                <strong style={{ color: COLORS.ink }}>Aucun médicament n&apos;a d&apos;AMM dans l&apos;anorexie mentale.</strong> Tous les traitements sont
                symptomatiques ou ciblent les comorbidités.
              </p>
            </Card>
            <div style={{ height: 18 }} />
            <DataTable
              headers={["Molécule", "Indication", "Posologie", "Effets indésirables", "Suivi"]}
              rows={[
                ["Fluoxétine (Prozac)", "Prévention rechute post-renutrition, dépression comorbide", "20 – 60 mg/j", "Nausées, insomnie, agitation, allongement QTc", "ECG, K⁺"],
                ["Olanzapine (Zyprexa)", "Anxiété pré-prandiale sévère, résistance", "2.5 – 10 mg/j", "Sédation, prise de poids (bénéfique ici), sd métabolique", "Glycémie, lipides, poids"],
                ["Cyproheptadine (Périactine)", "Appétit (pédiatrie)", "4 – 8 mg/j", "Somnolence — CI : glaucome", "—"],
                ["Calcium + Vitamine D", "Ostéoporose", "Ca 1000 mg + D 800–1000 UI/j", "Hypercalcémie possible", "Calcémie annuelle"],
                ["Supplémentation K⁺", "Hypokaliémie", "Selon déficit", "Hyperkaliémie — CI : IRC", "Kaliémie 48h après ajustement"],
                ["Supplémentation PO₄", "Hypophosphorémie (SRI)", "Selon déficit", "—", "Phosphorémie quotidienne"],
                ["Supplémentation Mg", "Hypomagnésémie", "Selon déficit", "Diarrhée", "Magnésémie"],
                ["Zinc", "Carence", "15 – 30 mg/j", "Nausées", "Zincémie /6 mois"],
              ]}
            />

            <SubHeading>7.3 Interventions</SubHeading>
            <DataTable
              headers={["Intervention", "Indication", "Suivi"]}
              rows={[
                ["Sonde nasogastrique", "Refus alimentaire total ou IMC < 13, défaillance multiviscérale", "USI, surveillance SRI"],
                ["Alimentation parentérale", "Échec ou CI sonde", "Rarement, USI"],
                ["Contrat de soins", "Hospitalisation (objectifs pondéral et comportemental)", "Réévaluation hebdomadaire"],
              ]}
            />

            <SubHeading>7.4 Éducation thérapeutique</SubHeading>
            <Card>
              <div style={{ fontSize: 14, color: COLORS.inkSoft, lineHeight: 1.7 }}>
                <strong style={{ color: COLORS.ink }}>Thèmes :</strong> comprendre le TCA, reconnaître les signaux
                de faim/satiété, gérer l&apos;anxiété alimentaire, activité physique adaptée, image corporelle,
                prévention de rechute.
                <br />
                <strong style={{ color: COLORS.ink }}>Supports :</strong> FFAB (fiche patient), association Autrement,
                FNA (Fédération Nationale des Associations TCA).
              </div>
            </Card>
          </Section>

          {/* ─────────────────────── §8 Complications ─────────────────────── */}
          <Section num="8" id="complications" title="Complications">
            <SubHeading>8.1 Complications aiguës</SubHeading>
            <DataTable
              headers={["Complication", "Signes d'alerte", "CAT", "Hospitalisation"]}
              rows={[
                ["Hypoglycémie", "Malaise, sueurs, confusion", "Resucrage oral ou IV", "Si < 0.5 g/L"],
                ["Hypokaliémie sévère", "Faiblesse, crampes, arythmie", "KCl IV lent + scope", "Si < 2.5 mmol/L"],
                ["SRI (renutrition)", "J1–J5 : ↓PO₄, ↓K, ↓Mg, confusion, œdèmes, IC", "Ralentir renut., suppléer PO₄/K/Mg, thiamine 200 mg IV", "Systématique si dénut. sévère"],
                ["Arythmie cardiaque", "Palpitations, syncope, QTc > 500 ms", "ECG, scope, rééquilibration ionique", "Si QTc > 500 ou arythmie"],
                ["Rupture œsophagienne (Boerhaave)", "Douleur thoracique post-vomissement, emphysème sous-cut.", severityChip("critical", "Urgence chirurgicale"), "Oui"],
                ["Dilatation gastrique aiguë", "Douleur abdominale, vomissements après renutrition", "Sonde gastrique, TDM", "Oui"],
              ]}
            />

            <SubHeading>8.2 Complications chroniques</SubHeading>
            <DataTable
              headers={["Système", "Complication", "Dépistage", "Prévention"]}
              rows={[
                ["Osseux", "Ostéoporose (30 – 50 %)", "DXA /2 ans", "Renutrition + retour règles + Ca/D + mise en charge"],
                ["Dentaire", "Érosion émail (vomissements)", "Examen dentaire /6 mois", "Rincer (NaHCO₃) après vomiss., pas de brossage immédiat"],
                ["Cardiaque", "Prolapsus mitral, péricardite, IC", "Écho si symptôme", "Renutrition progressive"],
                ["Rénal", "IRC (déshydratation, hypoK)", "Créat./DFG /6 mois", "Hydratation, arrêter les purges"],
                ["Cérébral", "Atrophie corticale (réversible), troubles cognitifs", "IRM si tr. neuro", "Renutrition"],
                ["Endocrinien", "Aménorrhée, infertilité, retard pubertaire", "Estradiol, LH, FSH", "Renutrition = traitement"],
                ["Digestif", "Gastroparésie, constipation, SII", "Clinique", "Renutrition progressive, fibres progressives"],
                ["Hématologique", "Pancytopénie (moelle gélatineuse)", "NFS /mois", "Renutrition"],
              ]}
            />

            <SubHeading>8.3 Comorbidités fréquentes</SubHeading>
            <DataTable
              headers={["Comorbidité", "Prévalence", "Impact"]}
              rows={[
                ["Dépression", "40 – 70 %", "Aggrave pronostic, risque suicidaire"],
                ["Anxiété (GAD, phobie sociale)", "50 – 60 %", "Anxiété pré-prandiale, évitement social"],
                ["TOC", "20 – 40 %", "Rituels alimentaires, rigidité"],
                ["ESPT", "15 – 25 %", "Abus dans l'enfance, traumatismes"],
                ["Trouble de la personnalité (borderline surtout ANBP)", "20 – 30 %", "Impulsivité, auto-mutilation"],
                ["Abus de substances", "10 – 15 % (surtout ANBP)", "Alcool, stimulants"],
                ["Diabète T1 (diabulimie)", "1 – 2 % des AN", "Manipulation insuline, gravissime"],
              ]}
            />

            <SubHeading>8.4 Risque vital — critères d&apos;hospitalisation d&apos;urgence (HAS 2010 + MARSIPAN)</SubHeading>
            <Card accent={COLORS.critical}>
              <p style={{ margin: 0, fontSize: 14, color: COLORS.inkSoft, lineHeight: 1.65, marginBottom: 14 }}>
                <strong style={{ color: COLORS.ink }}>Mortalité 5–10 % à 10 ans.</strong> 1ʳᵉ cause = complications somatiques (arythmie, infections). 2ᵉ = suicide (20–25 % des décès).
              </p>
            </Card>
            <DataTable
              headers={["Critère", "Seuil"]}
              rows={[
                ["IMC", "< 14 (adulte) · < 13.2 (< 17 ans)"],
                ["FC", "< 40 bpm"],
                ["PA systolique", "< 80 mmHg"],
                ["Hypothermie", "< 35.5 °C"],
                ["Potassium", "< 2.5 mmol/L"],
                ["Phosphore", "< 0.5 mmol/L"],
                ["Glycémie", "< 0.5 g/L"],
                ["Leucocytes", "< 1 G/L"],
                ["QTc", "> 500 ms"],
                ["Perte de poids", "> 2 kg/sem"],
                ["Aphagie totale", "> 48 h"],
                ["Vomissements incoercibles", "> 24 h"],
                ["Tentative de suicide", "Tout passage à l'acte ou plan structuré"],
                ["Malaise / syncope", "Tout épisode"],
                ["Déshydratation sévère", "Clinique + biologique"],
              ]}
            />
          </Section>

          {/* ─────────────────────── §9 Règles d'alerte ─────────────────────── */}
          <Section
            num="9"
            id="alertes"
            title="Règles d'alerte pour Nami"
            intro="Indicateurs de complétude du dossier — pas d'alerte clinique au sens MDR. Toute remontée est un signal d'attention, jamais une décision automatisée."
          >
            <SubHeading>9.1 Sévérité critique</SubHeading>
            <RuleBlock
              name="an_hypokalemia_critical"
              severity="critical"
              description="Hypokaliémie critique — critère d'hospitalisation"
              trigger="potassium_mmol < 2.5"
              action="Alerte CRITICAL + tâche clinical_review immédiate · cooldown 1h"
            />
            <RuleBlock
              name="an_bradycardia_critical"
              severity="critical"
              description="Bradycardie sévère"
              trigger="heart_rate_bpm < 40"
              action="Alerte CRITICAL « Bradycardie < 40 bpm — critère d'hospitalisation »"
            />
            <RuleBlock
              name="an_hypoglycemia"
              severity="critical"
              description="Hypoglycémie"
              trigger="glucose_gl < 0.5"
              action="Alerte CRITICAL « Hypoglycémie < 0.5 g/L — critère d'hospitalisation »"
            />
            <RuleBlock
              name="an_hypophosphatemia_sri"
              severity="critical"
              description="Hypophosphatémie — marqueur SRI"
              trigger="phosphate_mmol < 0.5"
              action="Alerte CRITICAL « SRI possible, ralentir renutrition »"
            />
            <RuleBlock
              name="an_qtc_prolonged"
              severity="critical"
              description="QTc allongé"
              trigger="qtc_ms > 500"
              action="Alerte CRITICAL « risque arythmie létale, hospitalisation »"
            />

            <SubHeading>9.2 Sévérité haute</SubHeading>
            <RuleBlock
              name="an_weight_loss_rapid"
              severity="high"
              description="Perte pondérale rapide"
              trigger="delta(weight_kg, 7j) < -1"
              action="Alerte HIGH « Perte > 1 kg/semaine — intensifier le suivi » · cooldown 7j"
            />
            <RuleBlock
              name="an_hypokalemia_moderate"
              severity="high"
              description="Hypokaliémie modérée"
              trigger="potassium_mmol < 3.0"
              action="Alerte HIGH « K⁺ < 3.0 — surveillance rapprochée, supplémentation » · cooldown 48h"
            />
            <RuleBlock
              name="an_bmi_severe"
              severity="high"
              description="IMC sévère"
              trigger="bmi < 15"
              action="Alerte HIGH « IMC < 15 — dénutrition sévère, évaluer hospitalisation » · cooldown 7j"
            />

            <SubHeading>9.3 Sévérité moyenne</SubHeading>
            <RuleBlock
              name="an_purge_detected"
              severity="medium"
              description="Conduites purgatives"
              trigger="purge_vomiting_week ≥ 1 OU purge_laxative_week ≥ 1"
              action="Alerte WARNING « Conduites purgatives détectées — évaluer ionogramme »"
            />
            <RuleBlock
              name="an_amenorrhea_prolonged"
              severity="medium"
              description="Aménorrhée prolongée"
              trigger="estradiol_pgml < 30"
              action="Alerte WARNING « Estradiol bas — aménorrhée, évaluer DXA si > 6 mois »"
            />

            <SubHeading>9.4 Sévérité basse</SubHeading>
            <RuleBlock
              name="an_excessive_exercise"
              severity="low"
              description="Exercice excessif"
              trigger="excessive_exercise_hours > 7"
              action="Alerte INFO « Exercice > 7h/sem — évaluer caractère compulsif (CET) »"
            />

            <SubHeading>9.5 Gap detection (rupture de suivi)</SubHeading>
            <RuleBlock
              name="an_no_weighing_14d"
              severity="medium"
              description="Pas de pesée depuis 14 jours"
              trigger="last_recorded(weight_kg) > 14j"
              action="Alerte WARNING « Patient en rupture de suivi ? » · cooldown 14j"
            />
            <RuleBlock
              name="an_no_biology_90d"
              severity="medium"
              description="Pas de bilan bio depuis 90 jours"
              trigger="last_recorded(potassium_mmol) > 90j"
              action="Alerte WARNING « Programmer ionogramme » · cooldown 30j"
            />
          </Section>

          {/* ─────────────────────── §10 Orientation ─────────────────────── */}
          <Section num="10" id="orientation" title="Orientation & adressage">
            <SubHeading>10.1 Vers qui adresser</SubHeading>
            <DataTable
              headers={["Spécialiste", "Déclencheur", "Urgence", "Infos à transmettre"]}
              rows={[
                ["Psychiatre", "Comorbidité psy (dépression, TS, TOC), psychotropes", "Sous 1 semaine", "IMC, PHQ-9, traitements en cours"],
                ["Cardiologue", "FC < 40, QTc > 440, malaise", "Sous 48 h", "ECG, FC, K⁺"],
                ["Endocrinologue", "Aménorrhée > 12 mois, ostéoporose, retard pubertaire", "Routine", "DXA, estradiol, stade Tanner"],
                ["Gastro-entérologue", "Vomissements incoercibles, douleur abdominale, pancréatite", "Sous 48 h", "Bilan hépatique, lipase"],
                ["Néphrologue", "DFG < 60, hypoK récidivante", "Sous 1 semaine", "Créat., ionogramme, historique"],
                ["Dentiste", "Érosion émail, caries multiples", "Routine", "Fréquence vomissements"],
                ["Gynécologue", "Infertilité, aménorrhée post-rémission", "Routine", "Poids, estradiol, durée aménorrhée"],
              ]}
            />

            <SubHeading>10.2 Structures spécialisées</SubHeading>
            <DataTable
              headers={["Type", "Indication", "Annuaire"]}
              rows={[
                ["CSO / Centre TCA spécialisé", "PEC pluridisciplinaire ambulatoire", "FFAB : ffab.fr"],
                ["HDJ TCA", "Échec ambulatoire, repas accompagnés", "CHU + certains centres privés"],
                ["Hospitalisation psychiatrique", "Refus de soins, comorbidité psy sévère", "Via urgences psy"],
                ["Hospitalisation MCO", "Dénutrition sévère, complications somatiques", "Via urgences médicales"],
                ["SSR nutrition", "Stabilisation post-hospitalisation", "Via médecin hospitalier"],
                ["CMPP / CMP (pédiatrie)", "Ambulatoire mineur", "Secteur"],
              ]}
            />

            <SubHeading>10.3 Transitions</SubHeading>
            <DataTable
              headers={["Transition", "Critère"]}
              rows={[
                ["Ambulatoire → HDJ", "Stagnation > 4 sem, détérioration clinique"],
                ["HDJ → Hospitalisation", "Perte sous HDJ, critère d'urgence"],
                ["Hospitalisation → HDJ", "Reprise stable ≥ 2 sem, autonomie partielle"],
                ["HDJ → Ambulatoire", "IMC > 17, autonomie alimentaire, soutien familial"],
                ["Pédiatrie → Adulte", "16–18 ans, consultation de transition conjointe"],
              ]}
            />
          </Section>

          {/* ─────────────────────── §11 Pédiatrie ─────────────────────── */}
          <Section num="11" id="pediatrie" title="Spécificités pédiatriques">
            <SubHeading>11.1 Particularités diagnostiques</SubHeading>
            <ul style={{ paddingLeft: 22, lineHeight: 1.8, color: COLORS.inkSoft, fontSize: 14 }}>
              <li>Pas de critère IMC fixe : utiliser les courbes de croissance (z-score, percentile).</li>
              <li><strong>Cassure de la courbe staturale</strong> = signe précoce.</li>
              <li>Aménorrhée primaire (jamais eu de règles) possible si début pré-pubertaire.</li>
              <li>Formes pré-pubères : anorexie sans préoccupation pondérale explicite («&nbsp;j&apos;ai mal au ventre&nbsp;»).</li>
              <li>Diagnostics différentiels spécifiques : ARFID (évitement sensoriel), maladie cœliaque, Crohn.</li>
            </ul>

            <SubHeading>11.2 Seuils adaptés</SubHeading>
            <DataTable
              headers={["Métrique", "Seuil pédiatrique"]}
              rows={[
                ["IMC", "Courbes Tanner-Whitehouse ou OMS. Z-score < -2 = émaciation"],
                ["FC", "Seuils plus bas tolérés chez l'enfant sportif. < 50 chez non-sportif = alerte"],
                ["K⁺", "Mêmes seuils que l'adulte"],
              ]}
            />

            <SubHeading>11.3 Place de la famille</SubHeading>
            <Card accent={COLORS.teal}>
              <ul style={{ paddingLeft: 22, margin: 0, lineHeight: 1.7, color: COLORS.inkSoft, fontSize: 14 }}>
                <li>Thérapie familiale (FBT / Maudsley) = gold standard chez l&apos;ado (Grade A).</li>
                <li>Parents = «&nbsp;co-thérapeutes&nbsp;», pas coupables. Les former à l&apos;accompagnement repas.</li>
                <li>Fratrie : impact psychologique, à inclure dans le suivi.</li>
              </ul>
            </Card>

            <SubHeading>11.4 Aspects médico-légaux</SubHeading>
            <ul style={{ paddingLeft: 22, lineHeight: 1.8, color: COLORS.inkSoft, fontSize: 14 }}>
              <li>Hospitalisation sous contrainte si danger vital + refus : HDT ou mesure de protection.</li>
              <li>Signalement si suspicion de maltraitance ou négligence parentale.</li>
              <li>Information préoccupante si danger pour le mineur.</li>
              <li>Consentement du mineur : à rechercher même si non suffisant légalement.</li>
            </ul>

            <SubHeading>11.5 Transition pédiatrie → adulte</SubHeading>
            <ul style={{ paddingLeft: 22, lineHeight: 1.8, color: COLORS.inkSoft, fontSize: 14 }}>
              <li>Préparer dès 16 ans (consultation conjointe pédiatre + médecin adulte).</li>
              <li>Transfert du dossier médical complet.</li>
              <li>Continuité psychothérapeutique (même thérapeute si possible pendant la transition).</li>
            </ul>
          </Section>

          {/* ─────────────────────── §12 Réglementaire ─────────────────────── */}
          <Section num="12" id="reglementaire" title="Contexte réglementaire France">
            <SubHeading>12.1 Recommandations HAS</SubHeading>
            <ul style={{ paddingLeft: 22, lineHeight: 1.8, color: COLORS.inkSoft, fontSize: 14 }}>
              <li>«&nbsp;Anorexie mentale : prise en charge&nbsp;» — HAS 2010 (mise à jour attendue).</li>
              <li>«&nbsp;Boulimie et hyperphagie boulimique : repérage et éléments généraux de prise en charge&nbsp;» — HAS 2019.</li>
              <li>Guide parcours de soins TCA — HAS (en cours).</li>
            </ul>

            <SubHeading>12.2 ALD</SubHeading>
            <Card>
              <p style={{ margin: 0, fontSize: 14, color: COLORS.inkSoft, lineHeight: 1.7 }}>
                <strong style={{ color: COLORS.ink }}>ALD 23 « Affections psychiatriques de longue durée »</strong> : anorexie mentale si durée &gt; 6 mois et/ou hospitalisation &gt; 1 mois. Exonération du ticket modérateur pour tous les soins liés au TCA. Protocole de soins à remplir par le médecin traitant.
              </p>
            </Card>

            <SubHeading>12.3 Forfaits</SubHeading>
            <DataTable
              headers={["Dispositif", "Couverture", "Limite"]}
              rows={[
                ["MonParcoursPsy", "Psychologue", "8 séances/an — insuffisant pour TCA"],
                ["Forfait diététicien", "Pas de remboursement de droit", "Sauf MSP/CPTS avec dérogation"],
                ["DXA", "Remboursée", "Si justification médicale (aménorrhée, IMC < 15)"],
              ]}
            />

            <SubHeading>12.4 Ségur du numérique</SubHeading>
            <ul style={{ paddingLeft: 22, lineHeight: 1.8, color: COLORS.inkSoft, fontSize: 14 }}>
              <li><strong>DMP</strong> — partage du protocole de soins, comptes-rendus d&apos;hospitalisation.</li>
              <li><strong>Mon Espace Santé</strong> — ordonnances, résultats bio.</li>
              <li><strong>MSSanté</strong> — messagerie sécurisée entre professionnels.</li>
            </ul>
          </Section>

          {/* ─────────────────────── §13 Sources ─────────────────────── */}
          <Section num="13" id="sources" title="Sources & références">
            <ol
              style={{
                paddingLeft: 22,
                lineHeight: 1.75,
                color: COLORS.inkSoft,
                fontSize: 13.5,
                columns: 1,
              }}
            >
              <li>American Psychiatric Association. <em>DSM-5</em>, 5th edition. 2013.</li>
              <li>HAS. <em>Anorexie mentale : prise en charge.</em> Recommandation de bonne pratique. Juin 2010.</li>
              <li>NICE. <em>Eating disorders: recognition and treatment.</em> NG69. 2017 (updated 2020).</li>
              <li>APA Practice Guidelines. <em>Treatment of Patients with Eating Disorders.</em> 3rd edition. 2023.</li>
              <li>MARSIPAN. <em>Management of Really Sick Patients with Anorexia Nervosa.</em> Royal College of Psychiatrists. 2nd edition. 2014.</li>
              <li>Treasure J, Duarte TA, Schmidt U. Eating disorders. <em>Lancet.</em> 2020;395:899-911.</li>
              <li>Fairburn CG. <em>Cognitive Behavior Therapy and Eating Disorders.</em> Guilford Press. 2008.</li>
              <li>Lock J, Le Grange D. <em>Treatment Manual for Anorexia Nervosa: A Family-Based Approach.</em> 2nd edition. 2013.</li>
              <li>FFAB. Recommandations de bonne pratique. Fédération Française Anorexie Boulimie.</li>
              <li>Hudson JI, Hiripi E, Pope HG, Kessler RC. The prevalence and correlates of eating disorders. <em>Biol Psychiatry.</em> 2007;61:348-358.</li>
              <li>Zipfel S, Giel KE, Bulik CM, Hay P, Schmidt U. Anorexia nervosa: aetiology, assessment, and treatment. <em>Lancet Psychiatry.</em> 2015;2:1099-1111.</li>
              <li>Mehler PS, Brown C. Anorexia nervosa — medical complications. <em>J Eat Disord.</em> 2015;3:11.</li>
              <li>WHO. <em>ICD-11 for Mortality and Morbidity Statistics.</em> 2022.</li>
            </ol>
          </Section>

          {/* ── MDR Disclaimer ── */}
          <div
            style={{
              marginTop: 56,
              padding: "20px 22px",
              background: COLORS.card,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 14,
              fontSize: 12.5,
              color: COLORS.muted,
              lineHeight: 1.65,
            }}
          >
            <strong style={{ color: COLORS.ink }}>Fiche professionnelle.</strong> Ce document est destiné aux
            professionnels de santé. Il synthétise des recommandations issues de la HAS, NICE, MARSIPAN, FFAB
            et de la littérature scientifique. Il ne remplace pas le jugement clinique ni une consultation
            médicale. Nami n&apos;est pas un dispositif médical au sens du règlement UE 2017/745 (MDR). Les
            indicateurs proposés sont des indicateurs de complétude du dossier, pas des alertes cliniques.
          </div>

          <div className="no-print" style={{ marginTop: 32, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <Link href="/pathologies" className="back-link">← Toutes les fiches</Link>
            <a href="#" className="back-link">↑ Haut de page</a>
          </div>
        </article>
      </div>
    </div>
  );
}
