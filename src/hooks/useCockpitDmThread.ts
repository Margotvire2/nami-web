import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken } from "@/lib/api";

export function useCockpitDmThread({ patientPersonId }: { patientPersonId: string | null }) {
  const { accessToken } = useAuthStore();
  const api = apiWithToken(accessToken!);

  return useQuery({
    queryKey: ["cockpit-dm-inbox", "thread", patientPersonId],
    queryFn: () => api.messages.dmInbox.thread(patientPersonId!),
    enabled: !!accessToken && !!patientPersonId,
    staleTime: 15_000,
  });
}
