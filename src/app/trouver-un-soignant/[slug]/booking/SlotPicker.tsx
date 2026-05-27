"use client";

import { useMemo } from "react";
import type { PublicBookingSlot } from "@/lib/api";

const WEEKDAY_LABELS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const FULL_WEEKDAY_LABELS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
const MONTH_LABELS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

function todayIso(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function addDaysIso(start: string, days: number): string {
  const d = new Date(`${start}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function formatHumanDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return `${FULL_WEEKDAY_LABELS[d.getDay()]} ${d.getDate()} ${MONTH_LABELS[d.getMonth()]}`;
}

interface SlotPickerProps {
  slots: PublicBookingSlot[];
  selectedSlotId: string | null;
  onSelect: (slot: PublicBookingSlot) => void;
}

export default function SlotPicker({ slots, selectedSlotId, onSelect }: SlotPickerProps) {
  // Construire la fenêtre 7 jours depuis aujourd'hui
  const today = todayIso();
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDaysIso(today, i)),
    [today],
  );

  // Index slots par date
  const slotsByDate = useMemo(() => {
    const map = new Map<string, PublicBookingSlot[]>();
    for (const s of slots) {
      const arr = map.get(s.date) ?? [];
      arr.push(s);
      map.set(s.date, arr);
    }
    // Tri par startTime
    for (const arr of map.values()) {
      arr.sort((a, b) => a.startTime.localeCompare(b.startTime));
    }
    return map;
  }, [slots]);

  const hasAnySlot = slots.length > 0;

  return (
    <section
      aria-labelledby="slot-picker-heading"
      className="bg-white rounded-xl border border-[rgba(26,26,46,0.06)] p-5 sm:p-6"
    >
      <div className="flex items-baseline justify-between gap-3 mb-4">
        <h2 id="slot-picker-heading" className="text-lg font-semibold text-[#1A1A2E]">
          Choisir un créneau
        </h2>
        <p className="text-xs text-[#6B7280]">
          Les créneaux affichés sont indicatifs
        </p>
      </div>

      {!hasAnySlot ? (
        <p
          role="status"
          className="text-sm text-[#6B7280] py-8 text-center"
        >
          Aucun créneau public n&apos;est proposé sur les 14 prochains jours.
          Vous pouvez tout de même envoyer une demande ci-dessous.
        </p>
      ) : (
        <div
          role="grid"
          aria-label="Créneaux disponibles sur 7 jours"
          className="grid grid-cols-7 gap-2"
        >
          {days.map((dayIso) => {
            const daySlots = slotsByDate.get(dayIso) ?? [];
            const d = new Date(`${dayIso}T00:00:00`);
            const weekdayLabel = WEEKDAY_LABELS[d.getDay()];
            const dayNum = d.getDate();
            return (
              <div
                key={dayIso}
                role="row"
                aria-label={formatHumanDate(dayIso)}
                className="flex flex-col gap-1.5"
              >
                <div className="text-center pb-2 border-b border-[rgba(26,26,46,0.06)]">
                  <div className="text-[11px] uppercase tracking-wide text-[#6B7280] font-medium">
                    {weekdayLabel}
                  </div>
                  <div className="text-base font-semibold text-[#1A1A2E]">
                    {dayNum}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  {daySlots.length === 0 ? (
                    <span className="text-[11px] text-[#9CA3AF] text-center py-2" aria-label="Aucun créneau ce jour">
                      —
                    </span>
                  ) : (
                    daySlots.map((slot) => {
                      const isSelected = slot.id === selectedSlotId;
                      const ariaLabel = `${slot.startTime} le ${formatHumanDate(slot.date)}${
                        slot.consultationType ? `, ${slot.consultationType.name}` : ""
                      }${slot.priority === "recommended" ? ", créneau suggéré" : ""}`;
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          role="gridcell"
                          aria-selected={isSelected}
                          aria-label={ariaLabel}
                          onClick={() => onSelect(slot)}
                          className={[
                            "w-full px-1 py-1.5 rounded-md text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4] focus-visible:ring-offset-1",
                            isSelected
                              ? "bg-[#5B4EC4] text-white"
                              : slot.priority === "recommended"
                              ? "bg-[#EEEDFB] text-[#5B4EC4] hover:bg-[#E2DFF8]"
                              : "bg-[#F5F3EF] text-[#1A1A2E] hover:bg-[#EDEAE3]",
                          ].join(" ")}
                        >
                          {slot.startTime}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
