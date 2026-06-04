"use client";

// F-SECRETAIRE-SIGNUP-FLOW-V1 — /reglages/secretariat (côté soignant).
//
// 3 sections :
//   - Mes secrétaires (ACTIVE)
//   - Demandes en attente (PENDING)
//   - Historique (REVOKED + REJECTED)
//
// Toutes les actions invalident la query ["secretariat-links", personId].

import Link from "next/link";
import { toast } from "sonner";
import { ChevronLeft, UserCheck, UserPlus, Archive, Check, X, Shield } from "lucide-react";
import {
  useSecretariatLinks,
  useAcceptSecretariatLink,
  useRejectSecretariatLink,
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
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function LinkCard({
  link,
  children,
}: {
  link:     SecretariatLink;
  children: React.ReactNode;
}) {
  const fullName = `${link.counterpart.firstName} ${link.counterpart.lastName}`.trim();
  return (
    <li
      data-testid={`link-${link.id}`}
      className="rounded-xl p-4"
      style={{ background: "#fff", border: "1px solid #E8ECF4" }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-[#1A1A2E] truncate">
            {fullName}
          </p>
          <p className="text-[11px] text-[#6B7280] mt-0.5">
            {link.counterpart.email}
            {link.counterpart.phone ? ` · ${link.counterpart.phone}` : ""}
          </p>
          {link.requestMessage && (
            <p className="text-[11px] text-[#475569] mt-1.5 italic">
              « {link.requestMessage} »
            </p>
          )}
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
        <div className="shrink-0 flex flex-col gap-1.5 items-end">
          {children}
        </div>
      </div>
    </li>
  );
}

export default function ReglagesSecretariatPage() {
  const pendingQuery = useSecretariatLinks("PROVIDER", "PENDING");
  const activeQuery  = useSecretariatLinks("PROVIDER", "ACTIVE");
  const rejectedQuery = useSecretariatLinks("PROVIDER", "REJECTED");
  const revokedQuery  = useSecretariatLinks("PROVIDER", "REVOKED");

  const accept = useAcceptSecretariatLink();
  const reject = useRejectSecretariatLink();
  const revoke = useRevokeSecretariatLink();

  const pending = pendingQuery.data?.links ?? [];
  const active  = activeQuery.data?.links  ?? [];
  const history = [
    ...(rejectedQuery.data?.links ?? []),
    ...(revokedQuery.data?.links  ?? []),
  ].sort((a, b) => {
    const at = new Date(a.revokedAt ?? a.requestedAt).getTime();
    const bt = new Date(b.revokedAt ?? b.requestedAt).getTime();
    return bt - at;
  });

  function handleAccept(l: SecretariatLink) {
    const label = `${l.counterpart.firstName} ${l.counterpart.lastName}`;
    accept.mutate(l.id, {
      onSuccess: () => toast.success(`${label} a été rattaché·e à votre cabinet.`),
      onError:   (e: any) => toast.error(e?.message ?? "Erreur lors de l'acceptation."),
    });
  }
  function handleReject(l: SecretariatLink) {
    const label = `${l.counterpart.firstName} ${l.counterpart.lastName}`;
    reject.mutate(l.id, {
      onSuccess: () => toast.success(`Demande de ${label} refusée.`),
      onError:   (e: any) => toast.error(e?.message ?? "Erreur lors du refus."),
    });
  }
  function handleRevoke(l: SecretariatLink) {
    const label = `${l.counterpart.firstName} ${l.counterpart.lastName}`;
    if (!window.confirm(`Révoquer le rattachement de ${label} ? Iel n'aura plus accès à vos dossiers.`)) {
      return;
    }
    revoke.mutate(l.id, {
      onSuccess: () => toast.success(`Rattachement de ${label} révoqué.`),
      onError:   (e: any) => toast.error(e?.message ?? "Erreur lors de la révocation."),
    });
  }

  const isPending = accept.isPending || reject.isPending || revoke.isPending;

  return (
    <div className="px-6 py-8 max-w-3xl mx-auto space-y-8">
      <header className="space-y-2">
        <Link
          href="/reglages"
          className="inline-flex items-center gap-1 text-[12px] font-medium hover:underline"
          style={{ color: "#5B4EC4" }}
        >
          <ChevronLeft size={14} />
          Retour aux réglages
        </Link>
        <h1
          className="text-2xl font-extrabold"
          style={{ color: "#1A1A2E", fontFamily: "var(--font-jakarta)" }}
        >
          Secrétariat
        </h1>
        <p className="text-sm" style={{ color: "#6B7280" }}>
          Gérez les secrétaires et assistant·e·s médicaux·ales qui ont accès à
          votre agenda, vos documents et vos messages.
        </p>
      </header>

      {/* Section : Demandes en attente */}
      <section data-testid="section-pending" className="space-y-3">
        <div className="flex items-center gap-2">
          <UserPlus size={16} color="#5B4EC4" />
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
                <button
                  type="button"
                  onClick={() => handleAccept(l)}
                  disabled={isPending}
                  className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg text-white disabled:opacity-50"
                  style={{ background: "#5B4EC4" }}
                >
                  <Check size={12} />
                  Accepter
                </button>
                <button
                  type="button"
                  onClick={() => handleReject(l)}
                  disabled={isPending}
                  className="flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-lg disabled:opacity-50"
                  style={{ background: "#fff", border: "1px solid #E8ECF4", color: "#475569" }}
                >
                  <X size={12} />
                  Refuser
                </button>
              </LinkCard>
            ))}
          </ul>
        )}
      </section>

      {/* Section : Mes secrétaires (ACTIVE) */}
      <section data-testid="section-active" className="space-y-3">
        <div className="flex items-center gap-2">
          <UserCheck size={16} color="#059669" />
          <h2 className="text-sm font-semibold" style={{ color: "#1A1A2E" }}>
            Mes secrétaires
          </h2>
          <span className="text-xs" style={{ color: "#94A3B8" }}>({active.length})</span>
        </div>
        {activeQuery.isLoading ? (
          <p className="text-xs" style={{ color: "#6B7280" }}>Chargement…</p>
        ) : active.length === 0 ? (
          <p
            className="text-xs rounded-xl px-4 py-3"
            style={{ color: "#6B7280", background: "#FAFAF8", border: "1px solid #E8ECF4" }}
          >
            Aucun rattachement actif pour le moment.
          </p>
        ) : (
          <ul className="space-y-2">
            {active.map((l) => (
              <LinkCard key={l.id} link={l}>
                <button
                  type="button"
                  onClick={() => handleRevoke(l)}
                  disabled={isPending}
                  className="flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-lg disabled:opacity-50"
                  style={{
                    background: "#fff",
                    border: "1px solid #FCA5A5",
                    color: "#B91C1C",
                  }}
                >
                  <Shield size={12} />
                  Révoquer
                </button>
              </LinkCard>
            ))}
          </ul>
        )}
      </section>

      {/* Section : Historique */}
      <section data-testid="section-history" className="space-y-3">
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
                  className="text-[10px] font-medium px-2 py-1 rounded-full"
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
    </div>
  );
}
