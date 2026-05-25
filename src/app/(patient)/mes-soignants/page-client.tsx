"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/store";
import { MesSoignantsHero } from "./MesSoignantsHero";
import { MesSoignantsList } from "./MesSoignantsList";
import { MesSoignantsEmptyState } from "./MesSoignantsEmptyState";
import { RevokeAccessModal } from "./RevokeAccessModal";
import {
  MOCK_AUTHORIZED_PROVIDERS,
  type AuthorizedProvider,
} from "./mock-data";

/**
 * Orchestrateur /mes-soignants.
 *
 * V1 — frontend pur :
 *   - data = mock illustratif (intégration API V2 via ticket dérivé
 *     F-MES-SOIGNANTS-REVOKE-API-INTEGRATION)
 *   - gate user via useAuthStore (cohérent avec layout (patient))
 *   - révocation simulée : console.info + close modal
 *
 * RGPD Art. 7§3 : mention explicite dans le hero. La révocation V1 n'écrit
 * pas en DB, mais le wording reflète déjà la sémantique attendue.
 */
export function MesSoignantsPageClient() {
  const user = useAuthStore((s) => s.user);
  const [revokeTarget, setRevokeTarget] = useState<AuthorizedProvider | null>(null);

  // Gate user (le layout (patient) gère déjà la redirection si pas connecté,
  // mais on évite le flash en attendant la réhydratation Zustand)
  if (!user) {
    return null;
  }

  const providers = MOCK_AUTHORIZED_PROVIDERS;

  function handleRevokeRequest(provider: AuthorizedProvider) {
    setRevokeTarget(provider);
  }

  function handleRevokeConfirmed(provider: AuthorizedProvider) {
    // V1 — simulation : on logue et on referme la modal.
    // V2 (post ICD11) : appel API via apiWithToken.patient.providers.revoke(provider.id)
    console.info("[mes-soignants] revoke simulated for provider", provider.id);
    setRevokeTarget(null);
  }

  return (
    <div className="max-w-3xl mx-auto py-8 md:py-12 space-y-8">
      <MesSoignantsHero count={providers.length} />

      {providers.length === 0 ? (
        <MesSoignantsEmptyState />
      ) : (
        <MesSoignantsList providers={providers} onRevoke={handleRevokeRequest} />
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
