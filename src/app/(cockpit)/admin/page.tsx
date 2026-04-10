"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import {
  Users, TrendingUp, Activity,
  BarChart2, BookOpen, ArrowUp, ArrowDown, Minus,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AnalyticsData {
  generatedAt: string;
  activeUsers: { dau: number; wau: number; mau: number };
  retention: { cohortSize: number; retainedW1: number; retentionW1Pct: number | null };
  totals: { providers: number; patients: number; newLast30d: number };
  dauTrend: { date: string; users: number }[];
  newUsersTrend: { date: string; providers: number; patients: number }[];
  featureUsage: { feature: string; count: number; icon: string }[];
  blog: {
    totalArticles: number;
    totalViews: number;
    topArticles: { slug: string; title: string; viewCount: number; category: string }[];
  };
}

// ─── Sparkline ───────────────────────────────────────────────────────────────

function Sparkline({ data, color = "#4F46E5" }: { data: number[]; color?: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const w = 120;
  const h = 36;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`)
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="opacity-70">
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={pts} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ─── Stat card ───────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, trend, sparkData, icon: Icon, color = "text-[#4F46E5]",
}: {
  label: string;
  value: string | number;
  sub?: string;
  trend?: number;
  sparkData?: number[];
  icon: React.ElementType;
  color?: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium">{label}</p>
          <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
        </div>
        <div className="flex flex-col items-end gap-2">
          <Icon className="size-5 text-gray-300" />
          {sparkData && <Sparkline data={sparkData} />}
        </div>
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend > 0 ? "text-emerald-600" : trend < 0 ? "text-red-500" : "text-gray-400"}`}>
          {trend > 0 ? <ArrowUp className="size-3" /> : trend < 0 ? <ArrowDown className="size-3" /> : <Minus className="size-3" />}
          {Math.abs(trend)}% vs semaine préc.
        </div>
      )}
    </div>
  );
}

// ─── Bar chart ───────────────────────────────────────────────────────────────

function BarChart({ data, maxVal, color = "#4F46E5" }: { data: { label: string; value: number }[]; maxVal: number; color?: string }) {
  return (
    <div className="space-y-2">
      {data.map(({ label, value }) => (
        <div key={label} className="flex items-center gap-3">
          <span className="text-xs text-gray-500 w-40 shrink-0 truncate">{label}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full transition-all"
              style={{ width: `${maxVal > 0 ? (value / maxVal) * 100 : 0}%`, backgroundColor: color }}
            />
          </div>
          <span className="text-xs font-semibold text-gray-700 w-8 text-right">{value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── DAU trend chart ─────────────────────────────────────────────────────────

function DauTrendChart({ data }: { data: { date: string; users: number }[] }) {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.users), 1);
  const w = 100;
  const h = 60;
  const pts = data
    .map((d, i) => `${(i / (data.length - 1)) * w},${h - (d.users / max) * h}`)
    .join(" ");
  const area = `0,${h} ${pts} ${w},${h}`;

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full">
      <defs>
        <linearGradient id="dauGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon fill="url(#dauGrad)" points={area} />
      <polyline fill="none" stroke="#4F46E5" strokeWidth="1.5" points={pts} strokeLinejoin="round" />
    </svg>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { user, accessToken } = useAuthStore();
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !accessToken) return;
    if (user.roleType !== "ADMIN") {
      router.replace("/aujourd-hui");
      return;
    }

    fetch(`${API_URL}/admin/analytics`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error(`Erreur ${r.status}`);
        return r.json() as Promise<AnalyticsData>;
      })
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [user, accessToken, router]);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-sm text-gray-400">Chargement…</div>;
  }
  if (error || !data) {
    return <div className="flex items-center justify-center h-64 text-sm text-red-500">{error ?? "Données indisponibles"}</div>;
  }

  const dauValues = data.dauTrend.map((d) => d.users);
  const maxFeature = Math.max(...data.featureUsage.map((f) => f.count), 1);
  const retPct = data.retention.retentionW1Pct;
  const retColor = retPct === null ? "text-gray-400" : retPct >= 40 ? "text-emerald-600" : retPct >= 20 ? "text-amber-600" : "text-red-500";

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard admin</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Généré le {new Date(data.generatedAt).toLocaleString("fr-FR")}
          </p>
        </div>
        <span className="text-[10px] bg-indigo-50 text-indigo-600 font-semibold px-2.5 py-1 rounded-full">ADMIN ONLY</span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="DAU — Actifs aujourd'hui"
          value={data.activeUsers.dau}
          sub="utilisateurs uniques"
          icon={Activity}
          sparkData={dauValues}
        />
        <StatCard
          label="WAU — 7 derniers jours"
          value={data.activeUsers.wau}
          icon={TrendingUp}
          color="text-emerald-600"
        />
        <StatCard
          label="MAU — 30 derniers jours"
          value={data.activeUsers.mau}
          icon={Users}
          color="text-blue-600"
        />
        <StatCard
          label="Rétention W1"
          value={retPct !== null ? `${retPct}%` : "–"}
          sub={`${data.retention.retainedW1} / ${data.retention.cohortSize} users`}
          icon={BarChart2}
          color={retColor}
        />
      </div>

      {/* Totaux + DAU trend */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-xs text-gray-500 font-medium mb-3">Utilisateurs totaux</p>
          <div className="flex gap-6">
            <div>
              <p className="text-2xl font-bold text-[#4F46E5]">{data.totals.providers}</p>
              <p className="text-[11px] text-gray-400">Soignants</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-500">{data.totals.patients}</p>
              <p className="text-[11px] text-gray-400">Patients</p>
            </div>
          </div>
          <p className="text-[11px] text-emerald-600 mt-3 font-medium">
            +{data.totals.newLast30d} inscrits (30j)
          </p>
        </div>

        <div className="col-span-2 rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-xs text-gray-500 font-medium mb-3">Actifs journaliers — 30 derniers jours</p>
          <DauTrendChart data={data.dauTrend} />
          <div className="flex justify-between text-[10px] text-gray-300 mt-1">
            <span>{data.dauTrend[0]?.date}</span>
            <span>{data.dauTrend[data.dauTrend.length - 1]?.date}</span>
          </div>
        </div>
      </div>

      {/* Features + Blog */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-xs text-gray-500 font-medium mb-4">Features — 30 derniers jours</p>
          <BarChart
            data={data.featureUsage.map((f) => ({ label: `${f.icon} ${f.feature}`, value: f.count }))}
            maxVal={maxFeature}
          />
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <p className="text-xs text-gray-500 font-medium">Blog SEO</p>
            <div className="text-right">
              <p className="text-xl font-bold text-[#4F46E5]">{data.blog.totalArticles}</p>
              <p className="text-[11px] text-gray-400">articles publiés</p>
              <p className="text-[11px] text-emerald-600 font-medium">{data.blog.totalViews} vues</p>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 font-medium mb-2">Top articles</p>
          <div className="space-y-2">
            {data.blog.topArticles.map((a, i) => (
              <div key={a.slug} className="flex items-start gap-2">
                <span className="text-[10px] text-gray-300 shrink-0 w-4 pt-0.5">{i + 1}.</span>
                <p className="flex-1 text-[11px] text-gray-700 line-clamp-1 min-w-0">{a.title}</p>
                <span className="text-[10px] font-semibold text-gray-500 shrink-0 flex items-center gap-0.5">
                  <BookOpen className="size-3" /> {a.viewCount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Nouveaux inscrits */}
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <p className="text-xs text-gray-500 font-medium mb-4">Nouveaux inscrits — 30 derniers jours</p>
        <div className="flex gap-0.5 items-end h-16 w-full">
          {data.newUsersTrend.map((d) => {
            const maxNew = Math.max(...data.newUsersTrend.map((x) => x.providers + x.patients), 1);
            const total = d.providers + d.patients;
            const hPct = (total / maxNew) * 100;
            return (
              <div
                key={d.date}
                className="flex-1 flex flex-col items-center justify-end h-full"
                title={`${d.date} — ${d.providers} soignants, ${d.patients} patients`}
              >
                {total > 0 && (
                  <div className="w-full rounded-sm overflow-hidden flex flex-col justify-end" style={{ height: `${hPct}%` }}>
                    <div className="w-full bg-blue-400" style={{ height: `${(d.patients / total) * 100}%` }} />
                    <div className="w-full bg-[#4F46E5]" style={{ height: `${(d.providers / total) * 100}%` }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-2">
          <span className="flex items-center gap-1 text-[10px] text-gray-400">
            <span className="size-2 rounded-sm bg-[#4F46E5] inline-block" /> Soignants
          </span>
          <span className="flex items-center gap-1 text-[10px] text-gray-400">
            <span className="size-2 rounded-sm bg-blue-400 inline-block" /> Patients
          </span>
        </div>
      </div>

      <p className="text-[10px] text-gray-300 text-center pb-4">
        DAU = logins uniques (RefreshToken). Features = créations 30j. Rétention W1 = cohorte inscrite J-37→J-7 et revenue J-7→J.
      </p>
    </div>
  );
}
