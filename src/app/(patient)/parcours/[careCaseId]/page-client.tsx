"use client";

import Link from "next/link";
import { ApiError } from "@/lib/api";
import { usePatientCareCaseHub } from "@/hooks/usePatientCareCaseHub";
import { useAuthStore } from "@/lib/store";
import { HubHero } from "./_components/HubHero";
import { HubPathwaySection } from "./_components/HubPathwaySection";
import { HubProvidersSection } from "./_components/HubProvidersSection";
import { HubCycleConsultationSection } from "./_components/HubCycleConsultationSection";
import { HubObservationsSection } from "./_components/HubObservationsSection";
import { HubDocumentsSection } from "./_components/HubDocumentsSection";
import { HubMessagesSection } from "./_components/HubMessagesSection";

const PAGE_LAYOUT = {
  maxWidth: 720,
  margin: "0 auto",
  padding: "32px 0 96px",
} as const;

const SECTIONS_LAYOUT = {
  display: "flex",
  flexDirection: "column" as const,
  gap: 24,
};

interface ParcoursHubPageClientProps {
  careCaseId: string;
}

export function ParcoursHubPageClient({
  careCaseId,
}: ParcoursHubPageClientProps) {
  const { data, isLoading, error } = usePatientCareCaseHub(careCaseId);
  const patientId = useAuthStore((s) => s.user?.id);

  if (isLoading) {
    return (
      <main aria-label="Mon parcours de soins" style={PAGE_LAYOUT}>
        <p
          role="status"
          aria-live="polite"
          style={{
            textAlign: "center",
            padding: "48px 0",
            color: "#6B7280",
            fontSize: 14,
          }}
        >
          Chargement de votre parcours…
        </p>
      </main>
    );
  }

  // 404 → CareCase introuvable ou pas le vôtre (anti-énumération backend).
  const status =
    error instanceof ApiError ? error.status : undefined;
  if (status === 404) {
    return (
      <main aria-label="Mon parcours de soins" style={PAGE_LAYOUT}>
        <section
          style={{
            background: "#FFFFFF",
            border: "1px solid rgba(26,26,46,0.06)",
            borderRadius: 16,
            padding: "32px 24px",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#1A1A2E",
              fontFamily: "var(--font-jakarta)",
              marginBottom: 8,
            }}
          >
            Ce parcours n&apos;existe pas
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "#6B7280",
              lineHeight: 1.5,
              marginBottom: 20,
            }}
          >
            Ce parcours n&apos;a pas pu être trouvé. Il a peut-être été clôturé
            ou son lien a changé.
          </p>
          <Link
            href="/parcours"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "10px 20px",
              background: "#5B4EC4",
              color: "#FFFFFF",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "var(--font-jakarta)",
              textDecoration: "none",
            }}
          >
            Revenir à mes parcours
          </Link>
        </section>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main aria-label="Mon parcours de soins" style={PAGE_LAYOUT}>
        <p
          role="alert"
          style={{
            textAlign: "center",
            padding: "48px 0",
            color: "#6B7280",
            fontSize: 14,
          }}
        >
          Impossible de charger votre parcours pour le moment. Réessayez plus
          tard.
        </p>
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Link
            href="/parcours"
            style={{
              fontSize: 13,
              color: "#5B4EC4",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            ← Revenir à mes parcours
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main aria-label="Mon parcours de soins" style={PAGE_LAYOUT}>
      {/* Lien de retour discret */}
      <div style={{ marginBottom: 16 }}>
        <Link
          href="/parcours"
          style={{
            fontSize: 13,
            color: "#6B7280",
            textDecoration: "none",
            fontFamily: "var(--font-inter)",
          }}
        >
          ← Mes parcours
        </Link>
      </div>

      <HubHero careCase={data.careCase} />

      <div style={SECTIONS_LAYOUT}>
        <HubPathwaySection pathway={data.pathway} />
        <HubCycleConsultationSection
          upcoming={data.appointments.upcoming}
          toBook={data.appointments.toBook}
          careCaseId={careCaseId}
          patientId={patientId ?? ""}
        />
        <HubProvidersSection
          providers={data.providers}
          careCaseId={careCaseId}
        />
        <HubObservationsSection observations={data.observations.recent} />
        <HubDocumentsSection
          documents={data.documents.recent}
          careCaseId={careCaseId}
        />
        <HubMessagesSection messages={data.messages} />
      </div>

      {/* Footer MDR obligatoire — Nami n'est pas un dispositif médical */}
      <p
        style={{
          marginTop: 48,
          fontSize: 12,
          color: "#9CA3AF",
          textAlign: "center",
          lineHeight: 1.5,
        }}
      >
        Nami n&apos;est pas un dispositif médical. Les éléments ci-dessus
        reflètent l&apos;organisation de votre dossier de coordination.
      </p>
    </main>
  );
}
