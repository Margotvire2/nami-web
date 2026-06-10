"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiWithToken } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { groupByFamily, getFamilyLabel } from "@/lib/pathwayFamilyLabels";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Route, Loader2, Search, Plus, CalendarClock, Users } from "lucide-react";
import { ParcoursTimeline } from "./_components/parcours/ParcoursTimeline";
import { buildUnifiedSteps, deriveCardType } from "@/lib/parcours";
import type { UnifiedStep } from "@/lib/parcours";
import { EvaluationBrief } from "./_components/parcours/EvaluationBrief";
import { SuiviBrief } from "./_components/parcours/SuiviBrief";
import { RcpBrief } from "./_components/parcours/RcpBrief";
import { labelSpecialty, cleanTitle } from "@/lib/pcr-labels";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TeamMember {
  firstName: string;
  lastName: string;
  role: string;
  specialty: string | null;
}

interface PatientConfig {
  pathway: {
    name: string;
    family: string;
    phases: unknown[];
    currentPhase: string | null;
    dayInPathway: number;
    startedAt: string;
  } | null;
  team: TeamMember[];
  nextAppointment: { date: string; provider: string; type: string } | null;
}

// ─── Inner component — reads searchParams (must be inside Suspense) ────────────

function ViewParcoursInner({ careCaseId }: { careCaseId: string }) {
  const { accessToken } = useAuthStore();
  const api = apiWithToken(accessToken!);
  const searchParams = useSearchParams();
  const forceTemplateKey = searchParams.get("forceTemplateKey") ?? undefined;
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);

  // Patient config (team, nextAppointment, pathway header)
  const { data: config, isLoading: configLoading } = useQuery<PatientConfig>({
    queryKey: ["patient-config", careCaseId],
    queryFn: async () => {
      const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
      const res = await fetch(`${API_URL}/care-cases/${careCaseId}/patient-config`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("patient-config failed");
      return res.json() as Promise<PatientConfig>;
    },
    staleTime: 60_000,
  });

  // Pathway graph (CIE nodes — instancié)
  const { data: graphData, isLoading: graphLoading } = useQuery({
    queryKey: ["pathway-graph", careCaseId],
    queryFn: () => api.careCases.pathwayGraph(careCaseId).catch(() => null),
    staleTime: 30_000,
  });

  const hasNodes = (graphData?.nodes?.length ?? 0) > 0;

  // Template steps — always fetched for unified timeline; forceTemplateKey bypasse le resolver
  const { data: templateData, isLoading: templateLoading } = useQuery({
    queryKey: ["pathway-template-steps", careCaseId, forceTemplateKey ?? "default"],
    queryFn: () => api.careCases.pathwayTemplateSteps(careCaseId, forceTemplateKey),
    staleTime: 300_000,
    enabled: !graphLoading,
  });

  const isLoading = configLoading || graphLoading || templateLoading;

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 780 }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="card"
            style={{ height: 80, background: "var(--paper-2, #F5F5F8)", animation: "pulse 1.5s ease-in-out infinite" }}
          />
        ))}
      </div>
    );
  }

  const pathway = graphData?.pathway ?? templateData?.pathway ?? null;

  if (!pathway) {
    return <EmptyState careCaseId={careCaseId} />;
  }

  const startedAt = config?.pathway?.startedAt ?? graphData?.pathwayStartedAt ?? null;
  const dayInPathway = config?.pathway?.dayInPathway ?? 0;

  // Unified steps for detail panel (same inputs as ParcoursTimeline — pure function, cheap)
  const unifiedSteps = buildUnifiedSteps(
    templateData?.steps ?? [],
    hasNodes ? (graphData?.nodes ?? []) : [],
  );
  const firstWithProtocol = unifiedSteps.find((s) => !!s.protocolContent) ?? unifiedSteps[0] ?? null;
  const effectiveId = selectedStepId ?? firstWithProtocol?.id ?? null;
  const selectedStep = effectiveId ? (unifiedSteps.find((s) => s.id === effectiveId) ?? null) : null;

  return (
    <div style={{ display: "flex", gap: 24, maxWidth: 1320, alignItems: "flex-start" }}>
      {/* Master panel — phases + consultation list */}
      <div style={{
        width: 400,
        flexShrink: 0,
        alignSelf: "flex-start",
        position: "sticky",
        top: 24,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}>
        <ParcoursTimeline
          meta={{ pathway, startedAt, dayInPathway, summary: graphData?.summary ?? null }}
          templateSteps={templateData?.steps ?? []}
          nodes={hasNodes ? (graphData?.nodes ?? []) : []}
          selectedStepId={effectiveId}
          onSelectStep={setSelectedStepId}
        />

        {/* Équipe + RDV — stacked vertically dans le master */}
        {(config?.team?.length || config?.nextAppointment) && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {(config.team?.length ?? 0) > 0 && (
              <div className="card" style={{ padding: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <Users size={12} style={{ color: "var(--ink-faint)" }} />
                  <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-faint)", margin: 0, fontFamily: "var(--font-ui)" }}>
                    Équipe de soins
                  </p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {config.team.map((m, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: "50%",
                        background: "rgba(91,78,196,0.08)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 10, fontWeight: 700, color: "var(--violet)", flexShrink: 0,
                      }}>
                        {m.firstName[0]}{m.lastName[0]}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {m.firstName} {m.lastName}
                        </p>
                        <p style={{ fontSize: 10.5, color: "var(--ink-faint)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {m.specialty ?? m.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {config?.nextAppointment && (
              <div className="card" style={{ padding: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <CalendarClock size={12} style={{ color: "var(--ink-faint)" }} />
                  <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-faint)", margin: 0, fontFamily: "var(--font-ui)" }}>
                    Prochain rendez-vous
                  </p>
                </div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", margin: "0 0 2px" }}>
                  {new Date(config.nextAppointment.date).toLocaleDateString("fr-FR", {
                    weekday: "long", day: "numeric", month: "long",
                  })}
                </p>
                <p style={{ fontSize: 12, color: "var(--ink-2)", margin: 0 }}>
                  {new Date(config.nextAppointment.date).toLocaleTimeString("fr-FR", {
                    hour: "2-digit", minute: "2-digit",
                  })}
                  {" · "}{config.nextAppointment.provider}
                </p>
                <p style={{ fontSize: 11, color: "var(--ink-faint)", margin: "2px 0 0" }}>
                  {config.nextAppointment.type}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail panel — protocole de la consultation sélectionnée */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {selectedStep ? (
          <DetailPanel step={selectedStep} />
        ) : (
          <div className="card" style={{ padding: "48px 24px", textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "var(--ink-faint)", margin: 0 }}>
              Sélectionnez une consultation pour voir son protocole.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── DetailPanel — protocole de la consultation sélectionnée ─────────────────

const ACT_TYPE_DETAIL: Record<string, string> = {
  CONSULTATION: "Consultation", BILAN: "Bilan", QUESTIONNAIRE: "Questionnaire",
  PRESCRIPTION: "Prescription", SUIVI: "Suivi", DOCUMENT: "Document",
  RCP: "RCP", PSYCHOTHERAPIE: "Psychothérapie", EDUCATION: "Éducation thérapeutique",
};

function DetailPanel({ step }: { step: UnifiedStep }) {
  const cardType = deriveCardType({ clinicalActType: step.clinicalActType, protocolContent: step.protocolContent });
  const protocol = step.protocolContent;
  const specialty = labelSpecialty(step.specialty);

  return (
    <div className="card" style={{ padding: "20px 24px" }}>
      {/* Header */}
      <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid var(--line)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
          <span style={{
            display: "inline-flex", alignItems: "center",
            fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
            padding: "2px 7px", borderRadius: "var(--r-sm)",
            border: "1px solid var(--line)", color: "var(--ink-3)", fontFamily: "var(--font-ui)",
          }}>
            {ACT_TYPE_DETAIL[step.clinicalActType] ?? step.clinicalActType}
          </span>
          {specialty !== "—" && (
            <span style={{ fontSize: 12, color: "var(--ink-faint)", fontFamily: "var(--font-ui)" }}>
              {specialty}
            </span>
          )}
        </div>
        <h3 style={{ fontFamily: "var(--font-sans)", fontSize: 16, fontWeight: 800, color: "var(--ink)", margin: "0 0 8px", lineHeight: 1.2 }}>
          {cleanTitle(step.actLabel)}
        </h3>
        <span className="badge-ia">Brouillon IA — à vérifier</span>
      </div>

      {/* Protocol content */}
      {protocol ? (
        <>
          {cardType === "EVALUATION" && <EvaluationBrief protocol={protocol} actLabel={step.actLabel} />}
          {cardType === "SUIVI" && <SuiviBrief protocol={protocol} />}
          {cardType === "RCP" && <RcpBrief protocol={protocol} />}
        </>
      ) : (
        <div className="empty" style={{ padding: "32px 0", textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "var(--ink-faint)", margin: 0 }}>
            Protocole en attente de validation clinique.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Public export — wraps in Suspense for useSearchParams ────────────────────

export function ViewParcours({ careCaseId }: { careCaseId: string }) {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 780 }}>
        {[1, 2].map((i) => (
          <div key={i} className="card" style={{ height: 80, background: "var(--paper-2, #F5F5F8)" }} />
        ))}
      </div>
    }>
      <ViewParcoursInner careCaseId={careCaseId} />
    </Suspense>
  );
}

// ─── EmptyState — sélection et assignation d'un parcours ─────────────────────

function EmptyState({ careCaseId }: { careCaseId: string }) {
  const [showPanel, setShowPanel] = useState(false);

  if (showPanel) {
    return (
      <div style={{ maxWidth: 780 }}>
        <PathwayAssignPanel careCaseId={careCaseId} onClose={() => setShowPanel(false)} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 780 }}>
      <div className="card" style={{ padding: "48px 24px", textAlign: "center" }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16,
          background: "var(--teal, #2BA89C)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
          boxShadow: "0 4px 16px rgba(43,168,156,0.25)",
        }}>
          <Route size={28} color="#fff" />
        </div>
        <h3 style={{ fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 700, color: "var(--ink)", margin: "0 0 8px" }}>
          Aucun parcours de soins assigné
        </h3>
        <p style={{ fontSize: 13, color: "var(--ink-faint)", margin: "0 auto 24px", maxWidth: 360, lineHeight: 1.55 }}>
          Affecter votre patient à un protocole de soin ou un parcours de soin
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 24 }}>
          {["Anorexie mentale", "Obésité complexe", "PCR Nutrition", "Épilepsie pédiatrique"].map((ex) => (
            <span key={ex} style={{
              fontSize: 11, fontWeight: 600,
              padding: "3px 12px", borderRadius: 999,
              background: "rgba(43,168,156,0.10)",
              color: "var(--teal, #2BA89C)",
              border: "1px solid rgba(43,168,156,0.20)",
            }}>
              {ex}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setShowPanel(true)}
          className="btn btn-primary"
          style={{ margin: "0 auto" }}
        >
          <Plus size={14} />
          Assigner un parcours structuré
        </button>
      </div>
    </div>
  );
}

// ─── PathwayAssignPanel ───────────────────────────────────────────────────────

function PathwayAssignPanel({ careCaseId, onClose }: { careCaseId: string; onClose?: () => void }) {
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();
  const apiClient = apiWithToken(accessToken!);
  const [search, setSearch] = useState("");

  const { data: pathways = [], isLoading } = useQuery<{ id: string; key: string; label: string; family: string }[]>({
    queryKey: ["pathways-all-slim"],
    queryFn: () => apiClient.intelligence.pathways(undefined, undefined, true),
    staleTime: 5 * 60 * 1000,
  });

  const filtered = pathways.filter(
    (p) =>
      !search ||
      p.label.toLowerCase().includes(search.toLowerCase()) ||
      p.family.toLowerCase().includes(search.toLowerCase())
  );

  const assignMutation = useMutation({
    mutationFn: (pathwayTemplateId: string) => apiClient.careCases.assignPathway(careCaseId, pathwayTemplateId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["patient-config", careCaseId] });
      qc.invalidateQueries({ queryKey: ["pathway-template-steps", careCaseId] });
      qc.invalidateQueries({ queryKey: ["pathway-graph", careCaseId] });
      toast.success("Parcours assigné");
      onClose?.();
    },
    onError: () => toast.error("Erreur lors de l'assignation"),
  });

  return (
    <div className="card" style={{ padding: 16 }}>
      <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-faint)", margin: "0 0 12px", fontFamily: "var(--font-ui)" }}>
        Choisir un parcours de soins
      </p>
      <div style={{ position: "relative", marginBottom: 12 }}>
        <Search size={12} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--ink-faint)" }} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom ou famille…"
          className="input"
          style={{ paddingLeft: 30, height: 36, fontSize: 12.5 }}
        />
      </div>

      <div style={{ maxHeight: 260, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
        {isLoading && (
          <div style={{ display: "flex", justifyContent: "center", padding: "16px 0" }}>
            <Loader2 size={16} style={{ color: "var(--ink-faint)", animation: "spin 1s linear infinite" }} />
          </div>
        )}
        {!isLoading && filtered.length === 0 && (
          <p style={{ fontSize: 12, color: "var(--ink-faint)", textAlign: "center", padding: "12px 0", fontStyle: "italic" }}>
            Aucun parcours trouvé
          </p>
        )}
        {!isLoading && !search &&
          groupByFamily(filtered).map(({ family: fam, label: famLabel, items }) => (
            <div key={fam}>
              <p style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-faint)", padding: "8px 4px 4px", margin: 0, fontFamily: "var(--font-ui)" }}>
                {famLabel}
              </p>
              {items.map((p) => (
                <PathwayButton
                  key={p.key}
                  label={p.label}
                  isPending={assignMutation.isPending}
                  onClick={() => assignMutation.mutate(p.id)}
                />
              ))}
            </div>
          ))}
        {!isLoading && search &&
          filtered.map((p) => (
            <PathwayButton
              key={p.key}
              label={p.label}
              family={getFamilyLabel(p.family)}
              isPending={assignMutation.isPending}
              onClick={() => assignMutation.mutate(p.id)}
            />
          ))}
      </div>
    </div>
  );
}

function PathwayButton({
  label,
  family,
  isPending,
  onClick,
}: {
  label: string;
  family?: string;
  isPending: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={isPending}
      onClick={onClick}
      className={cn(isPending && "opacity-50 cursor-not-allowed")}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "7px 12px",
        borderRadius: "var(--r-sm)",
        border: "1px solid var(--line)",
        background: "var(--surface)",
        cursor: isPending ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        transition: "border-color 180ms, background 180ms",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--teal, #2BA89C)";
        (e.currentTarget as HTMLButtonElement).style.background = "rgba(43,168,156,0.05)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--line)";
        (e.currentTarget as HTMLButtonElement).style.background = "var(--surface)";
      }}
    >
      <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {label}
      </span>
      {family && (
        <span style={{ fontSize: 9.5, padding: "2px 6px", borderRadius: "var(--r-sm)", background: "var(--paper-2, #F5F5F8)", color: "var(--ink-faint)", flexShrink: 0 }}>
          {family}
        </span>
      )}
    </button>
  );
}
