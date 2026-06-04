/**
 * KpiTrendChart — courbe de croissance 30 jours pour le dashboard admin.
 * Affiche les inscriptions totales + ventilation Patients/Soignants.
 */
"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { AdminKpiGrowthEntry } from "@/hooks/useAdminKpis";

interface KpiTrendChartProps {
  data: AdminKpiGrowthEntry[];
}

function formatDateShort(iso: string): string {
  // iso = YYYY-MM-DD → DD/MM
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

export function KpiTrendChart({ data }: KpiTrendChartProps) {
  const series = data.map((e) => ({
    date: formatDateShort(e.date),
    total: e.signupsTotal,
    patients: e.signupsByRole.PATIENT ?? 0,
    providers: e.signupsByRole.PROVIDER ?? 0,
  }));

  return (
    <div className="admin-card-static p-5" data-testid="kpi-trend-chart">
      <div className="flex items-center justify-between mb-4">
        <h3
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#1A1A2E",
            letterSpacing: "-0.01em",
          }}
        >
          Croissance 30 jours
        </h3>
        <span style={{ fontSize: 12, color: "#6B7280" }}>
          Inscriptions cumulées par jour
        </span>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={series} margin={{ top: 4, right: 16, bottom: 0, left: -8 }}>
          <CartesianGrid stroke="rgba(26,26,46,0.05)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#6B7280" }}
            tickLine={false}
            axisLine={false}
            interval={3}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#6B7280" }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              background: "#fff",
              border: "1px solid rgba(26,26,46,0.08)",
              borderRadius: 10,
              fontSize: 12,
            }}
            labelStyle={{ color: "#1A1A2E", fontWeight: 600 }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            iconType="line"
            iconSize={10}
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#4F46E5"
            strokeWidth={2}
            dot={false}
            name="Total"
          />
          <Line
            type="monotone"
            dataKey="patients"
            stroke="#2BA89C"
            strokeWidth={1.5}
            dot={false}
            name="Patients"
          />
          <Line
            type="monotone"
            dataKey="providers"
            stroke="#D97706"
            strokeWidth={1.5}
            dot={false}
            name="Soignants"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
