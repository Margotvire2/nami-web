"use client";

import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, Referral, CreateReferralInput } from "@/lib/api";
import { useOutgoingReferrals, useIncomingReferrals } from "@/hooks/useReferrals";
import { getStatusMeta, getPriorityMeta, getSenderActions } from "@/lib/referrals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import Link from "next/link";
import {
  ArrowLeftRight, Search, Plus, ChevronRight, Clock,
  CheckCircle2, XCircle, Send, ArrowRight,
  X, FileText,
} from "lucide-react";

// ─── Tabs ────────────────────────────────────────────────────────────────────

const TABS = [
  { key: "outgoing", label: "Envoyés" },
  { key: "incoming", label: "Reçus" },
] as const;

type Tab = (typeof TABS)[number]["key"];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AdressagesPage() {
  const [tab, setTab] = useState<Tab>("outgoing");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const outgoing = useOutgoingReferrals();
  const incoming = useIncomingReferrals();

  const allOutgoing = outgoing.data ?? [];
  const allIncoming = incoming.data ?? [];
  const isLoading = tab === "outgoing" ? outgoing.isLoading : incoming.isLoading;
  const referrals = tab === "outgoing" ? allOutgoing : allIncoming;

  const filtered = referrals.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.clinicalReason.toLowerCase().includes(q) ||
      r.careCase.caseTitle.toLowerCase().includes(q) ||
      r.sender.firstName.toLowerCase().includes(q) ||
      r.sender.lastName.toLowerCase().includes(q) ||
      (r.targetProvider?.person.firstName ?? "").toLowerCase().includes(q) ||
      (r.targetProvider?.person.lastName ?? "").toLowerCase().includes(q) ||
      (r.preferredSpecialty ?? "").toLowerCase().includes(q)
    );
  });

  const activeOut = allOutgoing.filter((r) => getStatusMeta(r.status).isActive).length;
  const blockedOut = allOutgoing.filter((r) => getStatusMeta(r.status).isBlocked).length;
  const pendingIn = allIncoming.filter((r) => ["SENT", "RECEIVED", "UNDER_REVIEW"].includes(r.status)).length;

  return (
    <div className="h-full flex flex-col overflow-hidden bg-muted/10">
      {/* Header */}
      <div className="border-b bg-card px-6 py-4 shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-base font-semibold flex items-center gap-2">
              <ArrowLeftRight size={16} /> Adressages
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Orientations et coordination avec le réseau de soin
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Rechercher…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-8 text-xs w-56" />
            </div>
            <Button size="sm" className="text-xs gap-1.5 h-8" onClick={() => setCreateOpen(true)}>
              <Plus size={12} /> Nouvel adressage
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs + KPIs */}
      <div className="border-b bg-card px-6 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex">
            {TABS.map((t) => {
              const count = t.key === "outgoing" ? allOutgoing.length : allIncoming.length;
              return (
                <button
                  key={t.key}
                  onClick={() => { setTab(t.key); setSelectedId(null); }}
                  className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors -mb-px flex items-center gap-1.5 ${
                    tab === t.key ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.label}
                  {count > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                      tab === t.key ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    }`}>{count}</span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-3 py-1.5 text-[11px]">
            <span className="text-muted-foreground">{activeOut} en cours</span>
            {blockedOut > 0 && <span className="text-destructive font-medium">{blockedOut} bloqué{blockedOut > 1 ? "s" : ""}</span>}
            {pendingIn > 0 && <span className="text-amber-600 font-medium">{pendingIn} en attente</span>}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Liste */}
        <div className={`${selectedId ? "w-1/2" : "flex-1"} overflow-y-auto transition-all`}>
          {isLoading ? (
            <div className="p-4 space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <ArrowLeftRight size={24} className="text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                {search ? "Aucun adressage trouvé." : tab === "outgoing" ? "Aucun adressage envoyé." : "Aucun adressage reçu."}
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {filtered.map((r) => (
                <ReferralCard key={r.id} referral={r} direction={tab} isSelected={r.id === selectedId} onSelect={() => setSelectedId(selectedId === r.id ? null : r.id)} />
              ))}
            </div>
          )}
        </div>

        {/* Panneau détail */}
        {selectedId && (
          <div className="w-1/2 border-l bg-white overflow-y-auto">
            <ReferralDetailPanel referralId={selectedId} direction={tab} onClose={() => setSelectedId(null)} />
          </div>
        )}
      </div>

      {/* Modale création */}
      {createOpen && <CreateReferralModal onClose={() => setCreateOpen(false)} />}
    </div>
  );
}

// ─── Carte referral ──────────────────────────────────────────────────────────

function ReferralCard({ referral: r, direction, isSelected, onSelect }: {
  referral: Referral; direction: Tab; isSelected: boolean; onSelect: () => void;
}) {
  const statusMeta = getStatusMeta(r.status);
  const priorityMeta = getPriorityMeta(r.priority);

  const targetName = r.targetProvider
    ? `${r.targetProvider.person.firstName} ${r.targetProvider.person.lastName}`
    : r.preferredSpecialty ?? "Pool";

  return (
    <div
      onClick={onSelect}
      className={`rounded-xl border bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] cursor-pointer transition-all ${
        isSelected ? "ring-2 ring-primary/30 border-primary/30" : "hover:shadow-md"
      } ${statusMeta.isBlocked ? "border-l-[3px] border-l-red-400" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${statusMeta.badgeClass}`}>{statusMeta.label}</span>
            {r.priority !== "ROUTINE" && (
              <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${priorityMeta.badgeClass}`}>{priorityMeta.label}</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            {direction === "outgoing" ? (
              <><span className="text-muted-foreground">→</span><span className="font-medium">{targetName}</span></>
            ) : (
              <><span className="text-muted-foreground">de</span><span className="font-medium">{r.sender.firstName} {r.sender.lastName}</span></>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{r.clinicalReason}</p>
          <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
            <Link href={`/patients/${r.careCase.id}`} className="hover:text-foreground flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <FileText size={10} /> {r.careCase.caseTitle}
            </Link>
            <span className="flex items-center gap-1"><Clock size={10} /> {daysAgoShort(r.createdAt)}</span>
          </div>
        </div>
        <ChevronRight size={14} className="text-muted-foreground/30 shrink-0 mt-1" />
      </div>
    </div>
  );
}

// ─── Panneau détail ──────────────────────────────────────────────────────────

function ReferralDetailPanel({ referralId, direction, onClose }: {
  referralId: string; direction: Tab; onClose: () => void;
}) {
  const { accessToken } = useAuthStore();
  const api = apiWithToken(accessToken!);
  const qc = useQueryClient();

  const { data: referral, isLoading } = useQuery({
    queryKey: ["referral", referralId],
    queryFn: () => api.referrals.get(referralId),
  });

  const respond = useMutation({
    mutationFn: ({ decision, note }: { decision: "ACCEPTED" | "DECLINED"; note?: string }) =>
      api.referrals.respond(referralId, decision, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["referrals"] });
      qc.invalidateQueries({ queryKey: ["referral", referralId] });
      toast.success("Réponse envoyée");
    },
    onError: () => toast.error("Erreur"),
  });

  const updateStatus = useMutation({
    mutationFn: (status: string) => api.referrals.updateStatus(referralId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["referrals"] });
      qc.invalidateQueries({ queryKey: ["referral", referralId] });
      toast.success("Statut mis à jour");
    },
    onError: () => toast.error("Erreur"),
  });

  if (isLoading || !referral) {
    return <div className="p-6 space-y-3"><Skeleton className="h-6 w-32" /><Skeleton className="h-20" /><Skeleton className="h-16" /></div>;
  }

  const statusMeta = getStatusMeta(referral.status);
  const priorityMeta = getPriorityMeta(referral.priority);
  const senderActions = direction === "outgoing" ? getSenderActions(referral.status) : [];
  const canRespond = direction === "incoming" && ["SENT", "RECEIVED", "UNDER_REVIEW"].includes(referral.status);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-3.5 border-b shrink-0">
        <h3 className="text-sm font-semibold">Détail de l'adressage</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Statut + priorité */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[11px] font-bold uppercase px-2 py-1 rounded border ${statusMeta.badgeClass}`}>{statusMeta.label}</span>
          <span className={`text-[11px] font-bold uppercase px-2 py-1 rounded border ${priorityMeta.badgeClass}`}>{priorityMeta.label}</span>
          <span className="text-[11px] text-muted-foreground">{referral.mode === "DIRECT" ? "Direct" : "Pool"}</span>
        </div>

        {/* Envoyeur → Destinataire */}
        <div className="rounded-xl border bg-muted/10 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
              {referral.sender.firstName[0]}{referral.sender.lastName[0]}
            </div>
            <div>
              <p className="text-xs font-medium">{referral.sender.firstName} {referral.sender.lastName}</p>
              <p className="text-[10px] text-muted-foreground">Envoyeur</p>
            </div>
          </div>
          <div className="flex items-center justify-center"><ArrowRight size={14} className="text-muted-foreground" /></div>
          {referral.targetProvider ? (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-bold text-emerald-700">
                {referral.targetProvider.person.firstName[0]}{referral.targetProvider.person.lastName[0]}
              </div>
              <div>
                <p className="text-xs font-medium">{referral.targetProvider.person.firstName} {referral.targetProvider.person.lastName}</p>
                <p className="text-[10px] text-muted-foreground">Destinataire{referral.preferredSpecialty ? ` — ${referral.preferredSpecialty}` : ""}</p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Pool — {referral.preferredSpecialty ?? "Spécialité non précisée"}</p>
          )}
        </div>

        {/* Bannières contextuelles */}
        {referral.desiredAppointmentDate && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-3.5 py-2.5 flex items-center gap-2">
            <Clock size={13} className="text-blue-600 shrink-0" />
            <div>
              <p className="text-[11px] font-semibold text-blue-700">RDV souhaité avant le {new Date(referral.desiredAppointmentDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}</p>
              {(() => { const d = Math.ceil((new Date(referral.desiredAppointmentDate).getTime() - Date.now()) / 86400000); return d > 0 ? <p className="text-[10px] text-blue-600">dans {d} jour{d > 1 ? "s" : ""}</p> : <p className="text-[10px] text-destructive font-medium">Date dépassée</p>; })()}
            </div>
          </div>
        )}

        {referral.urgencyNote && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3.5 py-2.5 flex items-start gap-2">
            <ArrowLeftRight size={13} className="text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold uppercase text-destructive">Urgence signalée</p>
              <p className="text-[11px] text-destructive/90 leading-relaxed">{referral.urgencyNote}</p>
            </div>
          </div>
        )}

        {/* Dossier patient */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Dossier patient</p>
          <Link href={`/patients/${referral.careCase.id}`} className="text-xs text-primary hover:underline flex items-center gap-1">
            <FileText size={11} /> {referral.careCase.caseTitle}
          </Link>
        </div>

        {/* Motif */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Motif clinique</p>
          <p className="text-sm leading-relaxed">{referral.clinicalReason}</p>
        </div>

        {referral.responseNote && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Réponse</p>
            <p className="text-sm">{referral.responseNote}</p>
          </div>
        )}

        {/* Dates */}
        <div className="space-y-1.5 text-[11px] text-muted-foreground">
          <p>Créé le {new Date(referral.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
          {referral.respondedAt && <p>Répondu le {new Date(referral.respondedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>}
          {referral.desiredAppointmentDate && <p>RDV souhaité : {new Date(referral.desiredAppointmentDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}</p>}
        </div>
      </div>

      {/* Actions */}
      <div className="border-t px-5 py-3.5 shrink-0 space-y-2">
        {canRespond && (
          <div className="flex gap-2">
            <Button size="sm" className="flex-1 text-xs gap-1.5 h-8" onClick={() => respond.mutate({ decision: "ACCEPTED" })} disabled={respond.isPending}>
              <CheckCircle2 size={12} /> Accepter
            </Button>
            <Button size="sm" variant="outline" className="flex-1 text-xs gap-1.5 h-8 text-destructive" onClick={() => respond.mutate({ decision: "DECLINED" })} disabled={respond.isPending}>
              <XCircle size={12} /> Refuser
            </Button>
          </div>
        )}
        {senderActions.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {senderActions.map((action) => (
              <Button
                key={action.action}
                size="sm"
                variant={action.action === "cancel" ? "outline" : "default"}
                className={`text-xs gap-1.5 h-8 flex-1 ${action.action === "cancel" ? "text-destructive" : ""}`}
                onClick={() => updateStatus.mutate(action.targetStatus)}
                disabled={updateStatus.isPending}
              >{action.label}</Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Modale création ─────────────────────────────────────────────────────────

function CreateReferralModal({ onClose }: { onClose: () => void }) {
  const { accessToken } = useAuthStore();
  const api = apiWithToken(accessToken!);
  const qc = useQueryClient();

  const [careCaseId, setCareCaseId] = useState("");
  const [targetProviderId, setTargetProviderId] = useState("");
  const [mode, setMode] = useState<"DIRECT" | "POOL">("DIRECT");
  const [priority, setPriority] = useState<"ROUTINE" | "URGENT" | "EMERGENCY">("ROUTINE");
  const [clinicalReason, setClinicalReason] = useState("");
  const [preferredSpecialty, setPreferredSpecialty] = useState("");
  const [urgencyNote, setUrgencyNote] = useState("");

  const { data: cases } = useQuery({ queryKey: ["care-cases", "all"], queryFn: () => api.careCases.list() });
  const { data: providers } = useQuery({
    queryKey: ["providers"],
    queryFn: () => fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/providers`)
      .then((r) => r.json()) as Promise<{ id: string; person: { firstName: string; lastName: string }; specialties: string[] }[]>,
  });

  const create = useMutation({
    mutationFn: () => api.referrals.create({
      careCaseId,
      targetProviderId: targetProviderId || undefined,
      mode,
      priority,
      clinicalReason,
      preferredSpecialty: preferredSpecialty || undefined,
      urgencyNote: urgencyNote.trim() || undefined,
      autoAddToTeam: true,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["referrals"] });
      const patient = (cases ?? []).find((c) => c.id === careCaseId);
      const provName = targetProviderId ? (providers ?? []).find((p) => p.id === targetProviderId) : null;
      toast.success(`Adressage envoyé${provName ? ` à ${provName.person.firstName} ${provName.person.lastName}` : ""}${patient ? ` pour ${patient.patient.firstName} ${patient.patient.lastName}` : ""}`);
      onClose();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Erreur"),
  });

  const canSubmit = careCaseId && (mode === "POOL" ? preferredSpecialty : targetProviderId) && clinicalReason.trim().length > 10;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b">
          <h3 className="text-sm font-semibold flex items-center gap-2"><Send size={14} /> Nouvel adressage</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
        </div>

        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Dossier patient</label>
            <select value={careCaseId} onChange={(e) => setCareCaseId(e.target.value)} className="w-full text-sm border rounded-lg px-3 py-2 bg-background">
              <option value="">Sélectionner un dossier</option>
              {(cases ?? []).map((c) => <option key={c.id} value={c.id}>{c.patient.firstName} {c.patient.lastName} — {c.caseTitle}</option>)}
            </select>
          </div>

          {/* Mode : DIRECT ou POOL */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Mode d'adressage</label>
            <div className="flex gap-2">
              <button onClick={() => { setMode("DIRECT"); }} className={`flex-1 text-xs font-medium py-1.5 rounded-lg border transition-colors ${mode === "DIRECT" ? "bg-primary/10 text-primary border-primary/30 ring-1 ring-primary/20" : "bg-white text-muted-foreground hover:bg-muted/30"}`}>
                Direct — vers un professionnel
              </button>
              <button onClick={() => { setMode("POOL"); setTargetProviderId(""); }} className={`flex-1 text-xs font-medium py-1.5 rounded-lg border transition-colors ${mode === "POOL" ? "bg-primary/10 text-primary border-primary/30 ring-1 ring-primary/20" : "bg-white text-muted-foreground hover:bg-muted/30"}`}>
                Pool — par spécialité
              </button>
            </div>
          </div>

          {mode === "DIRECT" ? (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Professionnel destinataire</label>
              <select value={targetProviderId} onChange={(e) => {
                setTargetProviderId(e.target.value);
                const prov = (providers ?? []).find((p) => p.id === e.target.value);
                if (prov?.specialties?.[0]) setPreferredSpecialty(prov.specialties[0]);
              }} className="w-full text-sm border rounded-lg px-3 py-2 bg-background">
                <option value="">Sélectionner un professionnel</option>
                {(providers ?? []).map((p) => <option key={p.id} value={p.id}>{p.person.firstName} {p.person.lastName} — {p.specialties.join(", ")}</option>)}
              </select>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Spécialité recherchée</label>
              <Input placeholder="Ex : Psychologue, Endocrinologue…" value={preferredSpecialty} onChange={(e) => setPreferredSpecialty(e.target.value)} className="text-sm" />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Priorité</label>
            <div className="flex gap-2">
              {(["ROUTINE", "URGENT", "EMERGENCY"] as const).map((p) => (
                <button key={p} onClick={() => setPriority(p)}
                  className={`flex-1 text-xs font-medium py-1.5 rounded-lg border transition-colors ${
                    priority === p ? getPriorityMeta(p).badgeClass + " ring-1 ring-primary/20" : "bg-white text-muted-foreground hover:bg-muted/30"
                  }`}
                >{getPriorityMeta(p).label}</button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Motif clinique</label>
            <Textarea placeholder="Décrivez le motif clinique de l'adressage…" value={clinicalReason} onChange={(e) => setClinicalReason(e.target.value)} rows={4} className="text-sm resize-none" />
          </div>

          {priority !== "ROUTINE" && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wide text-destructive">Note d'urgence (optionnel)</label>
              <Input placeholder="Précisez le contexte d'urgence…" value={urgencyNote} onChange={(e) => setUrgencyNote(e.target.value)} className="text-sm border-destructive/30" />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 px-5 py-3.5 border-t">
          <Button size="sm" variant="ghost" className="text-xs h-8" onClick={onClose}>Annuler</Button>
          <Button size="sm" className="text-xs h-8 gap-1.5" disabled={!canSubmit || create.isPending} onClick={() => create.mutate()}>
            <Send size={12} /> {create.isPending ? "Envoi…" : "Envoyer l'adressage"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function daysAgoShort(dateStr: string) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days === 0) return "aujourd'hui";
  if (days === 1) return "hier";
  return `${days}j`;
}
