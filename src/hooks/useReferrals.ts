import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken } from "@/lib/api";

export function useOutgoingReferrals(params?: { status?: string; careCaseId?: string }) {
  const { accessToken } = useAuthStore();
  const api = apiWithToken(accessToken!);

  return useQuery({
    queryKey: ["referrals", "outgoing", params],
    queryFn: () => api.referrals.outgoing(params),
    enabled: !!accessToken,
  });
}

export function useIncomingReferrals(params?: { status?: string }) {
  const { accessToken } = useAuthStore();
  const api = apiWithToken(accessToken!);

  return useQuery({
    queryKey: ["referrals", "incoming", params],
    queryFn: () => api.referrals.incoming(params),
    enabled: !!accessToken,
  });
}

export function useReferralDetail(id: string | null) {
  const { accessToken } = useAuthStore();
  const api = apiWithToken(accessToken!);

  return useQuery({
    queryKey: ["referral", id],
    queryFn: () => api.referrals.get(id!),
    enabled: !!accessToken && !!id,
  });
}
