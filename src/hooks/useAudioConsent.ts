import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, GLOBAL_SCOPE_KEY, type ConsentMatrix } from "@/lib/api";

export const AUDIO_CONSENT_SCOPE = "transcription_audio" as const;

export function audioConsentQueryKey(patientPersonId: string | null | undefined) {
  return ["audio-consent", patientPersonId ?? "anonymous"] as const;
}

function readMatrixForAudio(matrix: ConsentMatrix | undefined): boolean {
  if (!matrix) return false;
  const ai = matrix.AI_PROCESSING ?? {};
  return Boolean(ai[AUDIO_CONSENT_SCOPE]) || Boolean(ai[GLOBAL_SCOPE_KEY]);
}

/**
 * Hook bas niveau : interroge la matrice de consentements + permet de poser/retirer
 * le consentement pour la transcription audio d'une consultation enregistrée.
 *
 * Réutilise la matrice granulaire D2 G5 (PatientConsent + scope="transcription_audio")
 * — aucune nouvelle valeur d'enum, aucune migration.
 *
 * Le caller est responsable de gérer le cas 403 (le backend exige self / ADMIN /
 * délégation MANAGE_CONSENTS pour poser un consentement). Pour le cockpit soignant,
 * un échec 403 signifie que le patient doit donner son accord depuis son propre
 * espace.
 */
export function useAudioConsent(patientPersonId: string | null | undefined) {
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();

  const enabled = Boolean(accessToken && patientPersonId);

  const matrixQuery = useQuery({
    queryKey: audioConsentQueryKey(patientPersonId),
    queryFn: async () => {
      if (!accessToken || !patientPersonId) return null;
      const api = apiWithToken(accessToken);
      return api.persons.consentsMatrix(patientPersonId);
    },
    enabled,
    staleTime: 30_000,
  });

  const hasConsented = readMatrixForAudio(matrixQuery.data ?? undefined);

  const grant = useMutation({
    mutationFn: async (input?: { source?: "WEB" | "MOBILE" | "VERBAL"; notes?: string }) => {
      if (!accessToken || !patientPersonId) {
        throw new Error("Missing accessToken or patientPersonId");
      }
      const api = apiWithToken(accessToken);
      return api.persons.grantConsent(patientPersonId, {
        consentType: "AI_PROCESSING",
        granted: true,
        scope: AUDIO_CONSENT_SCOPE,
        source: input?.source ?? "WEB",
        notes: input?.notes,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: audioConsentQueryKey(patientPersonId) });
    },
  });

  const refuse = useMutation({
    mutationFn: async (input?: { source?: "WEB" | "MOBILE" | "VERBAL"; notes?: string }) => {
      if (!accessToken || !patientPersonId) {
        throw new Error("Missing accessToken or patientPersonId");
      }
      const api = apiWithToken(accessToken);
      return api.persons.grantConsent(patientPersonId, {
        consentType: "AI_PROCESSING",
        granted: false,
        scope: AUDIO_CONSENT_SCOPE,
        source: input?.source ?? "WEB",
        notes: input?.notes,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: audioConsentQueryKey(patientPersonId) });
    },
  });

  return {
    isLoading: matrixQuery.isLoading,
    hasConsented,
    grant,
    refuse,
    refetch: matrixQuery.refetch,
  };
}
