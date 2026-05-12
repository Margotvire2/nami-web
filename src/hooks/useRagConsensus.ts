import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, type ConsensusResponse } from "@/lib/api";

interface UseRagConsensusOptions {
  enabled?: boolean;
  limit?: number;
}

/**
 * useRagConsensus — V3.2b
 *
 * Hook React Query qui consomme GET /intelligence/consensus.
 * Le backend cache 5 min en mémoire, on aligne staleTime côté front pour
 * éviter les re-fetch inutiles entre composants montés/démontés.
 *
 * `enabled` est aussi gardé par `query.trim().length >= 3` pour éviter les
 * appels sur input trop court (le backend ne tokenize rien d'utile en dessous).
 */
export function useRagConsensus(
  query: string,
  options: UseRagConsensusOptions = {},
) {
  const { enabled = true, limit = 20 } = options;
  const { accessToken } = useAuthStore();
  const trimmed = query.trim();

  return useQuery<ConsensusResponse, Error>({
    queryKey: ["consensus", trimmed, limit],
    queryFn: () => apiWithToken(accessToken!).intelligence.consensus(trimmed, limit),
    enabled: enabled && !!accessToken && trimmed.length >= 3,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
}
