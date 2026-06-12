"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarCheck, Clock, MapPin, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, type PatientAppointment } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ProposedSlotsSectionProps {
  slots: PatientAppointment[];
  onConfirmed: () => void;
}

const LOC_LABEL: Record<string, string> = {
  IN_PERSON: "Cabinet",
  VIDEO: "Vidéo",
  PHONE: "Téléphone",
};

export function ProposedSlotsSection({ slots, onConfirmed }: ProposedSlotsSectionProps) {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();
  const [confirmed, setConfirmed] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (appointmentId: string) =>
      apiWithToken(accessToken!).patient.appointments.confirm(appointmentId),
    onSuccess: (_, appointmentId) => {
      setConfirmed(appointmentId);
      queryClient.invalidateQueries({ queryKey: ["patient-appointments"] });
      toast.success("Rendez-vous confirmé !");
      setTimeout(onConfirmed, 800);
    },
    onError: () => {
      toast.error("Impossible de confirmer ce créneau, veuillez réessayer.");
    },
  });

  if (!slots.length) return null;

  const providerName = `${slots[0].provider.person.firstName} ${slots[0].provider.person.lastName}`;

  return (
    <div className="rounded-2xl overflow-hidden border border-[rgba(91,78,196,0.18)] shadow-[0_4px_24px_rgba(91,78,196,0.10)]">
      {/* Header */}
      <div
        className="px-5 py-4"
        style={{
          background: "linear-gradient(135deg, rgba(91,78,196,0.08) 0%, rgba(43,168,156,0.06) 100%)",
          borderBottom: "1px solid rgba(91,78,196,0.10)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[rgba(91,78,196,0.12)] flex items-center justify-center shrink-0">
            <Sparkles size={15} className="text-[#5B4EC4]" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#1A1830]">
              {slots.length} créneau{slots.length > 1 ? "x" : ""} proposé{slots.length > 1 ? "s" : ""}
            </p>
            <p className="text-xs text-[#7A77A0] mt-0.5">
              {providerName} vous propose de choisir un créneau
            </p>
          </div>
        </div>
      </div>

      {/* Slots */}
      <div className="bg-white divide-y divide-[rgba(91,78,196,0.06)]">
        {slots.map((slot) => {
          const start = parseISO(slot.startAt);
          const end = parseISO(slot.endAt);
          const isConfirming = mutation.isPending && mutation.variables === slot.id;
          const isDone = confirmed === slot.id;
          const loc = LOC_LABEL[slot.locationType] ?? slot.locationType;

          return (
            <div
              key={slot.id}
              className={cn(
                "flex items-center gap-4 px-5 py-4 transition-colors",
                isDone ? "bg-[rgba(43,168,156,0.06)]" : "hover:bg-[rgba(91,78,196,0.02)]",
              )}
            >
              {/* Date block */}
              <div className="shrink-0 w-12 text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#5B4EC4]">
                  {format(start, "MMM", { locale: fr })}
                </div>
                <div className="text-2xl font-black text-[#1A1830] leading-none">
                  {format(start, "d")}
                </div>
                <div className="text-[10px] text-[#7A77A0] capitalize">
                  {format(start, "EEE", { locale: fr })}
                </div>
              </div>

              {/* Divider */}
              <div className="w-px h-10 bg-[rgba(91,78,196,0.10)] shrink-0" />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-[#1A1830]">
                  <Clock size={12} className="text-[#5B4EC4] shrink-0" />
                  {format(start, "HH:mm")} – {format(end, "HH:mm")}
                </div>
                {loc && (
                  <div className="flex items-center gap-1 mt-0.5 text-xs text-[#7A77A0]">
                    <MapPin size={10} className="shrink-0" />
                    {loc}
                  </div>
                )}
              </div>

              {/* CTA */}
              {isDone ? (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1F9F72] shrink-0">
                  <CheckCircle2 size={16} />
                  Confirmé
                </div>
              ) : (
                <button
                  type="button"
                  disabled={mutation.isPending || !!confirmed}
                  onClick={() => mutation.mutate(slot.id)}
                  className={cn(
                    "shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all",
                    "bg-[#5B4EC4] text-white hover:bg-[#4A3FB5]",
                    "disabled:opacity-40 disabled:cursor-not-allowed",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40",
                  )}
                >
                  {isConfirming ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <CalendarCheck size={12} />
                  )}
                  Choisir
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="px-5 py-3 bg-[rgba(91,78,196,0.03)] border-t border-[rgba(91,78,196,0.06)]">
        <p className="text-[11px] text-[#7A77A0]">
          Les autres créneaux seront automatiquement annulés après votre choix.
        </p>
      </div>
    </div>
  );
}
