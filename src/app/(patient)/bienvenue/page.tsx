"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Loader2, Search, Stethoscope, Sparkles } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { usePatientCareCases } from "@/hooks/usePatientCareCases";

/**
 * Page /bienvenue — accueil patient post-signup contextualisé.
 *
 * Friction audit 31/05 (#5) : patient sans soignant a un chemin clair vers
 * /trouver-un-soignant ; patient avec N parcours peut sauter directement
 * vers son hub /accueil ou un parcours précis.
 *
 * Branche contextuelle (usePatientCareCases) :
 *  - 0 CareCase : guide d'onboarding "Trouvez un soignant → RDV → parcours créé"
 *  - N CareCase : CTA hub /accueil + liste compact des parcours actifs
 *
 * Wording strict MDR-safe : voir lexique CLAUDE.md (mots cliniques interdits).
 * Composants existants /aide non touchés.
 *
 * Cohérence palette : voir CLAUDE.md (#5B4EC4 violet, #FAFAF8 fond, #1A1A2E dark).
 */

const C = {
  primary: "#5B4EC4",
  primaryDeep: "#4A3FA6",
  primaryLight: "rgba(91,78,196,0.08)",
  primaryBorder: "rgba(91,78,196,0.18)",
  teal: "#2BA89C",
  dark: "#1A1A2E",
  text: "#374151",
  muted: "#6B7280",
  border: "rgba(26,26,46,0.06)",
  card: "#FFFFFF",
  bg: "#FAFAF8",
};

export default function BienvenuePage() {
  const user = useAuthStore((s) => s.user);
  const firstName = user?.firstName ?? "";

  const careCasesQuery = usePatientCareCases();
  const isLoading = careCasesQuery.isLoading;
  const careCases = careCasesQuery.data ?? [];
  const hasCareCases = careCases.length > 0;

  return (
    <main
      style={{
        padding: "36px 24px 96px",
        maxWidth: 720,
        margin: "0 auto",
        minHeight: "100vh",
        background: C.bg,
        fontFamily: "var(--font-jakarta)",
      }}
      aria-label="Bienvenue dans votre espace patient"
    >
      {/* Hero — mascotte + titre */}
      <header style={{ marginBottom: 40, textAlign: "center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 96,
            height: 96,
            marginBottom: 16,
          }}
          aria-hidden="true"
        >
          <Image
            src="/nami-mascot.png"
            alt=""
            width={96}
            height={96}
            priority
            style={{ objectFit: "contain" }}
          />
        </div>

        <h1
          style={{
            fontSize: 32,
            fontWeight: 800,
            color: C.dark,
            letterSpacing: "-0.04em",
            margin: "0 0 12px 0",
            lineHeight: 1.15,
          }}
        >
          {firstName ? `Bienvenue sur Nami, ${firstName}` : "Bienvenue sur Nami"}
        </h1>

        <p
          style={{
            fontSize: 16,
            color: C.muted,
            lineHeight: 1.6,
            maxWidth: 480,
            margin: "0 auto",
          }}
        >
          Nami est l&apos;espace qui vous aide à coordonner votre santé avec
          votre équipe soignante.
        </p>
      </header>

      {/* Branche contextuelle 0 / N CareCases */}
      {isLoading ? (
        <div
          role="status"
          aria-live="polite"
          style={{ display: "flex", justifyContent: "center", padding: 40 }}
        >
          <Loader2
            size={28}
            strokeWidth={1.8}
            style={{ color: C.primary, animation: "spin 1s linear infinite" }}
            aria-hidden="true"
          />
          <span className="sr-only">Chargement de vos parcours…</span>
        </div>
      ) : hasCareCases ? (
        <ExistingPatientBranch
          careCases={careCases.map((cc) => ({
            id: cc.id,
            title: cc.caseTitle,
            organizationName: cc.organizationName,
          }))}
        />
      ) : (
        <NewPatientBranch />
      )}

      {/* Hint card commun */}
      <aside
        style={{
          marginTop: 40,
          padding: "16px 20px",
          borderRadius: 14,
          background: C.primaryLight,
          border: `1px solid ${C.primaryBorder}`,
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
        }}
        aria-label="Information complémentaire"
      >
        <Sparkles
          size={18}
          strokeWidth={1.8}
          style={{ color: C.primary, flexShrink: 0, marginTop: 2 }}
          aria-hidden="true"
        />
        <div>
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: C.dark,
              margin: "0 0 4px 0",
            }}
          >
            Votre équipe soignante reste votre interlocuteur
          </p>
          <p
            style={{
              fontSize: 13,
              color: C.text,
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            Nami est un outil de coordination — votre médecin et vos soignants
            restent vos interlocuteurs pour toute question médicale. Besoin
            d&apos;aide ?{" "}
            <Link
              href="/aide"
              style={{
                color: C.primary,
                fontWeight: 600,
                textDecoration: "underline",
                textUnderlineOffset: 3,
              }}
            >
              Consultez l&apos;aide
            </Link>
            .
          </p>
        </div>
      </aside>

      {/* keyframes spin (inline pour éviter dépendance globale) */}
      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </main>
  );
}

/* ─────────────────────────── 0 CareCase ─────────────────────────── */

function NewPatientBranch() {
  return (
    <section aria-label="Démarrez votre suivi sur Nami">
      {/* Card primary CTA */}
      <div
        style={{
          background: C.card,
          border: `1px solid ${C.primaryBorder}`,
          borderRadius: 20,
          padding: 24,
          marginBottom: 24,
          boxShadow: "0 1px 3px rgba(26,26,46,0.05)",
        }}
      >
        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: C.dark,
            margin: "0 0 8px 0",
            letterSpacing: "-0.02em",
          }}
        >
          Démarrez votre suivi
        </h2>
        <p
          style={{
            fontSize: 14,
            color: C.muted,
            lineHeight: 1.55,
            margin: "0 0 20px 0",
          }}
        >
          Pour utiliser pleinement Nami, vous avez besoin d&apos;être suivi(e)
          par un soignant inscrit sur la plateforme. Trouvez un professionnel
          près de chez vous et prenez rendez-vous en quelques clics.
        </p>

        <Link
          href="/trouver-un-soignant"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 24px",
            borderRadius: 100,
            background: C.primary,
            color: "#fff",
            fontSize: 15,
            fontWeight: 600,
            textDecoration: "none",
            boxShadow: "0 2px 8px rgba(91,78,196,0.25)",
            transition: "opacity 0.2s",
          }}
          className="hover:opacity-90"
        >
          <Search size={16} strokeWidth={2} aria-hidden="true" />
          Trouver un soignant
        </Link>
      </div>

      {/* 3 étapes visuelles */}
      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 20,
          padding: 24,
          marginBottom: 24,
          boxShadow: "0 1px 3px rgba(26,26,46,0.05)",
        }}
        aria-label="Comment ça marche en 3 étapes"
      >
        <h3
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: C.muted,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            margin: "0 0 20px 0",
          }}
        >
          Comment ça marche
        </h3>

        <ol
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <Step
            number={1}
            title="Trouvez un soignant"
            description="Cherchez par spécialité ou par ville parmi les professionnels Nami."
            isLast={false}
          />
          <Step
            number={2}
            title="Prenez rendez-vous"
            description="Choisissez un créneau disponible directement depuis la fiche soignant."
            isLast={false}
          />
          <Step
            number={3}
            title="Votre soignant créera votre parcours"
            description="Une fois rencontré, votre soignant crée votre parcours et votre espace s'enrichit."
            isLast
          />
        </ol>
      </div>
    </section>
  );
}

function Step({
  number,
  title,
  description,
  isLast,
}: {
  number: number;
  title: string;
  description: string;
  isLast: boolean;
}) {
  return (
    <li style={{ display: "flex", gap: 16, position: "relative" }}>
      {/* Number bubble */}
      <div
        style={{
          flexShrink: 0,
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: C.primaryLight,
          color: C.primary,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          fontWeight: 800,
          letterSpacing: "-0.02em",
          position: "relative",
          zIndex: 1,
        }}
        aria-hidden="true"
      >
        {number}
      </div>

      {/* Pointillé vertical sauf dernier */}
      {!isLast && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 17,
            top: 40,
            bottom: -16,
            width: 2,
            borderLeft: `2px dashed ${C.primaryBorder}`,
          }}
        />
      )}

      <div style={{ flex: 1, paddingTop: 4 }}>
        <p
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: C.dark,
            margin: "0 0 4px 0",
          }}
        >
          {title}
        </p>
        <p
          style={{
            fontSize: 13,
            color: C.muted,
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          {description}
        </p>
      </div>
    </li>
  );
}

/* ─────────────────────────── N CareCases ─────────────────────────── */

function ExistingPatientBranch({
  careCases,
}: {
  careCases: Array<{
    id: string;
    title: string;
    organizationName: string | null;
  }>;
}) {
  const count = careCases.length;
  const plural = count > 1;

  return (
    <section aria-label="Vos parcours en cours">
      {/* Card primary CTA */}
      <div
        style={{
          background: C.card,
          border: `1px solid ${C.primaryBorder}`,
          borderRadius: 20,
          padding: 24,
          marginBottom: 24,
          boxShadow: "0 1px 3px rgba(26,26,46,0.05)",
        }}
      >
        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: C.dark,
            margin: "0 0 8px 0",
            letterSpacing: "-0.02em",
          }}
        >
          Reprenez où vous en êtes
        </h2>
        <p
          style={{
            fontSize: 14,
            color: C.muted,
            lineHeight: 1.55,
            margin: "0 0 20px 0",
          }}
        >
          {plural
            ? `Vous avez ${count} parcours actifs avec votre équipe soignante. Retrouvez vos rendez-vous, messages et documents depuis votre accueil.`
            : "Vous avez un parcours actif avec votre équipe soignante. Retrouvez vos rendez-vous, messages et documents depuis votre accueil."}
        </p>

        <Link
          href="/accueil"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 24px",
            borderRadius: 100,
            background: C.primary,
            color: "#fff",
            fontSize: 15,
            fontWeight: 600,
            textDecoration: "none",
            boxShadow: "0 2px 8px rgba(91,78,196,0.25)",
            transition: "opacity 0.2s",
          }}
          className="hover:opacity-90"
        >
          Mon accueil
          <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
        </Link>
      </div>

      {/* Liste compact CareCases */}
      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 20,
          padding: 24,
          marginBottom: 24,
          boxShadow: "0 1px 3px rgba(26,26,46,0.05)",
        }}
        aria-label="Liste de vos parcours"
      >
        <h3
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: C.muted,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            margin: "0 0 16px 0",
          }}
        >
          {plural ? "Vos parcours" : "Votre parcours"}
        </h3>

        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {careCases.map((cc) => (
            <li key={cc.id}>
              <Link
                href={`/parcours/${cc.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: `1px solid ${C.border}`,
                  background: "#fff",
                  textDecoration: "none",
                  transition: "background 0.15s ease, border-color 0.15s ease",
                }}
                className="hover:bg-[rgba(91,78,196,0.04)] hover:border-[rgba(91,78,196,0.2)]"
              >
                <div
                  style={{
                    flexShrink: 0,
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: C.primaryLight,
                    color: C.primary,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  aria-hidden="true"
                >
                  <Stethoscope size={18} strokeWidth={1.8} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: C.dark,
                      margin: "0 0 2px 0",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {cc.title}
                  </p>
                  {cc.organizationName ? (
                    <p
                      style={{
                        fontSize: 12,
                        color: C.muted,
                        margin: 0,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {cc.organizationName}
                    </p>
                  ) : null}
                </div>
                <ArrowRight
                  size={16}
                  strokeWidth={2}
                  style={{ color: C.muted, flexShrink: 0 }}
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
