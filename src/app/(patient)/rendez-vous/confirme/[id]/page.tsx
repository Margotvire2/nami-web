"use client";

import { use, useSyncExternalStore } from "react";
import { ConfirmHero } from "./ConfirmHero";
import { ConfirmDetails, type PendingRequestSummary } from "./ConfirmDetails";
import { ConfirmNextSteps } from "./ConfirmNextSteps";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Subscribe à sessionStorage via useSyncExternalStore — évite le pattern
// useEffect + setState (déconseillé en React 19, déclenche des cascades de
// renders). Le cache module-level garantit qu'on retourne la MÊME référence
// pour le même id à chaque snapshot (sinon React boucle).
function subscribeNoop(): () => void {
  return () => {};
}

const summaryCache = new Map<string, PendingRequestSummary | null>();

function readSummaryFromSession(id: string): PendingRequestSummary | null {
  if (summaryCache.has(id)) return summaryCache.get(id) ?? null;
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(`apt-request:${id}`);
    const parsed = raw ? (JSON.parse(raw) as PendingRequestSummary) : null;
    summaryCache.set(id, parsed);
    return parsed;
  } catch {
    summaryCache.set(id, null);
    return null;
  }
}

/**
 * Page de confirmation post-soumission d'une AppointmentRequest.
 *
 * Pas de fetch backend en V1 — la route GET /appointment-requests/:id
 * publique n'existe pas encore. Le résumé est lu depuis sessionStorage,
 * qui est rempli par le booking flow (CC #65 R4) au moment de la
 * redirection vers /rendez-vous/confirme/[id].
 *
 * Si la clé n'est pas présente (deep-link depuis email par exemple), la
 * page affiche un état dégradé mais informatif avec la référence ID.
 */
export default function BookingConfirmationPage({ params }: PageProps) {
  const { id } = use(params);
  const summary = useSyncExternalStore(
    subscribeNoop,
    () => readSummaryFromSession(id),
    () => null
  );

  return (
    <main
      aria-label="Confirmation de votre demande de rendez-vous"
      className="max-w-4xl mx-auto p-4 md:p-6 space-y-6"
    >
      <ConfirmHero providerName={summary?.providerName ?? null} />
      <ConfirmDetails requestId={id} summary={summary} />
      <ConfirmNextSteps />

      <p
        className="text-xs italic text-center"
        style={{ color: "#9CA3AF" }}
      >
        Nami n&apos;est pas un dispositif médical. En cas d&apos;urgence
        vitale, appelez le 15 ou le 112.
      </p>
    </main>
  );
}
