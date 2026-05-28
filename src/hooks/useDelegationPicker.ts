"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiWithToken, type SwitchableProfile } from "@/lib/api";

/**
 * Picker générique pour les flows "Pour qui ?" — agrège self + délégations
 * actives du patient connecté, filtré par scope (BOOK_APPOINTMENTS, etc.)
 *
 * Le caller fournit le scope requis : seules les délégations qui le portent
 * apparaitront comme options en plus de "self". `personId` retourné identifie
 * la sélection (self ou enfant), `delegationId` est l'ID Delegation à envoyer
 * au backend (null si self).
 */
export interface UseDelegationPickerOptions {
  scope: string;
  accessToken: string | null;
  enabled?: boolean;
}

export interface UseDelegationPickerResult {
  profiles: SwitchableProfile[];
  isLoading: boolean;
  selectedPersonId: string | null;
  selectedProfile: SwitchableProfile | null;
  selectedDelegationId: string | null;
  hasDelegations: boolean;
  setSelectedPersonId: (id: string) => void;
}

export function useDelegationPicker({
  scope,
  accessToken,
  enabled = true,
}: UseDelegationPickerOptions): UseDelegationPickerResult {
  const { data: rawProfiles, isLoading } = useQuery<SwitchableProfile[]>({
    queryKey: ["patient-switchable-profiles"],
    queryFn: () => apiWithToken(accessToken!).patient.switchableProfiles(),
    enabled: enabled && !!accessToken,
  });

  // Filtrer : self toujours + délégations portant le scope demandé
  const profiles = (rawProfiles ?? []).filter(
    (p) => p.isSelf || (p.delegationScopes?.includes(scope) ?? false),
  );

  const self = profiles.find((p) => p.isSelf) ?? null;
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  const effectivePersonId = selectedPersonId ?? self?.personId ?? null;
  const selectedProfile =
    profiles.find((p) => p.personId === effectivePersonId) ?? null;

  return {
    profiles,
    isLoading,
    selectedPersonId: effectivePersonId,
    selectedProfile,
    selectedDelegationId: selectedProfile?.isSelf
      ? null
      : selectedProfile?.delegationId ?? null,
    hasDelegations: profiles.some((p) => !p.isSelf),
    setSelectedPersonId,
  };
}
