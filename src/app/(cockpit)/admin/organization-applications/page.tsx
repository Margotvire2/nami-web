"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Inbox, Loader2, AlertCircle, ClipboardList } from "lucide-react";
import { N, cardStyle } from "@/lib/design-tokens";
import { ApplicationCard } from "@/components/admin/applications/ApplicationCard";
import {
  useAdminApplicationsList,
  type ApplicationListItem,
  type ApplicationStatus,
} from "@/hooks/useAdminApplications";

// V1 — Le backend (route GET /admin/organization-applications) ne retourne que
// PENDING_REVIEW + IN_REVIEW. Les 3 statuts terminaux (APPROVED/REJECTED/
// WITHDRAWN) viendront en V2 avec un endpoint dédié (filtre status query param).
// Pour l'instant on présente 2 tabs fonctionnels + l'historique est accessible
// directement via l'URL /admin/organization-applications/[id].
const ACTIVE_TABS: { value: ApplicationStatus; label: string }[] = [
  { value: "PENDING_REVIEW", label: "À reviewer" },
  { value: "IN_REVIEW",      label: "En cours" },
];

export default function OrganizationApplicationsQueuePage() {
  const [activeTab, setActiveTab] = useState<ApplicationStatus>("PENDING_REVIEW");
  const { data, isLoading, isError, refetch } = useAdminApplicationsList();

  const items = useMemo(() => data ?? [], [data]);
  const counts = useMemo(() => {
    const c: Partial<Record<ApplicationStatus, number>> = {};
    for (const item of items) c[item.status] = (c[item.status] ?? 0) + 1;
    return c;
  }, [items]);

  const filtered = useMemo(
    () => items.filter((i) => i.status === activeTab),
    [items, activeTab],
  );

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Header */}
      <header style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <ClipboardList size={18} color={N.primary} />
            <h1 style={{ fontSize: 20, fontWeight: 700, color: N.dark, margin: 0 }}>
              Demandes d&apos;inscription structures
            </h1>
          </div>
          <p style={{ fontSize: 13, color: N.textLight, margin: 0, maxWidth: 640 }}>
            Candidatures soumises via le formulaire public de self-signup. Approuver
            crée l&apos;Organisation et déclenche l&apos;envoi d&apos;un magic link à
            l&apos;applicant pour finaliser son inscription comme STRUCTURE_ADMIN.
          </p>
        </div>
      </header>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: 4,
          background: N.bgAlt,
          borderRadius: 12,
          width: "fit-content",
        }}
      >
        {ACTIVE_TABS.map((tab) => {
          const isActive = activeTab === tab.value;
          const count = counts[tab.value] ?? 0;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              data-testid={`tab-${tab.value}`}
              aria-pressed={isActive}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                background: isActive ? N.card : "transparent",
                color: isActive ? N.dark : N.textLight,
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                boxShadow: isActive ? "0 1px 2px rgba(26,26,46,0.06)" : "none",
                transition: "all 0.2s ease",
              }}
            >
              {tab.label}
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "1px 7px",
                  borderRadius: 6,
                  background: isActive ? N.primaryLight : "transparent",
                  color: isActive ? N.primary : N.textLight,
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Body */}
      {isLoading && <LoadingState />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && filtered.length === 0 && <EmptyState tab={activeTab} />}

      {!isLoading && !isError && filtered.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((app: ApplicationListItem) => (
            <ApplicationCard
              key={app.id}
              application={app}
              showNewBadge={activeTab === "PENDING_REVIEW"}
            />
          ))}
        </div>
      )}

      {/* Footnote historique */}
      <p style={{ fontSize: 11, color: N.textLight, marginTop: 20, lineHeight: 1.5 }}>
        Historique (approuvées / rejetées / retirées) accessible via l&apos;URL directe
        d&apos;une candidature. Vue dédiée à venir en V2.
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div
      style={{
        ...cardStyle,
        padding: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        color: N.textLight,
        fontSize: 13,
      }}
    >
      <Loader2 size={16} className="animate-spin" />
      Chargement…
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      style={{
        ...cardStyle,
        padding: 24,
        display: "flex",
        alignItems: "center",
        gap: 12,
        color: N.danger,
        background: N.dangerBg,
        border: `1px solid ${N.dangerBorder}`,
      }}
    >
      <AlertCircle size={18} />
      <div style={{ flex: 1, fontSize: 13 }}>
        Impossible de charger les candidatures.
      </div>
      <button
        type="button"
        onClick={onRetry}
        style={{
          padding: "6px 12px",
          background: N.card,
          border: `1px solid ${N.dangerBorder}`,
          borderRadius: 8,
          color: N.danger,
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Réessayer
      </button>
    </div>
  );
}

function EmptyState({ tab }: { tab: ApplicationStatus }) {
  const copy =
    tab === "PENDING_REVIEW"
      ? {
          title: "Aucune candidature à reviewer",
          desc: "Vous serez notifié dès qu'une nouvelle structure soumet une demande d'inscription.",
        }
      : {
          title: "Aucune review en cours",
          desc: "Démarrez une review depuis l'onglet « À reviewer » pour la voir apparaître ici.",
        };

  return (
    <div
      style={{
        ...cardStyle,
        padding: 40,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 10,
      }}
    >
      <Inbox size={28} color={N.textLight} />
      <div style={{ fontSize: 15, fontWeight: 600, color: N.dark }}>{copy.title}</div>
      <p style={{ fontSize: 12, color: N.textLight, maxWidth: 360, margin: 0 }}>{copy.desc}</p>
      <Link
        href="/admin"
        style={{
          marginTop: 6,
          padding: "7px 14px",
          background: N.primaryLight,
          color: N.primary,
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        Retour à la vue d&apos;ensemble
      </Link>
    </div>
  );
}
