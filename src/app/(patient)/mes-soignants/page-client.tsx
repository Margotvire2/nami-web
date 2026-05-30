"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { usePatientCareCases } from "@/hooks/usePatientCareCases";
import { usePatientCareTeamByCareCases } from "@/hooks/usePatientCareTeamByCareCases";
import { useRevokePatientCareTeamMember } from "@/hooks/useRevokePatientCareTeamMember";
import { MesSoignantsHero } from "./MesSoignantsHero";
import { MesSoignantsEmptyState } from "./MesSoignantsEmptyState";
import { CareCaseSection } from "./CareCaseSection";
import { RevokeAccessModal } from "./RevokeAccessModal";
import { toAuthorizedProvider } from "./types";
import type { AuthorizedProvider } from "./mock-data";

/**
 * Orchestrateur /mes-soignants — V2 (CC #SOIGNANTS-V2 PHASE 2).
 *
 * Branchement API réelle :
 *   1. GET /patient/care-cases             → liste des parcours ACTIVE
 *   2. N × GET /patient/care-team?careCaseId= en parallèle (useQueries)
 *   3. DELETE /patient/care-team/:providerId pour la révocation
 *
 * Grouping multi-parcours : règle métier 30/05 — un patient peut avoir N
 * CareCases, chacun avec sa propre care team. On affiche une section par
 * parcours plutôt qu'une liste plate dédupliquée (qui ferait perdre l'info
 * d'appartenance). La révocation est globale par soignant (cf. CC #91).
 *
 * Le compteur du Hero affiche le total dédupliqué (un soignant présent dans
 * 2 parcours n'est compté qu'une fois — wording "X soignant a accès").
 */
export function MesSoignantsPageClient() {
  const user = useAuthStore((s) => s.user);
  const [revokeTarget, setRevokeTarget] = useState<AuthorizedProvider | null>(
    null,
  );

  const careCasesQuery = usePatientCareCases();
  const careCaseIds = useMemo(
    () => (careCasesQuery.data ?? []).map((c) => c.id),
    [careCasesQuery.data],
  );
  const careTeamQueries = usePatientCareTeamByCareCases(careCaseIds);
  const revokeMutation = useRevokePatientCareTeamMember();

  if (!user) {
    return null;
  }

  // Total dédupliqué (un soignant présent dans 2 parcours = 1 seul comptage)
  const uniqueProviderIds = new Set<string>();
  for (const q of careTeamQueries) {
    for (const p of q.data ?? []) {
      uniqueProviderIds.add(p.id);
    }
  }
  const uniqueCount = uniqueProviderIds.size;

  function handleRevokeRequest(provider: AuthorizedProvider) {
    setRevokeTarget(provider);
  }

  async function handleRevokeConfirmed(provider: AuthorizedProvider) {
    try {
      await revokeMutation.mutateAsync({ providerId: provider.id });
    } catch (err) {
      // Erreur loguée — l'UI reste sur la modal pour permettre un retry,
      // mais le modal a déjà rendu confirming=false dans son finally.
      console.error("[mes-soignants] revoke failed", err);
      return;
    }
    setRevokeTarget(null);
  }

  // ─── État global : chargement parcours en cours ────────────────────────
  if (careCasesQuery.isPending) {
    return (
      <div className="max-w-3xl mx-auto py-8 md:py-12 space-y-8">
        <MesSoignantsHero count={0} />
        <div
          role="status"
          aria-live="polite"
          className="flex items-center justify-center gap-2 text-sm text-[#6B7280] py-12"
        >
          <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" strokeWidth={2} />
          Chargement de vos parcours…
        </div>
      </div>
    );
  }

  // ─── Erreur globale parcours ───────────────────────────────────────────
  if (careCasesQuery.isError) {
    return (
      <div className="max-w-3xl mx-auto py-8 md:py-12 space-y-8">
        <MesSoignantsHero count={0} />
        <p
          role="alert"
          className="text-sm text-[#DC2626] bg-[rgba(220,38,38,0.05)] border border-[rgba(220,38,38,0.18)] rounded-xl p-4"
        >
          Impossible de charger vos parcours de soins pour le moment. Réessayez
          dans un instant.
        </p>
      </div>
    );
  }

  const careCases = careCasesQuery.data ?? [];

  return (
    <div className="max-w-3xl mx-auto py-8 md:py-12 space-y-8">
      <MesSoignantsHero count={uniqueCount} />

      {careCases.length === 0 ? (
        <MesSoignantsEmptyState />
      ) : (
        <div className="space-y-10">
          {careCases.map((careCase, idx) => {
            const teamQuery = careTeamQueries[idx];
            const providers = (teamQuery?.data ?? []).map(toAuthorizedProvider);
            return (
              <CareCaseSection
                key={careCase.id}
                careCase={careCase}
                providers={providers}
                isLoading={teamQuery?.isPending ?? true}
                isError={teamQuery?.isError ?? false}
                onRevoke={handleRevokeRequest}
              />
            );
          })}
        </div>
      )}

      <RevokeAccessModal
        provider={revokeTarget}
        open={revokeTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRevokeTarget(null);
        }}
        onConfirm={handleRevokeConfirmed}
      />
    </div>
  );
}
