"use client";

// F-SECRETAIRE-SIGNUP-FLOW-V1 — Widget cockpit /aujourd-hui.
//
// Affiche les demandes de rattachement secrétariat reçues PENDING pour le
// soignant connecté. Si 0 demande → composant retourne null (la carte n'apparaît pas).
// Cliquer "Accepter" / "Refuser" → PATCH /secretariat-links/:id { action } puis
// invalidation de la query ["secretariat-links", personId].

import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight, UserPlus, Check, X } from "lucide-react";
import { toast } from "sonner";
import {
  useSecretariatLinks,
  useAcceptSecretariatLink,
  useRejectSecretariatLink,
} from "@/hooks/useSecretariatLinks";

const PREVIEW_MAX = 3;

function relativeTime(dateStr: string): string {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60_000);
  if (mins < 1)   return "à l'instant";
  if (mins < 60)  return `il y a ${mins}min`;
  const h = Math.floor(mins / 60);
  if (h < 24)     return `il y a ${h}h`;
  const d = Math.floor(h / 24);
  return d === 1 ? "hier" : `il y a ${d}j`;
}

export default function SecretariatLinkRequestsWidget() {
  const { data, isLoading } = useSecretariatLinks("PROVIDER", "PENDING");
  const accept = useAcceptSecretariatLink();
  const reject = useRejectSecretariatLink();

  if (isLoading) return null;

  const links = data?.links ?? [];
  if (links.length === 0) return null;

  const preview = links.slice(0, PREVIEW_MAX);
  const pending = accept.isPending || reject.isPending;

  function onAccept(linkId: string, label: string) {
    accept.mutate(linkId, {
      onSuccess: () => toast.success(`Demande de ${label} acceptée.`),
      onError:   (e: any) => toast.error(e?.message ?? "Erreur lors de l'acceptation."),
    });
  }
  function onReject(linkId: string, label: string) {
    reject.mutate(linkId, {
      onSuccess: () => toast.success(`Demande de ${label} refusée.`),
      onError:   (e: any) => toast.error(e?.message ?? "Erreur lors du refus."),
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.28, duration: 0.3 }}
      role="region"
      aria-label="Demandes de rattachement secrétariat"
      data-testid="secretariat-link-requests-widget"
    >
      <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid #E8ECF4" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <UserPlus size={18} color="#5B4EC4" aria-hidden />
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.07em]"
              style={{ color: "#94A3B8", fontFamily: "var(--font-inter)" }}
            >
              DEMANDES DE RATTACHEMENT SECRÉTARIAT
            </p>
            <span
              data-testid="secretariat-pending-badge"
              className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-full"
              style={{
                background: "#EEEDFB",
                color: "#5B4EC4",
                fontSize: 11,
                fontWeight: 700,
                fontFamily: "var(--font-inter)",
              }}
            >
              {links.length} en attente
            </span>
          </div>
          <Link
            href="/reglages/secretariat"
            className="text-[12px] font-medium text-[#5B4EC4] hover:underline"
          >
            Tout voir →
          </Link>
        </div>

        <ul className="space-y-2">
          {preview.map((l) => {
            const fullName = `${l.counterpart.firstName} ${l.counterpart.lastName}`.trim();
            return (
              <li
                key={l.id}
                data-testid={`pending-request-${l.id}`}
                className="rounded-xl p-3"
                style={{ background: "#FAFBFF", border: "1px solid #E8ECF4" }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-[#0F172A] truncate">
                      {fullName}
                    </p>
                    <p className="text-[11px] text-[#94A3B8] mt-0.5">
                      {l.counterpart.email} · {relativeTime(l.requestedAt)}
                    </p>
                    {l.requestMessage && (
                      <p className="text-[11px] text-[#475569] mt-1.5 italic line-clamp-2">
                        « {l.requestMessage} »
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => onAccept(l.id, fullName)}
                    disabled={pending}
                    data-testid={`accept-${l.id}`}
                    className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg text-white disabled:opacity-50"
                    style={{ background: "#5B4EC4" }}
                  >
                    <Check size={13} />
                    Accepter
                  </button>
                  <button
                    type="button"
                    onClick={() => onReject(l.id, fullName)}
                    disabled={pending}
                    data-testid={`reject-${l.id}`}
                    className="flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg disabled:opacity-50"
                    style={{
                      background: "#fff",
                      border: "1px solid #E8ECF4",
                      color: "#475569",
                    }}
                  >
                    <X size={13} />
                    Refuser
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        {links.length > PREVIEW_MAX && (
          <Link
            href="/reglages/secretariat"
            className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#5B4EC4] hover:underline"
          >
            Voir les {links.length - PREVIEW_MAX} autres demandes
            <ChevronRight size={13} />
          </Link>
        )}
      </div>
    </motion.div>
  );
}
