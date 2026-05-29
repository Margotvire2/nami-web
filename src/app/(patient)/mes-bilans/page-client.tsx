"use client";

import Link from "next/link";
import { Loader2, Plus } from "lucide-react";
import { usePatientBilans } from "@/hooks/usePatientBilans";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { BilanCard } from "./_components/BilanCard";
import { BilanEmptyState } from "./_components/BilanEmptyState";
import { MdrDisclaimer } from "./_components/MdrDisclaimer";

const C = {
  bg: "#FAFAF8",
  text: "#1A1A2E",
  textSoft: "#6B7280",
  primary: "#5B4EC4",
};

export function MesBilansClient() {
  const { data: bilans = [], isLoading } = usePatientBilans();

  return (
    <main
      aria-label="Mes bilans"
      style={{
        padding: "28px 0 80px",
        maxWidth: 720,
        margin: "0 auto",
        background: C.bg,
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: C.text,
              letterSpacing: "-0.4px",
            }}
          >
            Mes bilans
          </h1>
          <p style={{ fontSize: 13, color: C.textSoft, marginTop: 4 }}>
            Vos bilans biologiques, conservés et partagés avec vos soignants.
          </p>
        </div>

        {bilans.length > 0 ? (
          <Link
            href="/mes-bilans/upload"
            aria-label="Ajouter un bilan"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 14px",
              borderRadius: 10,
              background: C.primary,
              color: "#FFFFFF",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            <Plus size={16} strokeWidth={2.2} aria-hidden="true" />
            Ajouter
          </Link>
        ) : null}
      </div>

      {isLoading ? (
        <div
          role="status"
          aria-live="polite"
          aria-label="Chargement de vos bilans"
          style={{ display: "flex", justifyContent: "center", padding: 40 }}
        >
          <Loader2
            size={22}
            className="animate-spin"
            style={{ color: C.primary }}
            aria-hidden="true"
          />
        </div>
      ) : bilans.length === 0 ? (
        <BilanEmptyState />
      ) : (
        <>
          <p aria-live="polite" aria-atomic="true" className="sr-only">
            {bilans.length} bilan{bilans.length !== 1 ? "s" : ""} affiché
            {bilans.length !== 1 ? "s" : ""}.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {bilans.map((bilan, idx) => (
              <ScrollReveal
                key={bilan.id}
                variant="fade-up"
                delay={idx * 0.05}
                duration={0.45}
              >
                <BilanCard bilan={bilan} />
              </ScrollReveal>
            ))}
          </div>
          <MdrDisclaimer />
        </>
      )}
    </main>
  );
}
