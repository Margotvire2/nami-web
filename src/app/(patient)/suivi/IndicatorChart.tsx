"use client";

import { LineChart, Line, Area, AreaChart, ResponsiveContainer, YAxis, Tooltip } from "recharts";
import type { IndicatorMeasurement } from "./mock-data";

interface IndicatorChartProps {
  measurements: IndicatorMeasurement[];
  unit: string;
  labelForA11y: string;
}

/**
 * Mini courbe d'évolution — area chart discret sans axes labels.
 * <figure> + <figcaption> a11y avec valeurs min/max/dernière (pas d'interprétation).
 */
export function IndicatorChart({ measurements, unit, labelForA11y }: IndicatorChartProps) {
  if (measurements.length === 0) {
    return (
      <div
        role="status"
        style={{
          height: 80,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          color: "#9CA3AF",
        }}
      >
        Pas de mesure sur cette période
      </div>
    );
  }

  // Calcul values min/max/last pour aria-label (factuel, pas d'interprétation)
  const values = measurements.map((m) => m.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const last = values[values.length - 1];
  const figcaption = `${labelForA11y} : ${measurements.length} mesure${measurements.length > 1 ? "s" : ""}, minimum ${min} ${unit}, maximum ${max} ${unit}, dernière valeur ${last} ${unit}`;

  return (
    <figure style={{ margin: 0 }} aria-label={figcaption}>
      <div style={{ width: "100%", height: 80 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={measurements} margin={{ top: 6, right: 4, bottom: 0, left: 4 }}>
            <defs>
              <linearGradient id="nami-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5B4EC4" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#5B4EC4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis hide domain={["auto", "auto"]} />
            <Tooltip
              cursor={{ stroke: "#5B4EC4", strokeOpacity: 0.2 }}
              contentStyle={{
                background: "#FFFFFF",
                border: "1px solid rgba(26,26,46,0.1)",
                borderRadius: 8,
                fontSize: 12,
                padding: "6px 10px",
              }}
              labelStyle={{ color: "#6B7280" }}
              itemStyle={{ color: "#1A1A2E" }}
              formatter={(value) => [`${value} ${unit}`, ""]}
              labelFormatter={(label) =>
                new Date(String(label)).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              }
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#5B4EC4"
              strokeWidth={2}
              fill="url(#nami-fill)"
              dot={false}
              activeDot={{ r: 3, fill: "#5B4EC4" }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="sr-only">{figcaption}</figcaption>
    </figure>
  );
}

// Export unused but available pour V2 si Line préféré sur certains indicateurs
export { LineChart, Line };
