"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, CareCase, Message, Document as NamiDocument } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import Link from "next/link";
import {
  CalendarDays, AlertTriangle, ArrowLeftRight, ChevronRight,
  Bell, FileText, MessageSquare, Search, Plus, CheckSquare,
  Activity,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type AttentionReason = {
  label: string;
  tag: "no-step" | "inactive" | "alert" | "no-lead" | "risk";
};

type PatientWithReason = CareCase & { reason: AttentionReason; daysSinceActivity: number | null };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAttentionReason(c: CareCase): AttentionReason | null {
  const daysSince = c.lastActivityAt
    ? Math.floor((Date.now() - new Date(c.lastActivityAt).getTime()) / 86400000)
    : null;

  if (!c.leadProvider) return { label: "Aucun lead provider défini", tag: "no-lead" };
  if (["CRITICAL", "HIGH"].includes(c.riskLevel)) return { label: `Risque ${c.riskLevel === "CRITICAL" ? "critique" : "élevé"} — action requise`, tag: "risk" };
  if (daysSince !== null && daysSince >= 10) return { label: `Patient inactif depuis ${daysSince} jours`, tag: "inactive" };
  return null;
}

function daysAgo(dateStr: string) {
  const d = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (d === 0) return "aujourd'hui";
  if (d === 1) return "hier";
  return `il y a ${d}j`;
}

const RISK_DOT: Record<string, string> = {
  CRITICAL: "bg-severity-critical", HIGH: "bg-severity-high",
  MEDIUM: "bg-severity-warning", LOW: "bg-severity-success", UNKNOWN: "bg-muted-foreground/30",
};

const TAG_STYLE: Record<string, string> = {
  "no-step": "bg-severity-warning-bg text-severity-warning-foreground border-severity-warning-border",
  "inactive": "bg-severity-info-bg text-severity-info-foreground border-severity-info-border",
  "alert": "bg-severity-critical-bg text-severity-critical-foreground border-severity-critical-border",
  "no-lead": "bg-severity-info-bg text-severity-info-foreground border-severity-info-border",
  "risk": "bg-severity-critical-bg text-severity-critical-foreground border-severity-critical-border",
};

const ATTENTION_FILTERS = [
  { key: "all", label: "Tous" },
  { key: "risk", label: "Risque élevé" },
  { key: "inactive", label: "Inactifs" },
  { key: "no-lead", label: "Sans lead" },
];

// ─── Page principale ──────────────────────────────────────────────────────────

export default function AujourdhuiPage() {
  const { user, accessToken } = useAuthStore();
  const api = apiWithToken(accessToken!);
  const [noteOpen, setNoteOpen] = useState(false);
  const [attentionFilter, setAttentionFilter] = useState("all");

  const { data: cases, isLoading } = useQuery({
    queryKey: ["care-cases", "ACTIVE"],
    queryFn: () => api.careCases.list({ status: "ACTIVE" }),
  });

  const activeCases = cases ?? [];

  // Données réelles pour les summary cards
  const { data: todayAppointments } = useQuery({
    queryKey: ["appointments", "today"],
    queryFn: () => api.appointments.list(),
  });

  const { data: outgoingReferrals } = useQuery({
    queryKey: ["referrals", "outgoing-pending"],
    queryFn: () => api.referrals.outgoing(),
  });

  const todayAppts = (todayAppointments ?? []).filter((a: any) => {
    const d = new Date(a.startAt);
    const now = new Date();
    return d.toDateString() === now.toDateString() && a.status !== "CANCELLED";
  });

  const pendingReferrals = (outgoingReferrals ?? []).filter((r: any) =>
    ["SENT", "RECEIVED", "UNDER_REVIEW"].includes(r.status)
  );

  // Messages récents — fetch par care case puis merge
  const caseIds = useMemo(() => (cases ?? []).map((c) => c.id), [cases]);

  const { data: allMessages } = useQuery({
    queryKey: ["dashboard-messages", caseIds],
    queryFn: async () => {
      const results = await Promise.all(
        caseIds.map(async (id) => {
          const msgs = await api.messages.list(id);
          const caseData = activeCases.find((c) => c.id === id);
          return msgs.map((m: Message) => ({ ...m, _patientName: caseData ? `${caseData.patient.firstName} ${caseData.patient.lastName}` : "" }));
        })
      );
      return results.flat().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    enabled: caseIds.length > 0,
  });

  const recentMessages = (allMessages ?? []).slice(0, 4);

  // Documents récents
  const { data: allDocuments } = useQuery({
    queryKey: ["dashboard-documents", caseIds],
    queryFn: async () => {
      const results = await Promise.all(
        caseIds.map(async (id) => {
          const docs = await api.documents.list(id);
          const caseData = activeCases.find((c) => c.id === id);
          return docs.map((d: NamiDocument) => ({ ...d, _patientName: caseData ? `${caseData.patient.firstName} ${caseData.patient.lastName}` : "" }));
        })
      );
      return results.flat().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    enabled: caseIds.length > 0,
  });

  const recentDocs = (allDocuments ?? []).slice(0, 4);

  // Patients nécessitant attention — on dérive depuis les données disponibles
  const patientsAttention: PatientWithReason[] = activeCases
    .map((c) => {
      const reason = getAttentionReason(c);
      if (!reason) return null;
      const daysSince = c.lastActivityAt
        ? Math.floor((Date.now() - new Date(c.lastActivityAt).getTime()) / 86400000)
        : null;
      return { ...c, reason, daysSinceActivity: daysSince };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const order: Record<string, number> = { risk: 0, "no-lead": 1, inactive: 2, "no-step": 3, alert: 4 };
      return (order[a!.reason.tag] ?? 9) - (order[b!.reason.tag] ?? 9);
    }) as PatientWithReason[];

  const filteredAttention = attentionFilter === "all"
    ? patientsAttention
    : patientsAttention.filter((p) => p.reason.tag === attentionFilter);

  const recentCases = [...activeCases]
    .sort((a, b) => (b.lastActivityAt ?? b.startDate) > (a.lastActivityAt ?? a.startDate) ? 1 : -1)
    .slice(0, 8);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* ── Header — Level 1 surface (white on gray floor) ── */}
      <header className="bg-card px-8 py-6 shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <h1 className="text-page-title">Aujourd'hui</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
              {" · "}
              {greeting}, {user?.firstName}
            </p>
          </div>
          <div className="relative hidden md:block">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un patient, un document…"
              className="pl-10 h-10 text-sm w-80 bg-background border-0 rounded-xl focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors" title="Notifications">
              <Bell size={18} />
            </button>
            <Button size="sm" variant="secondary" className="h-10 rounded-xl border-0" onClick={() => setNoteOpen(true)}>
              <CheckSquare size={16} /> Créer une tâche
            </Button>
            <Button size="sm" className="h-10 rounded-xl" onClick={() => setNoteOpen(true)}>
              <Plus size={16} /> Ajouter une note
            </Button>
          </div>
        </div>
      </header>

      <div className="nami-page-body">
        <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">

          {/* ── Bandeau résumé rapide ── */}
          <div className="grid grid-cols-4 gap-5">
            <SummaryCard
              icon={<CalendarDays size={14} />}
              label="Consultations du jour"
              value={isLoading ? null : todayAppts.length}
              sub={todayAppts.length > 0 ? `${todayAppts.length} consultation${todayAppts.length > 1 ? "s" : ""} prévue${todayAppts.length > 1 ? "s" : ""}` : "Aucune consultation programmée"}
              href="/agenda"
              cta="Voir l'agenda"
            />
            <SummaryCard
              icon={<AlertTriangle size={14} />}
              label="Patients à surveiller"
              value={isLoading ? null : patientsAttention.length}
              sub={patientsAttention.length > 0 ? `${patientsAttention.filter(p => p.reason.tag === "risk").length} signaux critiques` : "Aucun signal actif"}
              href="#patients-attention"
              cta="Voir les patients"
              alert={patientsAttention.some((p) => p.reason.tag === "risk")}
            />
            <SummaryCard
              icon={<CheckSquare size={14} />}
              label="Tâches en retard"
              value={isLoading ? null : 0}
              sub="Aucune tâche en retard"
              href="/patients"
              cta="Voir les tâches"
            />
            <SummaryCard
              icon={<ArrowLeftRight size={14} />}
              label="Adressages en attente"
              value={isLoading ? null : pendingReferrals.length}
              sub={pendingReferrals.length > 0 ? `${pendingReferrals.length} adressage${pendingReferrals.length > 1 ? "s" : ""} en cours` : "Aucun adressage en attente"}
              href="/adressages"
              cta="Voir les adressages"
            />
          </div>

          {/* ── Layout principal 2 colonnes ── */}
          <div className="flex gap-8 items-start">

            {/* Colonne gauche 70% */}
            <div className="flex-1 min-w-0 space-y-5">

              {/* Bloc A — Consultations du jour */}
              <MainBlock
                title="Consultations du jour"
                icon={<CalendarDays size={13} />}
                action={
                  <Link href="/agenda" className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-0.5">
                    Voir l'agenda <ChevronRight size={11} />
                  </Link>
                }
              >
                <ConsultationsEmpty />
              </MainBlock>

              {/* Bloc B — Patients nécessitant mon attention */}
              <MainBlock
                title="Patients nécessitant mon attention"
                icon={<AlertTriangle size={13} className={patientsAttention.length > 0 ? "text-destructive" : ""} />}
                titleClass={patientsAttention.length > 0 ? "text-destructive" : undefined}
                action={
                  <Link href="/patients" className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-0.5">
                    Voir tous les patients <ChevronRight size={11} />
                  </Link>
                }
                id="patients-attention"
                subHeader={
                  patientsAttention.length > 0 ? (
                    <div className="flex items-center gap-1.5 px-4 py-2.5 border-b bg-muted/20">
                      {ATTENTION_FILTERS.map((f) => {
                        const count = f.key === "all"
                          ? patientsAttention.length
                          : patientsAttention.filter((p) => p.reason.tag === f.key).length;
                        if (count === 0 && f.key !== "all") return null;
                        return (
                          <button
                            key={f.key}
                            onClick={() => setAttentionFilter(f.key)}
                            className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                              attentionFilter === f.key
                                ? "bg-primary text-primary-foreground border-primary"
                                : "border-border text-muted-foreground hover:bg-muted"
                            }`}
                          >
                            {f.label}
                            {count > 0 && <span className="ml-1 opacity-70">{count}</span>}
                          </button>
                        );
                      })}
                    </div>
                  ) : null
                }
              >
                {isLoading ? (
                  <LoadingSkeleton />
                ) : filteredAttention.length === 0 ? (
                  <EmptyState
                    icon={<Activity size={20} />}
                    title="Aucun patient à surveiller"
                    sub="Aucun signal critique détecté pour le moment."
                  />
                ) : (
                  <div className="divide-y divide-border/50">
                    {filteredAttention.map((p) => (
                      <PatientAttentionRow key={p.id} patient={p} />
                    ))}
                  </div>
                )}
              </MainBlock>

              {/* Bloc C — Tâches & prochaines étapes */}
              <MainBlock
                title="Tâches & prochaines étapes"
                icon={<CheckSquare size={13} />}
                action={
                  <div className="flex items-center gap-2">
                    <Link href="/patients" className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-0.5">
                      Voir les dossiers <ChevronRight size={11} />
                    </Link>
                  </div>
                }
              >
                <EmptyState
                  icon={<CheckSquare size={20} />}
                  title="Aucune tâche en retard"
                  sub="Les tâches liées à vos dossiers actifs apparaîtront ici."
                  cta={{ label: "Voir les patients actifs", href: "/patients" }}
                />
              </MainBlock>
            </div>

            {/* Colonne droite 30% */}
            <div className="w-72 shrink-0 space-y-4">

              {/* D — Messages récents */}
              <SideBlock title="Messages récents" icon={<MessageSquare size={12} />} href="/messages">
                {recentMessages.length === 0 ? (
                  <EmptyState
                    icon={<MessageSquare size={16} />}
                    title="Aucun nouveau message"
                    sub="Les échanges cliniques récents apparaîtront ici."
                    compact
                  />
                ) : (
                  <div className="space-y-2">
                    {recentMessages.map((m) => (
                      <div key={m.id} className="hover:bg-muted/40 -mx-1 px-1 py-1.5 rounded transition-colors">
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary shrink-0">
                            {m.sender.firstName[0]}{m.sender.lastName[0]}
                          </div>
                          <span className="text-[11px] font-medium truncate">{m.sender.firstName} {m.sender.lastName}</span>
                          <span className="text-[10px] text-muted-foreground/60 ml-auto shrink-0">{daysAgo(m.createdAt)}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">{m.body}</p>
                        {m._patientName && <p className="text-[9px] text-muted-foreground/50 mt-0.5">{m._patientName}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </SideBlock>

              {/* E — Documents récents */}
              <SideBlock title="Documents récents" icon={<FileText size={12} />} href="/documents">
                {recentDocs.length === 0 ? (
                  <EmptyState
                    icon={<FileText size={16} />}
                    title="Aucun document récent"
                    sub="Les bilans et comptes rendus récents apparaîtront ici."
                    compact
                  />
                ) : (
                  <div className="space-y-1.5">
                    {recentDocs.map((d) => (
                      <div key={d.id} className="flex items-start gap-2 hover:bg-muted/40 -mx-1 px-1 py-1.5 rounded transition-colors">
                        <FileText size={12} className="text-muted-foreground shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-medium truncate">{d.title}</p>
                          <p className="text-[10px] text-muted-foreground/60">{d._patientName} · {daysAgo(d.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </SideBlock>

              {/* F — Alertes actives */}
              <SideBlock
                title="Alertes actives"
                icon={<Bell size={12} />}
                href="/alertes"
                titleClass={patientsAttention.some((p) => p.reason.tag === "risk") ? "text-destructive" : undefined}
              >
                {patientsAttention.filter((p) => p.reason.tag === "risk").length === 0 ? (
                  <EmptyState
                    icon={<Bell size={16} />}
                    title="Aucune alerte critique"
                    sub="Aucun signal critique détecté pour le moment."
                    compact
                  />
                ) : (
                  <div className="space-y-2">
                    {patientsAttention
                      .filter((p) => p.reason.tag === "risk")
                      .slice(0, 4)
                      .map((p) => (
                        <Link key={p.id} href={`/patients/${p.id}`}>
                          <div className="flex items-start gap-2 hover:bg-muted/40 -mx-1 px-1 py-1.5 rounded transition-colors group">
                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${RISK_DOT[p.riskLevel]}`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">
                                {p.patient.firstName} {p.patient.lastName}
                              </p>
                              <p className="text-[10px] text-muted-foreground truncate">{p.reason.label}</p>
                            </div>
                            <ChevronRight size={11} className="text-muted-foreground/0 group-hover:text-muted-foreground/40 shrink-0 mt-0.5" />
                          </div>
                        </Link>
                      ))}
                  </div>
                )}
              </SideBlock>

              {/* Accès rapide — dossiers récents */}
              <SideBlock title="Dossiers récents" icon={<Activity size={12} />} href="/patients">
                {isLoading ? (
                  <div className="space-y-1.5">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-8 rounded" />)}
                  </div>
                ) : recentCases.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground/60 py-1">Aucun dossier actif.</p>
                ) : (
                  <div className="space-y-0.5">
                    {recentCases.slice(0, 5).map((c) => (
                      <Link key={c.id} href={`/patients/${c.id}`}>
                        <div className="flex items-center gap-2 hover:bg-muted/40 -mx-1 px-1 py-1.5 rounded transition-colors group">
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${RISK_DOT[c.riskLevel]}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs truncate">{c.patient.firstName} {c.patient.lastName}</p>
                          </div>
                          {c.lastActivityAt && (
                            <span className="text-[10px] text-muted-foreground/60 shrink-0">{daysAgo(c.lastActivityAt)}</span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </SideBlock>
            </div>
          </div>
        </div>
      </div>

      {/* Note sheet global */}
      <NoteSheet open={noteOpen} onClose={() => setNoteOpen(false)} api={api} cases={activeCases} />
    </div>
  );
}

// ─── Patient attention row ────────────────────────────────────────────────────

function PatientAttentionRow({ patient: p }: { patient: PatientWithReason }) {
  return (
    <div className="px-4 py-3.5 hover:bg-muted/30 transition-colors group">
      <div className="flex items-start gap-3">
        {/* Avatar + dot */}
        <div className="relative shrink-0">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary">
            {p.patient.firstName[0]}{p.patient.lastName[0]}
          </div>
          <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background ${RISK_DOT[p.riskLevel]}`} />
        </div>

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium">
                  {p.patient.firstName} {p.patient.lastName}
                </p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${TAG_STYLE[p.reason.tag]}`}>
                  {p.reason.label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {p.caseType}
                {p.leadProvider && <> · Lead : {p.leadProvider.person.firstName} {p.leadProvider.person.lastName}</>}
                {p.lastActivityAt && <> · Dernier contact : {daysAgo(p.lastActivityAt)}</>}
              </p>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="flex items-center gap-1.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Link href={`/patients/${p.id}`}>
              <Button size="sm" variant="outline" className="text-[11px] h-6 px-2.5">
                Ouvrir dossier
              </Button>
            </Link>
            <Link href={`/patients/${p.id}`}>
              <Button size="sm" variant="ghost" className="text-[11px] h-6 px-2.5 text-muted-foreground">
                Voir la timeline
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Consultations empty state intelligent ────────────────────────────────────

function ConsultationsEmpty() {
  return (
    <div className="px-4 py-8 text-center space-y-2">
      <CalendarDays size={24} className="text-muted-foreground/30 mx-auto" />
      <p className="text-sm text-muted-foreground font-medium">Aucune consultation prévue aujourd'hui</p>
      <p className="text-xs text-muted-foreground/70 max-w-xs mx-auto">
        Vous pouvez avancer sur les tâches, revoir vos patients à surveiller ou organiser vos prochains suivis.
      </p>
      <div className="flex items-center justify-center gap-2 mt-3">
        <Link href="/agenda">
          <Button size="sm" variant="outline" className="text-xs h-7">Voir l'agenda</Button>
        </Link>
        <Link href="/patients">
          <Button size="sm" variant="ghost" className="text-xs h-7 text-muted-foreground">Voir mes patients</Button>
        </Link>
      </div>
    </div>
  );
}

// ─── Note sheet global ────────────────────────────────────────────────────────

function NoteSheet({ open, onClose, api, cases }: {
  open: boolean;
  onClose: () => void;
  api: ReturnType<typeof apiWithToken>;
  cases: CareCase[];
}) {
  const qc = useQueryClient();
  const [body, setBody] = useState("");
  const [selectedCase, setSelectedCase] = useState("");

  const create = useMutation({
    mutationFn: () => api.notes.create(selectedCase, { noteType: "GENERAL", body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["timeline", selectedCase] });
      qc.invalidateQueries({ queryKey: ["notes", selectedCase] });
      setBody("");
      setSelectedCase("");
      onClose();
      toast.success("Note ajoutée au dossier");
    },
    onError: () => toast.error("Erreur lors de l'ajout"),
  });

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-[440px] sm:w-[500px] flex flex-col">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="text-sm font-semibold">Nouvelle note clinique</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Dossier patient</label>
            <select
              value={selectedCase}
              onChange={(e) => setSelectedCase(e.target.value)}
              className="w-full text-sm border rounded-md px-3 py-2 bg-background"
            >
              <option value="">Sélectionner un patient…</option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.patient.firstName} {c.patient.lastName} — {c.caseTitle}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Note</label>
            <Textarea
              placeholder="Rédiger une note clinique…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              className="resize-none text-sm"
              autoFocus
            />
          </div>
        </div>
        <div className="pt-4 border-t flex gap-2">
          <Button
            className="flex-1 text-sm"
            disabled={!body.trim() || !selectedCase || create.isPending}
            onClick={() => create.mutate()}
          >
            {create.isPending ? "Enregistrement…" : "Enregistrer la note"}
          </Button>
          <Button variant="outline" onClick={onClose} className="text-sm">Annuler</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Blocs layout ─────────────────────────────────────────────────────────────

function MainBlock({ title, icon, titleClass, action, subHeader, children, id }: {
  title: string;
  icon: React.ReactNode;
  titleClass?: string;
  action?: React.ReactNode;
  subHeader?: React.ReactNode;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <div id={id} className="nami-card overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4">
        <div className={`text-label flex items-center gap-2 ${titleClass ?? ""}`}>
          {icon} {title}
        </div>
        {action}
      </div>
      {subHeader}
      <div>{children}</div>
    </div>
  );
}

function SideBlock({ title, icon, titleClass, href, children }: {
  title: string;
  icon: React.ReactNode;
  titleClass?: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <div className="nami-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5">
        <div className={`text-label flex items-center gap-2 ${titleClass ?? ""}`}>
          {icon} {title}
        </div>
        <Link href={href} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors font-medium">
          Voir tout <ChevronRight size={12} />
        </Link>
      </div>
      <div className="px-5 py-3">{children}</div>
    </div>
  );
}

function SummaryCard({ icon, label, value, sub, href, cta, alert }: {
  icon: React.ReactNode;
  label: string;
  value: number | string | null;
  sub: string;
  href: string;
  cta: string;
  alert?: boolean;
}) {
  return (
    <Link href={href}>
      <div className={`nami-card p-6 space-y-3 ${alert ? "" : ""}`}>
        <div className={`text-label ${alert ? "text-severity-critical-foreground" : ""}`}>
          <span className="flex items-center gap-2">{icon} {label}</span>
        </div>
        {value === null ? (
          <Skeleton className="h-10 w-14 rounded-lg" />
        ) : (
          <p className={`text-kpi ${alert ? "!text-severity-critical" : ""}`}>{value}</p>
        )}
        <p className="text-sm text-muted-foreground leading-snug">{sub}</p>
        <p className={`text-sm font-semibold ${alert ? "text-severity-critical" : "text-primary"}`}>{cta} →</p>
      </div>
    </Link>
  );
}

function EmptyState({ icon, title, sub, cta, compact }: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  cta?: { label: string; href: string };
  compact?: boolean;
}) {
  return (
    <div className={`flex flex-col items-center text-center ${compact ? "py-4 gap-1.5" : "py-10 gap-2"}`}>
      <div className="text-muted-foreground/25">{icon}</div>
      <p className={`font-medium text-muted-foreground ${compact ? "text-caption" : "text-sm"}`}>{title}</p>
      <p className={`text-muted-foreground/60 max-w-xs ${compact ? "text-micro" : "text-caption"}`}>{sub}</p>
      {cta && (
        <Link href={cta.href} className="mt-2">
          <Button size="sm" variant="outline">{cta.label}</Button>
        </Link>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="divide-y divide-border/50">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="px-4 py-3.5 flex items-start gap-3">
          <Skeleton className="w-8 h-8 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-64" />
          </div>
        </div>
      ))}
    </div>
  );
}
