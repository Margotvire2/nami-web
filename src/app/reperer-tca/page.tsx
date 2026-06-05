import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Repérer un TCA en consultation — Guide pour spécialistes | Nami",
  description:
    "Signaux d'alerte des troubles du comportement alimentaire (anorexie, boulimie, hyperphagie) par spécialité : MG, gynéco, endocrino, cardio, gastro, dentiste, dermato, sport, pédiatre. Outils de dépistage, phrasing pour aborder la conversation, bilan à prescrire. Sources FFAB, HAS, NICE, MARSIPAN.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/reperer-tca" },
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
  tealSoft: "#E0F5F2",
  critical: "#DC2626",
  high: "#D97706",
  highSoft: "#FEF3C7",
  info: "#2563EB",
  infoSoft: "#DBEAFE",
  success: "#059669",
  successSoft: "#D1FAE5",
} as const;

/* ── Data ──────────────────────────────────────────────────────────────── */
const SECTIONS: { id: string; num: string; title: string }[] = [
  { id: "pourquoi", num: "1", title: "Pourquoi cette fiche" },
  { id: "3-questions", num: "2", title: "3 questions pour ouvrir" },
  { id: "mg", num: "3", title: "Médecin généraliste" },
  { id: "gyneco", num: "4", title: "Gynécologue" },
  { id: "endocrino", num: "5", title: "Endocrinologue" },
  { id: "cardio", num: "6", title: "Cardiologue" },
  { id: "gastro", num: "7", title: "Gastro-entérologue" },
  { id: "dentiste", num: "8", title: "Dentiste" },
  { id: "dermato", num: "9", title: "Dermatologue" },
  { id: "sport", num: "10", title: "Médecin du sport" },
  { id: "pediatre", num: "11", title: "Pédiatre" },
  { id: "atypique", num: "12", title: "Le piège de l'atypique" },
  { id: "conversation", num: "13", title: "Aborder la conversation" },
  { id: "bilan", num: "14", title: "Bilan à prescrire" },
  { id: "orienter", num: "15", title: "Vers qui orienter" },
  { id: "vignettes", num: "16", title: "3 cas concrets" },
];

/* ── Components ────────────────────────────────────────────────────────── */

type Evoc = "fort" | "modere" | "faible";

function EvocChip({ level }: { level: Evoc }) {
  const map: Record<Evoc, { bg: string; fg: string; lbl: string }> = {
    fort: { bg: "#FEF2F2", fg: COLORS.critical, lbl: "Évocation forte" },
    modere: { bg: COLORS.highSoft, fg: COLORS.high, lbl: "Évocation modérée" },
    faible: { bg: COLORS.infoSoft, fg: COLORS.info, lbl: "À investiguer" },
  };
  const v = map[level];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 10.5,
        fontWeight: 700,
        letterSpacing: "0.04em",
        padding: "3px 9px",
        borderRadius: 100,
        background: v.bg,
        color: v.fg,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: v.fg }} />
      {v.lbl}
    </span>
  );
}

function TCABadge({ kind }: { kind: "AN" | "BN" | "BED" | "ARFID" | "ALL" }) {
  const map = {
    AN: { lbl: "Anorexie", color: COLORS.primary },
    BN: { lbl: "Boulimie", color: COLORS.teal },
    BED: { lbl: "Hyperphagie", color: COLORS.high },
    ARFID: { lbl: "ARFID", color: COLORS.info },
    ALL: { lbl: "Tous TCA", color: COLORS.muted },
  };
  const v = map[kind];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.05em",
        padding: "2px 8px",
        borderRadius: 6,
        background: "transparent",
        color: v.color,
        border: `1px solid ${v.color}40`,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {v.lbl}
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

function Card({
  children,
  accent,
  bg,
}: {
  children: React.ReactNode;
  accent?: string;
  bg?: string;
}) {
  return (
    <div
      style={{
        background: bg ?? COLORS.card,
        border: `1px solid ${COLORS.border}`,
        borderLeft: accent ? `3px solid ${accent}` : `1px solid ${COLORS.border}`,
        borderRadius: 14,
        padding: "20px 22px",
        boxShadow: "0 1px 3px rgba(26,26,46,0.04)",
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}

function StatCard({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div
      style={{
        background: COLORS.card,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 14,
        padding: "22px 18px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: "2.4rem",
          fontWeight: 800,
          letterSpacing: "-0.04em",
          color,
          lineHeight: 1,
          marginBottom: 8,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 12,
          color: COLORS.muted,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          lineHeight: 1.5,
        }}
      >
        {label}
      </div>
    </div>
  );
}

function KeyValueGrid({ items }: { items: { label: string; value: React.ReactNode }[] }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
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
          <div style={{ fontSize: 13.5, color: COLORS.ink, lineHeight: 1.5 }}>{it.value}</div>
        </div>
      ))}
    </div>
  );
}

function DataTable({
  headers,
  rows,
  caption,
  firstColBold = true,
}: {
  headers: string[];
  rows: (string | React.ReactNode)[][];
  caption?: string;
  firstColBold?: boolean;
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

function PhraseCompare({
  bad,
  good,
}: {
  bad: { label: string; text: string };
  good: { label: string; text: string };
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12,
        marginBottom: 14,
      }}
      className="phrase-grid"
    >
      <div
        style={{
          background: "#FEF2F2",
          border: "1px solid #FECACA",
          borderRadius: 12,
          padding: "14px 16px",
        }}
      >
        <div
          style={{
            fontSize: 10.5,
            fontWeight: 700,
            color: COLORS.critical,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 8,
          }}
        >
          ✗ {bad.label}
        </div>
        <div style={{ fontSize: 14, color: COLORS.ink, fontStyle: "italic", lineHeight: 1.55 }}>
          «&nbsp;{bad.text}&nbsp;»
        </div>
      </div>
      <div
        style={{
          background: COLORS.successSoft,
          border: "1px solid #A7F3D0",
          borderRadius: 12,
          padding: "14px 16px",
        }}
      >
        <div
          style={{
            fontSize: 10.5,
            fontWeight: 700,
            color: COLORS.success,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 8,
          }}
        >
          ✓ {good.label}
        </div>
        <div style={{ fontSize: 14, color: COLORS.ink, fontStyle: "italic", lineHeight: 1.55 }}>
          «&nbsp;{good.text}&nbsp;»
        </div>
      </div>
    </div>
  );
}

function Vignette({
  title,
  context,
  signaux,
  question,
  outcome,
}: {
  title: string;
  context: string;
  signaux: string[];
  question: string;
  outcome: string;
}) {
  return (
    <div
      style={{
        background: COLORS.card,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 16,
        padding: "22px 24px",
        marginBottom: 16,
        boxShadow: "0 1px 3px rgba(26,26,46,0.04)",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: COLORS.primary,
          marginBottom: 10,
        }}
      >
        Cas clinique
      </div>
      <h4
        style={{
          fontSize: "1.15rem",
          fontWeight: 700,
          color: COLORS.ink,
          letterSpacing: "-0.015em",
          marginBottom: 12,
        }}
      >
        {title}
      </h4>
      <p style={{ fontSize: 14, color: COLORS.inkSoft, lineHeight: 1.65, marginBottom: 14 }}>
        {context}
      </p>
      <div
        style={{
          fontSize: 10.5,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: COLORS.muted,
          marginBottom: 8,
        }}
      >
        Signaux
      </div>
      <ul
        style={{
          margin: "0 0 16px",
          paddingLeft: 22,
          fontSize: 13.5,
          color: COLORS.inkSoft,
          lineHeight: 1.7,
        }}
      >
        {signaux.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
      <div
        style={{
          background: COLORS.primarySoft,
          borderRadius: 10,
          padding: "12px 14px",
          marginBottom: 12,
        }}
      >
        <div
          style={{
            fontSize: 10.5,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: COLORS.primary,
            marginBottom: 6,
          }}
        >
          Question à poser
        </div>
        <p style={{ margin: 0, fontSize: 14, color: COLORS.ink, fontStyle: "italic", lineHeight: 1.55 }}>
          «&nbsp;{question}&nbsp;»
        </p>
      </div>
      <div
        style={{
          fontSize: 10.5,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: COLORS.muted,
          marginBottom: 6,
        }}
      >
        Suite à donner
      </div>
      <p style={{ margin: 0, fontSize: 13.5, color: COLORS.inkSoft, lineHeight: 1.65 }}>
        {outcome}
      </p>
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────────────────── */
export default function ReprerTCAPage() {
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
        .toc-num { font-size: 10.5px; font-weight: 700; color: ${COLORS.faint}; min-width: 18px; }
        .toc-link:hover .toc-num { color: ${COLORS.primary}; }
        .back-link { color: ${COLORS.muted}; font-size: 13px; text-decoration: none; transition: color 0.15s; }
        .back-link:hover { color: ${COLORS.primary}; }
        @media (max-width: 960px) {
          .layout-grid { grid-template-columns: 1fr !important; }
          .toc-aside { display: none !important; }
          .phrase-grid { grid-template-columns: 1fr !important; }
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
            <span style={{ color: COLORS.faint, fontSize: 12, marginLeft: 4 }}>· Guide repérage</span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <Link href="/fiche-anorexie-mentale" className="back-link">
              Fiche anorexie mentale →
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section
        style={{
          padding: "64px 24px 48px",
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
              Repérage précoce · TCA
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
              9 spécialités · KB v1
            </span>
          </div>
          <h1
            style={{
              fontSize: "clamp(2.2rem, 4.5vw, 3.4rem)",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
              color: COLORS.ink,
              marginBottom: 18,
              maxWidth: 880,
            }}
          >
            Repérer un trouble du comportement alimentaire quand la patiente consulte pour autre chose.
          </h1>
          <p
            style={{
              fontSize: "1.1rem",
              color: COLORS.inkSoft,
              lineHeight: 1.65,
              maxWidth: 720,
              marginBottom: 28,
            }}
          >
            L&apos;anorexie, la boulimie et l&apos;hyperphagie se présentent rarement par leur
            symptôme principal. Cette fiche aide les spécialistes — gynéco, endocrino, cardio,
            gastro, dentiste, dermato — à reconnaître les signaux indirects, à poser les bonnes
            questions et à orienter sans casser la relation thérapeutique.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              { k: "Sources", v: "FFAB · HAS 2010 · NICE NG69 · MARSIPAN" },
              { k: "Sections", v: "16" },
              { k: "TCA couverts", v: "AN · BN · BED · ARFID" },
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
                <span style={{ color: COLORS.ink, fontWeight: 600 }}>{b.v}</span>
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
          gridTemplateColumns: "240px 1fr",
          gap: 56,
          alignItems: "start",
        }}
      >
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

        <article style={{ minWidth: 0 }}>
          {/* ─────────────────────── §1 Pourquoi ─────────────────────── */}
          <Section
            num="1"
            id="pourquoi"
            title="Pourquoi cette fiche"
            intro="Les TCA touchent ~5 % de la population française. Pourtant, plus d'un cas sur deux échappe au diagnostic médical, et le délai moyen entre le début des troubles et la première prise en charge dépasse 5 ans. Raison principale : le patient consulte rarement pour son TCA — il consulte pour ses conséquences."
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(200px, 100%), 1fr))",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <StatCard value="~5 %" label="population française\ntouchée par un TCA" color={COLORS.primary} />
              <StatCard value="5-7 ans" label="délai moyen avant\ndiagnostic" color={COLORS.high} />
              <StatCard value="50 %" label="des cas non identifiés\nen 1er recours" color={COLORS.critical} />
              <StatCard value="9F/1H" label="ratio historique,\n5F/1H aujourd'hui" color={COLORS.teal} />
            </div>

            <Card accent={COLORS.primary}>
              <p style={{ margin: 0, fontSize: 14, color: COLORS.inkSoft, lineHeight: 1.65 }}>
                <strong style={{ color: COLORS.ink }}>Le motif de consultation cache le TCA</strong> dans 7 cas sur 10.
                La patiente vient pour une aménorrhée chez le gynéco, une bradycardie chez le cardio, une cytolyse
                inexpliquée chez le gastro, une ostéopénie chez l&apos;endocrino, des caries multiples chez le
                dentiste. Repérer = penser à la possibilité, oser la question, savoir vers qui adresser.
              </p>
            </Card>
          </Section>

          {/* ─────────────────────── §2 3 questions ─────────────────────── */}
          <Section
            num="2"
            id="3-questions"
            title="3 questions pour ouvrir le dialogue"
            intro="Le SCOFF-F est un outil de dépistage validé en français, sensibilité ~85 %, spécificité ~80 %. 2 oui sur 5 = haute suspicion."
          >
            <SubHeading>SCOFF-F (Sick, Control, One stone, Fat, Food)</SubHeading>
            <DataTable
              headers={["Question", "Item"]}
              rows={[
                [<strong key="s">S</strong>, "Vous faites-vous vomir parce que vous vous sentez mal d'avoir trop mangé ?"],
                [<strong key="c">C</strong>, "Vous inquiétez-vous d'avoir perdu le contrôle de ce que vous mangez ?"],
                [<strong key="o">O</strong>, "Avez-vous récemment perdu plus de 6 kg en 3 mois ?"],
                [<strong key="f">F</strong>, "Pensez-vous que vous êtes gros(se) alors que les autres vous disent que vous êtes mince ?"],
                [<strong key="ff">F</strong>, "Diriez-vous que la nourriture domine votre vie ?"],
              ]}
              firstColBold={false}
            />
            <p style={{ fontSize: 13, color: COLORS.muted, marginTop: 8, marginBottom: 24 }}>
              ⏱ &lt; 2 minutes · libre de droits · à intégrer dans tout interrogatoire si suspicion.
            </p>

            <SubHeading>Trois questions « entrée douce » (alternative SCOFF)</SubHeading>
            <Card bg={COLORS.tealSoft}>
              <ol style={{ margin: 0, paddingLeft: 22, fontSize: 14.5, color: COLORS.ink, lineHeight: 1.8 }}>
                <li><strong>«&nbsp;Est-ce que la nourriture vous prend beaucoup de place dans la tête ?&nbsp;»</strong></li>
                <li><strong>«&nbsp;Est-ce qu&apos;il vous arrive de manger en dehors des repas, ou de sauter des repas, sans en parler à votre entourage ?&nbsp;»</strong></li>
                <li><strong>«&nbsp;Est-ce que votre poids ou votre corps influence votre humeur, votre journée ?&nbsp;»</strong></li>
              </ol>
            </Card>
          </Section>

          {/* ─────────────────────── §3 MG ─────────────────────── */}
          <Section
            num="3"
            id="mg"
            title="Médecin généraliste"
            intro="Premier recours. La majorité des TCA passe par le MG avant tout spécialiste. Vigilance sur tout motif vague chez l'adolescente ou la jeune femme."
          >
            <DataTable
              headers={["Motif de consultation", "Signal", "TCA évoqué", "Niveau"]}
              rows={[
                ["Fatigue chronique", "Bradycardie de repos < 55 bpm, hypotension", <TCABadge key="1" kind="AN" />, <EvocChip key="e1" level="fort" />],
                ["Perte de poids inexpliquée", "≥ 5 % en 6 mois sans cause organique trouvée", <TCABadge key="2" kind="AN" />, <EvocChip key="e2" level="fort" />],
                ["Constipation", "Chronique, sévère, chez jeune femme mince", <TCABadge key="3" kind="AN" />, <EvocChip key="e3" level="modere" />],
                ["Frilosité, extrémités froides", "Acrocyanose, lanugo dans le dos / joues", <TCABadge key="4" kind="AN" />, <EvocChip key="e4" level="fort" />],
                ["Vertiges, malaises", "Hypotension orthostatique > 20 mmHg", <TCABadge key="5" kind="ALL" />, <EvocChip key="e5" level="modere" />],
                ["Demandes répétées de régime", "Insatisfaction corporelle, IMC normal ou élevé", <TCABadge key="6" kind="ALL" />, <EvocChip key="e6" level="fort" />],
                ["Demande d'arrêt maladie autour des repas", "Évitement social alimentaire", <TCABadge key="7" kind="AN" />, <EvocChip key="e7" level="modere" />],
                ["Plaintes digestives diffuses", "« Toujours ballonnée », « digestion lente »", <TCABadge key="8" kind="ALL" />, <EvocChip key="e8" level="faible" />],
                ["Insomnie + ruminations", "Pensées centrées sur la nourriture, le corps", <TCABadge key="9" kind="ALL" />, <EvocChip key="e9" level="modere" />],
                ["Demande de bilan « complet »", "Sans plainte précise, jeune femme, demande pesée", <TCABadge key="10" kind="ALL" />, <EvocChip key="e10" level="faible" />],
              ]}
              caption="Signaux courants en médecine générale"
            />
          </Section>

          {/* ─────────────────────── §4 Gynéco ─────────────────────── */}
          <Section
            num="4"
            id="gyneco"
            title="Gynécologue"
            intro="L'aménorrhée hypothalamique fonctionnelle est l'un des signes les plus précoces de l'anorexie. Toute aménorrhée secondaire chez une femme mince ou sportive impose d'évoquer un TCA avant d'incriminer le stress, la pilule ou un SOPK."
          >
            <DataTable
              headers={["Motif", "Signal", "TCA évoqué", "Niveau"]}
              rows={[
                ["Aménorrhée secondaire", "Sans grossesse, sans SOPK, IMC < 19 ou perte récente", <TCABadge key="g1" kind="AN" />, <EvocChip key="eg1" level="fort" />],
                ["Aménorrhée primaire", "Adolescente normo-pondérée mais sportive intensive / restriction", <TCABadge key="g2" kind="AN" />, <EvocChip key="eg2" level="fort" />],
                ["Oligoménorrhée", "Cycles > 35j, hypoestrogénie biologique (E2 < 30 pg/mL)", <TCABadge key="g3" kind="AN" />, <EvocChip key="eg3" level="modere" />],
                ["Infertilité inexpliquée", "Bilan négatif, profil restrictif, sport intensif, IMC bas", <TCABadge key="g4" kind="AN" />, <EvocChip key="eg4" level="modere" />],
                ["Ostéopénie / ostéoporose précoce", "DXA T-score < -1 chez < 40 ans", <TCABadge key="g5" kind="AN" />, <EvocChip key="eg5" level="fort" />],
                ["Atrophie endométriale", "Endomètre fin à l'écho sans cause hormonale identifiée", <TCABadge key="g6" kind="AN" />, <EvocChip key="eg6" level="modere" />],
                ["Bilan hormonal effondré", "FSH/LH basses (hypogonadisme hypogonadotrope)", <TCABadge key="g7" kind="AN" />, <EvocChip key="eg7" level="fort" />],
                ["Demande de pilule pour « ramener les règles »", "Patiente jeune, IMC < 19, refus de prendre du poids", <TCABadge key="g8" kind="AN" />, <EvocChip key="eg8" level="fort" />],
                ["Prise de poids inexpliquée", "Chez jeune femme, surtout après régime restrictif récent", <TCABadge key="g9" kind="BED" />, <EvocChip key="eg9" level="modere" />],
              ]}
              caption="Signaux gynécologiques évocateurs"
            />

            <Card accent={COLORS.critical}>
              <p style={{ margin: 0, fontSize: 14, color: COLORS.inkSoft, lineHeight: 1.65 }}>
                <strong style={{ color: COLORS.ink }}>Piège n°1 du gynéco</strong> — prescrire une contraception œstroprogestative chez une jeune femme en aménorrhée hypothalamique fait disparaître le signal sans traiter la cause. <strong>Le retour des règles sous pilule n&apos;est pas une rémission</strong>. Vérifier IMC, poids antérieur, perte récente, comportements alimentaires.
              </p>
            </Card>
          </Section>

          {/* ─────────────────────── §5 Endocrino ─────────────────────── */}
          <Section
            num="5"
            id="endocrino"
            title="Endocrinologue"
            intro="L'endocrinologue voit les conséquences hormonales de la dénutrition (low T3 syndrome, hypogonadisme, hyperaldostéronisme), les hypoglycémies, l'ostéoporose précoce et — situation à risque vital majeur — la diabulimie chez le DT1."
          >
            <DataTable
              headers={["Motif", "Signal", "TCA évoqué", "Niveau"]}
              rows={[
                ["Suspicion hypothyroïdie", "TSH normale ou peu élevée, T3 basse (low T3 syndrome adaptatif)", <TCABadge key="e1" kind="AN" />, <EvocChip key="ee1" level="fort" />],
                ["Hypothyroïdie subclinique", "TSH 4-10, Ac anti-TPO négatifs, IMC bas", <TCABadge key="e2" kind="AN" />, <EvocChip key="ee2" level="modere" />],
                ["Hypoglycémies inexpliquées", "À jeun, chez jeune femme mince, sans diabète", <TCABadge key="e3" kind="AN" />, <EvocChip key="ee3" level="fort" />],
                ["Ostéoporose précoce", "T-score < -2 chez < 40 ans, surtout femme", <TCABadge key="e4" kind="AN" />, <EvocChip key="ee4" level="fort" />],
                ["Hypogonadisme hypogonadotrope", "FSH/LH basses, E2 effondré, femme jeune", <TCABadge key="e5" kind="AN" />, <EvocChip key="ee5" level="fort" />],
                ["Retard pubertaire / aménorrhée primaire", "Stagnation Tanner, courbe de taille en cassure", <TCABadge key="e6" kind="AN" />, <EvocChip key="ee6" level="fort" />],
                ["Cortisol 8h élevé", "Sans Cushing clinique (hypercorticisme adaptatif de la dénutrition)", <TCABadge key="e7" kind="AN" />, <EvocChip key="ee7" level="modere" />],
                ["DT1 : HbA1c instable, acido-cétoses répétées", "Manipulation des doses d'insuline pour ne pas prendre de poids = diabulimie", <TCABadge key="e8" kind="ALL" />, <EvocChip key="ee8" level="fort" />],
                ["Demande de chirurgie bariatrique", "Antécédent de TCA non exploré, BED actif", <TCABadge key="e9" kind="BED" />, <EvocChip key="ee9" level="fort" />],
                ["Insulinorésistance + cycles irréguliers", "Profil compatible BED chronique masqué par étiquette SOPK", <TCABadge key="e10" kind="BED" />, <EvocChip key="ee10" level="modere" />],
              ]}
              caption="Signaux endocrinologiques évocateurs"
            />

            <Card accent={COLORS.critical}>
              <p style={{ margin: 0, fontSize: 14, color: COLORS.inkSoft, lineHeight: 1.65 }}>
                <strong style={{ color: COLORS.ink }}>Diabulimie — urgence absolue.</strong> 30 % des femmes DT1 ont, à un moment, manipulé leurs doses d&apos;insuline pour contrôler leur poids. Mortalité multipliée par 3. Toute HbA1c chaotique chez DT1 jeune femme doit faire poser la question explicitement.
              </p>
            </Card>
          </Section>

          {/* ─────────────────────── §6 Cardio ─────────────────────── */}
          <Section
            num="6"
            id="cardio"
            title="Cardiologue"
            intro="Bradycardie chez jeune femme non sportive, QTc allongé sans cause iatrogène, hypokaliémie récidivante, et surtout l'hypercholestérolémie paradoxale du sujet maigre : la dénutrition perturbe le métabolisme lipidique hépatique, le cholestérol total peut dépasser 3 g/L chez une patiente à IMC 14."
          >
            <DataTable
              headers={["Motif", "Signal", "TCA évoqué", "Niveau"]}
              rows={[
                ["Bradycardie sinusale", "< 50 bpm chez sujet jeune non sportif", <TCABadge key="c1" kind="AN" />, <EvocChip key="ec1" level="fort" />],
                ["Hypotension", "PAS < 90 mmHg sans cause médicamenteuse", <TCABadge key="c2" kind="AN" />, <EvocChip key="ec2" level="fort" />],
                ["QTc allongé", "> 440 ms sans cause iatrogène, sans antécédent familial", <TCABadge key="c3" kind="AN" />, <EvocChip key="ec3" level="fort" />],
                ["Syncopes / lipothymies", "Orthostatiques, post-prandiales (renutrition)", <TCABadge key="c4" kind="ALL" />, <EvocChip key="ec4" level="modere" />],
                ["Hypercholestérolémie paradoxale", "Cholestérol total > 2.5 g/L chez IMC < 18.5 — pseudo-dyslipidémie de dénutrition", <TCABadge key="c5" kind="AN" />, <EvocChip key="ec5" level="fort" />],
                ["Hypokaliémie inexpliquée", "K⁺ < 3.5 sans diurétique, sans IRC = vomissements occultes / laxatifs", <TCABadge key="c6" kind="BN" />, <EvocChip key="ec6" level="fort" />],
                ["Prolapsus mitral isolé", "Femme jeune mince, sans syndrome de Marfan", <TCABadge key="c7" kind="AN" />, <EvocChip key="ec7" level="modere" />],
                ["Péricardite récidivante", "Sans cause virale ni auto-immune, sujet jeune dénutri", <TCABadge key="c8" kind="AN" />, <EvocChip key="ec8" level="faible" />],
                ["Demande de bilan cardio pour « sport intensif »", "Sportive aménorrhéique, perte de poids, perfectionnisme", <TCABadge key="c9" kind="AN" />, <EvocChip key="ec9" level="modere" />],
              ]}
              caption="Signaux cardiologiques évocateurs"
            />

            <Card accent={COLORS.high}>
              <p style={{ margin: 0, fontSize: 14, color: COLORS.inkSoft, lineHeight: 1.65 }}>
                <strong style={{ color: COLORS.ink }}>Ne pas prescrire de statine</strong> sur une hypercholestérolémie paradoxale de dénutrition. Le profil lipidique se normalise spontanément avec la renutrition. Le traitement est nutritionnel, pas pharmacologique.
              </p>
            </Card>
          </Section>

          {/* ─────────────────────── §7 Gastro ─────────────────────── */}
          <Section
            num="7"
            id="gastro"
            title="Gastro-entérologue"
            intro="La gastro-entérologie est un sas naturel pour la boulimie occulte (RGO, érosions œsophagiennes, hypertrophie parotidienne) et pour l'anorexie (gastroparésie, constipation sévère, cytolyse hépatique de dénutrition)."
          >
            <DataTable
              headers={["Motif", "Signal", "TCA évoqué", "Niveau"]}
              rows={[
                ["RGO résistant", "Œsophagite distale chez jeune femme sans facteur classique", <TCABadge key="ga1" kind="BN" />, <EvocChip key="ega1" level="fort" />],
                ["Œsophagite/érosions distales", "Aspect d'œsophagite peptique sans hernie hiatale", <TCABadge key="ga2" kind="BN" />, <EvocChip key="ega2" level="fort" />],
                ["Hypertrophie parotidienne bilatérale", "Pseudo-syndrome de Sjögren chez jeune femme", <TCABadge key="ga3" kind="BN" />, <EvocChip key="ega3" level="fort" />],
                ["Élévation amylasémie salivaire", "Sans pancréatite (sialadénose des vomissements)", <TCABadge key="ga4" kind="BN" />, <EvocChip key="ega4" level="fort" />],
                ["Constipation chronique sévère", "Transit > 5 jours, abus de laxatifs", <TCABadge key="ga5" kind="ALL" />, <EvocChip key="ega5" level="modere" />],
                ["Gastroparésie", "Ballonnements massifs post-prandiaux, satiété précoce, IMC bas", <TCABadge key="ga6" kind="AN" />, <EvocChip key="ega6" level="modere" />],
                ["Cytolyse hépatique inexpliquée", "ASAT/ALAT modérément élevées chez sujet maigre", <TCABadge key="ga7" kind="AN" />, <EvocChip key="ega7" level="modere" />],
                ["Stéatose hépatique chez sujet maigre", "Sans alcool, sans surcharge, dénutrition chronique", <TCABadge key="ga8" kind="AN" />, <EvocChip key="ega8" level="modere" />],
                ["Hypokaliémie + alcalose métabolique", "Vomissements répétés non avoués", <TCABadge key="ga9" kind="BN" />, <EvocChip key="ega9" level="fort" />],
                ["Demande de coloscopie pour « transit »", "Femme jeune, abus de laxatifs masqué", <TCABadge key="ga10" kind="BN" />, <EvocChip key="ega10" level="modere" />],
              ]}
              caption="Signaux gastro-entérologiques évocateurs"
            />
          </Section>

          {/* ─────────────────────── §8 Dentiste ─────────────────────── */}
          <Section
            num="8"
            id="dentiste"
            title="Dentiste"
            intro="Le dentiste est souvent le premier à voir la boulimie. L'érosion de l'émail sur la face palatine des incisives supérieures est pathognomonique des vomissements répétés."
          >
            <DataTable
              headers={["Signal", "Description", "TCA évoqué", "Niveau"]}
              rows={[
                ["Érosion émail face palatine supérieure", "Perimylolyse — pathognomonique des vomissements chroniques", <TCABadge key="d1" kind="BN" />, <EvocChip key="ed1" level="fort" />],
                ["Hypersensibilité dentinaire diffuse", "Sans cause iatrogène ou parafonctionnelle", <TCABadge key="d2" kind="BN" />, <EvocChip key="ed2" level="modere" />],
                ["Caries multiples rapides", "Chez patient(e) compliant(e) à l'hygiène orale", <TCABadge key="d3" kind="BN" />, <EvocChip key="ed3" level="modere" />],
                ["Hypertrophie parotidienne", "Visible et palpable, joues « gonflées »", <TCABadge key="d4" kind="BN" />, <EvocChip key="ed4" level="fort" />],
                ["Sécheresse buccale", "Hyposialie, langue dépapillée", <TCABadge key="d5" kind="ALL" />, <EvocChip key="ed5" level="faible" />],
                ["Aphtes récidivants", "Carences (vit. B12, fer, zinc)", <TCABadge key="d6" kind="AN" />, <EvocChip key="ed6" level="faible" />],
                ["Gingivite érosive chronique", "Sans plaque, jeune femme", <TCABadge key="d7" kind="BN" />, <EvocChip key="ed7" level="faible" />],
              ]}
              caption="Signaux dentaires évocateurs"
            />

            <Card accent={COLORS.teal}>
              <p style={{ margin: 0, fontSize: 14, color: COLORS.inkSoft, lineHeight: 1.65 }}>
                <strong style={{ color: COLORS.ink }}>Conseil patient bref</strong> — si vomissements, ne PAS se brosser les dents immédiatement après (l&apos;émail est ramolli par l&apos;acide). Rincer à l&apos;eau ou au bicarbonate, attendre 30 min avant brossage.
              </p>
            </Card>
          </Section>

          {/* ─────────────────────── §9 Dermato ─────────────────────── */}
          <Section
            num="9"
            id="dermato"
            title="Dermatologue"
            intro="La peau et les phanères reflètent l'état nutritionnel. Le signe de Russell (callosités sur le dos des doigts liées au réflexe nauséeux provoqué) reste le marqueur dermato le plus spécifique de boulimie."
          >
            <DataTable
              headers={["Signal", "Description", "TCA évoqué", "Niveau"]}
              rows={[
                ["Signe de Russell", "Callosités sur dos des doigts (2e/3e métacarpe) — vomissements provoqués", <TCABadge key="de1" kind="BN" />, <EvocChip key="ede1" level="fort" />],
                ["Lanugo", "Duvet sur dos, joues, cou (hypothermie compensatoire)", <TCABadge key="de2" kind="AN" />, <EvocChip key="ede2" level="fort" />],
                ["Acrocyanose", "Extrémités froides, bleutées, dans toute l'année", <TCABadge key="de3" kind="AN" />, <EvocChip key="ede3" level="fort" />],
                ["Xérose cutanée", "Peau sèche, fine, parchemin", <TCABadge key="de4" kind="AN" />, <EvocChip key="ede4" level="modere" />],
                ["Cheveux cassants, alopécie", "Diffuse, effluvium télogène par dénutrition", <TCABadge key="de5" kind="AN" />, <EvocChip key="ede5" level="modere" />],
                ["Ongles cassants, koïlonychie", "Carence martiale, dénutrition", <TCABadge key="de6" kind="AN" />, <EvocChip key="ede6" level="modere" />],
                ["Hématomes faciles", "Carence vit. K, thrombopénie de dénutrition", <TCABadge key="de7" kind="AN" />, <EvocChip key="ede7" level="faible" />],
                ["Caroténodermie", "Coloration orange palmo-plantaire (β-carotène)", <TCABadge key="de8" kind="AN" />, <EvocChip key="ede8" level="modere" />],
                ["Acné tardive", "Femme > 25 ans avec compensation hormonale", <TCABadge key="de9" kind="ALL" />, <EvocChip key="ede9" level="faible" />],
                ["Vergetures de prise/perte rapide", "Antécédent de yo-yo pondéral, BED", <TCABadge key="de10" kind="BED" />, <EvocChip key="ede10" level="faible" />],
              ]}
              caption="Signaux dermatologiques évocateurs"
            />
          </Section>

          {/* ─────────────────────── §10 Sport ─────────────────────── */}
          <Section
            num="10"
            id="sport"
            title="Médecin du sport / MPR"
            intro="Le RED-S (Relative Energy Deficiency in Sport) regroupe l'aménorrhée, l'ostéoporose et la dénutrition chez la sportive. Sports à risque : danse, gymnastique, athlétisme fond, mannequinat sportif, escalade, équitation, natation synchronisée."
          >
            <DataTable
              headers={["Signal", "Description", "TCA évoqué", "Niveau"]}
              rows={[
                ["Aménorrhée athlétique", "Sportive intensive, IMC < 19 ou perte récente", <TCABadge key="s1" kind="AN" />, <EvocChip key="es1" level="fort" />],
                ["Fractures de stress répétées", "Tibia, métatarses, fémur — RED-S typique", <TCABadge key="s2" kind="AN" />, <EvocChip key="es2" level="fort" />],
                ["Stagnation / chute de performance", "Malgré entraînement maintenu ou intensifié", <TCABadge key="s3" kind="AN" />, <EvocChip key="es3" level="modere" />],
                ["Surentraînement compulsif", "≥ 2h/j, incapacité à arrêter même blessé(e)", <TCABadge key="s4" kind="AN" />, <EvocChip key="es4" level="fort" />],
                ["Régime restrictif justifié par la performance", "« Sec », « affûté », pesées quotidiennes", <TCABadge key="s5" kind="AN" />, <EvocChip key="es5" level="fort" />],
                ["Fatigue persistante, syndrome dépressif", "Sur fond de surentraînement, sommeil dégradé", <TCABadge key="s6" kind="AN" />, <EvocChip key="es6" level="modere" />],
                ["Anémie ferriprive récidivante", "Sportive avec apports inadéquats", <TCABadge key="s7" kind="AN" />, <EvocChip key="es7" level="modere" />],
                ["Visite de non-contre-indication", "Sport à risque + IMC limite + perfectionnisme", <TCABadge key="s8" kind="AN" />, <EvocChip key="es8" level="modere" />],
              ]}
              caption="Signaux médecine du sport / RED-S"
            />
          </Section>

          {/* ─────────────────────── §11 Pédiatre ─────────────────────── */}
          <Section
            num="11"
            id="pediatre"
            title="Pédiatre"
            intro="Chez l'enfant et l'adolescent, le TCA se présente rarement par une plainte de poids. Le pédiatre voit la cassure de la courbe (poids, taille, BMI), le retard pubertaire, ou l'ARFID (évitement sensoriel sans préoccupation pondérale)."
          >
            <DataTable
              headers={["Signal", "Description", "TCA évoqué", "Niveau"]}
              rows={[
                ["Cassure de la courbe de poids", "Décrochage > 1 DS sur courbe OMS/Tanner-Whitehouse", <TCABadge key="p1" kind="AN" />, <EvocChip key="ep1" level="fort" />],
                ["Cassure de la courbe staturale", "Ralentissement, perte de plusieurs centimètres de prévision", <TCABadge key="p2" kind="AN" />, <EvocChip key="ep2" level="fort" />],
                ["Retard pubertaire", "Stagnation Tanner, aménorrhée primaire", <TCABadge key="p3" kind="AN" />, <EvocChip key="ep3" level="fort" />],
                ["Refus alimentaire prolongé", "Sélectivité extrême, peu d'aliments tolérés, sans préoccupation poids", <TCABadge key="p4" kind="ARFID" />, <EvocChip key="ep4" level="fort" />],
                ["Plaintes digestives chroniques chez ado", "« Mal au ventre », « ballonnements » — évitement justifié", <TCABadge key="p5" kind="AN" />, <EvocChip key="ep5" level="modere" />],
                ["Sportivité « envahissante »", "Sport quotidien, refus de manquer une séance, blessures répétées", <TCABadge key="p6" kind="AN" />, <EvocChip key="ep6" level="modere" />],
                ["Demande parentale autour des repas", "« Elle ne mange plus rien », conflits aux repas", <TCABadge key="p7" kind="ALL" />, <EvocChip key="ep7" level="fort" />],
                ["Perfectionnisme scolaire + insatisfaction", "Bonnes notes, autoexigence, dévalorisation corporelle", <TCABadge key="p8" kind="AN" />, <EvocChip key="ep8" level="modere" />],
              ]}
              caption="Signaux pédiatriques évocateurs"
            />

            <Card accent={COLORS.primary}>
              <p style={{ margin: 0, fontSize: 14, color: COLORS.inkSoft, lineHeight: 1.65 }}>
                <strong style={{ color: COLORS.ink }}>Toujours peser et mesurer</strong> à chaque consultation entre 10 et 18 ans, et reporter sur la courbe. Une cassure sur 2-3 mesures successives est un signal d&apos;alerte fort, même chez un enfant qui « va bien » par ailleurs.
              </p>
            </Card>
          </Section>

          {/* ─────────────────────── §12 Atypique ─────────────────────── */}
          <Section
            num="12"
            id="atypique"
            title="Le piège de la présentation atypique"
            intro="Un TCA n'est PAS forcément maigre. Le DSM-5 reconnaît l'anorexie atypique (tous les critères sauf le poids bas), et la boulimie + l'hyperphagie se présentent souvent à IMC normal ou élevé."
          >
            <DataTable
              headers={["Profil atypique", "Pourquoi on rate le diagnostic", "TCA"]}
              rows={[
                ["Femme à IMC normal qui a beaucoup maigri", "Le clinicien évalue le poids absolu, pas la trajectoire. Anorexie atypique.", <TCABadge key="a1" kind="AN" />],
                ["Femme en surpoids qui a perdu 20 kg", "Félicitée pour la perte de poids, signaux ignorés", <TCABadge key="a2" kind="AN" />],
                ["Adolescente sportive sans préoccupation explicite du poids", "Justifie la restriction par la performance (RED-S)", <TCABadge key="a3" kind="AN" />],
                ["Homme jeune musclé compulsif", "Bigorexie, restriction sélective, sous-diagnostiqué", <TCABadge key="a4" kind="AN" />],
                ["Personne en surpoids qui mange en cachette", "Étiquetée « manque de volonté », pas évoquée comme BED", <TCABadge key="a5" kind="BED" />],
                ["Femme normo-pondérale qui vomit après les repas", "Boulimie occulte, IMC normal masque la pathologie", <TCABadge key="a6" kind="BN" />],
                ["Patient âgé > 60 ans", "TCA tardif rare mais existe, jamais évoqué", <TCABadge key="a7" kind="ALL" />],
                ["Patient enceinte ou en post-partum", "Restriction camouflée derrière les « envies » de grossesse", <TCABadge key="a8" kind="ALL" />],
                ["Patient en post-chirurgie bariatrique", "BED non traité préop. réapparaît, ou nouvel ARFID", <TCABadge key="a9" kind="ALL" />],
              ]}
              caption="Quand le diagnostic est manqué"
            />

            <Card accent={COLORS.critical}>
              <p style={{ margin: 0, fontSize: 14, color: COLORS.inkSoft, lineHeight: 1.65 }}>
                <strong style={{ color: COLORS.ink }}>La règle d&apos;or</strong> — la gravité d&apos;un TCA se juge sur les comportements et les conséquences (somatiques, psychiques, sociales), <strong>pas sur le poids</strong>. Une anorexie atypique à IMC 22 peut être aussi dangereuse qu&apos;une anorexie typique à IMC 15.
              </p>
            </Card>
          </Section>

          {/* ─────────────────────── §13 Conversation ─────────────────────── */}
          <Section
            num="13"
            id="conversation"
            title="Aborder la conversation"
            intro="L'entretien décide souvent de la suite. Un mot maladroit ferme la porte pour des années. Quelques principes : ne pas juger, ne pas centrer sur le poids, partir de ce que vous observez, laisser le patient nommer."
          >
            <SubHeading>Principes</SubHeading>
            <Card bg="#FBFAFD">
              <ol style={{ margin: 0, paddingLeft: 22, lineHeight: 1.8, color: COLORS.inkSoft, fontSize: 14 }}>
                <li><strong style={{ color: COLORS.ink }}>Partir des conséquences observées</strong>, pas du poids. « J&apos;ai observé X. Comment ça se passe pour vous ? »</li>
                <li><strong style={{ color: COLORS.ink }}>Ne pas féliciter une perte de poids</strong>, même si le contexte semble bénéfique.</li>
                <li><strong style={{ color: COLORS.ink }}>Nommer sans imposer</strong>. « Ce que vous décrivez ressemble à ce qu&apos;on appelle un trouble alimentaire. Est-ce que ça vous parle ? »</li>
                <li><strong style={{ color: COLORS.ink }}>Respecter le déni</strong>. Le déni est une caractéristique du trouble, pas un échec d&apos;entretien.</li>
                <li><strong style={{ color: COLORS.ink }}>Laisser la porte ouverte.</strong> « Si un jour vous avez envie d&apos;en parler, on peut. »</li>
                <li><strong style={{ color: COLORS.ink }}>Préparer l&apos;orientation avant l&apos;entretien</strong> (CSO, diététicien TCA, psychologue, FFAB).</li>
              </ol>
            </Card>

            <SubHeading>Phrasing — ce qu&apos;il ne faut PAS dire vs ce qu&apos;on peut dire</SubHeading>

            <PhraseCompare
              bad={{
                label: "Centré sur le poids",
                text: "Il faut vraiment que vous repreniez du poids, c'est dangereux à ce niveau-là.",
              }}
              good={{
                label: "Centré sur le vécu",
                text: "Votre corps me montre qu'il manque d'énergie. Comment vous vivez ça au quotidien ?",
              }}
            />

            <PhraseCompare
              bad={{
                label: "Banalisant",
                text: "Vous savez, beaucoup de jeunes femmes font ça à votre âge, ça passera.",
              }}
              good={{
                label: "Validant",
                text: "Ce que vous traversez n'est pas une question de volonté. C'est connu, c'est fréquent, et ça se soigne.",
              }}
            />

            <PhraseCompare
              bad={{
                label: "Félicitation piégée",
                text: "Vous avez fait des efforts, vous êtes plus mince, bravo !",
              }}
              good={{
                label: "Observation neutre",
                text: "J'ai vu votre poids baisser depuis la dernière fois. Comment ça s'est passé ?",
              }}
            />

            <PhraseCompare
              bad={{
                label: "Injonction",
                text: "Vous devez voir un psy.",
              }}
              good={{
                label: "Proposition",
                text: "Il existe des équipes formées pour ce type de difficulté. Est-ce que ça vous intéresse que je vous montre comment ça se passe ?",
              }}
            />

            <PhraseCompare
              bad={{
                label: "Accusatoire",
                text: "Vous vomissez ? Il faut arrêter, vous allez vous abîmer les dents.",
              }}
              good={{
                label: "Curieux",
                text: "Certaines personnes, après les repas, ressentent un besoin de vomir. Est-ce que c'est quelque chose qui vous arrive ?",
              }}
            />

            <SubHeading>Si la patiente refuse ou nie</SubHeading>
            <Card accent={COLORS.teal}>
              <p style={{ margin: 0, fontSize: 14, color: COLORS.inkSoft, lineHeight: 1.65 }}>
                «&nbsp;<em>D&apos;accord. Je note ce que vous me dites. Je vais quand même vous proposer un bilan biologique parce que ce que j&apos;ai observé m&apos;inquiète un peu. On en rediscute à la prochaine consultation, et si à un moment ça change pour vous, on en reparlera.</em>&nbsp;»
              </p>
            </Card>

            <SubHeading>Si la patiente verbalise la souffrance</SubHeading>
            <Card accent={COLORS.success}>
              <p style={{ margin: 0, fontSize: 14, color: COLORS.inkSoft, lineHeight: 1.65 }}>
                «&nbsp;<em>Merci de m&apos;en parler. C&apos;est important. Vous n&apos;êtes pas seule, et ce que vous traversez se soigne. On va prendre les choses dans l&apos;ordre : un bilan d&apos;abord, puis je vous mets en relation avec quelqu&apos;un de formé. Vous voulez qu&apos;on appelle ensemble maintenant ?</em>&nbsp;»
              </p>
            </Card>
          </Section>

          {/* ─────────────────────── §14 Bilan ─────────────────────── */}
          <Section
            num="14"
            id="bilan"
            title="Bilan minimal à prescrire dès suspicion"
            intro="Ordonnance type pour tout repérage TCA. À demander même si le diagnostic est encore hypothétique : permet d'évaluer le risque somatique et de poser une base de suivi."
          >
            <DataTable
              headers={["Examen", "Pourquoi", "Délai souhaité"]}
              rows={[
                ["Poids, taille, IMC, FC, PA, T°", "Première évaluation somatique", "Consultation"],
                ["NFS plaquettes", "Leucopénie, anémie, thrombopénie de dénutrition", "< 7 jours"],
                ["Ionogramme + K + Na + Ca + Mg + phosphore", "Troubles électrolytiques, alerte hospitalisation", "< 7 jours"],
                ["Urée, créatinine, DFG", "Fonction rénale", "< 7 jours"],
                ["Glycémie à jeun", "Hypoglycémie", "< 7 jours"],
                ["Bilan hépatique (ASAT, ALAT, GGT, PAL)", "Cytolyse de dénutrition", "< 7 jours"],
                ["Albumine, préalbumine", "État nutritionnel objectif", "< 7 jours"],
                ["TSH, T3L, T4L", "Low T3 syndrome, dysthyroïdie", "< 14 jours"],
                ["Vitamine D 25-OH, ferritine, vitamine B12, folates", "Carences fréquentes", "< 14 jours"],
                ["ECG", "QTc, bradycardie, troubles du rythme", "< 7 jours"],
                ["β-HCG (si femme en âge de procréer)", "Éliminer grossesse devant aménorrhée", "Consultation"],
                ["Estradiol, FSH, LH (si aménorrhée)", "Hypogonadisme hypogonadotrope", "< 14 jours"],
                ["DXA (ostéodensitométrie)", "Si aménorrhée > 6 mois ou IMC < 17.5", "< 1 mois"],
              ]}
              caption="Bilan biologique de repérage TCA"
            />

            <Card accent={COLORS.critical}>
              <p style={{ margin: 0, fontSize: 14, color: COLORS.inkSoft, lineHeight: 1.65 }}>
                <strong style={{ color: COLORS.ink }}>Critères d&apos;adressage urgences :</strong> IMC &lt; 14, FC &lt; 40, PAS &lt; 80, T° &lt; 35.5, K⁺ &lt; 2.5, PO₄ &lt; 0.5, glycémie &lt; 0.5, QTc &gt; 500, perte &gt; 2 kg/sem, idéation suicidaire, malaise/syncope.
              </p>
            </Card>
          </Section>

          {/* ─────────────────────── §15 Orienter ─────────────────────── */}
          <Section num="15" id="orienter" title="Vers qui orienter et comment">
            <SubHeading>15.1 Vers qui adresser, selon la situation</SubHeading>
            <DataTable
              headers={["Situation", "Qui contacter", "Délai"]}
              rows={[
                ["Repérage sans urgence somatique", "Médecin formé TCA (CSO ou libéral)", "Sous 2 sem."],
                ["Comorbidité psychiatrique, dépression, idéation", "Psychiatre TCA + psychologue", "Sous 1 sem."],
                ["Critères somatiques d'hospitalisation (cf §14)", "Service spécialisé TCA + urgences", "< 24h"],
                ["Adolescente avec famille présente", "FBT / thérapie familiale (CMP, CMPP, CHU péd.)", "Sous 2 sem."],
                ["Patiente avec demande de chirurgie bariatrique", "Bilan préop TCA obligatoire (psy + diét TCA)", "Avant chirurgie"],
                ["BED sans urgence", "Diététicien TCA + psy comportementale", "Sous 1 mois"],
                ["Patient adulte autonome", "CSO ville-hôpital ou réseau libéral coordonné", "Sous 2 sem."],
              ]}
            />

            <SubHeading>15.2 Annuaires & ressources</SubHeading>
            <KeyValueGrid items={[
              { label: "FFAB", value: <a href="https://ffab.fr" target="_blank" rel="noreferrer" style={{ color: COLORS.primary, textDecoration: "none" }}>ffab.fr — annuaire centres et professionnels TCA</a> },
              { label: "Anorexie Boulimie Info Écoute", value: "0 810 037 037 (numéro national)" },
              { label: "Centres de référence", value: "Liste CHU FFAB (Paris, Lyon, Bordeaux, Toulouse, Lille, Marseille, etc.)" },
              { label: "Pédiatrie", value: "CMP, CMPP, services de pédopsychiatrie + AP-HP (Robert-Debré, Necker, Bicêtre)" },
              { label: "Associations patients", value: "Autrement, ENFINE, FNA-TCA" },
              { label: "Nami", value: "Réseau coordonné ville-hôpital pour parcours TCA complexes" },
            ]} />

            <SubHeading>15.3 Comment formuler le courrier d&apos;adressage</SubHeading>
            <Card>
              <p style={{ margin: 0, fontSize: 13.5, color: COLORS.inkSoft, lineHeight: 1.7 }}>
                <strong style={{ color: COLORS.ink }}>À transmettre :</strong> motif initial de consultation, signaux observés (avec valeurs biologiques et anthropométriques), résultat éventuel du SCOFF-F, contexte (familial, scolaire, professionnel, sportif), traitements en cours, ce qui a été dit à la patiente, sa réceptivité.
                <br /><br />
                <strong style={{ color: COLORS.ink }}>Ce qu&apos;il faut éviter :</strong> tournures jugeantes, vocabulaire culpabilisant («&nbsp;refuse de manger&nbsp;», «&nbsp;manque de volonté&nbsp;»), conclusions diagnostiques fermées si la patiente n&apos;a pas verbalisé.
              </p>
            </Card>
          </Section>

          {/* ─────────────────────── §16 Vignettes ─────────────────────── */}
          <Section
            num="16"
            id="vignettes"
            title="3 cas concrets"
            intro="Trois situations où le diagnostic se joue dans la qualité du repérage et de la première parole."
          >
            <Vignette
              title="La sportive aménorrhéique chez le gynéco"
              context="Marion, 22 ans, vient pour aménorrhée secondaire depuis 14 mois. Coureuse de demi-fond niveau régional, IMC 18.8 (était 21 il y a 2 ans). FSH/LH basses, E2 = 18 pg/mL. Test de grossesse négatif. Aucun signe de SOPK. Demande la pilule pour « ramener les règles avant de penser à un enfant »."
              signaux={[
                "Aménorrhée hypothalamique (FSH/LH effondrées + E2 bas)",
                "Perte de 7 kg progressive sur 2 ans",
                "Sport intensif + entraînement quotidien",
                "Demande de pilule pour masquer le symptôme",
              ]}
              question="Avant de discuter pilule, j'aimerais comprendre comment vous mangez et comment vous vivez votre corps. Est-ce qu'il vous arrive de penser à la nourriture, au poids, plus que ce que vous voudriez ?"
              outcome="Bilan complet (NFS, iono, TSH, T3L, vit D, DXA si > 6 mois aménorrhée). Pas de pilule en première intention. SCOFF-F. Si positif, adressage CSO ou diét TCA + psy. Expliquer que le retour des règles sous pilule n'est pas un retour à la santé."
            />

            <Vignette
              title="L'hypercholestérolémie paradoxale chez le cardio"
              context="Pauline, 29 ans, vient pour bilan cardiovasculaire à la demande de son MG : cholestérol total 3.1 g/L, LDL 2.2 g/L. IMC 16.8. FC 48 bpm. ECG : QTc 460 ms. Antécédent familial : père dyslipidémique. Le cardiologue est tenté de prescrire une statine, mais pousse l'interrogatoire."
              signaux={[
                "Hypercholestérolémie paradoxale chez IMC bas — dénutrition",
                "Bradycardie + QTc allongé chez femme jeune non sportive",
                "Pas de réponse claire sur l'alimentation",
                "Joue avec sa montre, évite le regard à la pesée",
              ]}
              question="Vos valeurs de cholestérol sont surprenantes pour votre profil. Ce qu'on voit chez des personnes très minces, c'est souvent un effet du manque d'apport, pas un excès. Comment se passent vos repas ?"
              outcome="Pas de statine. Bilan complet TCA (NFS, ionogramme, albu/préalbu, TSH, T3L, vit D, ferritine). ECG de suivi mensuel. Adressage CSO. Suivi cardio rapproché jusqu'à renutrition (risque arythmie)."
            />

            <Vignette
              title="L'hypothyroïdie « subclinique » chez l'endocrino"
              context="Léa, 24 ans, étudiante. Adressée par le MG pour TSH à 5.2, T4L normale. Demande : « est-ce que c'est ma thyroïde qui me fatigue ? ». IMC 17.5, FC 50. Pas d'Ac anti-TPO. Cycles irréguliers. Constipation. Frilosité. Le MG voulait introduire du Levothyrox."
              signaux={[
                "TSH limite + T4L normale + Ac anti-TPO négatifs = pas d'auto-immunité",
                "T3L basse (low T3 syndrome adaptatif de la dénutrition)",
                "IMC 17.5 + bradycardie + constipation + frilosité",
                "Plainte « thyroïdienne » mais tableau de dénutrition",
              ]}
              question="Avant de toucher à la thyroïde, j'aimerais qu'on regarde ensemble votre alimentation. Le corps, quand il manque d'énergie, ralentit la thyroïde exprès, pour économiser. Est-ce que vous avez perdu du poids récemment ?"
              outcome="Pas de Levothyrox (aggraverait la perte musculaire). T3L à doser. Bilan dénutrition complet. SCOFF-F. Adressage diététicien TCA + psy. Suivi TSH dans 3 mois après renutrition partielle."
            />
          </Section>

          {/* ── Sources / disclaimer ── */}
          <SubHeading>Sources</SubHeading>
          <ol
            style={{
              paddingLeft: 22,
              lineHeight: 1.7,
              color: COLORS.inkSoft,
              fontSize: 13,
              marginBottom: 32,
            }}
          >
            <li>FFAB — Fédération Française Anorexie Boulimie. Recommandations de bonne pratique pour le repérage.</li>
            <li>HAS. <em>Anorexie mentale : prise en charge.</em> Recommandation de bonne pratique. Juin 2010.</li>
            <li>HAS. <em>Boulimie et hyperphagie boulimique : repérage et éléments généraux de prise en charge.</em> 2019.</li>
            <li>NICE. <em>Eating disorders: recognition and treatment.</em> NG69. 2017 (updated 2020).</li>
            <li>MARSIPAN. <em>Management of Really Sick Patients with Anorexia Nervosa.</em> RC Psychiatrists. 2014.</li>
            <li>Morgan JF, Reid F, Lacey JH. The SCOFF questionnaire. <em>BMJ</em> 1999;319:1467-8.</li>
            <li>Garcia FD et al. Validation of the French version of SCOFF questionnaire. <em>Eur Eat Disord Rev.</em> 2010.</li>
            <li>Mountjoy M et al. IOC consensus statement on Relative Energy Deficiency in Sport (RED-S). <em>Br J Sports Med.</em> 2018.</li>
            <li>Mehler PS, Brown C. Anorexia nervosa — medical complications. <em>J Eat Disord.</em> 2015;3:11.</li>
            <li>APA Practice Guidelines. <em>Treatment of Patients with Eating Disorders.</em> 3rd edition. 2023.</li>
          </ol>

          <div
            style={{
              padding: "20px 22px",
              background: COLORS.card,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 14,
              fontSize: 12.5,
              color: COLORS.muted,
              lineHeight: 1.65,
            }}
          >
            <strong style={{ color: COLORS.ink }}>Fiche professionnelle de repérage.</strong> Ce document est destiné
            aux professionnels de santé. Il ne remplace ni le jugement clinique ni une consultation spécialisée.
            Nami n&apos;est pas un dispositif médical au sens du règlement UE 2017/745 (MDR). Les signaux décrits
            sont des indicateurs cliniques d&apos;orientation, pas des critères diagnostiques. Sources principales :
            FFAB, HAS, NICE, MARSIPAN.
          </div>

          <div className="no-print" style={{ marginTop: 32, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <Link href="/fiche-anorexie-mentale" className="back-link">→ Fiche complète anorexie mentale</Link>
            <a href="#" className="back-link">↑ Haut de page</a>
          </div>
        </article>
      </div>
    </div>
  );
}
