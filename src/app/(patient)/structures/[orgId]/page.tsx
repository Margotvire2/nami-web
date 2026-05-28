"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, type PatientCareCaseOrganization } from "@/lib/api";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

interface StructurePageProps {
  params: Promise<{ orgId: string }>;
}

function isWebsiteString(value: unknown): value is string {
  return typeof value === "string" && /^https?:\/\//i.test(value);
}

function getWebsite(meta: PatientCareCaseOrganization["publicMetadata"]): string | null {
  if (!meta) return null;
  const candidate = (meta as Record<string, unknown>).website;
  return isWebsiteString(candidate) ? candidate : null;
}

const KIND_LABEL_FR: Partial<Record<PatientCareCaseOrganization["type"], string>> = {
  NETWORK: "Réseau de soins",
  FEDERATION: "Fédération",
  CPTS: "Communauté Professionnelle Territoriale de Santé (CPTS)",
  MSP: "Maison de Santé Pluriprofessionnelle",
  HOSPITAL: "Hôpital",
  HOSPITAL_SERVICE: "Service hospitalier",
  CLINIC: "Clinique",
  HEALTH_CENTER: "Centre de santé",
  PRIVATE_PRACTICE: "Cabinet libéral",
  ASSOCIATION: "Association",
  PROFESSIONAL_GROUP: "Groupement professionnel",
  INTERNAL: "Structure interne",
  INSTITUTIONNEL: "Acteur institutionnel",
  ACCELERATEUR: "Accélérateur",
};

export default function StructureDetailPage({ params }: StructurePageProps) {
  const { orgId } = use(params);
  const accessToken = useAuthStore((s) => s.accessToken);
  const api = apiWithToken(accessToken!);

  const { data: me, isLoading } = useQuery({
    queryKey: ["patient-me"],
    queryFn: () => api.patient.me(),
    enabled: !!accessToken,
  });

  if (isLoading) {
    return (
      <main
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          background: "var(--nami-bg)",
        }}
      >
        <Loader2 size={24} className="animate-spin" style={{ color: "var(--nami-primary)" }} />
      </main>
    );
  }

  // Vérification d'accès : le patient doit avoir un CareCase pointant vers cette org.
  // On ne montre la fiche que si l'organisation est rattachée à un de ses parcours.
  const matchedCareCase = me?.careCases.find((cc) => cc.organization?.id === orgId);
  const organization = matchedCareCase?.organization ?? null;

  if (!organization) {
    return (
      <main
        aria-label="Structure introuvable"
        style={{
          padding: "36px 28px 96px",
          maxWidth: 680,
          margin: "0 auto",
          background: "var(--nami-bg)",
          minHeight: "100vh",
        }}
      >
        <Link
          href="/accueil"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            color: "var(--nami-text-muted)",
            textDecoration: "none",
            marginBottom: 24,
          }}
        >
          <ArrowLeft size={14} /> Retour à l&apos;accueil
        </Link>
        <div
          style={{
            padding: "32px 24px",
            borderRadius: 16,
            background: "var(--nami-card)",
            border: "1px solid var(--nami-border)",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "var(--nami-dark)",
              margin: 0,
              marginBottom: 8,
            }}
          >
            Structure introuvable
          </h1>
          <p style={{ fontSize: 14, color: "var(--nami-text-muted)", margin: 0 }}>
            Cette structure n&apos;est pas associée à votre parcours.
          </p>
        </div>
      </main>
    );
  }

  const website = getWebsite(organization.publicMetadata);
  const kindLabel = KIND_LABEL_FR[organization.type] ?? "Structure";

  return (
    <main
      aria-label={`Structure de coordination ${organization.name}`}
      style={{
        padding: "36px 28px 96px",
        maxWidth: 680,
        margin: "0 auto",
        background: "var(--nami-bg)",
        minHeight: "100vh",
      }}
    >
      <Link
        href="/accueil"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 13,
          color: "var(--nami-text-muted)",
          textDecoration: "none",
          marginBottom: 20,
        }}
      >
        <ArrowLeft size={14} /> Retour à l&apos;accueil
      </Link>

      <ScrollReveal variant="fade-up" delay={0} duration={0.6}>
        <header
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 18,
            marginBottom: 28,
          }}
        >
          {organization.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={organization.logoUrl}
              alt=""
              style={{
                width: 64,
                height: 64,
                borderRadius: 14,
                objectFit: "cover",
                border: "1px solid var(--nami-border)",
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              aria-hidden="true"
              style={{
                width: 64,
                height: 64,
                borderRadius: 14,
                background:
                  "linear-gradient(135deg, rgba(91,78,196,0.18), rgba(43,168,156,0.18))",
                flexShrink: 0,
              }}
            />
          )}
          <div style={{ minWidth: 0 }}>
            <span
              style={{
                display: "inline-block",
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                color: "var(--nami-primary)",
                marginBottom: 6,
              }}
            >
              {kindLabel}
            </span>
            <h1
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: "var(--nami-dark)",
                margin: 0,
                letterSpacing: "-0.02em",
                fontFamily: "var(--font-jakarta)",
              }}
            >
              {organization.name}
            </h1>
          </div>
        </header>
      </ScrollReveal>

      {organization.missionStatement && (
        <ScrollReveal variant="fade-up" delay={0.08} duration={0.6}>
          <section
            style={{
              marginBottom: 20,
              padding: "20px 22px",
              borderRadius: 16,
              background: "var(--nami-card)",
              border: "1px solid var(--nami-border)",
              boxShadow: "0 1px 3px rgba(26,26,46,0.05)",
            }}
          >
            <h2
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--nami-dark)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                margin: 0,
                marginBottom: 10,
              }}
            >
              Mission
            </h2>
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.6,
                color: "var(--nami-text)",
                margin: 0,
                whiteSpace: "pre-line",
              }}
            >
              {organization.missionStatement}
            </p>
          </section>
        </ScrollReveal>
      )}

      {website && (
        <ScrollReveal variant="fade-up" delay={0.12} duration={0.6}>
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 16px",
              borderRadius: 10,
              background: "var(--nami-primary)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 2px 8px rgba(91,78,196,0.25)",
            }}
          >
            Site officiel
            <ExternalLink size={14} />
          </a>
        </ScrollReveal>
      )}
    </main>
  );
}
