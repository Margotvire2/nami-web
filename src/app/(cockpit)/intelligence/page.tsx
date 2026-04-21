"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, type KnowledgeSearchResult } from "@/lib/api";
import {
  Search,
  BookOpen,
  FileText,
  GitBranch,
  Database,
  FlaskConical,
  X,
  ChevronDown,
  ChevronUp,
  Activity,
} from "lucide-react";
import { ShimmerCard } from "@/components/ui/shimmer";

// ─── Quality Dashboard ───────────────────────────────────────────────────────

function pct(v: number | null): string {
  if (v == null) return "—";
  return `${Math.round(v * 100)}%`;
}

function QualityDashboard() {
  const { accessToken } = useAuthStore();
  const [open, setOpen] = useState(false);
  const api = apiWithToken(accessToken!);

  const { data, isLoading } = useQuery({
    queryKey: ["evaluation-stats"],
    queryFn: () => api.intelligence.evaluationStats(),
    staleTime: 5 * 60_000,
    enabled: !!accessToken,
  });

  const score = data?.avgOverallScore ?? null;
  const halluc = data?.avgHallucinationRate ?? null;
  const coverage = data?.avgSourceCoverage ?? null;
  const completeness = data?.avgCompleteness ?? null;
  const total = data?.totalEvaluations ?? 0;

  const scoreColor = (v: number | null) => {
    if (v == null) return "text-gray-400";
    if (v >= 0.9) return "text-emerald-600";
    if (v >= 0.7) return "text-amber-600";
    return "text-red-500";
  };

  const maxDist = Math.max(1, ...(data?.scoreDistribution ?? []).map((d) => d.count));

  const DIST_COLORS: Record<string, string> = {
    "0.9-1.0": "bg-emerald-400",
    "0.8-0.9": "bg-blue-400",
    "0.7-0.8": "bg-amber-400",
    "<0.7":    "bg-red-400",
  };

  // Trend sparkline — last 14 days
  const trend = (data?.trend ?? []).slice(0, 14).reverse();
  const maxTrend = Math.max(0.5, ...trend.map((t) => t.avgScore));

  return (
    <div className="mb-6 rounded-xl border border-[#E8ECF4] bg-white overflow-hidden">
      {/* Header row — always visible */}
      <button
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50/50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Activity size={14} className="text-[#5B4EC4]" />
            <span className="text-xs font-semibold text-gray-700">Qualité IA</span>
          </div>
          {isLoading ? (
            <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
          ) : (
            <div className="flex items-center gap-4">
              <span className={`text-xs font-bold tabular-nums ${scoreColor(score)}`}>
                {pct(score)} score
              </span>
              <span className="text-xs text-gray-400 tabular-nums">
                {pct(halluc)} halluc.
              </span>
              <span className="text-xs text-gray-400 tabular-nums">
                {pct(coverage)} sources
              </span>
              <span className="text-xs text-gray-400 tabular-nums hidden sm:inline">
                {pct(completeness)} complétude
              </span>
              <span className="text-[10px] text-gray-300">
                {total} éval.
              </span>
            </div>
          )}
        </div>
        {open ? <ChevronUp size={14} className="text-gray-400 shrink-0" /> : <ChevronDown size={14} className="text-gray-400 shrink-0" />}
      </button>

      {/* Expanded panel */}
      {open && (
        <div className="border-t border-[#E8ECF4] px-4 py-4 space-y-4">
          {/* KPI grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Score global",   value: data?.avgOverallScore,       good: ">= 0.85" },
              { label: "Hallucinations", value: data?.avgHallucinationRate,  invert: true },
              { label: "Couverture",     value: data?.avgSourceCoverage,     good: ">= 0.85" },
              { label: "Complétude",     value: data?.avgCompleteness,       good: ">= 0.85" },
              { label: "Actionnabilité", value: data?.avgActionability,      good: ">= 0.85" },
              { label: "Cohérence",      value: data?.avgConsistency,        good: ">= 0.85" },
            ].map(({ label, value, invert }) => {
              const v = value ?? null;
              const color = v == null ? "text-gray-400"
                : invert
                  ? (v <= 0.05 ? "text-emerald-600" : v <= 0.15 ? "text-amber-600" : "text-red-500")
                  : (v >= 0.9 ? "text-emerald-600" : v >= 0.7 ? "text-amber-600" : "text-red-500");
              return (
                <div key={label} className="rounded-lg bg-gray-50 border border-gray-100 p-3 text-center">
                  <div className={`text-lg font-bold tabular-nums ${color}`}>{pct(v)}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5 leading-tight">{label}</div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Score distribution */}
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Distribution des scores</p>
              <div className="space-y-1.5">
                {(data?.scoreDistribution ?? []).map(({ bucket, count }) => (
                  <div key={bucket} className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500 w-14 shrink-0 tabular-nums">{bucket}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all ${DIST_COLORS[bucket] ?? "bg-gray-400"}`}
                        style={{ width: `${Math.round((count / maxDist) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-400 w-6 text-right tabular-nums">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trend sparkline */}
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Tendance (30j)</p>
              {trend.length === 0 ? (
                <p className="text-[11px] text-gray-300 italic">Pas encore de données</p>
              ) : (
                <div className="flex items-end gap-0.5 h-12">
                  {trend.map((t, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t bg-[#5B4EC4]/60 hover:bg-[#5B4EC4] transition-colors cursor-default min-w-[4px]"
                      style={{ height: `${Math.round((t.avgScore / maxTrend) * 100)}%` }}
                      title={`${t.date} — ${pct(t.avgScore)}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pipeline context */}
          {data?.pipelineContext && (
            <div className="flex flex-wrap gap-3 pt-1 border-t border-gray-100">
              <span className={`text-[10px] px-2 py-1 rounded-full border font-medium ${data.pipelineContext.rerankerEnabled ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-gray-50 text-gray-400 border-gray-200"}`}>
                Reranker {data.pipelineContext.rerankerEnabled ? "actif" : "inactif"}
              </span>
              {data.pipelineContext.avgRagChunks != null && (
                <span className="text-[10px] px-2 py-1 rounded-full border bg-indigo-50 text-indigo-600 border-indigo-200 font-medium">
                  {data.pipelineContext.avgRagChunks.toFixed(1)} chunks / résumé
                </span>
              )}
              {data.pipelineContext.avgGraphRelations != null && (
                <span className="text-[10px] px-2 py-1 rounded-full border bg-purple-50 text-purple-600 border-purple-200 font-medium">
                  {data.pipelineContext.avgGraphRelations.toFixed(1)} relations graphe
                </span>
              )}
              <span className="text-[10px] px-2 py-1 rounded-full border bg-gray-50 text-gray-500 border-gray-200 font-medium">
                {total} évaluation{total !== 1 ? "s" : ""} totale{total !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Slug → catégorie ────────────────────────────────────────────────────────

function slugToCategory(slug: string): string {
  if (slug.startsWith("sem_"))  return "SEM";
  if (slug.startsWith("algo_")) return "ALGO";
  if (slug.startsWith("ke_"))   return "KE";
  if (slug.startsWith("pcr-"))  return "PCR";
  return "REF";
}

const CATEGORY_META: Record<string, { label: string; color: string; bg: string; desc: string }> = {
  SEM:  { label: "Sémantique", color: "#5B4EC4", bg: "rgba(91,78,196,0.08)",    desc: "Fiches pathologies sémantiques" },
  ALGO: { label: "Algorithme", color: "#2BA89C", bg: "rgba(43,168,156,0.08)",   desc: "Arbres décisionnels cliniques" },
  KE:   { label: "Fiche",      color: "#8A8A96", bg: "rgba(138,138,150,0.10)",  desc: "Fiches de référence" },
  PCR:  { label: "PCR",        color: "#7C3AED", bg: "rgba(124,58,237,0.08)",   desc: "Parcours de soins complexe" },
  REF:  { label: "Référence",  color: "#2563EB", bg: "rgba(37,99,235,0.08)",    desc: "Sources HAS / guidelines" },
};

// Kept for modal icon rendering
const SOURCE_ICON: Record<string, typeof BookOpen> = {
  SEM:  Database,
  ALGO: GitBranch,
  KE:   FileText,
  PCR:  BookOpen,
  REF:  FileText,
};

// ─── Preview helpers ──────────────────────────────────────────────────────────

function cleanForPreview(content: string): string {
  return content
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^[-*•]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/^---+$/gm, "")
    .replace(/^\|.+\|$/gm, "")
    .replace(/\n{2,}/g, " ")
    .replace(/\n/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function highlightTerms(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const terms = query.trim().split(/\s+/).filter((t) => t.length > 2);
  if (terms.length === 0) return text;
  const escaped = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(pattern);
  return parts.map((part, i) =>
    pattern.test(part) ? <strong key={i} style={{ fontWeight: 700, color: "#1A1A2E" }}>{part}</strong> : part
  );
}

function ScoreDots({ score }: { score: number }) {
  const filled = Math.round(score * 5);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          style={{
            width: 7, height: 7, borderRadius: "50%",
            background: i < filled ? "#5B4EC4" : "rgba(91,78,196,0.15)",
            flexShrink: 0,
          }}
        />
      ))}
      <span style={{ fontSize: 10, color: "#8A8A96", marginLeft: 4, fontVariantNumeric: "tabular-nums" }}>
        {Math.round(score * 100)}%
      </span>
    </div>
  );
}

const SUGGESTED_QUERIES = [
  "critères hospitalisation anorexie",
  "seuils biologiques anorexie mentale",
  "bilan initial TCA adulte",
  "indications chirurgie bariatrique IMC",
  "profils PCR obésité complexe A B C D",
  "suivi nutritionnel post sleeve",
  "critères diagnostic PR biothérapie",
  "diabète gestationnel critères HAPO",
];

// ─── Result card ─────────────────────────────────────────────────────────────

function ResultCard({
  result,
  query,
  onOpen,
}: {
  result: KnowledgeSearchResult;
  query: string;
  onOpen: (r: KnowledgeSearchResult) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const cat = slugToCategory(result.slug);
  const meta = CATEGORY_META[cat];

  const clean = cleanForPreview(result.content);
  const LIMIT = 200;
  const preview = clean.slice(0, LIMIT);
  const hasMore = clean.length > LIMIT;

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid rgba(26,26,46,0.06)",
        borderLeft: `4px solid ${meta?.color ?? "rgba(26,26,46,0.12)"}`,
        borderRadius: 12,
        padding: "14px 16px",
        cursor: "pointer",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(91,78,196,0.18)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 10px rgba(91,78,196,0.07)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(26,26,46,0.06)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
      }}
      onClick={() => onOpen(result)}
    >
      {/* Top row: badge + score */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span
          style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: meta?.color ?? "#8A8A96",
            background: meta?.bg ?? "rgba(138,138,150,0.10)",
            padding: "2px 8px", borderRadius: 6,
            flexShrink: 0,
          }}
        >
          {meta?.label ?? cat}
        </span>
        <ScoreDots score={result.score} />
        {result.qualityScore > 0 && result.qualityScore < 0.75 && (
          <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: "rgba(230,153,62,0.08)", color: "#E6993E", border: "1px solid rgba(230,153,62,0.2)", flexShrink: 0 }}>
            Qualité source limitée
          </span>
        )}
        <span style={{ fontSize: 10, color: "#8A8A96", marginLeft: "auto" }}>
          {result.qualityScore > 0 ? `${Math.round(result.qualityScore * 100)}%` : ""}
        </span>
      </div>

      {/* Title */}
      <h3 style={{ fontSize: 13, fontWeight: 600, color: "#1A1A2E", lineHeight: 1.4, marginBottom: 3, fontFamily: "var(--font-jakarta)" }}>
        {result.sectionTitle || result.slug}
      </h3>

      {/* Source slug */}
      <p style={{ fontSize: 10, color: "#8A8A96", marginBottom: 8, letterSpacing: "0.02em" }}>
        {result.slug}
      </p>

      {/* Content prose */}
      <p style={{ fontSize: 12, color: "#4A4A5A", lineHeight: 1.65 }}>
        {expanded
          ? highlightTerms(clean, query)
          : <>{highlightTerms(preview, query)}{hasMore && <span style={{ color: "#8A8A96" }}>…</span>}</>}
      </p>

      {/* Voir plus / Réduire */}
      {hasMore && (
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          style={{
            fontSize: 11, color: "#5B4EC4", fontWeight: 600,
            marginTop: 6, background: "none", border: "none",
            cursor: "pointer", padding: 0, display: "block",
          }}
        >
          {expanded ? "Réduire" : "Voir plus"}
        </button>
      )}
    </div>
  );
}

// ─── Detail modal ─────────────────────────────────────────────────────────────

function KnowledgeDetailModal({
  result,
  onClose,
}: {
  result: KnowledgeSearchResult;
  onClose: () => void;
}) {
  const cat = slugToCategory(result.slug);
  const meta = CATEGORY_META[cat];
  const Icon = SOURCE_ICON[cat] ?? FileText;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-6 py-4 border-b shrink-0">
          <div className="flex items-start gap-3 min-w-0">
            <div
              style={{
                marginTop: 2, flexShrink: 0, padding: "6px",
                borderRadius: 8, border: `1px solid ${meta?.color ?? "#8A8A96"}22`,
                background: meta?.bg ?? "rgba(138,138,150,0.10)",
                color: meta?.color ?? "#8A8A96",
              }}
            >
              <Icon size={14} />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-gray-900 leading-snug">
                {result.sectionTitle || result.slug}
              </h2>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span
                  style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    color: meta?.color ?? "#8A8A96",
                    background: meta?.bg ?? "rgba(138,138,150,0.10)",
                    padding: "2px 8px", borderRadius: 6,
                  }}
                >
                  {meta?.label ?? cat}
                </span>
                <span className="text-[10px] text-gray-400 font-mono">{result.slug}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#5B4EC4" }}>
                  {Math.round(result.score * 100)}% pertinence
                </span>
                <span className="text-[10px] text-gray-400">
                  qualité {Math.round(result.qualityScore * 100)}%
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors shrink-0"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <KnowledgeContentRenderer content={result.content} source={cat} />
        </div>
      </div>
    </div>
  );
}

// ─── Content renderer helpers ─────────────────────────────────────────────────

function headingEmoji(text: string): string {
  const t = text.toLowerCase();
  if (t.includes("définition") || t.includes("introduction") || t.includes("à propos")) return "📖";
  if (t.includes("diagnostic") || t.includes("critère") || t.includes("dsm") || t.includes("classification")) return "🔍";
  if (t.includes("traitement") || t.includes("prise en charge") || t.includes("thérapeutique") || t.includes("prescription")) return "💊";
  if (t.includes("signe") || t.includes("symptôme") || t.includes("clinique") || t.includes("manifestation")) return "🩺";
  if (t.includes("examen") || t.includes("bilan") || t.includes("biologie") || t.includes("paraclinique")) return "🧪";
  if (t.includes("compli") || t.includes("risque")) return "⚠️";
  if (t.includes("épidémio") || t.includes("prévalence") || t.includes("incidence") || t.includes("fréquence")) return "📊";
  if (t.includes("étiologie") || t.includes("cause") || t.includes("physiopathologie") || t.includes("mécanisme")) return "🔬";
  if (t.includes("pronostic") || t.includes("évolution") || t.includes("guérison")) return "📈";
  if (t.includes("prévention") || t.includes("prophylaxie") || t.includes("vaccination")) return "🛡️";
  if (t.includes("urgence") || t.includes("hospitalisation")) return "🚨";
  if (t.includes("suivi") || t.includes("surveillance") || t.includes("monitoring")) return "📅";
  if (t.includes("source") || t.includes("référence") || t.includes("bibliographie")) return "📚";
  if (t.includes("nutrition") || t.includes("alimentaire") || t.includes("apport")) return "🥗";
  if (t.includes("médicament") || t.includes("pharmaco") || t.includes("posologie") || t.includes("dose")) return "💉";
  if (t.includes("psycho") || t.includes("mental") || t.includes("psychiatrie") || t.includes("comportement")) return "🧠";
  if (t.includes("chirurgi")) return "🔪";
  return "";
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i} className="font-semibold text-gray-800">{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*"))
      return <em key={i} className="italic text-gray-600">{part.slice(1, -1)}</em>;
    if (part.startsWith("`") && part.endsWith("`"))
      return <code key={i} className="font-mono text-[11px] bg-gray-100 text-gray-700 px-1 py-0.5 rounded">{part.slice(1, -1)}</code>;
    return part;
  });
}

// ─── Content renderer ─────────────────────────────────────────────────────────

function KnowledgeContentRenderer({ content, source }: { content: string; source: string }) {
  // FFAB : slides séparés par "--- Slide X ---"
  if (source === "FFAB") {
    const slides = content.split(/^--- Slide \d+ ---$/m).filter(Boolean);
    return (
      <div className="space-y-3">
        {slides.map((slide, i) => {
          const lines = slide.trim().split("\n").filter(Boolean);
          const title = lines[0];
          const body = lines.slice(1).join("\n");
          return (
            <div key={i} className="rounded-xl bg-purple-50/60 border border-purple-100 p-4">
              <p className="text-[11px] font-bold text-purple-600 uppercase tracking-wide mb-2">
                📋 Slide {i + 1}{title ? ` — ${title}` : ""}
              </p>
              {body && (
                <div className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-line">{body}</div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // FICHE / HAS / ORPHANET / ALGORITHME : markdown structuré
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  const listBuffer: string[] = [];
  let key = 0;

  const flushList = () => {
    if (listBuffer.length === 0) return;
    elements.push(
      <ul key={key++} className="my-2 space-y-1 pl-0">
        {listBuffer.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-[13px] text-gray-600 leading-relaxed">
            <span className="mt-[6px] shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-300" />
            <span>{renderInline(item)}</span>
          </li>
        ))}
      </ul>
    );
    listBuffer.length = 0;
  };

  for (const line of lines) {
    if (line.startsWith("# ")) {
      flushList();
      const text = line.slice(2);
      const emoji = headingEmoji(text);
      elements.push(
        <h1 key={key++} className="flex items-center gap-2 text-base font-bold mt-6 mb-3 first:mt-0 text-gray-900">
          {emoji && <span className="text-lg">{emoji}</span>}
          <span>{text}</span>
        </h1>
      );
    } else if (line.startsWith("## ")) {
      flushList();
      const text = line.slice(3);
      const emoji = headingEmoji(text);
      elements.push(
        <h2 key={key++} className="flex items-center gap-2 text-sm font-semibold mt-5 mb-2 text-gray-900 border-l-[3px] border-indigo-200 pl-3 py-0.5">
          {emoji && <span>{emoji}</span>}
          <span>{text}</span>
        </h2>
      );
    } else if (line.startsWith("### ")) {
      flushList();
      const text = line.slice(4);
      const emoji = headingEmoji(text);
      elements.push(
        <h3 key={key++} className="flex items-center gap-1.5 text-[11px] font-bold mt-4 mb-1.5 text-indigo-500 uppercase tracking-wider">
          {emoji && <span className="normal-case text-[13px]">{emoji}</span>}
          <span>{text}</span>
        </h3>
      );
    } else if (line.match(/^\|[-:\s|]+\|/)) {
      flushList();
      // séparateur tableau — ignoré
    } else if (line.startsWith("|")) {
      flushList();
      const cells = line.split("|").filter(Boolean).map(c => c.trim());
      elements.push(
        <div key={key++} className="flex gap-3 text-[12px] py-1.5 border-b border-gray-50 last:border-0">
          {cells.map((c, j) => (
            <span key={j} className={j === 0 ? "font-semibold text-gray-700 w-40 shrink-0" : "text-gray-600 flex-1"}>
              {renderInline(c)}
            </span>
          ))}
        </div>
      );
    } else if (line.startsWith("- ") || line.startsWith("* ") || /^\d+\.\s/.test(line)) {
      const text = /^\d+\.\s/.test(line) ? line.replace(/^\d+\.\s/, "") : line.slice(2);
      listBuffer.push(text);
    } else if (line.trim() === "---") {
      flushList();
      elements.push(<hr key={key++} className="border-gray-100 my-4" />);
    } else if (line.trim() === "") {
      flushList();
      elements.push(<div key={key++} className="h-1.5" />);
    } else {
      flushList();
      elements.push(
        <p key={key++} className="text-[13px] leading-relaxed text-gray-600">
          {renderInline(line)}
        </p>
      );
    }
  }

  flushList();

  return <div className="space-y-0 px-1">{elements}</div>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function IntelligencePage() {
  const { accessToken } = useAuthStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<KnowledgeSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [activeSource, setActiveSource] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<KnowledgeSearchResult | null>(null);

  const doSearch = async (q: string) => {
    if (!q.trim() || q.trim().length < 2) return;
    setLoading(true);
    setSearched(false);
    setSearchError(null);
    setActiveSource(null);
    try {
      const data = await apiWithToken(accessToken!).intelligence.knowledgeSearch(q, { limit: 10 });
      setResults(data.results);
      setSearched(true);
    } catch (err: any) {
      setResults([]);
      setSearchError(err?.message || "Erreur de recherche");
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") doSearch(query);
  };

  const filteredResults = activeSource
    ? results.filter((r) => slugToCategory(r.slug) === activeSource)
    : results;

  const sourceCounts = results.reduce<Record<string, number>>((acc, r) => {
    const cat = slugToCategory(r.slug);
    acc[cat] = (acc[cat] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* ── Header ── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <FlaskConical size={18} className="text-[#5B4EC4]" />
          <h1 className="text-xl font-bold text-gray-900">Références cliniques</h1>
        </div>
        <p className="text-sm text-gray-500">
          Recherche dans la base unifiée : FFAB · HAS · Fiches pathologies · Algorithmes diagnostiques
        </p>
      </div>

      {/* ── Quality Dashboard ── */}
      <QualityDashboard />

      {/* ── Search bar ── */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Chercher un médicament, une pathologie, un critère diagnostique…"
          className="w-full pl-11 pr-28 py-3.5 rounded-xl border border-[#E8ECF4] bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B4EC4]/30 focus:border-[#5B4EC4] shadow-sm transition-all"
          autoFocus
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {query && (
            <button
              onClick={() => { setQuery(""); setResults([]); setSearched(false); }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={15} />
            </button>
          )}
          <button
            onClick={() => doSearch(query)}
            disabled={loading || query.trim().length < 2}
            className="px-3 py-1.5 bg-[#5B4EC4] text-white text-xs font-medium rounded-lg hover:bg-[#4940A8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "…" : "Rechercher"}
          </button>
        </div>
      </div>

      {/* ── Suggested queries ── */}
      {!searched && (
        <div className="mb-8">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Exemples</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUERIES.map((q) => (
              <button
                key={q}
                onClick={() => { setQuery(q); doSearch(q); }}
                className="text-xs px-3 py-1.5 rounded-lg border border-[#E8ECF4] bg-white text-gray-600 hover:border-[#5B4EC4] hover:text-[#5B4EC4] transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Source filter tabs ── */}
      {searched && results.length > 0 && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setActiveSource(null)}
            className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
              activeSource === null
                ? "bg-[#5B4EC4] text-white border-[#5B4EC4]"
                : "border-[#E8ECF4] bg-white text-gray-600 hover:border-[#5B4EC4] hover:text-[#5B4EC4]"
            }`}
          >
            Tous ({results.length})
          </button>
          {Object.entries(sourceCounts).map(([src, count]) => {
            const meta = CATEGORY_META[src];
            const isActive = activeSource === src;
            return (
              <button
                key={src}
                onClick={() => setActiveSource(isActive ? null : src)}
                style={{
                  fontSize: 12, fontWeight: 600, padding: "6px 12px",
                  borderRadius: 8, border: "1px solid",
                  cursor: "pointer", transition: "all 0.15s",
                  borderColor: isActive ? (meta?.color ?? "#5B4EC4") : "rgba(26,26,46,0.08)",
                  color: isActive ? (meta?.color ?? "#5B4EC4") : "#4A4A5A",
                  background: isActive ? (meta?.bg ?? "rgba(91,78,196,0.08)") : "#fff",
                }}
              >
                {meta?.label ?? src} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* ── Results ── */}
      {loading && (
        <div className="flex flex-col gap-3 py-4">
          {[...Array(5)].map((_, i) => <ShimmerCard key={i} />)}
        </div>
      )}

      {!loading && searched && filteredResults.length > 0 && (
        <div className="space-y-3">
          {filteredResults.map((r) => (
            <ResultCard key={r.id} result={r} query={query} onOpen={setSelectedResult} />
          ))}
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="text-center py-16">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Search size={20} className="text-gray-400" />
          </div>
          {searchError ? (
            <>
              <p className="text-red-600 font-medium">Erreur de recherche</p>
              <p className="text-sm text-red-400 mt-1">{searchError}</p>
            </>
          ) : (
            <>
              <p className="text-gray-600 font-medium">Aucun résultat pour «&nbsp;{query}&nbsp;»</p>
              <p className="text-sm text-gray-400 mt-1">Essayez d'autres termes ou vérifiez l'orthographe</p>
            </>
          )}
        </div>
      )}

      {!loading && !searched && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {Object.entries(CATEGORY_META).map(([key, meta]) => {
            const Icon = SOURCE_ICON[key] ?? FileText;
            return (
              <div
                key={key}
                style={{
                  padding: 16, borderRadius: 12,
                  border: `1px solid ${meta.color}22`,
                  background: meta.bg,
                  display: "flex", flexDirection: "column", gap: 4,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: meta.color }}>
                  <Icon size={14} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: meta.color }}>{meta.label}</span>
                </div>
                <p style={{ fontSize: 10, color: meta.color, opacity: 0.7 }}>{meta.desc}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>

    {selectedResult && (
      <KnowledgeDetailModal result={selectedResult} onClose={() => setSelectedResult(null)} />
    )}
    </>
  );
}
