"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiWithToken, ApiError, type PatientBilanCreated } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

function formatTodayTitleFr(): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `Bilan du ${dd}/${mm}/${yyyy}`;
}

/**
 * Upload d'un bilan biologique patient + cascade analyse IA.
 *
 * - Étape 1 : POST /patient/documents/upload (multipart, BIOLOGICAL_REPORT,
 *   title auto-généré "Bilan du DD/MM/YYYY").
 * - Étape 2 : POST /patient/documents/:id/analyze (CC #79 backend).
 *   Tolère 404 si l'endpoint n'est pas encore déployé — le bilan est uploadé,
 *   l'analyse pourra être relancée plus tard (ticket dérivé
 *   F-PATIENT-MES-BILANS-RELANCE-ANALYSE).
 *
 * onSuccess : invalide ["patient","bilans"] pour rafraîchir la liste.
 */
export function useUploadBilan() {
  const token = useAuthStore((s) => s.accessToken);
  const qc = useQueryClient();

  return useMutation<
    PatientBilanCreated,
    ApiError,
    {
      file: File;
      title?: string;
      // Routing CC #UPLOAD-MODAL-CARECASE-PICKER (XOR aligné backend PR #96).
      careCaseIds?: string[];
      directRecipientPersonId?: string;
    }
  >({
    mutationFn: async ({ file, title, careCaseIds, directRecipientPersonId }) => {
      if (!token) throw new ApiError(401, "Non authentifié");
      const api = apiWithToken(token);
      const finalTitle = (title?.trim() || formatTodayTitleFr()).slice(0, 200);
      const bilan = await api.patient.bilans.upload(file, finalTitle, {
        careCaseIds,
        directRecipientPersonId,
      });

      try {
        await api.patient.bilans.analyze(bilan.id);
      } catch (e: unknown) {
        if (e instanceof ApiError && e.status === 404) {
          // CC #79 backend pas encore déployé — bilan uploadé, analyse en attente.
          console.warn(
            "[useUploadBilan] /analyze endpoint absent — bilan conservé sans analyse",
          );
        } else {
          throw e;
        }
      }

      return bilan;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["patient", "bilans"] });
    },
  });
}
