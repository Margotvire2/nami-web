"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { ObservationValidationCard } from "./ObservationValidationCard";
import type { PendingObservation } from "./types";
import { Loader2, Inbox } from "lucide-react";

interface Props {
  profileId: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export function PendingObservationsPanel({ profileId }: Props) {
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();

  const { data: observations, isLoading } = useQuery<PendingObservation[]>({
    queryKey: ["pediatric-pending-obs", profileId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/pediatric/profiles/${profileId}/pending-observations`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error();
      return res.json() as Promise<PendingObservation[]>;
    },
    enabled: !!accessToken && !!profileId,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["pediatric-pending-obs", profileId] });

  const validate = useMutation({
    mutationFn: async ({ id, correctedValue }: { id: string; correctedValue?: number }) => {
      const res = await fetch(`${API_URL}/pediatric/observations/${id}/validate`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(correctedValue !== undefined ? { validatedValue: correctedValue } : {}),
      });
      if (!res.ok) throw new Error();
    },
    onSuccess: invalidate,
  });

  const reject = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const res = await fetch(`${API_URL}/pediatric/observations/${id}/reject`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error();
    },
    onSuccess: invalidate,
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-[#6B7280] py-4">
        <Loader2 size={14} className="animate-spin" />
        Chargement…
      </div>
    );
  }

  if (!observations?.length) {
    return (
      <div className="flex items-center gap-2 text-xs text-[#6B7280] py-4">
        <Inbox size={14} />
        Aucune mesure en attente de vérification
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-amber-600 font-medium">
        {observations.length} mesure{observations.length > 1 ? "s" : ""} extraite{observations.length > 1 ? "s" : ""} automatiquement — à vérifier
      </p>
      {observations.map((obs) => (
        <ObservationValidationCard
          key={obs.id}
          obs={obs}
          onValidate={(id, val) => validate.mutateAsync({ id, correctedValue: val })}
          onReject={(id, reason) => reject.mutateAsync({ id, reason })}
        />
      ))}
    </div>
  );
}
