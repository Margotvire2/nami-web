import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken } from "@/lib/api";

/** Tous les RDV du provider connecté */
export function useAppointments(params?: { careCaseId?: string; status?: string }) {
  const { accessToken } = useAuthStore();
  const api = apiWithToken(accessToken!);

  return useQuery({
    queryKey: ["appointments", "all", params],
    queryFn: () => api.appointments.list(params),
    enabled: !!accessToken,
  });
}
