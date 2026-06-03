"use client";

import { useQuery } from "@tanstack/react-query";

/**
 * F-CROSS-GAP-Document-SIGNED-SECRETARIAT (audit cross-espaces §5.7).
 *
 * Hook V1 "shell gracieux" : appelle l'endpoint backend
 *   GET /secretary/signed-documents
 * Cet endpoint N'EXISTE PAS encore côté backend (ticket dérivé
 * `F-DOC-SIGNED-SECRETARY-SCOPE-BACKEND` à créer). Tant qu'il n'est pas
 * livré, on retourne gracieusement `data: []` sur 404/501/5xx pour que
 * la section UI affiche son état vide ("Aucune ordonnance signée à
 * transmettre") au lieu de crasher.
 *
 * Définition opérationnelle "Document SIGNED" (rappel) :
 *   Document de type PRESCRIPTION lié à un PrescriptionDraft.status="SIGNED"
 *   via PrescriptionDraft.pdfDocumentId (cf. schema.prisma:892 + :1916).
 *   `Document` n'a PAS de champ `signedAt` — c'est `PrescriptionDraft`
 *   qui porte signedAt / signatureMethod / signatureHash / pdfDocumentId.
 */

export interface SecretariatSignedDocItem {
  /** Document.id */
  id: string;
  /** Document.title (ex: "Ordonnance - Léa Rousseau") */
  title: string;
  /** PrescriptionDraft.signedAt — ISO 8601 */
  signedAt: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface UseSecretariatSignedDocsResult {
  data: SecretariatSignedDocItem[];
  isLoading: boolean;
  error: Error | null;
}

async function fetchSecretariatSignedDocs(
  token: string,
): Promise<SecretariatSignedDocItem[]> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "";
  const res = await fetch(`${base}/secretary/signed-documents`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  // Endpoint pas encore implémenté côté backend (V1 shell).
  // 404 = route inexistante. 501 = not implemented. 5xx = erreur backend
  // → on retourne [] pour ne pas casser l'UI.
  if (res.status === 404 || res.status === 501 || res.status >= 500) {
    return [];
  }

  if (!res.ok) {
    throw new Error(`Signed docs fetch failed: ${res.status}`);
  }

  const json = (await res.json()) as
    | { items: SecretariatSignedDocItem[] }
    | SecretariatSignedDocItem[];
  if (Array.isArray(json)) return json;
  return json.items ?? [];
}

export function useSecretariatSignedDocs(params: {
  accessToken: string | null;
  userId: string | null;
}): UseSecretariatSignedDocsResult {
  const { accessToken, userId } = params;

  const query = useQuery({
    queryKey: ["secretariat-signed-docs", userId],
    queryFn: () => fetchSecretariatSignedDocs(accessToken ?? ""),
    enabled: !!accessToken,
    staleTime: 60_000,
    retry: false,
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: (query.error as Error | null) ?? null,
  };
}
