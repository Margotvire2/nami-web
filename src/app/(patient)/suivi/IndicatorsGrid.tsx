import { IndicatorCard } from "./IndicatorCard";
import type { MockIndicator, PeriodKey } from "./mock-data";

interface IndicatorsGridProps {
  indicators: MockIndicator[];
  period: PeriodKey;
}

export function IndicatorsGrid({ indicators, period }: IndicatorsGridProps) {
  return (
    <section role="region" aria-label="Indicateurs de suivi">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        {indicators.map((indicator) => (
          <IndicatorCard key={indicator.slug} indicator={indicator} period={period} />
        ))}
      </div>
    </section>
  );
}
