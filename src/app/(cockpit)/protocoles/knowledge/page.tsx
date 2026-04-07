"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, type KnowledgeSource } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  BookOpen,
  Check,
  Eye,
  Send,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  FileText,
  Clock,
  Shield,
  ArrowLeft,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

type StatusTab = "DRAFT" | "REVIEW" | "VALIDATED" | "PUBLISHED";

const STATUS_META: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Brouillon", className: "bg-amber-50 text-amber-700 border-amber-200" },
  REVIEW: { label: "En revue", className: "bg-blue-50 text-blue-700 border-blue-200" },
  VALIDATED: { label: "Validée", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  PUBLISHED: { label: "Publiée", className: "bg-primary/10 text-primary border-primary/20" },
  DEPRECATED: { label: "Dépréciée", className: "bg-muted text-muted-foreground border-border" },
};

const SOURCE_TYPE_META: Record<string, { label: string; className: string }> = {
  FFAB: { label: "FFAB", className: "bg-purple-50 text-purple-700 border-purple-200" },
  HAS: { label: "HAS", className: "bg-blue-50 text-blue-700 border-blue-200" },
  PUBMED: { label: "PubMed", className: "bg-teal-50 text-teal-700 border-teal-200" },
  SNOMED: { label: "SNOMED", className: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  CIM11: { label: "CIM-11", className: "bg-orange-50 text-orange-700 border-orange-200" },
  MANUAL: { label: "Manuel", className: "bg-muted text-muted-foreground border-border" },
};

function timeAgo(d: string) {
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  if (days === 0) return "aujourd'hui";
  if (days === 1) return "hier";
  return `il y a ${days}j`;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function KnowledgePage() {
  const { accessToken } = useAuthStore();
  const api = apiWithToken(accessToken!);
  const qc = useQueryClient();
  const [tab, setTab] = useState<StatusTab>("DRAFT");

  const { data: sources, isLoading } = useQuery({
    queryKey: ["knowledge-sources", tab],
    queryFn: () => api.knowledge.list({ status: tab }),
  });

  const draftCount = useQuery({
    queryKey: ["knowledge-sources-draft-count"],
    queryFn: () => api.knowledge.list({ status: "DRAFT" }),
    select: (data) => data.length,
  });

  const tabs: { key: StatusTab; label: string; icon: typeof Clock }[] = [
    { key: "DRAFT", label: "En attente", icon: Clock },
    { key: "REVIEW", label: "En revue", icon: Eye },
    { key: "VALIDATED", label: "Validées", icon: Check },
    { key: "PUBLISHED", label: "Publiées", icon: Send },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden bg-muted/10">
      {/* Header */}
      <header className="bg-card border-b px-6 py-4 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href="/protocoles" className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft size={14} />
              </Link>
              <h1 className="text-base font-semibold flex items-center gap-2">
                <BookOpen size={16} /> Base de connaissances
              </h1>
            </div>
            <p className="text-xs text-muted-foreground">
              {draftCount.data !== undefined && draftCount.data > 0
                ? `${draftCount.data} source${draftCount.data !== 1 ? "s" : ""} en attente de validation`
                : "Toutes les sources sont à jour"}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-3">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "text-xs font-medium px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5",
                  tab === t.key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <Icon size={11} />
                {t.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="max-w-3xl mx-auto px-6 py-6 space-y-3">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
          </div>
        ) : (sources ?? []).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-80 text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center mb-4">
              {tab === "DRAFT" ? (
                <Check size={24} className="text-emerald-500" />
              ) : (
                <BookOpen size={24} className="text-primary/40" />
              )}
            </div>
            <p className="text-sm font-semibold text-foreground">
              {tab === "DRAFT"
                ? "Toutes les sources sont validées"
                : `Aucune source ${STATUS_META[tab]?.label.toLowerCase() ?? ""}`}
            </p>
            <p className="text-xs text-muted-foreground mt-1.5 max-w-sm leading-relaxed">
              {tab === "DRAFT"
                ? "Les nouvelles sources apparaîtront ici après ingestion."
                : "Les sources changeront de statut au fil de la validation."}
            </p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-6 py-4 space-y-3">
            {(sources ?? []).map((source) => (
              <SourceCard key={source.id} source={source} api={api} qc={qc} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Source Card ─────────────────────────────────────────────────────────────

function SourceCard({
  source,
  api,
  qc,
}: {
  source: KnowledgeSource;
  api: ReturnType<typeof apiWithToken>;
  qc: ReturnType<typeof useQueryClient>;
}) {
  const [expanded, setExpanded] = useState(false);

  const reviewMut = useMutation({
    mutationFn: () => api.knowledge.review(source.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["knowledge-sources"] }); toast.success("Mis en revue"); },
    onError: () => toast.error("Erreur"),
  });

  const validateMut = useMutation({
    mutationFn: () => api.knowledge.validate(source.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["knowledge-sources"] }); toast.success("Validée"); },
    onError: () => toast.error("Erreur"),
  });

  const publishMut = useMutation({
    mutationFn: () => api.knowledge.publish(source.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["knowledge-sources"] }); toast.success("Publiée — données intégrées au catalogue"); },
    onError: () => toast.error("Erreur de publication"),
  });

  const deprecateMut = useMutation({
    mutationFn: () => api.knowledge.deprecate(source.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["knowledge-sources"] }); toast.success("Rejetée"); },
    onError: () => toast.error("Erreur"),
  });

  const statusMeta = STATUS_META[source.status] ?? STATUS_META.DRAFT;
  const typeMeta = SOURCE_TYPE_META[source.sourceType] ?? SOURCE_TYPE_META.MANUAL;
  const hasStructured = source.structuredData && Object.keys(source.structuredData).length > 0;

  let structuredCount = 0;
  if (hasStructured) {
    for (const val of Object.values(source.structuredData!)) {
      if (Array.isArray(val)) structuredCount += val.length;
    }
  }

  return (
    <div className="rounded-xl border bg-card shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_8px_rgba(79,70,229,0.08)] transition-shadow">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-muted/30 flex items-center justify-center shrink-0 mt-0.5">
            <FileText size={16} className="text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded border", typeMeta.className)}>
                {typeMeta.label}
              </span>
              <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded border", statusMeta.className)}>
                {statusMeta.label}
              </span>
              {hasStructured && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary/5 text-primary border border-primary/10 flex items-center gap-0.5">
                  <Sparkles size={8} /> {structuredCount} entrées extraites
                </span>
              )}
            </div>

            <p className="text-sm font-medium">{source.sourceTitle}</p>

            <p className="text-[10px] text-muted-foreground mt-0.5">
              Ingéré {timeAgo(source.ingestedAt)}
              {source.sourceDate && ` · Source : ${new Date(source.sourceDate).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}`}
            </p>

            {source.rawContent && (
              <p className="text-[11px] text-muted-foreground mt-1.5 line-clamp-2 italic">
                {source.rawContent.slice(0, 200)}…
              </p>
            )}
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Expanded: structured data */}
      {expanded && hasStructured && (
        <div className="border-t px-4 py-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Données structurées
          </p>
          <pre className="text-[10px] text-foreground/80 bg-muted/30 rounded-lg p-3 overflow-x-auto max-h-60 overflow-y-auto font-mono leading-relaxed">
            {JSON.stringify(source.structuredData, null, 2)}
          </pre>
        </div>
      )}

      {/* Expanded: raw content */}
      {expanded && source.rawContent && (
        <div className="border-t px-4 py-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Contenu brut
          </p>
          <div className="text-[11px] text-foreground/70 bg-muted/20 rounded-lg p-3 max-h-40 overflow-y-auto whitespace-pre-wrap leading-relaxed">
            {source.rawContent.slice(0, 3000)}
            {source.rawContent.length > 3000 && "…"}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="border-t px-4 py-2.5 flex items-center gap-2 flex-wrap">
        {source.status === "DRAFT" && (
          <>
            <Button size="sm" variant="outline" className="text-xs h-7 gap-1" onClick={() => reviewMut.mutate()} disabled={reviewMut.isPending}>
              <Eye size={11} /> Mettre en revue
            </Button>
            <Button size="sm" className="text-xs h-7 gap-1" onClick={() => validateMut.mutate()} disabled={validateMut.isPending}>
              <Check size={11} /> Valider
            </Button>
          </>
        )}
        {source.status === "REVIEW" && (
          <Button size="sm" className="text-xs h-7 gap-1" onClick={() => validateMut.mutate()} disabled={validateMut.isPending}>
            <Check size={11} /> Valider
          </Button>
        )}
        {source.status === "VALIDATED" && (
          <Button size="sm" className="text-xs h-7 gap-1" onClick={() => publishMut.mutate()} disabled={publishMut.isPending}>
            <Send size={11} /> Publier
          </Button>
        )}
        {source.status !== "DEPRECATED" && source.status !== "PUBLISHED" && (
          <Button size="sm" variant="outline" className="text-xs h-7 gap-1 text-destructive hover:text-destructive" onClick={() => deprecateMut.mutate()} disabled={deprecateMut.isPending}>
            <X size={11} /> Rejeter
          </Button>
        )}
        {source.status === "PUBLISHED" && (
          <span className="text-[10px] text-emerald-600 flex items-center gap-1">
            <Shield size={10} /> Données intégrées au catalogue clinique
          </span>
        )}
      </div>
    </div>
  );
}
