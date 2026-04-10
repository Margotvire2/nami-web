"use client"

import { useState, useEffect, useMemo } from "react"
import { useAuthStore } from "@/lib/store"
import {
  TrendingUp, AlertTriangle, CheckCircle, Clock,
  Euro, FileText, XCircle, Loader2, CalendarDays, ChevronLeft, ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

const API = process.env.NEXT_PUBLIC_API_URL || "https://nami-production-f268.up.railway.app"

interface BillingStats {
  period: { from: string; to: string }
  count: {
    total: number
    paid: number
    rejected: number
    pending: number
    draft: number
  }
  totals: {
    honoraires: number
    amo: number
    amc: number
    patient: number
    depassement: number
  }
}

interface MonthlyPoint {
  month: string
  label: string
  honoraires: number
  count: number
}

const MONTH_LABELS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"]

export function BillingDashboard({ className }: { className?: string }) {
  const accessToken = useAuthStore((s) => s.accessToken)
  const [stats, setStats] = useState<BillingStats | null>(null)
  const [monthly, setMonthly] = useState<MonthlyPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState(new Date().getFullYear())

  useEffect(() => {
    if (!accessToken) return
    setLoading(true)

    const from = `${year}-01-01`
    const to = `${year}-12-31`

    fetch(`${API}/billing/stats?from=${from}&to=${to}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setStats(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))

    // Stats par mois (12 requêtes parallèles)
    const promises = Array.from({ length: 12 }, (_, i) => {
      const m = String(i + 1).padStart(2, "0")
      const mFrom = `${year}-${m}-01`
      const lastDay = new Date(year, i + 1, 0).getDate()
      const mTo = `${year}-${m}-${lastDay}`
      return fetch(`${API}/billing/stats?from=${mFrom}&to=${mTo}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .then((r) => r.json())
        .then((data) => ({
          month: m,
          label: MONTH_LABELS[i],
          honoraires: data.totals?.honoraires ?? 0,
          count: data.count?.total ?? 0,
        }))
        .catch(() => ({ month: m, label: MONTH_LABELS[i], honoraires: 0, count: 0 }))
    })

    Promise.all(promises).then(setMonthly)
  }, [accessToken, year])

  const currentMonth = new Date().getMonth()
  const currentMonthStats = monthly[currentMonth]
  const prevMonthStats = currentMonth > 0 ? monthly[currentMonth - 1] : null

  const trend = useMemo(() => {
    if (!currentMonthStats || !prevMonthStats || prevMonthStats.honoraires === 0) return null
    return ((currentMonthStats.honoraires - prevMonthStats.honoraires) / prevMonthStats.honoraires) * 100
  }, [currentMonthStats, prevMonthStats])

  const maxHonoraires = useMemo(
    () => Math.max(...monthly.map((m) => m.honoraires), 1),
    [monthly]
  )

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <Loader2 className="w-6 h-6 animate-spin text-neutral-300" />
      </div>
    )
  }

  if (!stats) return null

  const tauxRejet = stats.count.total > 0
    ? ((stats.count.rejected / stats.count.total) * 100).toFixed(1)
    : "0"
  const tauxPaiement = stats.count.total > 0
    ? ((stats.count.paid / stats.count.total) * 100).toFixed(1)
    : "0"

  return (
    <div className={cn("space-y-5", className)}>
      {/* En-tête + sélecteur d'année */}
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-[#0F172A] flex items-center gap-2" style={{ fontFamily: "var(--font-jakarta)" }}>
          <TrendingUp className="w-4 h-4 text-teal-500" />
          Tableau de bord facturation
        </h2>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setYear(year - 1)}
            className="w-7 h-7 rounded-lg border border-[#E8ECF4] flex items-center justify-center hover:bg-[#F8FAFF] transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-neutral-500" />
          </button>
          <span className="text-sm font-medium text-[#0F172A] w-12 text-center tabular-nums">{year}</span>
          <button
            onClick={() => setYear(year + 1)}
            disabled={year >= new Date().getFullYear()}
            className="w-7 h-7 rounded-lg border border-[#E8ECF4] flex items-center justify-center hover:bg-[#F8FAFF] transition-colors disabled:opacity-30"
          >
            <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          icon={<Euro className="w-4 h-4" />}
          label="Chiffre d'affaires"
          value={formatMoney(stats.totals.honoraires)}
          sublabel={`dont ${formatMoney(stats.totals.depassement)} dépassements`}
          color="teal"
          trend={trend}
        />
        <KPICard
          icon={<FileText className="w-4 h-4" />}
          label="FSE émises"
          value={String(stats.count.total)}
          sublabel={`${stats.count.draft} brouillons`}
          color="blue"
        />
        <KPICard
          icon={<CheckCircle className="w-4 h-4" />}
          label="Taux de paiement"
          value={`${tauxPaiement}%`}
          sublabel={`${stats.count.paid} payées sur ${stats.count.total}`}
          color="emerald"
        />
        <KPICard
          icon={<XCircle className="w-4 h-4" />}
          label="Taux de rejet"
          value={`${tauxRejet}%`}
          sublabel={`${stats.count.rejected} rejetée${stats.count.rejected > 1 ? "s" : ""}`}
          color={stats.count.rejected > 0 ? "red" : "emerald"}
        />
      </div>

      {/* Ventilation financière */}
      <div className="rounded-xl border border-[#E8ECF4] bg-white p-5 space-y-3">
        <h3 className="text-[13px] font-semibold text-[#0F172A]">Ventilation financière</h3>
        <div className="space-y-1">
          <FinancialRow label="Honoraires totaux" amount={stats.totals.honoraires} bold />
          <FinancialRow label="Part AMO (Assurance Maladie)" amount={stats.totals.amo} color="emerald" />
          <FinancialRow label="Part AMC (Complémentaire)" amount={stats.totals.amc} color="blue" />
          <FinancialRow label="Reste à charge patient" amount={stats.totals.patient} color="amber" />
          {stats.totals.depassement > 0 && (
            <FinancialRow label="Dépassements d'honoraires" amount={stats.totals.depassement} color="purple" />
          )}
        </div>
        {stats.totals.honoraires > 0 && (
          <div className="pt-2">
            <div className="h-3 rounded-full overflow-hidden flex bg-neutral-100">
              <div
                className="bg-emerald-400 transition-all"
                style={{ width: `${(stats.totals.amo / stats.totals.honoraires) * 100}%` }}
                title={`AMO : ${formatMoney(stats.totals.amo)}`}
              />
              <div
                className="bg-blue-400 transition-all"
                style={{ width: `${(stats.totals.amc / stats.totals.honoraires) * 100}%` }}
                title={`AMC : ${formatMoney(stats.totals.amc)}`}
              />
              <div
                className="bg-amber-400 transition-all"
                style={{ width: `${(stats.totals.patient / stats.totals.honoraires) * 100}%` }}
                title={`Patient : ${formatMoney(stats.totals.patient)}`}
              />
            </div>
            <div className="flex justify-between mt-1.5 text-[9px] text-neutral-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> AMO</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" /> AMC</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Patient</span>
            </div>
          </div>
        )}
      </div>

      {/* Graphique mensuel */}
      <div className="rounded-xl border border-[#E8ECF4] bg-white p-5 space-y-3">
        <h3 className="text-[13px] font-semibold text-[#0F172A] flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-neutral-400" />
          Évolution mensuelle {year}
        </h3>
        <div className="flex items-end gap-1.5 h-40">
          {monthly.map((m, i) => {
            const height = maxHonoraires > 0 ? (m.honoraires / maxHonoraires) * 100 : 0
            const isCurrent = i === currentMonth && year === new Date().getFullYear()
            return (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col items-center justify-end h-32">
                  {m.honoraires > 0 && (
                    <span className="text-[8px] text-neutral-400 mb-0.5 tabular-nums">
                      {m.honoraires >= 1000
                        ? `${(m.honoraires / 1000).toFixed(1)}k`
                        : Math.round(m.honoraires)}
                    </span>
                  )}
                  <div
                    className={cn(
                      "w-full rounded-t-md transition-all",
                      isCurrent ? "bg-teal-400" : m.honoraires > 0 ? "bg-teal-100" : "bg-neutral-100",
                      height === 0 && "min-h-[2px]"
                    )}
                    style={{ height: `${Math.max(height, 2)}%` }}
                  />
                </div>
                <span className={cn(
                  "text-[9px]",
                  isCurrent ? "font-bold text-teal-700" : "text-neutral-400"
                )}>
                  {m.label}
                </span>
                {m.count > 0 && (
                  <span className="text-[8px] text-neutral-300">{m.count} FSE</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Pipeline FSE */}
      <div className="rounded-xl border border-[#E8ECF4] bg-white p-5 space-y-3">
        <h3 className="text-[13px] font-semibold text-[#0F172A]">Pipeline des FSE</h3>
        <div className="flex gap-2">
          <StatusBadge icon={<FileText className="w-3 h-3" />} label="Brouillons" count={stats.count.draft} color="neutral" />
          <StatusBadge icon={<Clock className="w-3 h-3" />} label="En attente" count={stats.count.pending} color="amber" />
          <StatusBadge icon={<CheckCircle className="w-3 h-3" />} label="Payées" count={stats.count.paid} color="emerald" />
          <StatusBadge icon={<XCircle className="w-3 h-3" />} label="Rejetées" count={stats.count.rejected} color="red" />
        </div>
        {stats.count.total > 0 && (
          <div className="h-2 rounded-full overflow-hidden flex bg-neutral-100">
            <div className="bg-neutral-300 transition-all" style={{ width: `${(stats.count.draft / stats.count.total) * 100}%` }} />
            <div className="bg-amber-400 transition-all" style={{ width: `${(stats.count.pending / stats.count.total) * 100}%` }} />
            <div className="bg-emerald-400 transition-all" style={{ width: `${(stats.count.paid / stats.count.total) * 100}%` }} />
            <div className="bg-red-400 transition-all" style={{ width: `${(stats.count.rejected / stats.count.total) * 100}%` }} />
          </div>
        )}
      </div>

      {/* Alertes */}
      {stats.count.rejected > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-[13px] font-medium text-red-800">
              {stats.count.rejected} FSE rejetée{stats.count.rejected > 1 ? "s" : ""} par la caisse
            </p>
            <p className="text-[11px] text-red-600 mt-0.5">
              Consultez le détail des rejets dans la liste des factures pour corriger et retransmettre.
            </p>
          </div>
        </div>
      )}
      {stats.count.pending > 5 && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-100">
          <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-[13px] font-medium text-amber-800">
              {stats.count.pending} FSE en attente de paiement
            </p>
            <p className="text-[11px] text-amber-600 mt-0.5">
              Vérifiez l&apos;état de vos télétransmissions et les retours NOEMIE.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Sous-composants ─────────────────────────────────────────────────────────

function KPICard({
  icon, label, value, sublabel, color, trend,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sublabel?: string
  color: string
  trend?: number | null
}) {
  const colorMap: Record<string, string> = {
    teal: "bg-teal-50 text-teal-600",
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    red: "bg-red-50 text-red-600",
    amber: "bg-amber-50 text-amber-600",
  }
  return (
    <div className="rounded-xl border border-[#E8ECF4] bg-white p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", colorMap[color])}>
          {icon}
        </div>
        {trend !== undefined && trend !== null && (
          <span className={cn(
            "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
            trend >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
          )}>
            {trend >= 0 ? "+" : ""}{trend.toFixed(1)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-xl font-bold text-[#0F172A] tabular-nums">{value}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
        {sublabel && <p className="text-[9px] text-neutral-400 mt-0.5">{sublabel}</p>}
      </div>
    </div>
  )
}

function FinancialRow({ label, amount, color, bold }: {
  label: string
  amount: number
  color?: string
  bold?: boolean
}) {
  const colorMap: Record<string, string> = {
    emerald: "text-emerald-600",
    blue: "text-blue-600",
    amber: "text-amber-600",
    purple: "text-purple-600",
  }
  return (
    <div className={cn("flex items-center justify-between py-1.5", bold && "border-b border-[#F1F5F9] pb-2 mb-1")}>
      <span className={cn("text-[12px]", bold ? "font-semibold text-[#0F172A]" : "text-muted-foreground")}>{label}</span>
      <span className={cn(
        "text-[12px] font-medium tabular-nums",
        bold ? "text-[#0F172A] font-bold" : (color ? colorMap[color] : "text-[#0F172A]")
      )}>
        {formatMoney(amount)}
      </span>
    </div>
  )
}

function StatusBadge({ icon, label, count, color }: {
  icon: React.ReactNode
  label: string
  count: number
  color: string
}) {
  const colorMap: Record<string, string> = {
    neutral: "bg-[#F8FAFF] text-[#64748B] border-[#E8ECF4]",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    red: "bg-red-50 text-red-700 border-red-100",
  }
  return (
    <div className={cn("flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border", colorMap[color])}>
      {icon}
      <div>
        <p className="text-[17px] font-bold leading-none tabular-nums">{count}</p>
        <p className="text-[9px] mt-0.5 opacity-70">{label}</p>
      </div>
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
