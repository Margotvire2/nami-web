"use client";

import { Calendar, MessageSquare } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { publicSlotsApi, type PublicBookingSlot } from "@/lib/api";

const WEEKDAY_FR = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];
const MONTH_FR = [
  "jan.", "fév.", "mars", "avr.", "mai", "juin",
  "juil.", "août", "sept.", "oct.", "nov.", "déc.",
];

function formatSlotLabel(slot: PublicBookingSlot): string {
  const d = new Date(`${slot.date}T00:00:00`);
  return `${WEEKDAY_FR[d.getDay()]} ${d.getDate()} ${MONTH_FR[d.getMonth()]} à ${slot.startTime}`;
}

function sortSlots(slots: PublicBookingSlot[]): PublicBookingSlot[] {
  return [...slots].sort((a, b) => {
    const cmp = a.date.localeCompare(b.date);
    return cmp !== 0 ? cmp : a.startTime.localeCompare(b.startTime);
  });
}

interface ProviderSlotsCardProps {
  providerId: string;
}

export function ProviderSlotsCard({ providerId }: ProviderSlotsCardProps) {
  const { data: slots, isLoading, isError } = useQuery({
    queryKey: ["provider-slots", providerId],
    queryFn: () => publicSlotsApi.getSlots(providerId),
    staleTime: 60_000,
    retry: 1,
  });

  const next3 = slots ? sortSlots(slots).slice(0, 3) : [];
  const hasSlots = next3.length > 0;

  return (
    <div
      aria-label="Prochains créneaux"
      className="rounded-2xl p-5 md:p-6"
      style={{
        background: "#fff",
        border: "1px solid rgba(91,78,196,0.14)",
        boxShadow: "0 2px 8px rgba(91,78,196,0.06)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div
          className="flex items-center justify-center rounded-lg shrink-0"
          style={{ width: 28, height: 28, background: "rgba(91,78,196,0.10)" }}
          aria-hidden="true"
        >
          <Calendar size={14} style={{ color: "#5B4EC4" }} />
        </div>
        <h2
          className="text-sm font-bold"
          style={{ color: "#1A1A2E", fontFamily: "var(--font-jakarta)" }}
        >
          Prochains créneaux
        </h2>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2" aria-busy="true" aria-label="Chargement des créneaux">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg h-9"
              style={{ background: "rgba(26,26,46,0.05)" }}
            />
          ))}
        </div>
      ) : isError || !hasSlots ? (
        <div
          className="rounded-xl p-4 text-center"
          style={{ background: "rgba(26,26,46,0.03)", border: "1px dashed rgba(26,26,46,0.10)" }}
        >
          <MessageSquare size={16} className="mx-auto mb-2" style={{ color: "#9CA3AF" }} aria-hidden="true" />
          <p className="text-xs" style={{ color: "#6B7280", lineHeight: 1.55 }}>
            Contactez ce soignant pour connaître ses prochains rendez-vous disponibles.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2" aria-label="Liste des prochains créneaux">
          {next3.map((slot) => (
            <li key={slot.id}>
              <div
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium"
                style={{
                  background: "rgba(91,78,196,0.06)",
                  border: "1px solid rgba(91,78,196,0.12)",
                }}
              >
                <span
                  className="shrink-0 inline-block rounded-full"
                  style={{ width: 6, height: 6, background: "#2BA84A" }}
                  aria-hidden="true"
                />
                <span style={{ color: "#1A1A2E" }}>{formatSlotLabel(slot)}</span>
                {slot.consultationType && (
                  <span
                    className="ml-auto shrink-0"
                    style={{ color: "#9CA3AF", fontSize: 10 }}
                  >
                    {slot.consultationType.durationMinutes} min
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <p
        className="mt-3 text-[10px]"
        style={{ color: "#9CA3AF" }}
        aria-live="polite"
      >
        Les créneaux affichés sont indicatifs et peuvent évoluer.
      </p>
    </div>
  );
}
