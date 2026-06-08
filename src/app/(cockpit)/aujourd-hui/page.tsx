"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { useDashboard, type DashboardConsultation } from "@/hooks/useDashboard";
import { KnowledgeSearch } from "@/components/nami/KnowledgeSearch";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  apiWithToken,
  type ConnectionRequest,
  type Referral,
  type TaskWithContext,
  type AppointmentRequest,
  type ProConversation,
  type NotificationItem,
} from "@/lib/api";
import { toast } from "sonner";
import { useConsultation } from "@/contexts/ConsultationContext";
import { FilThread } from "@/components/cockpit/LeFil/FilThread";
import { AgendaStrip } from "@/components/cockpit/LeFil/AgendaStrip";
import {
  FilCardConsult,
  FilCardTask,
  FilCardReferral,
  FilCardRequest,
} from "@/components/cockpit/LeFil/FilCard";
import { DetailRail } from "@/components/cockpit/LeFil/DetailRail";
import SecretariatLinkRequestsWidget from "./_components/SecretariatLinkRequestsWidget";
import CockpitDmBadgeCard from "./CockpitDmBadgeCard";

const PENDING_REFERRAL_STATUSES = ["SENT", "RECEIVED", "UNDER_REVIEW"];
const PRIORITY_ORDER: Record<string, number> = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

export default function DashboardPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const filRef = useRef<HTMLDivElement>(null);
  const { user, accessToken } = useAuthStore();
  const { startConsultation } = useConsultation();

  // ── Consultations du jour ──
  const {
    consultations,
    nextConsultation: nextConsult,
    totalToday,
    isLoading,
    isError,
    refetch,
  } = useDashboard();

  const api = apiWithToken(accessToken!);

  // ── Tâches du provider ──
  const { data: allTasks = [] } = useQuery<TaskWithContext[]>({
    queryKey: ["tasks-mine"],
    queryFn: () => api.tasksMine.list(),
    enabled: !!accessToken,
    refetchInterval: 60_000,
  });

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const pendingTasks = allTasks
    .filter((t) => t.status !== "COMPLETED" && t.status !== "CANCELLED")
    .sort((a, b) => {
      const aOv = a.dueDate && new Date(a.dueDate) < new Date();
      const bOv = b.dueDate && new Date(b.dueDate) < new Date();
      if (aOv && !bOv) return -1;
      if (!aOv && bOv) return 1;
      return (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2);
    });

  const qc = useQueryClient();

  // ── Adressages reçus ──
  const { data: incomingReferrals = [] } = useQuery({
    queryKey: ["referrals-incoming"],
    queryFn: () => api.referrals.incoming({ status: "SENT" }),
    enabled: !!accessToken,
  });
  const pendingReferrals = (incomingReferrals as Referral[]).filter((r) =>
    PENDING_REFERRAL_STATUSES.includes(r.status)
  );

  const acceptRefMut = useMutation({
    mutationFn: (id: string) => api.referrals.respond(id, "ACCEPTED"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["referrals-incoming"] });
      toast.success("Adressage accepté — dossier créé");
    },
  });

  const declineRefMut = useMutation({
    mutationFn: (id: string) =>
      api.referrals.respond(id, "DECLINED", "Décliné depuis le fil — voir /adressages"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["referrals-incoming"] });
      toast.success("Adressage décliné");
    },
  });

  // ── Demandes de suivi patients ──
  const { data: connRequests = [] } = useQuery({
    queryKey: ["connection-requests-pending"],
    queryFn: () => api.connectionRequests.incoming("PENDING"),
    enabled: !!accessToken,
    refetchInterval: 30_000,
  });
  const pendingConnReqs = (connRequests as ConnectionRequest[]) ?? [];

  const acceptConnMut = useMutation({
    mutationFn: (id: string) => api.connectionRequests.respond(id, { decision: "ACCEPTED" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["connection-requests-pending"] });
      toast.success("Demande acceptée — dossier créé");
    },
  });

  const declineConnMut = useMutation({
    mutationFn: (id: string) => api.connectionRequests.respond(id, { decision: "DECLINED" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["connection-requests-pending"] });
      toast.success("Demande déclinée");
    },
  });

  // ── Tâche completion ──
  const completeMut = useMutation({
    mutationFn: (t: TaskWithContext) =>
      api.tasks.update(t.careCase.id, t.id, { status: "COMPLETED" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks-mine"] }),
  });

  // ── Consultation start ──
  async function handleStartConsultation(c: DashboardConsultation) {
    if (!c.careCaseId) return;
    try {
      await startConsultation({ careCaseId: c.careCaseId, patientName: c.patient });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Impossible de démarrer");
    }
  }

  // ── Résumé ──
  const selected = consultations.find((c: DashboardConsultation) => c.id === selectedId) ?? null;
  const railConsult = selected ?? nextConsult ?? null;

  const pendingCoordCount = pendingReferrals.length + pendingConnReqs.length;
  const totalFilItems =
    consultations.length + pendingTasks.slice(0, 5).length + pendingReferrals.length + pendingConnReqs.length;

  // Date label
  const dateLabel = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const dateLabelCap = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1);

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        overflow: "hidden",
        background: "var(--paper)",
        position: "relative",
      }}
    >
      {/* ── Main column ── */}
      <main
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          padding: "26px 30px 60px",
        }}
      >
        {/* ── Topbar ── */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 20,
            marginBottom: 20,
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 27,
                fontWeight: 800,
                letterSpacing: "-.03em",
                margin: "0 0 4px",
                color: "var(--ink)",
              }}
            >
              Bonjour{user ? `, ${user.firstName}` : ""}
            </h1>
            <p style={{ margin: 0, fontSize: "13.5px", color: "var(--ink-2)" }}>
              {dateLabelCap} ·{" "}
              <span style={{ fontFamily: "var(--font-mono)", color: "var(--ink-3)" }}>
                {totalFilItems} point{totalFilItems !== 1 ? "s" : ""}
              </span>{" "}
              cousus pour aujourd&apos;hui
            </p>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <KnowledgeSearch className="w-72 hidden sm:block" />
          </div>
        </div>

        {/* ── StatLine ── */}
        <div style={{ display: "flex", gap: 10, marginBottom: 26, flexWrap: "wrap" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "9px 14px 9px 11px",
              borderRadius: 13,
              background: "var(--surface)",
              border: "1px solid var(--line)",
              boxShadow: "var(--sh-1)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 18,
                fontWeight: 800,
                letterSpacing: "-.02em",
                lineHeight: 1,
              }}
            >
              {totalToday}
            </span>
            <span style={{ fontSize: 12, color: "var(--ink-2)", fontWeight: 500, lineHeight: 1.15 }}>
              consultation{totalToday !== 1 ? "s" : ""}
              <br />
              aujourd&apos;hui
            </span>
          </div>

          {pendingCoordCount > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                padding: "9px 14px 9px 11px",
                borderRadius: 13,
                background: "var(--surface)",
                border: "1px solid var(--line)",
                boxShadow: "var(--sh-1)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 18,
                  fontWeight: 800,
                  letterSpacing: "-.02em",
                  lineHeight: 1,
                  color: "var(--violet)",
                }}
              >
                {pendingCoordCount}
              </span>
              <span style={{ fontSize: 12, color: "var(--ink-2)", fontWeight: 500, lineHeight: 1.15 }}>
                demande{pendingCoordCount !== 1 ? "s" : ""} de
                <br />
                coordination
              </span>
            </div>
          )}

          {nextConsult && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                padding: "9px 14px 9px 11px",
                borderRadius: 13,
                background: "linear-gradient(120deg, var(--violet-soft), var(--surface))",
                border: "1px solid var(--violet-tint)",
                boxShadow: "var(--sh-1)",
                cursor: "pointer",
              }}
              onClick={() => setSelectedId(nextConsult.id)}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "var(--violet)",
                  boxShadow: "0 0 0 4px var(--violet-tint)",
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.15, color: "var(--ink-2)" }}>
                Prochain&nbsp;{" "}
                <b style={{ fontFamily: "var(--font-sans)", fontWeight: 700, color: "var(--violet-h)" }}>
                  {nextConsult.patient.split(" ")[0]} {nextConsult.patient.split(" ")[1]?.[0]}.
                </b>
                {" · "}
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{nextConsult.time}</span>
              </span>
            </div>
          )}
        </div>

        {/* ── AgendaStrip ── */}
        {consultations.length > 0 && <AgendaStrip consultations={consultations} />}

        {/* ── Le Fil container ── */}
        <div ref={filRef} style={{ position: "relative" }}>
          <FilThread containerRef={filRef} />

          {/* Section: Consultations */}
          <p
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: ".1em",
              textTransform: "uppercase",
              color: "var(--ink-faint)",
              margin: "0 0 14px",
              paddingLeft: 60,
              position: "relative",
              zIndex: 3,
            }}
          >
            Consultations · aujourd&apos;hui
          </p>

          <div style={{ paddingLeft: 60, position: "relative", zIndex: 3 }}>
            {isLoading && (
              <div
                className="card"
                style={{ marginBottom: 13, display: "flex", alignItems: "center", gap: 12, padding: "18px 20px" }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    border: "2px solid var(--violet)",
                    borderTopColor: "transparent",
                    animation: "spin 0.7s linear infinite",
                  }}
                />
                <span style={{ fontSize: 13, color: "var(--ink-3)" }}>Chargement des consultations…</span>
              </div>
            )}
            {isError && (
              <div className="card" style={{ marginBottom: 13 }}>
                <p style={{ fontSize: 13, color: "var(--critical)", margin: 0 }}>
                  Erreur de chargement —{" "}
                  <button
                    onClick={() => refetch()}
                    style={{ color: "var(--violet)", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                  >
                    Réessayer
                  </button>
                </p>
              </div>
            )}
            {!isLoading && !isError && consultations.length === 0 && (
              <div className="empty" style={{ paddingLeft: 0 }}>
                <h4>Aucune consultation aujourd&apos;hui</h4>
                <p>Votre agenda est libre — profitez-en pour avancer sur les dossiers.</p>
              </div>
            )}
            {consultations.map((c: DashboardConsultation) => (
              <FilCardConsult
                key={c.id}
                c={c}
                selected={selectedId === c.id}
                onSelect={() => setSelectedId(c.id)}
                onStart={() => handleStartConsultation(c)}
                onPrep={() =>
                  c.careCaseId &&
                  window.dispatchEvent(
                    new CustomEvent("nami-prep-mode", {
                      detail: { careCaseId: c.careCaseId, patientName: c.patient, time: c.time },
                    })
                  )
                }
              />
            ))}
          </div>

          {/* Section: Tâches & demandes */}
          {(pendingReferrals.length > 0 || pendingConnReqs.length > 0 || pendingTasks.length > 0) && (
            <>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                  color: "var(--ink-faint)",
                  margin: "28px 0 14px",
                  paddingLeft: 60,
                  position: "relative",
                  zIndex: 3,
                }}
              >
                Tâches &amp; demandes · à traiter
              </p>

              <div style={{ paddingLeft: 60, position: "relative", zIndex: 3 }}>
                {pendingReferrals.map((ref) => (
                  <FilCardReferral
                    key={ref.id}
                    referral={ref}
                    onAccept={() => acceptRefMut.mutate((ref as any).id)}
                    onDecline={() => declineRefMut.mutate((ref as any).id)}
                  />
                ))}
                {pendingConnReqs.map((cr) => (
                  <FilCardRequest
                    key={cr.id}
                    request={cr}
                    onAccept={() => acceptConnMut.mutate(cr.id)}
                    onDecline={() => declineConnMut.mutate(cr.id)}
                  />
                ))}
                {pendingTasks.slice(0, 5).map((t) => (
                  <FilCardTask
                    key={t.id}
                    task={t}
                    onComplete={() => completeMut.mutate(t)}
                    onNavigate={() => t.careCase?.id && router.push(`/patients/${t.careCase.id}`)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── Widgets secondaires — hors fil, compacts ── */}
        <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 12 }}>
          <SecretariatLinkRequestsWidget />
          <CockpitDmBadgeCard />
        </div>

        {/* ── Footer légal ── */}
        <div
          className="legal"
          style={{
            textAlign: "center",
            marginTop: 40,
            paddingTop: 16,
            borderTop: "1px solid var(--line)",
          }}
        >
          Outil de coordination · Non dispositif médical · Conforme RGPD
        </div>
      </main>

      {/* ── Detail Rail ── */}
      <DetailRail
        consultation={railConsult}
        onStart={() => railConsult && handleStartConsultation(railConsult)}
        onOpenDossier={() =>
          railConsult?.careCaseId && router.push(`/patients/${railConsult.careCaseId}`)
        }
      />
    </div>
  );
}
