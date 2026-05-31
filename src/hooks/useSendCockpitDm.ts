import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken } from "@/lib/api";
import { toast } from "sonner";

export function useSendCockpitDm() {
  const { accessToken } = useAuthStore();
  const api = apiWithToken(accessToken!);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ patientPersonId, body }: { patientPersonId: string; body: string }) =>
      api.messages.dmInbox.send(patientPersonId, body),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["cockpit-dm-inbox"] });
      qc.invalidateQueries({
        queryKey: ["cockpit-dm-inbox", "thread", variables.patientPersonId],
      });
    },
    onError: () => {
      toast.error("Erreur d'envoi");
    },
  });
}
