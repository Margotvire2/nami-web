"use client";

/**
 * /adressages/[id] — page détail dédiée pour navigation directe.
 *
 * Cas d'usage :
 *   - Cloche → "Adressage reçu" → navigation directe vers ce détail (BUG #062)
 *   - Lien depuis email / Slack / notification externe
 *
 * Pattern V1 : page autonome qui réutilise AdressageDetailSheet en `open=true`.
 * Le close (X ou Échap) renvoie vers /adressages (liste).
 *
 * Note : les patterns Next.js de parallel/intercepting routes pourront être
 * envisagés dans une PR ultérieure pour bénéficier d'une navigation native
 * sheet-over-list ; ici on reste sur le pattern simple page autonome.
 */

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { useReferralDetail } from "@/hooks/useReferrals";
import { referralsApi } from "@/lib/api";
import CockpitMeshBackground from "@/components/cockpit/CockpitMeshBackground";
import { AdressageDetailSheet } from "@/components/adressages/AdressageDetailSheet";

export default function AdressageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) ?? null;

  const { accessToken } = useAuthStore();
  const qc = useQueryClient();

  const { data, isLoading, error } = useReferralDetail(id);

  // Détermine le rôle de l'user : si sender.id === current user.personId → owner ;
  // si targetProvider matches current providerProfile → recipient.
  // Pour V1 sans accès direct à providerProfile.id, on autorise les actions selon le statut
  // (le backend rejettera de toute façon si non autorisé via assertReferralAccess).
  const user = useAuthStore((s) => s.user);
  const isOwner = useMemo(() => {
    if (!data || !user) return false;
    return data.sender?.id === user.id;
  }, [data, user]);
  const isRecipient = !isOwner; // simplification V1, le backend tranche

  const acceptMutation = useMutation({
    mutationFn: (refId: string) =>
      referralsApi.respond(accessToken!, refId, "ACCEPTED"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["referrals"] });
      qc.invalidateQueries({ queryKey: ["referral", id] });
      toast.success("Adressage accepté");
      router.push("/adressages");
    },
    onError: (e: unknown) => {
      toast.error(e instanceof Error ? e.message : "Impossible d'accepter");
    },
  });

  const declineMutation = useMutation({
    mutationFn: (params: { id: string; reason: string }) =>
      referralsApi.respond(accessToken!, params.id, "DECLINED", params.reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["referrals"] });
      qc.invalidateQueries({ queryKey: ["referral", id] });
      toast.success("Adressage refusé — motif tracé dans l'audit log");
      router.push("/adressages");
    },
    onError: (e: unknown) => {
      toast.error(e instanceof Error ? e.message : "Impossible de refuser");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (refId: string) =>
      referralsApi.updateStatus(accessToken!, refId, "CANCELLED"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["referrals"] });
      qc.invalidateQueries({ queryKey: ["referral", id] });
      toast.success("Adressage annulé");
      router.push("/adressages");
    },
    onError: (e: unknown) => {
      toast.error(e instanceof Error ? e.message : "Impossible d'annuler");
    },
  });

  return (
    <div className="relative min-h-screen">
      <CockpitMeshBackground />

      <main className="relative max-w-[800px] mx-auto px-6 py-8">
        <button
          type="button"
          onClick={() => router.push("/adressages")}
          className="glass-soft rounded-lg px-3 py-2 text-sm font-medium text-[#1A1A2E] hover:bg-white/60 transition mb-6 inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40"
        >
          <ArrowLeft className="size-4" />
          Retour aux adressages
        </button>

        {isLoading && (
          <div className="glass-soft rounded-2xl p-12 text-center">
            <p className="text-[#4A4A5A]">Chargement…</p>
          </div>
        )}

        {error && (
          <div className="glass-soft rounded-2xl p-12 text-center">
            <p className="text-[#D14545] font-medium">
              Adressage introuvable ou accès refusé.
            </p>
            <p className="text-sm text-[#8A8A96] mt-1">
              Cet adressage a peut-être été supprimé ou vous n'y avez pas accès.
            </p>
          </div>
        )}

        <footer className="mt-10 glass-soft rounded-xl px-5 py-3 text-center text-[11px] text-[#1A1A2E]/50">
          Outil de coordination · Non dispositif médical · Conforme RGPD
        </footer>
      </main>

      <AdressageDetailSheet
        referral={data ?? null}
        open={!!data}
        onOpenChange={(open) => {
          if (!open) router.push("/adressages");
        }}
        isRecipient={isRecipient}
        isOwner={isOwner}
        onAccept={async (refId) => {
          await acceptMutation.mutateAsync(refId);
        }}
        onDecline={async (refId, reason) => {
          await declineMutation.mutateAsync({ id: refId, reason });
        }}
        onCancel={async (refId) => {
          await cancelMutation.mutateAsync(refId);
        }}
      />
    </div>
  );
}
