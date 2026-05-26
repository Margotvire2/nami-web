"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Info, AlertCircle, Calendar } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import {
  publicSlotsApi,
  submitAppointmentRequestApi,
  type PublicBookingSlot,
} from "@/lib/api";
import BookingHero from "./BookingHero";
import SlotPicker from "./SlotPicker";
import BookingForm, { type BookingMode } from "./BookingForm";
import BookingSubmitButton from "./BookingSubmitButton";
import type { BookingProviderHero } from "./page";

const FULL_WEEKDAY_LABELS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
const MONTH_LABELS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

function formatSlotLabel(slot: PublicBookingSlot): string {
  const d = new Date(`${slot.date}T00:00:00`);
  return `${FULL_WEEKDAY_LABELS[d.getDay()]} ${d.getDate()} ${MONTH_LABELS[d.getMonth()]} à ${slot.startTime}`;
}

interface BookingPageClientProps {
  provider: BookingProviderHero;
  initialSlots: PublicBookingSlot[];
}

export default function BookingPageClient({
  provider,
  initialSlots,
}: BookingPageClientProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);

  // Hydration guard — Zustand persist
  const [hasHydrated, setHasHydrated] = useState(false);
  useEffect(() => setHasHydrated(true), []);

  // Redirection si pas loggé OU si rôle != PATIENT (V1 adulte connecté)
  useEffect(() => {
    if (!hasHydrated) return;
    if (!user || !accessToken) {
      const returnUrl = `/trouver-un-soignant/${provider.slug}/booking`;
      router.replace(
        `/login?role=patient&returnUrl=${encodeURIComponent(returnUrl)}`,
      );
    }
  }, [hasHydrated, user, accessToken, provider.slug, router]);

  // ─── État local ───────────────────────────────────────────────────────────
  const [slots, setSlots] = useState<PublicBookingSlot[]>(initialSlots);
  const [selectedSlot, setSelectedSlot] = useState<PublicBookingSlot | null>(null);
  const [mode, setMode] = useState<BookingMode>("IN_PERSON");
  const [motif, setMotif] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Rafraîchir les slots côté client (no-store) pour avoir l'état le plus frais
  useEffect(() => {
    let cancelled = false;
    publicSlotsApi
      .getSlots(provider.id)
      .then((fresh) => {
        if (!cancelled) setSlots(fresh);
      })
      .catch(() => {
        // silent — on garde initialSlots
      });
    return () => {
      cancelled = true;
    };
  }, [provider.id]);

  // Si le créneau sélectionné disparaît (booké entretemps), on le déselectionne
  useEffect(() => {
    if (selectedSlot && !slots.find((s) => s.id === selectedSlot.id)) {
      setSelectedSlot(null);
    }
  }, [slots, selectedSlot]);

  // ─── Submit ───────────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!user || !selectedSlot) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    // Combine date + startTime en ISO datetime
    const requestedDate = new Date(
      `${selectedSlot.date}T${selectedSlot.startTime}:00`,
    ).toISOString();

    // Concatène motif + notes complémentaires dans le champ motif (limite 2000 backend)
    const fullMotif = [motif, notes ? `--- Notes\n${notes}` : ""]
      .filter(Boolean)
      .join("\n\n");

    try {
      const { requestId } = await submitAppointmentRequestApi(
        {
          providerId: provider.id,
          patientFirstName: user.firstName,
          patientLastName: user.lastName,
          patientEmail: user.email,
          motif: fullMotif || undefined,
          requestedDate,
          locationType: mode,
        },
        accessToken ?? undefined,
      );
      router.push(`/rendez-vous/confirme/${requestId}`);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Impossible d'envoyer la demande. Réessayez dans quelques instants.";
      setErrorMsg(message);
      setIsSubmitting(false);
    }
  }

  // Pendant hydration / redirection : on ne rend rien
  if (!hasHydrated || !user || !accessToken) {
    return (
      <main
        aria-label="Demande de rendez-vous"
        className="min-h-screen bg-[#FAFAF8] flex items-center justify-center"
      >
        <p className="text-sm text-[#6B7280]">Chargement…</p>
      </main>
    );
  }

  const canSubmit = !!selectedSlot && !isSubmitting;

  return (
    <main
      aria-label="Demande de rendez-vous"
      className="min-h-screen bg-[#FAFAF8]"
    >
      <BookingHero provider={provider} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Récap créneau sélectionné */}
        {selectedSlot && (
          <div
            role="status"
            className="bg-[#EEEDFB] border border-[#5B4EC4]/20 rounded-xl px-4 py-3 flex items-start gap-3"
          >
            <Calendar className="w-5 h-5 text-[#5B4EC4] shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-sm">
              <p className="font-medium text-[#1A1A2E]">
                Créneau choisi : {formatSlotLabel(selectedSlot)}
              </p>
              {selectedSlot.consultationType && (
                <p className="text-[#6B7280] text-xs mt-0.5">
                  {selectedSlot.consultationType.name} — {selectedSlot.consultationType.durationMinutes} min
                </p>
              )}
            </div>
          </div>
        )}

        <SlotPicker
          slots={slots}
          selectedSlotId={selectedSlot?.id ?? null}
          onSelect={setSelectedSlot}
        />

        <BookingForm
          user={user}
          mode={mode}
          onModeChange={setMode}
          motif={motif}
          onMotifChange={setMotif}
          notes={notes}
          onNotesChange={setNotes}
          teleconsultAvailable={provider.teleconsultAvailable}
        />

        {/* Toast info RGPD */}
        <div
          role="note"
          className="bg-[#F5F3EF] border border-[rgba(26,26,46,0.06)] rounded-xl px-4 py-3 flex items-start gap-2.5 text-xs text-[#374151]"
        >
          <Info className="w-4 h-4 text-[#6B7280] shrink-0 mt-0.5" aria-hidden="true" />
          <p>
            Votre demande sera partagée avec{" "}
            <strong className="font-medium">
              {provider.firstName} {provider.lastName}
            </strong>{" "}
            uniquement. Vos données sont hébergées en France, conformément au RGPD.
          </p>
        </div>

        {/* Erreur de soumission */}
        {errorMsg && (
          <div
            role="alert"
            className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] rounded-xl px-4 py-3 flex items-start gap-2.5 text-sm"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <p>{errorMsg}</p>
          </div>
        )}

        <BookingSubmitButton
          isSubmitting={isSubmitting}
          disabled={!canSubmit}
          onSubmit={handleSubmit}
        />

        {!selectedSlot && (
          <p className="text-xs text-[#6B7280] text-center">
            Sélectionnez un créneau pour activer l&apos;envoi.
          </p>
        )}
      </div>
    </main>
  );
}
