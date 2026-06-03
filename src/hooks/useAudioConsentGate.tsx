"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import { AudioConsentBanner } from "@/components/consent/AudioConsentBanner";
import { useAudioConsent } from "@/hooks/useAudioConsent";

/**
 * Gate UX à brancher sur n'importe quel bouton qui démarre un enregistrement
 * audio de consultation. Vérifie d'abord la matrice de consentements ; si le
 * patient n'a pas encore consenti à la transcription, ouvre le bandeau modal
 * et n'exécute l'action qu'après accord.
 *
 * Usage :
 *
 *   const { check, banner } = useAudioConsentGate(patientPersonId, patientName);
 *   <button onClick={() => check(() => startRecording(...))}>Démarrer</button>
 *   {banner}
 */
export function useAudioConsentGate(
  patientPersonId: string | null | undefined,
  patientName: string,
): { check: (action: () => void) => void; banner: ReactNode } {
  const { hasConsented, isLoading, refetch } = useAudioConsent(patientPersonId);
  const [bannerOpen, setBannerOpen] = useState(false);
  const pendingActionRef = useRef<(() => void) | null>(null);

  const runPending = useCallback(() => {
    const fn = pendingActionRef.current;
    pendingActionRef.current = null;
    fn?.();
  }, []);

  const check = useCallback(
    (action: () => void) => {
      if (!patientPersonId) {
        action();
        return;
      }
      if (isLoading) {
        // On évite de lancer un audio si la matrice n'a pas encore été récupérée :
        // mieux vaut un léger délai que de tirer getUserMedia avant de connaître
        // l'état du consentement.
        pendingActionRef.current = action;
        refetch().then((res) => {
          const matrix = res.data;
          const ai = matrix?.AI_PROCESSING ?? {};
          if (ai["transcription_audio"] || ai["__global__"]) {
            runPending();
          } else {
            setBannerOpen(true);
          }
        });
        return;
      }
      if (hasConsented) {
        action();
        return;
      }
      pendingActionRef.current = action;
      setBannerOpen(true);
    },
    [patientPersonId, isLoading, hasConsented, refetch, runPending],
  );

  const banner = patientPersonId ? (
    <AudioConsentBanner
      patientPersonId={patientPersonId}
      patientName={patientName}
      open={bannerOpen}
      onAccepted={() => {
        setBannerOpen(false);
        runPending();
      }}
      onRefused={() => {
        setBannerOpen(false);
        pendingActionRef.current = null;
      }}
      onClose={() => {
        setBannerOpen(false);
        pendingActionRef.current = null;
      }}
    />
  ) : null;

  return { check, banner };
}
