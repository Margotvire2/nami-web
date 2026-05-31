import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken } from "@/lib/api";

export function useCockpitDmInbox() {
  const { accessToken } = useAuthStore();
  const api = apiWithToken(accessToken!);

  return useQuery({
    queryKey: ["cockpit-dm-inbox"],
    queryFn: () => api.messages.dmInbox.list(),
    enabled: !!accessToken,
    staleTime: 30_000,
  });
}
