"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  apiWithToken,
  type ProviderAvailability,
  type ProviderAvailabilitiesResponse,
} from "@/lib/api";
import { useAuthStore } from "@/lib/store";

interface SlotPickerProps {
  providerId: string;
  careCaseId: string;
  patientId: string;
  expectedDate: string | null;
  onClose?: () => void;
}

const MAX_SLOTS_DISPLAYED = 5;
const DEFAULT_WINDOW_DAYS_AFTER_EXPECTED = 14;
const FALLBACK_WINDOW_DAYS = 30;

function buildWindow(expectedDate: string | null): { from: string; to: string } {
  const from = new Date();
  const to = expectedDate
    ? new Date(new Date(expectedDate).getTime() + DEFAULT_WINDOW_DAYS_AFTER_EXPECTED * 24 * 60 * 60 * 1000)
    : new Date(from.getTime() + FALLBACK_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  return { from: from.toISOString(), to: to.toISOString() };
}

function formatSlot(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function SlotPicker({
  providerId,
  careCaseId,
  patientId,
  expectedDate,
  onClose,
}: SlotPickerProps) {
  const token = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();
  const [pendingSlotKey, setPendingSlotKey] = useState<string | null>(null);

  const window = useMemo(() => buildWindow(expectedDate), [expectedDate]);

  const { data, isLoading, error } = useQuery<ProviderAvailabilitiesResponse>({
    queryKey: ["providers", providerId, "availabilities", window.from, window.to],
    queryFn: () =>
      apiWithToken(token!).providers.availabilities.list({
        providerId,
        from: window.from,
        to: window.to,
      }),
    enabled: !!token,
    staleTime: 60_000,
  });

  const bookMutation = useMutation({
    mutationFn: (slot: ProviderAvailability) =>
      apiWithToken(token!).patient.appointments.book({
        careCaseId,
        patientId,
        providerId,
        startAt: slot.startAt,
        endAt: slot.endAt,
        locationType: slot.locationType ?? "IN_PERSON",
        consultationTypeId: slot.consultationTypeId ?? undefined,
      }),
    onMutate: (slot) => {
      setPendingSlotKey(slot.startAt);
    },
    onSuccess: () => {
      toast.success("Rendez-vous réservé. Votre équipe est notifiée.");
      queryClient.invalidateQueries({ queryKey: ["patient", "careCaseHub"] });
      queryClient.invalidateQueries({
        queryKey: ["providers", providerId, "availabilities"],
      });
      onClose?.();
    },
    onError: () => {
      toast.error(
        "Impossible de réserver ce créneau. Réessayez ou contactez votre soignant.",
      );
    },
    onSettled: () => {
      setPendingSlotKey(null);
    },
  });

  if (isLoading) {
    return (
      <p
        role="status"
        aria-live="polite"
        style={{
          margin: "8px 0 0",
          fontSize: 12,
          color: "#6B7280",
          fontFamily: "var(--font-inter)",
        }}
      >
        Chargement des créneaux…
      </p>
    );
  }

  if (error) {
    return (
      <p
        role="alert"
        style={{
          margin: "8px 0 0",
          fontSize: 12,
          color: "#6B7280",
          fontFamily: "var(--font-inter)",
        }}
      >
        Impossible de récupérer les créneaux. Contactez votre soignant via la
        messagerie.
      </p>
    );
  }

  const slots = (data?.slots ?? []).slice(0, MAX_SLOTS_DISPLAYED);

  if (slots.length === 0) {
    return (
      <p
        style={{
          margin: "8px 0 0",
          fontSize: 12,
          color: "#6B7280",
          fontFamily: "var(--font-inter)",
        }}
      >
        Aucun créneau disponible avec ce soignant. Contactez-le via la
        messagerie pour convenir d&apos;une date.
      </p>
    );
  }

  return (
    <div
      role="group"
      aria-label="Choisir un créneau"
      style={{
        marginTop: 12,
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
      }}
    >
      {slots.map((slot) => {
        const key = slot.startAt;
        const isPending = pendingSlotKey === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => bookMutation.mutate(slot)}
            disabled={bookMutation.isPending}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              background: isPending ? "rgba(91,78,196,0.16)" : "#F5F3EF",
              border: "1px solid rgba(91,78,196,0.16)",
              color: "#1A1A2E",
              fontSize: 13,
              fontFamily: "var(--font-inter)",
              fontWeight: 500,
              cursor: bookMutation.isPending ? "wait" : "pointer",
              transition: "background-color 0.15s ease",
            }}
          >
            {isPending ? "Réservation…" : formatSlot(slot.startAt)}
          </button>
        );
      })}
    </div>
  );
}
