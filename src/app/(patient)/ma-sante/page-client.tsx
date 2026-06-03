"use client";

import { Loader2 } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { usePatientCareCases } from "@/hooks/usePatientCareCases";
import { useMaSante } from "@/hooks/useMaSante";
import { MeteoCard } from "@/components/ma-sante/MeteoCard";
import { EnergieCard } from "@/components/ma-sante/EnergieCard";
import { TendancesCard } from "@/components/ma-sante/TendancesCard";
import { SaisirMesuresCTA } from "@/components/ma-sante/SaisirMesuresCTA";

export function MaSantePageClient() {
  const careCasesQuery = usePatientCareCases();
  const activeCareCase = careCasesQuery.data?.find((cc) => cc.status === "ACTIVE");

  const maSanteQuery = useMaSante(activeCareCase?.id);

  if (careCasesQuery.isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "60vh",
        }}
      >
        <Loader2 size={24} className="animate-spin" style={{ color: "var(--nami-primary)" }} />
      </div>
    );
  }

  return (
    <main
      aria-label="Ma santé"
      style={{
        padding: "36px 28px 96px",
        maxWidth: 680,
        margin: "0 auto",
        background: "var(--nami-bg)",
        minHeight: "100vh",
      }}
    >
      <ScrollReveal variant="fade-up" delay={0} duration={0.6}>
        <div style={{ marginBottom: 28 }}>
          <h1
            style={{
              fontSize: 30,
              fontWeight: 800,
              color: "var(--nami-dark)",
              letterSpacing: "-0.04em",
              fontFamily: "var(--font-jakarta)",
            }}
          >
            Ma santé
          </h1>
          <p style={{ fontSize: 15, color: "var(--nami-text-muted)", marginTop: 6 }}>
            Comment vous vous sentez, jour après jour.
          </p>
        </div>
      </ScrollReveal>

      {!activeCareCase ? (
        <ScrollReveal variant="fade-up" delay={0.04} duration={0.6}>
          <div
            style={{
              background: "var(--nami-card)",
              borderRadius: 20,
              border: "1px solid var(--nami-border)",
              padding: "28px 24px",
              textAlign: "center",
              boxShadow: "0 1px 3px rgba(26,26,46,0.05)",
            }}
          >
            <div style={{ fontSize: 15, color: "var(--nami-dark)", fontWeight: 600 }}>
              Aucun parcours en cours
            </div>
            <p style={{ fontSize: 13, color: "var(--nami-text-muted)", marginTop: 6 }}>
              Cet espace se remplira dès qu&apos;un soignant aura ouvert un parcours pour vous.
            </p>
          </div>
        </ScrollReveal>
      ) : maSanteQuery.isLoading ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px 0",
          }}
        >
          <Loader2 size={20} className="animate-spin" style={{ color: "var(--nami-primary)" }} />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <ScrollReveal variant="fade-up" delay={0.06} duration={0.6}>
            <MeteoCard mood={maSanteQuery.data?.latestMood ?? null} />
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={0.10} duration={0.6}>
            <EnergieCard
              latestEnergy={maSanteQuery.data?.latestEnergy ?? null}
              averageEnergy7d={maSanteQuery.data?.averageEnergy7d ?? null}
              energyPoints7d={maSanteQuery.data?.energyPoints7d ?? []}
            />
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={0.14} duration={0.6}>
            <TendancesCard
              entriesCount7d={maSanteQuery.data?.entriesCount7d ?? 0}
              entriesCountPrev7d={maSanteQuery.data?.entriesCountPrev7d ?? 0}
            />
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={0.18} duration={0.6}>
            <SaisirMesuresCTA />
          </ScrollReveal>
        </div>
      )}

      <p
        style={{
          fontSize: 12,
          color: "var(--nami-text-muted)",
          textAlign: "center",
          marginTop: 32,
          lineHeight: 1.5,
        }}
      >
        Nami n&apos;est pas un dispositif médical. Ces informations vous appartiennent
        et restent confidentielles.
      </p>
    </main>
  );
}
