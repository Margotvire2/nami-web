import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Coordination soins pluridisciplinaire — CPTS, MSP, hôpital | Nami",
  description:
    "CPTS, MSP, réseau, fédération, hôpital ou clinique : pilotez la coordination de vos équipes et structurez les parcours de soins. Dossier partagé, base documentaire HAS, adressage sécurisé.",
  keywords: [
    "coordination soins CPTS",
    "logiciel coordination MSP",
    "coordination pluridisciplinaire hôpital",
    "outil coordination réseau santé",
    "dossier partagé équipe soignante",
    "parcours soins structuré",
    "coordination ville hôpital",
    "outil CPTS",
  ],
  alternates: { canonical: "/pour-les-structures" },
  openGraph: {
    title: "Nami pour les structures de santé — Coordination pluridisciplinaire",
    description:
      "Pilotez la coordination de vos équipes et structurez les parcours de soins. CPTS, MSP, réseaux, hôpitaux. Validation manuelle par l'équipe en 24-48h.",
    url: "https://namipourlavie.com/pour-les-structures",
    type: "website",
    siteName: "Nami",
    locale: "fr_FR",
    images: [
      {
        url: "/og-image-structures.svg",
        width: 1200,
        height: 630,
        alt: "Nami — Pour les structures de santé",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nami pour les structures de santé — Coordination pluridisciplinaire",
    description:
      "Pilotez la coordination de vos équipes : CPTS, MSP, réseaux, hôpitaux. Dossier partagé, base HAS, adressage sécurisé.",
    images: ["/og-image-structures.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

const TARGET_ORGS: ReadonlyArray<{ label: string; description: string }> = [
  {
    label: "CPTS",
    description:
      "Coordonnez les parcours complexes de votre territoire entre ville et hôpital.",
  },
  {
    label: "MSP",
    description:
      "Centralisez les dossiers de coordination pluridisciplinaire de votre maison de santé.",
  },
  {
    label: "Réseaux de santé",
    description:
      "Suivez les patients orientés par votre réseau ville-hôpital sur un dossier partagé.",
  },
  {
    label: "Fédérations",
    description:
      "Donnez à vos structures membres un outil commun de coordination, sans imposer de SI lourd.",
  },
  {
    label: "Hôpitaux & cliniques",
    description:
      "Préparez la sortie d'hospitalisation et le suivi ville en associant les soignants de proximité.",
  },
];

const BENEFITS: ReadonlyArray<{ title: string; body: string }> = [
  {
    title: "Un espace dédié à votre structure",
    body: "Dossier de coordination partagé, organisation des passages de relais, base documentaire de votre équipe.",
  },
  {
    title: "Vos membres en quelques clics",
    body: "Invitez vos soignants, désignez vos coordinateurs, gérez les accès depuis une console claire.",
  },
  {
    title: "Aucun engagement, déploiement progressif",
    body: "Commencez avec une équipe pilote, ouvrez aux autres soignants quand vous êtes prêts.",
  },
];

const STEPS: ReadonlyArray<{ n: number; title: string; body: string }> = [
  {
    n: 1,
    title: "Vous décrivez votre structure",
    body: "5 minutes pour renseigner identité légale (SIRET / FINESS) et coordonnées du référent.",
  },
  {
    n: 2,
    title: "L'équipe Nami examine la demande",
    body: "Vérification réglementaire et appel rapide pour cadrer votre cas d'usage. Réponse sous 24 à 48h.",
  },
  {
    n: 3,
    title: "Vous activez votre espace",
    body: "Votre référent reçoit l'accès admin et invite les premiers soignants membres.",
  },
];

const sectionWrap: React.CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto",
  padding: "0 24px",
};

export default function PourLesStructuresPage() {
  return (
    <main
      style={{
        fontFamily: "var(--font-jakarta), system-ui, sans-serif",
        background: "#FAFAF8",
        color: "#1A1A2E",
      }}
    >
      {/* ─── HERO ───────────────────────────────────────────────────── */}
      <section
        style={{
          padding: "120px 24px 80px",
          background:
            "linear-gradient(180deg, #FFFFFF 0%, #FAFAF8 100%)",
          borderBottom: "1px solid rgba(26,26,46,0.04)",
        }}
      >
        <div style={{ ...sectionWrap, textAlign: "center" }}>
          <span
            style={{
              display: "inline-block",
              padding: "6px 14px",
              borderRadius: 999,
              background: "#F2F0FB",
              color: "#5B4EC4",
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 24,
            }}
          >
            Inscription des structures de santé
          </span>
          <h1
            style={{
              fontSize: "clamp(2.5rem, 6vw, 4rem)",
              lineHeight: 1.05,
              marginBottom: 20,
              letterSpacing: "-0.02em",
              fontWeight: 700,
            }}
          >
            Coordonnez votre structure
            <br />
            <span
              style={{
                background:
                  "linear-gradient(135deg, #5B4EC4, #2BA89C)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              avec Nami
            </span>
          </h1>
          <p
            style={{
              fontSize: 19,
              lineHeight: 1.55,
              color: "#374151",
              maxWidth: 720,
              margin: "0 auto 36px",
            }}
          >
            CPTS, MSP, réseaux, fédérations, hôpitaux : pilotez la coordination de vos équipes
            et structurez les parcours de soins. Validation manuelle par
            l&apos;équipe en 24 à 48 heures.
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/pour-structures/inscription"
              style={{
                padding: "14px 28px",
                borderRadius: 999,
                background:
                  "linear-gradient(135deg, #5B4EC4, #2BA89C)",
                color: "#FFFFFF",
                fontWeight: 600,
                fontSize: 15,
                textDecoration: "none",
                boxShadow: "0 10px 28px rgba(91,78,196,0.28)",
              }}
            >
              Inscrire ma structure
            </Link>
            <Link
              href="/demander-une-demo"
              style={{
                padding: "14px 28px",
                borderRadius: 999,
                border: "1px solid rgba(26,26,46,0.12)",
                background: "#FFFFFF",
                color: "#1A1A2E",
                fontWeight: 600,
                fontSize: 15,
                textDecoration: "none",
              }}
            >
              Parler à l&apos;équipe Nami
            </Link>
          </div>
        </div>
      </section>

      {/* ─── POUR QUI ────────────────────────────────────────────────── */}
      <section style={{ padding: "80px 24px" }}>
        <div style={sectionWrap}>
          <h2
            style={{
              fontSize: "clamp(1.75rem, 3vw, 2.25rem)",
              marginBottom: 8,
              fontWeight: 700,
            }}
          >
            Pour qui&nbsp;?
          </h2>
          <p style={{ color: "#6B7280", marginBottom: 36, fontSize: 16 }}>
            Nami s&apos;adresse aux structures qui orchestrent des parcours
            pluridisciplinaires entre plusieurs soignants.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(240px, 1fr))",
              gap: 16,
            }}
          >
            {TARGET_ORGS.map((o) => (
              <div
                key={o.label}
                style={{
                  padding: 20,
                  borderRadius: 14,
                  background: "#FFFFFF",
                  border: "1px solid rgba(26,26,46,0.06)",
                }}
              >
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                >
                  {o.label}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: "#374151",
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  {o.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CE QUE VOUS OBTENEZ ───────────────────────────────────── */}
      <section
        style={{
          padding: "80px 24px",
          background: "#FFFFFF",
          borderTop: "1px solid rgba(26,26,46,0.04)",
          borderBottom: "1px solid rgba(26,26,46,0.04)",
        }}
      >
        <div style={sectionWrap}>
          <h2
            style={{
              fontSize: "clamp(1.75rem, 3vw, 2.25rem)",
              marginBottom: 36,
              fontWeight: 700,
            }}
          >
            Ce que vous obtenez
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 20,
            }}
          >
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                style={{
                  padding: 24,
                  borderRadius: 14,
                  background: "#FAFAF8",
                  border: "1px solid rgba(26,26,46,0.06)",
                }}
              >
                <h3
                  style={{
                    fontSize: 17,
                    fontWeight: 600,
                    marginBottom: 10,
                  }}
                >
                  {b.title}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: "#374151",
                    lineHeight: 1.55,
                    margin: 0,
                  }}
                >
                  {b.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMMENT ÇA MARCHE ──────────────────────────────────────── */}
      <section style={{ padding: "80px 24px" }}>
        <div style={sectionWrap}>
          <h2
            style={{
              fontSize: "clamp(1.75rem, 3vw, 2.25rem)",
              marginBottom: 36,
              fontWeight: 700,
            }}
          >
            Comment ça marche&nbsp;?
          </h2>
          <ol
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "grid",
              gap: 16,
            }}
          >
            {STEPS.map((s) => (
              <li
                key={s.n}
                style={{
                  display: "grid",
                  gridTemplateColumns: "48px 1fr",
                  gap: 16,
                  padding: 20,
                  borderRadius: 14,
                  background: "#FFFFFF",
                  border: "1px solid rgba(26,26,46,0.06)",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 999,
                    background:
                      "linear-gradient(135deg, #5B4EC4, #2BA89C)",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 16,
                  }}
                >
                  {s.n}
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: 17,
                      fontWeight: 600,
                      marginBottom: 4,
                    }}
                  >
                    {s.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 14,
                      color: "#374151",
                      lineHeight: 1.55,
                      margin: 0,
                    }}
                  >
                    {s.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <div style={{ marginTop: 32, textAlign: "center" }}>
            <Link
              href="/pour-structures/inscription"
              style={{
                padding: "14px 28px",
                borderRadius: 999,
                background:
                  "linear-gradient(135deg, #5B4EC4, #2BA89C)",
                color: "#FFFFFF",
                fontWeight: 600,
                fontSize: 15,
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Démarrer l&apos;inscription
            </Link>
            <p
              style={{
                fontSize: 12,
                color: "#6B7280",
                marginTop: 12,
              }}
            >
              Nami n&apos;est pas un dispositif médical. Aucune donnée
              clinique de patient n&apos;est requise pour cette demande.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
