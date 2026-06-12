"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { addDays, format, startOfDay, parseISO, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, Clock, CheckCircle2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/lib/store";
import { careCasesApi, appointmentsApi, referralsApi, apiWithToken, type ProviderAvailability } from "@/lib/api";
import { cn } from "@/lib/utils";

interface SlotChoice {
  startAt: string;
  endAt: string;
  locationType: "IN_PERSON" | "VIDEO" | "PHONE" | null;
}

interface ProposeSlotModalProps {
  referralId: string;
  careCaseId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const LOC_LABEL: Record<string, string> = {
  IN_PERSON: "Cabinet",
  VIDEO: "Vidéo",
  PHONE: "Téléphone",
};

export function ProposeSlotModal({
  referralId,
  careCaseId,
  open,
  onOpenChange,
  onSuccess,
}: ProposeSlotModalProps) {
  const { accessToken, user } = useAuthStore();
  const [selected, setSelected] = useState<SlotChoice[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const providerId = user?.providerProfile?.id;

  // Fetch care case to get patient.id
  const { data: careCase } = useQuery({
    queryKey: ["careCase", careCaseId],
    queryFn: () => careCasesApi.get(accessToken!, careCaseId),
    enabled: open && !!accessToken,
  });

  // Fetch availability slots: today → today+21d, 30-min slots
  const from = useMemo(() => startOfDay(new Date()).toISOString(), []);
  const to = useMemo(() => addDays(startOfDay(new Date()), 21).toISOString(), []);

  const { data: availData, isLoading: loadingSlots } = useQuery({
    queryKey: ["availability", providerId, from, to],
    queryFn: () =>
      providerId
        ? apiWithToken(accessToken!).providers.availabilities.list({
            providerId,
            from,
            to,
            slotDurationMinutes: 30,
          })
        : Promise.resolve({ providerId: "", count: 0, slots: [] }),
    enabled: open && !!accessToken && !!providerId,
  });

  const slots: ProviderAvailability[] = availData?.slots ?? [];

  // Group slots by day
  const slotsByDay = useMemo(() => {
    const map = new Map<string, ProviderAvailability[]>();
    for (const s of slots) {
      const key = startOfDay(parseISO(s.startAt)).toISOString();
      const arr = map.get(key) ?? [];
      arr.push(s);
      map.set(key, arr);
    }
    return map;
  }, [slots]);

  // Smart suggestions: earliest / +7 / +14 at a different time-of-day
  const suggestions = useMemo((): SlotChoice[] => {
    if (!slots.length) return [];
    const result: SlotChoice[] = [];
    const used = new Set<string>();

    const pick = (from: Date, to: Date, preferAM?: boolean) => {
      for (const s of slots) {
        const d = parseISO(s.startAt);
        if (d >= from && d < to) {
          if (preferAM !== undefined) {
            const h = d.getHours();
            if (preferAM && h >= 14) continue;
            if (!preferAM && h < 14) continue;
          }
          if (!used.has(s.startAt)) {
            used.add(s.startAt);
            return s;
          }
        }
      }
      // Fallback: any slot in range
      for (const s of slots) {
        const d = parseISO(s.startAt);
        if (d >= from && d < to && !used.has(s.startAt)) {
          used.add(s.startAt);
          return s;
        }
      }
      return null;
    };

    const now = new Date();
    const s1 = pick(now, addDays(now, 7));
    const s2 = pick(addDays(now, 7), addDays(now, 14), true);
    const s3 = pick(addDays(now, 7), addDays(now, 21), false);

    if (s1) result.push({ startAt: s1.startAt, endAt: s1.endAt, locationType: s1.locationType });
    if (s2) result.push({ startAt: s2.startAt, endAt: s2.endAt, locationType: s2.locationType });
    if (s3) result.push({ startAt: s3.startAt, endAt: s3.endAt, locationType: s3.locationType });

    return result;
  }, [slots]);

  const toggle = (slot: SlotChoice) => {
    const key = slot.startAt;
    const exists = selected.find((s) => s.startAt === key);
    if (exists) {
      setSelected((prev) => prev.filter((s) => s.startAt !== key));
    } else if (selected.length < 3) {
      setSelected((prev) => [...prev, slot]);
    }
  };

  const isSelected = (slot: SlotChoice) => selected.some((s) => s.startAt === slot.startAt);

  const handleConfirm = async () => {
    if (!selected.length || !careCase || !providerId || !accessToken) return;
    setSubmitting(true);
    try {
      const patientId = careCase.patient.id;
      await Promise.all(
        selected.map((slot) =>
          appointmentsApi.create(accessToken, {
            patientId,
            providerId,
            startAt: slot.startAt,
            endAt: slot.endAt,
            locationType: slot.locationType ?? "IN_PERSON",
            careCaseId,
            notes: "Proposition suite adressage",
          }),
        ),
      );
      // Best-effort: le backend limite la mise à jour de statut à l'expéditeur.
      // On ignore le 403 — les appointments PENDING sont créés, c'est l'essentiel.
      try {
        await referralsApi.updateStatus(accessToken, referralId, "APPOINTMENT_INVITED");
      } catch {
        // 403 expected when called by recipient — appointments are created successfully
      }
      onOpenChange(false);
      setSelected([]);
      onSuccess();
    } catch (err) {
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden rounded-2xl border-white/60 bg-white/95 backdrop-blur-xl">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[rgba(26,26,46,0.06)]">
          <DialogTitle className="text-lg font-bold text-[#1A1A2E]">
            Proposer des créneaux
          </DialogTitle>
          <DialogDescription className="text-sm text-[#4A4A5A] mt-1">
            Sélectionnez jusqu'à 3 créneaux. Le patient choisira parmi vos propositions.
          </DialogDescription>
        </div>

        {/* Body */}
        <div className="overflow-y-auto max-h-[60vh] px-6 py-4 space-y-5">
          {loadingSlots && (
            <div className="flex items-center justify-center py-10 gap-2 text-[#8A8A96]">
              <Loader2 className="size-4 animate-spin" />
              <span className="text-sm">Chargement de vos disponibilités…</span>
            </div>
          )}

          {!loadingSlots && !slots.length && (
            <p className="text-sm text-center py-10 text-[#8A8A96]">
              Aucune disponibilité trouvée sur les 3 prochaines semaines.
            </p>
          )}

          {!loadingSlots && slots.length > 0 && (
            <>
              {/* Smart suggestions */}
              {suggestions.length > 0 && (
                <section>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#5B4EC4] mb-2">
                    Suggestions intelligentes
                  </div>
                  <div className="space-y-2">
                    {suggestions.map((s) => (
                      <SlotRow
                        key={s.startAt}
                        slot={s}
                        picked={isSelected(s)}
                        onToggle={() => toggle(s)}
                        disabled={!isSelected(s) && selected.length >= 3}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Full list by day */}
              <section>
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#8A8A96] mb-2">
                  Toutes les disponibilités
                </div>
                {Array.from(slotsByDay.entries()).map(([dayKey, daySlots]) => (
                  <div key={dayKey} className="mb-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Calendar className="size-3 text-[#5B4EC4]" />
                      <span className="text-xs font-semibold text-[#1A1A2E] capitalize">
                        {format(parseISO(dayKey), "EEEE d MMMM", { locale: fr })}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {daySlots.map((s) => {
                        const choice: SlotChoice = { startAt: s.startAt, endAt: s.endAt, locationType: s.locationType };
                        return (
                          <SlotRow
                            key={s.startAt}
                            slot={choice}
                            picked={isSelected(choice)}
                            onToggle={() => toggle(choice)}
                            disabled={!isSelected(choice) && selected.length >= 3}
                            compact
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </section>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[rgba(26,26,46,0.06)] flex items-center justify-between gap-3">
          <span className="text-sm text-[#8A8A96]">
            {selected.length === 0
              ? "Aucun créneau sélectionné"
              : `${selected.length} créneau${selected.length > 1 ? "x" : ""} sélectionné${selected.length > 1 ? "s" : ""}`}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-[#4A4A5A] hover:bg-[rgba(26,26,46,0.04)] transition"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!selected.length || submitting || !careCase}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-semibold text-white transition",
                "bg-[#5B4EC4] hover:bg-[#4c44b0]",
                "disabled:opacity-40 disabled:cursor-not-allowed",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40",
              )}
            >
              {submitting ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="size-3.5 animate-spin" />
                  Envoi…
                </span>
              ) : (
                "Proposer ces créneaux"
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── SlotRow ────────────────────────────────────────────────────────────────

function SlotRow({
  slot,
  picked,
  onToggle,
  disabled,
  compact = false,
}: {
  slot: SlotChoice;
  picked: boolean;
  onToggle: () => void;
  disabled: boolean;
  compact?: boolean;
}) {
  const start = parseISO(slot.startAt);
  const end = parseISO(slot.endAt);
  const time = `${format(start, "HH:mm")} – ${format(end, "HH:mm")}`;
  const loc = slot.locationType ? LOC_LABEL[slot.locationType] ?? slot.locationType : null;

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        "w-full text-left rounded-xl px-3 py-2 border transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/30",
        picked
          ? "border-[#5B4EC4] bg-[rgba(91,78,196,0.06)]"
          : "border-[rgba(26,26,46,0.06)] bg-white hover:border-[rgba(91,78,196,0.20)] hover:bg-[rgba(91,78,196,0.02)]",
        disabled && "opacity-40 cursor-not-allowed",
        compact ? "flex items-center gap-2" : "flex items-start gap-3",
      )}
    >
      <div
        className={cn(
          "shrink-0 mt-0.5 rounded-full flex items-center justify-center",
          compact ? "size-4" : "size-5",
          picked ? "bg-[#5B4EC4]" : "border border-[rgba(26,26,46,0.12)]",
        )}
      >
        {picked && <CheckCircle2 className="size-3 text-white" />}
      </div>
      <div className="flex-1 min-w-0">
        {!compact && (
          <div className="text-xs text-[#8A8A96] mb-0.5 capitalize">
            {format(start, "EEEE d MMM", { locale: fr })}
          </div>
        )}
        <div className="flex items-center gap-1.5 text-sm font-semibold text-[#1A1A2E]">
          <Clock className="size-3 text-[#5B4EC4] shrink-0" />
          {time}
        </div>
        {loc && !compact && (
          <div className="text-[11px] text-[#8A8A96] mt-0.5">{loc}</div>
        )}
      </div>
    </button>
  );
}
