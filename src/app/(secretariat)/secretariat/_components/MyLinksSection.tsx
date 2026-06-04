"use client";

// F-SECRETAIRE-SIGNUP-FLOW-V1 — Espace secrétariat : "Mes rattachements".
//
// 3 sections : ACTIVE / PENDING / HISTORY (REJECTED + REVOKED).
// Action "Révoquer" sur ACTIVE → modale de confirmation puis DELETE.
//
// Source : GET /me/secretariat-links?role=SECRETARY (déduit du JWT)

import { useState } from "react";
import { toast } from "sonner";
import { UserCheck, Clock, Archive, ShieldOff, Stethoscope } from "lucide-react";
import {
  useSecretariatLinks,
  useRevokeSecretariatLink,
} from "@/hooks/useSecretariatLinks";
import type { SecretariatLink, SecretariatLinkScope } from "@/lib/api";

function scopeLabel(s: SecretariatLinkScope): string {
  switch (s) {
    case "APPOINTMENTS": return "Rendez-vous";
    case "DOCUMENTS":    return "Documents";
    case "MESSAGES":     return "Messages";
    default:             return s;
  }
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function ConfirmRevokeModal({
  link,
  onCancel,
  onConfirm,
}: {
  link:      SecretariatLink;
  onCancel:  () => void;
  onConfirm: () => void;
}) {
  const fullName = `${link.counterpart.firstName} ${link.counterpart.lastName}`.trim();
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="revoke-title"
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-[#E8ECF4]">
          <h3 id="revoke-title" className="text-sm font-semibold text-[#1A1A2E]">
            Révoquer ce rattachement ?
          </h3>
        </div>
        <div className="px-5 py-4 space-y-2 text-[12px]" style={{ color: "#374151" }}>
          <p>
            Vous allez révoquer votre rattachement avec <strong>{fullName}</strong>.
            Vous n&apos;aurez plus accès à son agenda, ses documents ni ses
            messages.
          </p>
          <p style={{ color: "#6B7280" }}>
            Cette action est immédiate. Vous pourrez relancer une demande de
            rattachement plus tard si nécessaire.
          </p>
        </div>
        <div className="flex gap-2 px-5 pb-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 text-[12px] py-2 rounded-lg border border-[#E8ECF4] text-[#374151] hover:bg-[#F5F3EF]"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 text-[12px] py-2 rounded-lg text-white"
            style={{ background: "#DC2626" }}
          >
            Révoquer
          </button>
        </div>
      </div>
    </div>
  );
}

function LinkCard({
  link,
  children,
}: {
  link:     SecretariatLink;
  children?: React.ReactNode;
}) {
  const fullName = `${link.counterpart.firstName} ${link.counterpart.lastName}`.trim();
  return (
    <li
      data-testid={`my-link-${link.id}`}
      className="rounded-xl p-4"
      style={{ background: "#fff", border: "1px solid #E8ECF4" }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Stethoscope size={13} color="#5B4EC4" />
            <p className="text-[13px] font-semibold text-[#1A1A2E] truncate">
              {fullName}
            </p>
          </div>
          <p className="text-[11px] text-[#6B7280] mt-0.5">
            {link.counterpart.email}
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {link.scope.map((s) => (
              <span
                key={s}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium"
                style={{ background: "#EEEDFB", color: "#5B4EC4" }}
              >
                {scopeLabel(s)}
              </span>
            ))}
          </div>
          <p className="text-[10px] text-[#94A3B8] mt-2">
            Demande envoyée le {formatDate(link.requestedAt)}
            {link.acceptedAt ? ` · Acceptée le ${formatDate(link.acceptedAt)}` : ""}
            {link.revokedAt  ? ` · Clôturée le ${formatDate(link.revokedAt)}`  : ""}
          </p>
        </div>
        {children}
      </div>
    </li>
  );
}

export default function MyLinksSection() {
  const activeQuery   = useSecretariatLinks("SECRETARY", "ACTIVE");
  const pendingQuery  = useSecretariatLinks("SECRETARY", "PENDING");
  const rejectedQuery = useSecretariatLinks("SECRETARY", "REJECTED");
  const revokedQuery  = useSecretariatLinks("SECRETARY", "REVOKED");

  const revoke = useRevokeSecretariatLink();
  const [confirmLink, setConfirmLink] = useState<SecretariatLink | null>(null);

  const active  = activeQuery.data?.links  ?? [];
  const pending = pendingQuery.data?.links ?? [];
  const history = [
    ...(rejectedQuery.data?.links ?? []),
    ...(revokedQuery.data?.links  ?? []),
  ].sort((a, b) => {
    const at = new Date(a.revokedAt ?? a.requestedAt).getTime();
    const bt = new Date(b.revokedAt ?? b.requestedAt).getTime();
    return bt - at;
  });

  function confirmRevoke() {
    if (!confirmLink) return;
    const label = `${confirmLink.counterpart.firstName} ${confirmLink.counterpart.lastName}`;
    revoke.mutate(confirmLink.id, {
      onSuccess: () => {
        toast.success(`Rattachement avec ${label} révoqué.`);
        setConfirmLink(null);
      },
      onError: (e: any) => toast.error(e?.message ?? "Erreur lors de la révocation."),
    });
  }

  return (
    <div className="space-y-8">
      {/* Section ACTIVE */}
      <section data-testid="my-section-active" className="space-y-3">
        <div className="flex items-center gap-2">
          <UserCheck size={16} color="#059669" />
          <h2 className="text-sm font-semibold" style={{ color: "#1A1A2E" }}>
            Soignants rattachés
          </h2>
          <span className="text-xs" style={{ color: "#94A3B8" }}>({active.length})</span>
        </div>
        {activeQuery.isLoading ? (
          <p className="text-xs" style={{ color: "#6B7280" }}>Chargement…</p>
        ) : active.length === 0 ? (
          <div
            className="rounded-xl px-4 py-6 text-center space-y-1"
            style={{ background: "#FAFAF8", border: "1px solid #E8ECF4" }}
          >
            <p className="text-[12px] font-semibold" style={{ color: "#1A1A2E" }}>
              Aucun rattachement actif
            </p>
            <p className="text-[11px]" style={{ color: "#6B7280" }}>
              Votre accès au secrétariat sera disponible une fois qu&apos;un
              soignant aura accepté votre demande.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {active.map((l) => (
              <LinkCard key={l.id} link={l}>
                <button
                  type="button"
                  onClick={() => setConfirmLink(l)}
                  disabled={revoke.isPending}
                  data-testid={`revoke-button-${l.id}`}
                  className="shrink-0 flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-lg disabled:opacity-50"
                  style={{
                    background: "#fff",
                    border: "1px solid #FCA5A5",
                    color: "#B91C1C",
                  }}
                >
                  <ShieldOff size={12} />
                  Révoquer
                </button>
              </LinkCard>
            ))}
          </ul>
        )}
      </section>

      {/* Section PENDING */}
      <section data-testid="my-section-pending" className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock size={16} color="#D97706" />
          <h2 className="text-sm font-semibold" style={{ color: "#1A1A2E" }}>
            Demandes en attente
          </h2>
          <span className="text-xs" style={{ color: "#94A3B8" }}>({pending.length})</span>
        </div>
        {pendingQuery.isLoading ? (
          <p className="text-xs" style={{ color: "#6B7280" }}>Chargement…</p>
        ) : pending.length === 0 ? (
          <p
            className="text-xs rounded-xl px-4 py-3"
            style={{ color: "#6B7280", background: "#FAFAF8", border: "1px solid #E8ECF4" }}
          >
            Aucune demande en attente.
          </p>
        ) : (
          <ul className="space-y-2">
            {pending.map((l) => (
              <LinkCard key={l.id} link={l}>
                <span
                  className="shrink-0 text-[10px] font-medium px-2 py-1 rounded-full"
                  style={{ background: "#FEF9F0", color: "#7B4F00" }}
                >
                  En attente
                </span>
              </LinkCard>
            ))}
          </ul>
        )}
      </section>

      {/* Section HISTORY */}
      <section data-testid="my-section-history" className="space-y-3">
        <div className="flex items-center gap-2">
          <Archive size={16} color="#94A3B8" />
          <h2 className="text-sm font-semibold" style={{ color: "#1A1A2E" }}>
            Historique
          </h2>
          <span className="text-xs" style={{ color: "#94A3B8" }}>({history.length})</span>
        </div>
        {history.length === 0 ? (
          <p
            className="text-xs rounded-xl px-4 py-3"
            style={{ color: "#6B7280", background: "#FAFAF8", border: "1px solid #E8ECF4" }}
          >
            Aucun rattachement clôturé.
          </p>
        ) : (
          <ul className="space-y-2">
            {history.map((l) => (
              <LinkCard key={l.id} link={l}>
                <span
                  className="shrink-0 text-[10px] font-medium px-2 py-1 rounded-full"
                  style={{
                    background: l.status === "REJECTED" ? "#FEE2E2" : "#F1F5F9",
                    color:      l.status === "REJECTED" ? "#B91C1C" : "#475569",
                  }}
                >
                  {l.status === "REJECTED" ? "Refusée" : "Révoquée"}
                </span>
              </LinkCard>
            ))}
          </ul>
        )}
      </section>

      {confirmLink && (
        <ConfirmRevokeModal
          link={confirmLink}
          onCancel={() => setConfirmLink(null)}
          onConfirm={confirmRevoke}
        />
      )}
    </div>
  );
}
