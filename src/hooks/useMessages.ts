import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken } from "@/lib/api";

/** Messages racine d'un care case */
export function useMessages(careCaseId: string | null) {
  const { accessToken } = useAuthStore();
  const api = apiWithToken(accessToken!);

  return useQuery({
    queryKey: ["messages", careCaseId],
    queryFn: () => api.messages.list(careCaseId!),
    enabled: !!accessToken && !!careCaseId,
  });
}

/** Détail d'un message avec ses replies */
export function useMessageDetail(careCaseId: string, messageId: string | null) {
  const { accessToken } = useAuthStore();
  const api = apiWithToken(accessToken!);

  return useQuery({
    queryKey: ["message", careCaseId, messageId],
    queryFn: () => api.messages.get(careCaseId, messageId!),
    enabled: !!accessToken && !!messageId,
  });
}
