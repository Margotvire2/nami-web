"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface SecretaryAssignment {
  id: string;
  canManageAgenda: boolean;
  canViewPatientList: boolean;
  canProcessPayment: boolean;
  provider: {
    id: string;
    specialtyView: string | null;
    person: { id: string; firstName: string | null; lastName: string; photoUrl: string | null };
  };
}

export interface OrgSecretaryRow {
  id: string;
  canCreatePatient: boolean;
  canEditPatient: boolean;
  canManageAgenda: boolean;
  canProcessPayment: boolean;
  canMessagePatients: boolean;
  canMessageProviders: boolean;
  canViewBilling: boolean;
  canExportData: boolean;
  createdAt: string;
  person: {
    id: string;
    firstName: string | null;
    lastName: string;
    email: string | null;
    photoUrl: string | null;
  };
  managedProviders: SecretaryAssignment[];
}

export function useOrgSecretaries(orgId: string) {
  const accessToken = useAuthStore((s) => s.accessToken);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["org-secretaries", orgId],
    queryFn: async (): Promise<OrgSecretaryRow[]> => {
      const r = await fetch(`${API}/organizations/${orgId}/secretaries`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!r.ok) throw new Error(`Secretaries fetch failed: ${r.status}`);
      const json = await r.json();
      return json.secretaries as OrgSecretaryRow[];
    },
    enabled: !!accessToken && !!orgId,
    staleTime: 30_000,
  });

  return { secretaries: data ?? [], isLoading, isError, refetch };
}

export function useAddSecretary(orgId: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { email: string }) => {
      const r = await fetch(`${API}/organizations/${orgId}/secretaries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? `${r.status}`);
      }
      return r.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["org-secretaries", orgId] }),
  });
}

export function useRemoveSecretary(orgId: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (secId: string) => {
      const r = await fetch(`${API}/organizations/${orgId}/secretaries/${secId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!r.ok) throw new Error(`${r.status}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["org-secretaries", orgId] }),
  });
}

export function useAssignSecretary(orgId: string, secId: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (providerIds: string[]) => {
      const r = await fetch(
        `${API}/organizations/${orgId}/secretaries/${secId}/assignments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ providerIds }),
        }
      );
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? `${r.status}`);
      }
      return r.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["org-secretaries", orgId] }),
  });
}

export interface SecretaryPermissions {
  canCreatePatient?: boolean;
  canEditPatient?: boolean;
  canManageAgenda?: boolean;
  canProcessPayment?: boolean;
  canMessagePatients?: boolean;
  canMessageProviders?: boolean;
  canViewBilling?: boolean;
  canExportData?: boolean;
}

export function useUpdateSecretaryPermissions(orgId: string, secId: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (perms: SecretaryPermissions) => {
      const r = await fetch(`${API}/organizations/${orgId}/secretaries/${secId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(perms),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? `${r.status}`);
      }
      return r.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["org-secretaries", orgId] }),
  });
}

export function useRemoveAssignment(orgId: string, secId: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (assignId: string) => {
      const r = await fetch(
        `${API}/organizations/${orgId}/secretaries/${secId}/assignments/${assignId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (!r.ok) throw new Error(`${r.status}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["org-secretaries", orgId] }),
  });
}
