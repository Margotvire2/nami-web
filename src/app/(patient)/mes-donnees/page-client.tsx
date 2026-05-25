"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/store";
import { DeleteAccountModal } from "@/components/patient/DeleteAccountModal";
import { MesDonneesHero } from "./MesDonneesHero";
import { MesDonneesAccessSection } from "./MesDonneesAccessSection";
import { MesDonneesExportSection } from "./MesDonneesExportSection";
import { MesDonneesRectifSection } from "./MesDonneesRectifSection";
import { MesDonneesAdvancedRights } from "./MesDonneesAdvancedRights";
import { MesDonneesDeleteSection } from "./MesDonneesDeleteSection";

/**
 * Espace patient — page "Mes données et mes droits".
 *
 * Exerce les 6 droits RGPD sur les données du patient connecté :
 *   - Art. 15 (accès)        — MesDonneesAccessSection
 *   - Art. 16 (rectification) — MesDonneesRectifSection
 *   - Art. 17 (effacement)   — MesDonneesDeleteSection + DeleteAccountModal
 *   - Art. 18 (limitation)   — MesDonneesAdvancedRights
 *   - Art. 20 (portabilité)  — MesDonneesExportSection (Blob client-side)
 *   - Art. 21 (opposition)   — MesDonneesAdvancedRights
 *
 * V1 (juillet 2026) : aucun appel API. L'export Art. 20 est généré client-side
 * à partir des champs du store auth (id, email, firstName, lastName,
 * roleType, emailVerifiedAt). Aucune donnée médicale n'est exposée — celles-ci
 * sont accessibles uniquement auprès du soignant responsable du traitement.
 */
export function MesDonneesPageClient() {
  const user = useAuthStore((s) => s.user);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto py-8 md:py-12 space-y-12">
      <MesDonneesHero />
      <MesDonneesAccessSection user={user} />
      <MesDonneesExportSection user={user} />
      <MesDonneesRectifSection />
      <MesDonneesAdvancedRights />
      <MesDonneesDeleteSection onRequestDelete={() => setDeleteModalOpen(true)} />

      {/*
        DeleteAccountModal (PR #64) — réutilisé tel quel.
        activeCareCases=[] : on n'appelle pas /patient/me ici (frontend pur V1).
        Conséquence : le modal saute directement à l'étape 2 (re-saisie SUPPRIMER),
        ce qui reste conforme RGPD Art. 17 (le droit à l'effacement ne peut pas
        être refusé pour cause de parcours en cours — le step 1 est un garde-fou
        INFORMATIF, jamais bloquant).
      */}
      <DeleteAccountModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        personId={user.id}
        activeCareCases={[]}
      />
    </div>
  );
}
