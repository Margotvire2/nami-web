import { IndicatorCard } from "./IndicatorCard";
import type { MockIndicator, PeriodKey } from "./mock-data";
import {
  categorizeIndicator,
  shouldShowToPatient,
  needsInterpretationDisclaimer,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  type PatientObservationCategory,
} from "./observationCategoryMapping";

interface IndicatorsGridProps {
  indicators: MockIndicator[];
  period: PeriodKey;
}

const SECTION_TITLE_STYLE = {
  fontSize: 14,
  fontWeight: 700,
  color: "#1A1A2E",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  marginBottom: 12,
  fontFamily: "var(--font-jakarta)",
};

const BIOLOGY_DISCLAIMER_STYLE = {
  background: "rgba(91,78,196,0.06)",
  borderRadius: 12,
  padding: "12px 16px",
  fontSize: 13,
  color: "#4B5563",
  marginBottom: 16,
  lineHeight: 1.5,
  fontFamily: "var(--font-jakarta)",
};

const VITAL_NOTE_STYLE = {
  fontSize: 12,
  fontStyle: "italic" as const,
  color: "#6B7280",
  marginBottom: 16,
  fontFamily: "var(--font-jakarta)",
};

export function IndicatorsGrid({ indicators, period }: IndicatorsGridProps) {
  const visible = indicators.filter((ind) => shouldShowToPatient(categorizeIndicator(ind)));

  if (visible.length === 0) {
    return (
      <section role="region" aria-label="Indicateurs de suivi">
        <p
          style={{
            fontSize: 13,
            color: "#6B7280",
            textAlign: "center",
            padding: "32px 0",
            fontFamily: "var(--font-jakarta)",
          }}
        >
          Vos indicateurs apparaîtront ici après vos prochaines consultations.
        </p>
      </section>
    );
  }

  const grouped = new Map<PatientObservationCategory, MockIndicator[]>();
  for (const ind of visible) {
    const cat = categorizeIndicator(ind);
    const bucket = grouped.get(cat) ?? [];
    bucket.push(ind);
    grouped.set(cat, bucket);
  }

  return (
    <section role="region" aria-label="Indicateurs de suivi">
      {CATEGORY_ORDER.filter((cat) => grouped.has(cat)).map((cat) => {
        const items = grouped.get(cat)!;
        const titleId = `suivi-category-${cat}`;

        return (
          <div
            key={cat}
            role="group"
            aria-labelledby={titleId}
            style={{ marginBottom: 32 }}
          >
            <h2 id={titleId} style={SECTION_TITLE_STYLE}>
              {CATEGORY_LABELS[cat]}
            </h2>

            {needsInterpretationDisclaimer(cat) ? (
              <p style={BIOLOGY_DISCLAIMER_STYLE}>
                📋 Ces valeurs viennent de vos analyses biologiques. Pour les
                interpréter et comprendre ce qu&apos;elles signifient pour vous,
                parlez-en à votre soignant lors de votre prochain rendez-vous.
              </p>
            ) : null}

            {cat === "vital_signs" ? (
              <p style={VITAL_NOTE_STYLE}>
                Mesures relevées lors de vos consultations.
              </p>
            ) : null}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 16,
              }}
            >
              {items.map((indicator) => (
                <IndicatorCard
                  key={indicator.slug}
                  indicator={indicator}
                  period={period}
                />
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
