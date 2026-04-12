"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, CareCaseDetail } from "@/lib/api";
import { toast } from "sonner";
import { SuiviTab } from "@/components/patient/SuiviTab";
import { getClinicalProfile, getDeltaColorClass, type ClinicalProfile } from "@/lib/clinicalProfile";

interface Props {
  careCaseId: string;
  careCase?: CareCaseDetail;
}

type DossierTab = "notes" | "bio" | "journal" | "timeline" | "documents";

export function ViewDossier({ careCaseId, careCase }: Props) {
  const [activeTab, setActiveTab] = useState<DossierTab>("notes");

  return (
    <div>
      <div className="flex gap-1 mb-5 border-b border-gray-200">
        {[
          { key: "notes" as const, label: "Notes cliniques", icon: "📝" },
          { key: "bio" as const, label: "Biologie", icon: "🧪" },
          { key: "journal" as const, label: "Journal patient", icon: "📱" },
          { key: "timeline" as const, label: "Ligne de vie", icon: "🕐" },
          { key: "documents" as const, label: "Documents", icon: "📄" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${
              activeTab === tab.key ? "border-[#5B4EC4] text-[#5B4EC4]" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "notes" && <NotesPanel careCaseId={careCaseId} />}
      {activeTab === "bio" && careCase ? (
        <SuiviTab
          careCaseId={careCaseId}
          pathwayKey={careCase.pathwayTemplateId ?? "default"}
          personId={careCase.patient.id}
          patient={{ firstName: careCase.patient.firstName, lastName: careCase.patient.lastName, birthDate: careCase.patient.birthDate ?? null, sex: careCase.patient.sex ?? undefined }}
          height={careCase.height}
          napValue={careCase.napValue}
          napDescription={careCase.napDescription}
        />
      ) : activeTab === "bio" ? (
        <BioPanel careCaseId={careCaseId} careCase={careCase} />
      ) : null}
      {activeTab === "journal" && <JournalPanel careCaseId={careCaseId} />}
      {activeTab === "timeline" && <TimelinePanel careCaseId={careCaseId} />}
      {activeTab === "documents" && <DocumentsPanel careCaseId={careCaseId} />}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// Notes
// ══════════════════════════════════════════════════════

function NotesPanel({ careCaseId }: { careCaseId: string }) {
  const { data: notes, isLoading } = useQuery({
    queryKey: ["notes", careCaseId],
    queryFn: async () => {
      const res = await api.get(`/care-cases/${careCaseId}/notes`);
      return res.data;
    },
  });

  const [search, setSearch] = useState("");
  if (isLoading) return <LoadingState />;

  const notesList = Array.isArray(notes) ? notes : [];
  const filtered = search
    ? notesList.filter((n: any) => `${n.title || ""} ${n.body || n.content || ""} ${n.author?.firstName || ""} ${n.author?.lastName || ""}`.toLowerCase().includes(search.toLowerCase()))
    : notesList;
  filtered.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const noteTypeLabels: Record<string, string> = {
    CONSULTATION: "Compte rendu", SOAP: "Note SOAP", PROGRESS: "Évolution",
    TEAM: "Note d'équipe", AI_SUMMARY: "Résumé IA", PHONE_CALL: "Appel",
  };
  const noteTypeColors: Record<string, string> = {
    CONSULTATION: "border-l-[#5B4EC4]", SOAP: "border-l-blue-500",
    PROGRESS: "border-l-green-500", TEAM: "border-l-amber-500",
    AI_SUMMARY: "border-l-purple-500", PHONE_CALL: "border-l-sky-500",
  };

  return (
    <div>
      <div className="mb-4">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher dans les notes…"
          className="w-full max-w-md text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#5B4EC4] focus:ring-1 focus:ring-[#5B4EC4]"
        />
      </div>
      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400 italic text-center py-12">{search ? "Aucune note trouvée" : "Pas encore de notes cliniques"}</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((note: any) => {
            const typeColor = noteTypeColors[note.noteType] || "border-l-gray-400";
            const authorName = note.author ? `${note.author.firstName || ""} ${note.author.lastName || ""}`.trim() : null;
            return (
              <div key={note.id} className={`rounded-xl border border-gray-200 bg-white p-5 border-l-4 ${typeColor}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-[#5B4EC4] bg-[#EDE9FC] px-2 py-0.5 rounded-full">
                      {noteTypeLabels[note.noteType] || note.noteType || "Note"}
                    </span>
                    {(note.hasTranscription || note.recordingId) && (
                      <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">🎙️ Transcription</span>
                    )}
                    {note.aiAnalysis && (
                      <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">✨ Analyse IA</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {new Date(note.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                {authorName && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-full bg-[#EDE9FC] flex items-center justify-center text-[10px] font-semibold text-[#5B4EC4]">
                      {authorName[0]?.toUpperCase() || "?"}
                    </div>
                    <span className="text-sm font-medium text-gray-800">{authorName}</span>
                    {(note.author?.specialty || note.author?.role) && (
                      <span className="text-xs text-gray-400">— {note.author.specialty || note.author.role}</span>
                    )}
                  </div>
                )}
                {note.title && <h4 className="text-sm font-semibold text-gray-900 mb-2">{note.title}</h4>}
                {(note.body || note.content) && <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{note.body || note.content}</div>}
                {note.aiAnalysis && (
                  <div className="mt-4 rounded-lg bg-[#F8F7FD] border border-[#EDE9FC] p-3">
                    <p className="text-[10px] font-medium text-[#5B4EC4] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      ✨ Analyse IA <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 ml-1">Brouillon</span>
                    </p>
                    <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                      {typeof note.aiAnalysis === "string" ? note.aiAnalysis : JSON.stringify(note.aiAnalysis, null, 2)}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// Bio — N vs N-1
// ══════════════════════════════════════════════════════

function BioPanel({ careCaseId, careCase }: { careCaseId: string; careCase?: CareCaseDetail }) {
  const profile: ClinicalProfile = getClinicalProfile(careCase);
  const { data: observations, isLoading } = useQuery({
    queryKey: ["observations-bio", careCaseId],
    queryFn: async () => {
      const res = await api.get(`/care-cases/${careCaseId}/observations`);
      return res.data.observations ?? [];
    },
  });

  const [domainFilter, setDomainFilter] = useState<string>("all");
  if (isLoading) return <LoadingState />;

  const obs = Array.isArray(observations) ? observations : [];
  const byMetric = new Map<string, any[]>();
  for (const o of obs) {
    const key = o.metricId || o.metric?.key || o.metric?.id;
    if (!key) continue;
    const group = byMetric.get(key) || [];
    group.push(o);
    byMetric.set(key, group);
  }

  interface BioRow {
    metricKey: string; label: string; domain: string; unit: string;
    current: number | null; previous: number | null; delta: number | null; deltaPercent: number | null;
    currentDate: string | null; previousDate: string | null; sparkline: number[];
    normalMin: number | null; normalMax: number | null; status: string;
  }

  const rows: BioRow[] = [];
  for (const [key, metricObs] of byMetric) {
    metricObs.sort((a: any, b: any) => new Date(b.effectiveAt).getTime() - new Date(a.effectiveAt).getTime());
    const metric = metricObs[0]?.metric || {};
    const current = metricObs[0]?.valueNumeric ?? null;
    const previous = metricObs[1]?.valueNumeric ?? null;
    const delta = current !== null && previous !== null ? current - previous : null;
    const deltaPercent = delta !== null && previous !== null && previous !== 0 ? (delta / Math.abs(previous)) * 100 : null;
    const sparkline = metricObs.slice(0, 8).map((o: any) => o.valueNumeric).filter((v: any): v is number => v !== null).reverse();
    let status = "OK";
    if (current === null) status = "MISSING";
    else if (metric.criticalLow !== null && current < metric.criticalLow) status = "CRITICAL";
    else if (metric.criticalHigh !== null && current > metric.criticalHigh) status = "CRITICAL";
    else if (metric.alertLow !== null && current < metric.alertLow) status = "ALERT";
    else if (metric.alertHigh !== null && current > metric.alertHigh) status = "ALERT";
    rows.push({
      metricKey: key, label: metric.label || key, domain: metric.domain || "other",
      unit: metricObs[0]?.unit || metric.unit || "", current, previous,
      delta: delta !== null ? Math.round(delta * 100) / 100 : null,
      deltaPercent: deltaPercent !== null ? Math.round(deltaPercent * 10) / 10 : null,
      currentDate: metricObs[0]?.effectiveAt || null, previousDate: metricObs[1]?.effectiveAt || null,
      sparkline, normalMin: metric.normalMin ?? null, normalMax: metric.normalMax ?? null, status,
    });
  }

  const domains = [...new Set(rows.map((r) => r.domain))];
  const filtered = domainFilter === "all" ? rows : rows.filter((r) => r.domain === domainFilter);
  const groupedByDomain = new Map<string, BioRow[]>();
  for (const row of filtered) {
    const group = groupedByDomain.get(row.domain) || [];
    group.push(row);
    groupedByDomain.set(row.domain, group);
  }

  const domainLabels: Record<string, string> = {
    anthropometry: "Anthropométrie", vital: "Vitaux", biology: "Biologie",
    psychology: "Psychologie", nutrition_behavior: "Comportement alimentaire",
    endocrinology: "Endocrinologie", other: "Autres",
  };
  const latestDate = obs.length > 0
    ? new Date(Math.max(...obs.map((o: any) => new Date(o.effectiveAt).getTime()))) : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Biologie — N vs N-1</h3>
          {latestDate && (
            <p className="text-xs text-gray-400 mt-0.5">
              Référence : {latestDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} · {rows.length} indicateurs
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-1.5 mb-4 flex-wrap">
        <FilterChip label="Tout" active={domainFilter === "all"} onClick={() => setDomainFilter("all")} />
        {domains.map((d) => (
          <FilterChip key={d} label={domainLabels[d] || d} active={domainFilter === d} onClick={() => setDomainFilter(d)} />
        ))}
      </div>
      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400 italic text-center py-12">Aucune observation biologique</p>
      ) : (
        <div className="space-y-4">
          {Array.from(groupedByDomain.entries()).map(([domain, domainRows]) => (
            <div key={domain} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div className="px-5 py-2.5 bg-gray-50 border-b border-gray-100">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{domainLabels[domain] || domain}</p>
              </div>
              <div className="divide-y divide-gray-50">
                {domainRows.map((row) => (
                  <div key={row.metricKey} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50/50 transition-colors">
                    <div className="w-44 flex-shrink-0">
                      <p className="text-sm font-medium text-gray-800">{row.label}</p>
                      {row.currentDate && row.previousDate && (
                        <p className="text-[10px] text-gray-400">
                          {new Date(row.previousDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} → {new Date(row.currentDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                        </p>
                      )}
                    </div>
                    <div className="w-24 flex-shrink-0">
                      {row.sparkline.length >= 2 ? <BioSparkline values={row.sparkline} status={row.status} /> : <div className="h-6" />}
                    </div>
                    <div className="w-24 text-right flex-shrink-0">
                      <p className="text-[10px] text-gray-400">Préc.</p>
                      <p className="text-sm text-gray-500">{row.previous !== null ? `${formatVal(row.previous)} ${row.unit}` : "—"}</p>
                    </div>
                    <div className="w-24 text-right flex-shrink-0">
                      <p className="text-[10px] text-gray-400">Actuel</p>
                      <p className="text-sm font-semibold text-gray-900">{row.current !== null ? `${formatVal(row.current)} ${row.unit}` : "—"}</p>
                    </div>
                    <div className="w-20 text-center flex-shrink-0">
                      {(row.normalMin !== null || row.normalMax !== null) && (
                        <p className="text-[10px] text-gray-400">({row.normalMin ?? ""}–{row.normalMax ?? ""})</p>
                      )}
                    </div>
                    <div className="w-24 text-right flex-shrink-0">
                      {row.delta !== null && row.delta !== 0 ? (
                        <div>
                          <span className={`text-sm font-semibold ${getDeltaColorClass(row.metricKey, row.delta, profile)}`}>{row.delta > 0 ? "+" : ""}{formatVal(row.delta)} {row.unit}</span>
                          <span className={`block text-[10px] ${getDeltaColorClass(row.metricKey, row.delta, profile)}`}>{row.delta > 0 ? "↑" : "↓"} {row.deltaPercent !== null ? `${Math.abs(row.deltaPercent)}%` : ""}</span>
                        </div>
                      ) : <span className="text-xs text-gray-300">—</span>}
                    </div>
                    <div className="w-20 flex-shrink-0 text-right"><StatusBadge status={row.status} /></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BioSparkline({ values, status }: { values: number[]; status: string }) {
  const min = Math.min(...values); const max = Math.max(...values);
  const range = max - min || 1; const h = 28; const w = 80;
  const step = w / (values.length - 1);
  const points = values.map((v, i) => `${i * step},${h - ((v - min) / range) * (h - 4) - 2}`).join(" ");
  const color = status === "CRITICAL" ? "#ef4444" : status === "ALERT" ? "#f59e0b" : "#6366f1";
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-7">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={(values.length - 1) * step} cy={parseFloat(points.split(" ").pop()!.split(",")[1])} r="2.5" fill={color} />
    </svg>
  );
}


// ══════════════════════════════════════════════════════
// Journal patient
// ══════════════════════════════════════════════════════

type PeriodFilter = "today" | "7d" | "30d" | "all";

function JournalPanel({ careCaseId }: { careCaseId: string }) {
  const [period, setPeriod] = useState<PeriodFilter>("7d");
  const { data: journalEntries, isLoading } = useQuery({
    queryKey: ["journal", careCaseId],
    queryFn: async () => {
      const res = await api.get(`/care-cases/${careCaseId}/journal`);
      return res.data;
    },
  });

  if (isLoading) return <LoadingState />;
  const entries = Array.isArray(journalEntries) ? journalEntries : [];
  const now = new Date();
  const filtered = entries.filter((e: any) => {
    const diff = now.getTime() - new Date(e.createdAt || e.date).getTime();
    if (period === "today") return diff < 86400000;
    if (period === "7d") return diff < 7 * 86400000;
    if (period === "30d") return diff < 30 * 86400000;
    return true;
  });

  const meals = filtered.filter((e: any) => e.entryType === "MEAL");
  const emotions = filtered.filter((e: any) => e.entryType === "EMOTION");
  const activities = filtered.filter((e: any) => e.entryType === "PHYSICAL_ACTIVITY");
  const symptoms = filtered.filter((e: any) => e.entryType === "SYMPTOM");
  const positives = filtered.filter((e: any) => e.entryType === "POSITIVE" || e.entryType === "NOTE");

  const periodDays = period === "today" ? 1 : period === "7d" ? 7 : period === "30d" ? 30
    : Math.max(1, Math.ceil((now.getTime() - new Date(entries[entries.length - 1]?.createdAt || now).getTime()) / 86400000));
  const avgEnergy = emotions.length > 0
    ? Math.round(emotions.reduce((s: number, e: any) => s + (e.energyLevel || e.intensity || 0), 0) / emotions.length * 10) : null;
  const avgMealsPerDay = periodDays > 0 ? (meals.length / periodDays).toFixed(1) : "0";
  const totalActivityMin = activities.reduce((s: number, a: any) => s + (a.duration || 0), 0);
  const avgPleasure = activities.length > 0
    ? Math.round(activities.reduce((s: number, a: any) => s + (a.pleasureLevel || 0), 0) / activities.length * 10) / 10 : null;
  const todayMeals = entries.filter((e: any) => e.entryType === "MEAL" && (now.getTime() - new Date(e.createdAt || e.date).getTime()) < 86400000);

  const days7 = Array.from({ length: 7 }, (_, i) => { const d = new Date(now); d.setDate(d.getDate() - (6 - i)); return d; });
  const slots = ["P.déj", "Déj", "Dîner", "Coll"];
  const dayNames = ["lun.", "mar.", "mer.", "jeu.", "ven.", "sam.", "dim."];
  const weatherEmojis: Record<string, string> = { "Ensoleillé": "☀️", "Nuageux": "🌤️", "Couvert": "☁️", "Pluvieux": "🌧️", "Orageux": "⛈️" };
  const weatherScale = ["⛈️", "🌧️", "☁️", "🌤️", "☀️"];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Journal patient ({filtered.length})</h3>
        <div className="flex gap-1">
          {([ { key: "today" as const, label: "Aujourd'hui" }, { key: "7d" as const, label: "7 jours" }, { key: "30d" as const, label: "30 jours" }, { key: "all" as const, label: "Tout" } ]).map((p) => (
            <button key={p.key} onClick={() => setPeriod(p.key)} className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${period === p.key ? "bg-[#5B4EC4] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>{p.label}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500 mb-1">🧠 Énergie</p>
          <p className="text-2xl font-semibold text-gray-900">{avgEnergy !== null ? `${avgEnergy}%` : "—"}</p>
          <p className="text-[10px] text-gray-400">{emotions.length} check-in{emotions.length > 1 ? "s" : ""}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500 mb-1">🍽️ Alimentation</p>
          <p className="text-2xl font-semibold text-gray-900">{avgMealsPerDay} repas/j</p>
          <p className="text-[10px] text-gray-400">{meals.length} enregistrés</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500 mb-1">🏃 Activité</p>
          <p className="text-2xl font-semibold text-gray-900">{totalActivityMin} min</p>
          <p className="text-[10px] text-gray-400">Plaisir {avgPleasure !== null ? `${avgPleasure}/10` : "—"}</p>
        </div>
      </div>

      {todayMeals.length === 0 && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-2.5 mb-4">
          <p className="text-xs text-amber-700">⚠️ Aucun repas enregistré aujourd'hui</p>
        </div>
      )}

      <JournalSection title="Alimentation" icon="🍽️" count={meals.length} defaultOpen>
        <div className="flex gap-5 mb-3">
          <div className="flex-1">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">Heatmap 7 jours</p>
            <div className="grid gap-1" style={{ gridTemplateColumns: `36px repeat(7, 1fr)` }}>
              <div />
              {days7.map((d, i) => <div key={i} className="text-center text-[10px] text-gray-400">{dayNames[d.getDay() === 0 ? 6 : d.getDay() - 1]}</div>)}
              {slots.map((slot, si) => (
                <div key={si} className="contents">
                  <div className="text-[10px] text-gray-400 flex items-center">{slot}</div>
                  {days7.map((d, di) => {
                    const dayStr = d.toISOString().split("T")[0];
                    const dayMeals = meals.filter((m: any) => new Date(m.createdAt || m.date).toISOString().split("T")[0] === dayStr);
                    const filled = dayMeals[si];
                    return <div key={di} className={`h-6 rounded-sm border ${filled ? "bg-green-300 border-green-400" : "bg-gray-50 border-gray-100"}`} />;
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="w-28 space-y-2 flex-shrink-0">
            <div className="rounded-lg bg-gray-50 p-2.5 text-center">
              <p className="text-lg font-semibold text-gray-900">{avgMealsPerDay}</p>
              <p className="text-[10px] text-gray-400">Repas/jour</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-2.5 text-center">
              <p className="text-lg font-semibold text-gray-900">{Math.max(0, 3 * periodDays - meals.length)}</p>
              <p className="text-[10px] text-gray-400">Sautés</p>
            </div>
          </div>
        </div>
        {meals.length === 0 && <p className="text-xs text-gray-400 italic">Aucun repas enregistré sur cette période</p>}
      </JournalSection>

      <JournalSection title="Santé mentale" icon="🧠" count={emotions.length} defaultOpen>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-3">
          <div>
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">Météo 7 jours</p>
            <div className="flex gap-1">
              {days7.map((d, i) => {
                const dayStr = d.toISOString().split("T")[0];
                const dayEmotions = emotions.filter((e: any) => new Date(e.createdAt || e.date).toISOString().split("T")[0] === dayStr);
                const mood = dayEmotions[0]?.mood || dayEmotions[0]?.weatherType;
                const energy = dayEmotions.length > 0 ? Math.round(dayEmotions.reduce((s: number, e: any) => s + (e.energyLevel || e.intensity || 5), 0) / dayEmotions.length) : null;
                const emoji = weatherEmojis[mood] || (energy !== null ? weatherScale[Math.min(4, Math.max(0, Math.round(energy / 2) - 1))] : null);
                return (
                  <div key={i} className="flex-1 text-center">
                    <p className="text-[10px] text-gray-400">{dayNames[d.getDay() === 0 ? 6 : d.getDay() - 1]}</p>
                    <p className="text-xl mt-0.5">{emoji || "·"}</p>
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">Courbe d'énergie</p>
            {emotions.length >= 2 ? (
              <JournalSparkline values={emotions.slice(0, 10).map((e: any) => e.energyLevel || e.intensity || 5).reverse()} color="#6366f1" />
            ) : <p className="text-xs text-gray-400 italic">Pas assez de données</p>}
          </div>
        </div>
      </JournalSection>

      {activities.length > 0 && (
        <JournalSection title="Activité physique" icon="🏃" count={activities.length}>
          <div className="space-y-1.5">
            {activities.map((a: any, i: number) => (
              <div key={i} className="rounded-lg border border-gray-100 p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🏃</span>
                  <span className="text-xs font-medium text-gray-700">{a.activityType || a.title || "Activité"} — {a.duration || "?"}min</span>
                  {a.pleasureLevel != null && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-100">Plaisir {a.pleasureLevel}/10</span>}
                </div>
                <span className="text-[10px] text-gray-400">{new Date(a.createdAt || a.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            ))}
          </div>
        </JournalSection>
      )}

      {symptoms.length > 0 && (
        <JournalSection title="Symptômes" icon="🩺" count={symptoms.length}>
          <div className="space-y-1.5">
            {symptoms.map((s: any, i: number) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-gray-100 p-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🩺</span>
                  <span className="text-xs text-gray-700">{s.symptomType || s.content || "Symptôme"}</span>
                </div>
                <div className="flex items-center gap-2">
                  {s.intensity && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.intensity > 6 ? "bg-red-100 text-red-600" : s.intensity > 3 ? "bg-amber-100 text-amber-600" : "bg-green-100 text-green-600"}`}>{s.intensity}/10</span>
                  )}
                  <span className="text-[10px] text-gray-400">{new Date(s.createdAt || s.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>
                </div>
              </div>
            ))}
          </div>
        </JournalSection>
      )}

      {positives.length > 0 && (
        <JournalSection title="Pensées & notes" icon="✨" count={positives.length}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {positives.map((p: any, i: number) => (
              <div key={i} className="rounded-lg bg-yellow-50 border border-yellow-100 p-3">
                <p className="text-xs text-gray-700">{p.entryType === "POSITIVE" ? "✨ " : "📝 "}{p.content || p.description}</p>
                <p className="text-[10px] text-gray-400 mt-1">{new Date(p.createdAt || p.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</p>
              </div>
            ))}
          </div>
        </JournalSection>
      )}

      {filtered.length === 0 && <p className="text-sm text-gray-400 italic text-center py-12">Aucune entrée sur cette période</p>}
    </div>
  );
}

function JournalSection({ title, icon, count, defaultOpen, children }: {
  title: string; icon: string; count: number; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen ?? true);
  return (
    <div className="rounded-xl border border-gray-200 bg-white mb-4 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50/50">
        <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5"><span>{icon}</span>{title}</h4>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{count}</span>
          <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {open && <div className="px-5 pb-4">{children}</div>}
    </div>
  );
}

function JournalSparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null;
  const min = Math.min(...values) - 0.5; const max = Math.max(...values) + 0.5;
  const range = max - min || 1; const h = 50; const w = 300;
  const step = w / (values.length - 1);
  const points = values.map((v, i) => `${i * step},${h - ((v - min) / range) * (h - 8) - 4}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-12">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {values.map((v, i) => (
        <circle key={i} cx={i * step} cy={h - ((v - min) / range) * (h - 8) - 4} r={i === values.length - 1 ? 3.5 : 2.5} fill={color} stroke="white" strokeWidth="1.5" />
      ))}
    </svg>
  );
}

// ══════════════════════════════════════════════════════
// Documents — extraction bio branchée
// ══════════════════════════════════════════════════════

type DocFilter = "all" | "shared" | "mine" | "patient" | "transcriptions";

const UPLOAD_TYPES = [
  { label: "Bilan biologique", type: "BIOLOGICAL_REPORT" },
  { label: "Impédancemétrie", type: "IMPEDANCE_REPORT" },
  { label: "DXA / Densitométrie", type: "DXA_REPORT" },
  { label: "ECG / EFR", type: "ECG_REPORT" },
  { label: "Ordonnance", type: "PRESCRIPTION" },
  { label: "Compte rendu", type: "CONSULTATION_REPORT" },
  { label: "Imagerie", type: "IMAGING" },
  { label: "Courrier", type: "LETTER" },
  { label: "Autre", type: "OTHER" },
];

function DocumentsPanel({ careCaseId }: { careCaseId: string }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [uploadType, setUploadType] = useState("OTHER");
  const [uploading, setUploading] = useState(false);
  const [showUploadMenu, setShowUploadMenu] = useState(false);

  useEffect(() => {
    if (!showUploadMenu) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUploadMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUploadMenu]);

  const { data: documents, isLoading } = useQuery({
    queryKey: ["documents", careCaseId],
    queryFn: async () => {
      const res = await api.get(`/care-cases/${careCaseId}/documents`);
      return res.data;
    },
  });

  const [filter, setFilter] = useState<DocFilter>("all");
  const [extractingDocId, setExtractingDocId] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [validationDocId, setValidationDocId] = useState<string | null>(null);
  const [extractionDate, setExtractionDate] = useState<string>("");
  const [extractionExamType, setExtractionExamType] = useState<string | null>(null);

  async function handleUpload(file: File, docType: string) {
    setUploading(true);
    try {
      const token = (() => {
        try { const s = localStorage.getItem("nami-auth"); return s ? JSON.parse(s)?.state?.accessToken : null; } catch { return null; }
      })();
      const form = new FormData();
      form.append("file", file);
      form.append("title", file.name);
      form.append("documentType", docType);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const res = await fetch(`${API_URL}/care-cases/${careCaseId}/documents/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as Record<string, string>).error || `Erreur ${res.status}`);
      }
      queryClient.invalidateQueries({ queryKey: ["documents", careCaseId] });
      toast.success("Document ajouté");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  }

  async function handleDownload(docId: string) {
    // Ouvrir la fenêtre AVANT l'await — sinon bloqué par le popup blocker
    const newWindow = window.open("about:blank", "_blank");
    try {
      const res = await api.get<{ url: string }>(`/care-cases/${careCaseId}/documents/${docId}/download`);
      const url = res.data?.url;
      if (!url) throw new Error("URL manquante");
      if (newWindow) newWindow.location.href = url;
      else window.location.href = url;
    } catch (err) {
      newWindow?.close();
      toast.error(err instanceof Error ? err.message : "Impossible de télécharger le document");
    }
  }

  async function handleDelete(docId: string) {
    if (!confirm("Supprimer ce document ?")) return;
    try {
      await api.delete(`/care-cases/${careCaseId}/documents/${docId}`);
      queryClient.invalidateQueries({ queryKey: ["documents", careCaseId] });
      toast.success("Document supprimé");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  }

  // POST /documents/:id/extract-bio
  const extractMutation = useMutation({
    mutationFn: async (docId: string) => {
      const res = await api.post(`/documents/${docId}/extract-bio`);
      return res.data;
    },
    onSuccess: (data, docId) => {
      const extracted = data.candidates || data.observations || [];
      setCandidates(extracted.map((c: any) => ({ ...c, selected: true })));
      setExtractionDate(data.datePrelevement || new Date().toISOString().split("T")[0]);
      setExtractionExamType(data.examType ?? null);
      setValidationDocId(docId);
      setExtractingDocId(null);
    },
    onError: () => setExtractingDocId(null),
  });

  // POST /documents/:id/validate-bio — format attendu par le backend
  const validateMutation = useMutation({
    mutationFn: async ({ docId, selected }: { docId: string; selected: any[] }) => {
      const res = await api.post(`/documents/${docId}/validate-bio`, {
        datePrelevement: extractionDate || new Date().toISOString().split("T")[0],
        observations: selected.map((c) => ({
          metricKey: c.metricKey,
          label: c.labelOriginal || c.label || c.metricKey,
          value: c.value ?? c.valueNumeric,
          unit: c.unit || "",
        })),
      });
      return res.data;
    },
    onSuccess: (data) => {
      const count = data?.observations?.length ?? candidates.filter((c) => c.selected).length;
      toast.success(`${count} observation${count > 1 ? "s" : ""} intégrée${count > 1 ? "s" : ""} dans le dossier`);
      queryClient.invalidateQueries({ queryKey: ["documents", careCaseId] });
      queryClient.invalidateQueries({ queryKey: ["observations-bio", careCaseId] });
      queryClient.invalidateQueries({ queryKey: ["observations-latest", careCaseId] });
      queryClient.invalidateQueries({ queryKey: ["observations-delta", careCaseId] });
      queryClient.invalidateQueries({ queryKey: ["observations-history", careCaseId] });
      queryClient.invalidateQueries({ queryKey: ["bia-sessions", careCaseId] });
      queryClient.invalidateQueries({ queryKey: ["trajectory", careCaseId] });
      queryClient.invalidateQueries({ queryKey: ["care-case", careCaseId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", careCaseId] });
      setValidationDocId(null);
      setCandidates([]);
      setExtractionExamType(null);
    },
    onError: (err: any) => {
      console.error("[validate-bio] error:", err);
      const msg = err?.message || "Erreur inconnue";
      if (msg === "UPGRADE_REQUIRED") {
        toast.error("Cette fonctionnalité nécessite un abonnement Nami Pro");
      } else {
        toast.error(`Erreur lors de l'intégration : ${msg}`);
      }
    },
  });

  function handleExtract(docId: string) {
    setExtractingDocId(docId);
    extractMutation.mutate(docId);
  }

  function handleValidate() {
    if (!validationDocId) return;
    validateMutation.mutate({ docId: validationDocId, selected: candidates.filter((c) => c.selected) });
  }

  function toggleCandidate(index: number) {
    setCandidates((prev) => prev.map((c, i) => (i === index ? { ...c, selected: !c.selected } : c)));
  }

  if (isLoading) return <LoadingState />;

  const docs = Array.isArray(documents) ? documents : [];
  const classified = docs.map((d: any) => {
    let category: DocFilter = "shared";
    if (d.documentType === "TRANSCRIPTION" || d.isTranscription) category = "transcriptions";
    else if (d.uploadedBy === "PATIENT" || d.source === "PATIENT_APP") category = "patient";
    else if (d.isShared === false || d.visibility === "PRIVATE") category = "mine";
    return { ...d, category };
  });

  const filtered = filter === "all" ? classified : classified.filter((d: any) => d.category === filter);
  filtered.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const counts = {
    all: classified.length,
    shared: classified.filter((d: any) => d.category === "shared").length,
    mine: classified.filter((d: any) => d.category === "mine").length,
    patient: classified.filter((d: any) => d.category === "patient").length,
    transcriptions: classified.filter((d: any) => d.category === "transcriptions").length,
  };

  const docTypeIcons: Record<string, string> = {
    PRESCRIPTION: "💊", LAB_REPORT: "🧪", BIOLOGICAL_REPORT: "🧪",
    DISCHARGE_SUMMARY: "🏥", REFERRAL_LETTER: "↗️", CONSULTATION_REPORT: "📋",
    IMAGING: "🩻", IMPEDANCE_REPORT: "⚖️", DXA_REPORT: "🦴",
    ECG_REPORT: "🫀", TRANSCRIPTION: "🎙️", PATIENT_UPLOAD: "📱", OTHER: "📄",
    LETTER: "✉️",
  };
  const docTypeLabels: Record<string, string> = {
    PRESCRIPTION: "Ordonnance", LAB_REPORT: "Bilan biologique", BIOLOGICAL_REPORT: "Bilan biologique",
    DISCHARGE_SUMMARY: "CR d'hospitalisation", REFERRAL_LETTER: "Courrier d'adressage",
    CONSULTATION_REPORT: "CR de consultation", IMAGING: "Imagerie",
    IMPEDANCE_REPORT: "Bilan d'impédancemétrie", DXA_REPORT: "DXA / Densitométrie",
    ECG_REPORT: "ECG / EFR", TRANSCRIPTION: "Transcription",
    PATIENT_UPLOAD: "Document patient", OTHER: "Document", LETTER: "Courrier",
  };

  const isBioDoc = (doc: any) => [
    "LAB_REPORT", "BIOLOGICAL_REPORT", "IMPEDANCE_REPORT",
    "DXA_REPORT", "ECG_REPORT", "IMAGING", "OTHER",
  ].includes(doc.documentType);

  return (
    <div>
      {/* Input file caché */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".pdf,.png,.jpg,.jpeg,.docx"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file, uploadType);
          e.target.value = "";
        }}
      />

      {/* Header : filtres + bouton ajouter */}
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {([
            { key: "all" as const, label: `Tout (${counts.all})`, icon: "📁" },
            { key: "shared" as const, label: `Partagés (${counts.shared})`, icon: "👥" },
            { key: "mine" as const, label: `Mes docs (${counts.mine})`, icon: "🔒" },
            { key: "patient" as const, label: `Patient (${counts.patient})`, icon: "📱" },
            { key: "transcriptions" as const, label: `Transcriptions (${counts.transcriptions})`, icon: "🎙️" },
          ]).map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f.key ? "bg-[#5B4EC4] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              <span>{f.icon}</span>{f.label}
            </button>
          ))}
        </div>
        <div className="relative" ref={menuRef}>
          <button
            disabled={uploading}
            onClick={() => setShowUploadMenu((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {uploading ? "Upload…" : "+ Ajouter"}
          </button>
          {showUploadMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-1.5 z-50 min-w-[160px]">
              {UPLOAD_TYPES.map((t) => (
                <button
                  key={t.type}
                  onClick={() => {
                    setUploadType(t.type);
                    setShowUploadMenu(false);
                    fileInputRef.current?.click();
                  }}
                  className="w-full text-left text-xs px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400 italic text-center py-12">Aucun document</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((doc: any) => {
            const isExtracted = doc.bioExtracted === true;
            const isExtracting = extractingDocId === doc.id;
            return (
              <div key={doc.id} className="rounded-xl border border-gray-200 bg-white p-4 hover:shadow-sm transition-shadow cursor-pointer group">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{docTypeIcons[doc.documentType] || "📄"}</span>
                    <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{docTypeLabels[doc.documentType] || doc.documentType || "Document"}</span>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                    doc.category === "mine" ? "bg-gray-100 text-gray-500" :
                    doc.category === "patient" ? "bg-purple-50 text-purple-600" :
                    doc.category === "transcriptions" ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600"
                  }`}>
                    {doc.category === "mine" ? "Privé" : doc.category === "patient" ? "Patient" : doc.category === "transcriptions" ? "Audio" : "Partagé"}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-900 truncate">{doc.title || doc.fileName || "Sans titre"}</p>
                <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-400">
                  <span>{new Date(doc.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}</span>
                  {doc.fileSize && <span>• {formatFileSize(doc.fileSize)}</span>}
                </div>
                <div className="flex gap-1.5 mt-2 items-center flex-wrap">
                  {isExtracted && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-medium border border-emerald-100">🧪 Bio extraite</span>
                  )}
                  {isExtracting && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium border border-blue-100 flex items-center gap-1">
                      <span className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />Analyse…
                    </span>
                  )}
                  {isBioDoc(doc) && isExtracted && (
                    <button onClick={(e) => { e.stopPropagation(); handleExtract(doc.id); }} className="text-[10px] text-[#5B4EC4] hover:underline font-medium">
                      Ré-analyser
                    </button>
                  )}
                </div>
                <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); handleDownload(doc.id); }} className="text-xs text-[#5B4EC4] hover:underline">Télécharger</button>
                  {isBioDoc(doc) && !isExtracted && !isExtracting && (
                    <button onClick={(e) => { e.stopPropagation(); handleExtract(doc.id); }} className="text-xs text-emerald-600 hover:underline font-medium">
                      🧪 Analyser IA
                    </button>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }} className="text-xs text-red-400 hover:underline ml-auto">
                    Supprimer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal validation bio */}
      {validationDocId && candidates.length > 0 && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[85vh] overflow-hidden shadow-xl">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  {extractionExamType === "IMPEDANCEMETRIE" ? "⚖️ Bilan d'impédancemétrie"
                    : extractionExamType === "DXA" ? "🦴 Ostéodensitométrie (DXA)"
                    : extractionExamType === "ECG" ? "🫀 ECG"
                    : "🧪 Bilan biologique"} — brouillon IA
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {candidates.length} valeur{candidates.length > 1 ? "s" : ""} extraite{candidates.length > 1 ? "s" : ""}
                  {extractionDate ? ` · ${new Date(extractionDate).toLocaleDateString("fr-FR")}` : ""}
                  {" — "}décochez ce que vous ne souhaitez pas intégrer
                </p>
              </div>
              <button onClick={() => { setValidationDocId(null); setCandidates([]); setExtractionExamType(null); }} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="px-5 py-3 overflow-y-auto max-h-[55vh] space-y-4">
              {(() => {
                // Grouper par catégorie en conservant l'index global
                const groups: Record<string, Array<{ c: any; gi: number }>> = {};
                candidates.forEach((c, gi) => {
                  const cat = c.category || "Autres";
                  if (!groups[cat]) groups[cat] = [];
                  groups[cat].push({ c, gi });
                });
                return Object.entries(groups).map(([cat, items]) => (
                  <div key={cat}>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">{cat}</p>
                    <div className="space-y-1.5">
                      {items.map(({ c, gi }) => {
                        const val = c.value ?? c.valueNumeric;
                        const refMin = c.refMin ?? null;
                        const refMax = c.refMax ?? null;
                        let badge: { text: string; cls: string } | null = null;
                        if (val != null && (refMin != null || refMax != null)) {
                          const low = refMin != null && val < refMin;
                          const high = refMax != null && val > refMax;
                          if (low || high) badge = { text: low ? "↓" : "↑", cls: "bg-amber-100 text-amber-700" };
                          else badge = { text: "✓", cls: "bg-green-100 text-green-700" };
                        }
                        return (
                          <label key={`cand-${gi}`} className={`flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer transition-all ${c.selected ? "border-[#5B4EC4] bg-[#F8F7FD]" : "border-gray-100 bg-gray-50 opacity-50"}`}>
                            <input type="checkbox" checked={c.selected} onChange={() => toggleCandidate(gi)} className="rounded border-gray-300 text-[#5B4EC4] w-4 h-4 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{c.labelOriginal || c.label || c.metricKey}</p>
                              {(refMin != null || refMax != null) && (
                                <p className="text-[10px] text-gray-400">
                                  Réf : {refMin != null ? refMin : "—"} – {refMax != null ? refMax : "—"} {c.unit || ""}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              {badge && <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${badge.cls}`}>{badge.text}</span>}
                              <p className="text-sm font-semibold text-gray-900 text-right">{val ?? "—"} <span className="text-[10px] font-normal text-gray-500">{c.unit || ""}</span></p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ));
              })()}
            </div>
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-500">{candidates.filter((c) => c.selected).length} / {candidates.length} sélectionnée{candidates.filter((c) => c.selected).length > 1 ? "s" : ""}</p>
              <div className="flex gap-2">
                <button onClick={() => { setValidationDocId(null); setCandidates([]); setExtractionExamType(null); }} className="text-xs px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Annuler</button>
                <button
                  onClick={handleValidate}
                  disabled={validateMutation.isPending || candidates.filter((c) => c.selected).length === 0}
                  className="text-xs px-4 py-2 rounded-lg bg-[#5B4EC4] text-white hover:bg-[#4A3DB3] disabled:opacity-50 font-medium"
                >
                  {validateMutation.isPending ? "Enregistrement…" : `Valider ${candidates.filter((c) => c.selected).length} observation${candidates.filter((c) => c.selected).length > 1 ? "s" : ""}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// Composants partagés
// ══════════════════════════════════════════════════════

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    OK: { bg: "bg-green-100", text: "text-green-700", label: "Normal" },
    ALERT: { bg: "bg-amber-100", text: "text-amber-700", label: "Attention" },
    CRITICAL: { bg: "bg-red-100", text: "text-red-700", label: "Critique" },
    MISSING: { bg: "bg-gray-100", text: "text-gray-500", label: "Manquant" },
  };
  const c = config[status] || config.MISSING;
  return <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded-full font-medium ${c.bg} ${c.text}`}>{c.label}</span>;
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${active ? "bg-[#5B4EC4] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
      {label}
    </button>
  );
}

// ══════════════════════════════════════════════════════
// Ligne de vie — timeline verticale détaillée
// ══════════════════════════════════════════════════════

type TimelineFilter = "all" | "rdv" | "referral" | "alert";

function TimelinePanel({ careCaseId }: { careCaseId: string }) {
  const [filter, setFilter] = useState<TimelineFilter>("all");

  const { data: timelineRaw, isLoading } = useQuery({
    queryKey: ["timeline", careCaseId],
    queryFn: async () => {
      const res = await api.get(`/care-cases/${careCaseId}/timeline?limit=100`);
      const raw = res.data;
      const activities = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
      return activities.map((a: any) => ({
        type: a.activityType || a.type || "NOTE",
        title: a.title || a.summary || "",
        description: a.summary || a.description || null,
        date: a.occurredAt || a.createdAt || a.date,
        authorName: a.person
          ? `${a.person.firstName || ""} ${a.person.lastName || ""}`.trim()
          : a.authorName || null,
        expandable: !!a.payload,
      }));
    },
  });

  if (isLoading) return <LoadingState />;

  const entries = Array.isArray(timelineRaw) ? timelineRaw : [];

  const filtered = filter === "all"
    ? entries
    : entries.filter((e: any) => {
        const t = (e.type || "").toUpperCase();
        if (filter === "rdv") return t.includes("APPOINTMENT") || t.includes("VISIT") || t.includes("STEP") || t === "NOTE";
        if (filter === "referral") return t.includes("REFERRAL") || t.includes("ADRESSAGE");
        if (filter === "alert") return t.includes("ALERT") || t.includes("OBSERVATION") || t.includes("METRIC");
        return true;
      });

  const byMonth = new Map<string, any[]>();
  for (const e of filtered) {
    const d = new Date(e.date || e.createdAt);
    const key = `${d.toLocaleString("fr-FR", { month: "long" }).toUpperCase()} ${d.getFullYear()}`;
    const group = byMonth.get(key) || [];
    group.push(e);
    byMonth.set(key, group);
  }

  const getIcon = (type: string) => {
    const t = (type || "").toUpperCase();
    if (t.includes("APPOINTMENT") || t.includes("VISIT")) return "📅";
    if (t.includes("REFERRAL") || t.includes("ADRESSAGE")) return "↗️";
    if (t.includes("ALERT") || t.includes("METRIC")) return "⚠️";
    if (t.includes("OBSERVATION") || t.includes("BIO")) return "🧪";
    if (t.includes("DOCUMENT")) return "📄";
    if (t.includes("NOTE")) return "📝";
    if (t.includes("STEP") || t.includes("PROTOCOL")) return "✅";
    if (t.includes("TASK")) return "☑️";
    if (t.includes("JOURNAL")) return "📱";
    return "•";
  };

  const isAlertType = (type: string) => {
    const t = (type || "").toUpperCase();
    return t.includes("ALERT") || t.includes("METRIC_OUT");
  };

  const startDate = entries.length > 0
    ? new Date(Math.min(...entries.map((e: any) => new Date(e.date || e.createdAt).getTime())))
    : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Ligne de vie clinique</h3>
          {startDate && <p className="text-xs text-gray-400">Depuis le {startDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>}
        </div>
        <div className="flex gap-1">
          {([
            { key: "all" as const, label: "Tout" },
            { key: "rdv" as const, label: "RDV" },
            { key: "referral" as const, label: "Adressages" },
            { key: "alert" as const, label: "Alertes" },
          ]).map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)} className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${filter === f.key ? "bg-[#5B4EC4] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400 italic text-center py-12">Aucun événement</p>
      ) : (
        <div className="space-y-6">
          {Array.from(byMonth.entries()).map(([month, monthEvents]) => (
            <div key={month}>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">{month}</p>
              <div className="relative">
                {/* Ligne verticale */}
                <div className="absolute left-[18px] top-2 bottom-2 w-px bg-gray-200" />
                <div className="space-y-1">
                  {monthEvents.map((e: any, i: number) => {
                    const isAlert = isAlertType(e.type);
                    const d = new Date(e.date || e.createdAt);
                    return (
                      <div key={i} className={`flex items-start gap-4 py-2 rounded-lg hover:bg-gray-50/50 cursor-pointer ${isAlert ? "bg-red-50/30" : ""}`}>
                        {/* Icône sur la ligne */}
                        <div className={`w-9 h-9 flex-shrink-0 rounded-full flex items-center justify-center text-sm z-10 border-2 bg-white ${isAlert ? "border-red-300" : "border-gray-200"}`}>
                          {getIcon(e.type)}
                        </div>
                        {/* Contenu */}
                        <div className="flex-1 min-w-0 pt-1">
                          <div className="flex items-baseline justify-between gap-2">
                            <p className={`text-sm font-medium ${isAlert ? "text-red-700" : "text-gray-800"}`}>
                              {e.title || e.summary || e.label}
                            </p>
                            <span className="text-[11px] text-gray-400 flex-shrink-0">
                              {d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          {e.description && <p className="text-xs text-gray-500 mt-0.5">{e.description}</p>}
                          {e.authorName && <p className="text-[11px] text-gray-400 mt-0.5">{e.authorName}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-6 h-6 border-2 border-[#5B4EC4] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function formatVal(v: number): string { return Number.isInteger(v) ? v.toString() : v.toFixed(1); }

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}
