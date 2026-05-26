import { COMPARISON_TABLE } from "./tarifs-data"

function renderCell(value: boolean | string, audienceLabel: string) {
  if (value === true) {
    return (
      <span
        aria-label={`Inclus pour ${audienceLabel}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: "#EEEDFB",
          color: "#5B4EC4",
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        ✓
      </span>
    )
  }
  if (value === "—" || value === false) {
    return (
      <span
        aria-label={`Non inclus pour ${audienceLabel}`}
        style={{ color: "#C4C4CC", fontSize: 14, fontWeight: 500 }}
      >
        —
      </span>
    )
  }
  return (
    <span
      style={{
        fontSize: 12,
        fontWeight: 600,
        color: "#5B4EC4",
        background: "#EEEDFB",
        padding: "3px 10px",
        borderRadius: 999,
        whiteSpace: "nowrap",
      }}
    >
      {value}
    </span>
  )
}

// Regroupement par catégorie
function groupByCategory(rows: typeof COMPARISON_TABLE) {
  const groups: { category: string; rows: typeof COMPARISON_TABLE }[] = []
  for (const row of rows) {
    const existing = groups.find((g) => g.category === row.category)
    if (existing) existing.rows.push(row)
    else groups.push({ category: row.category, rows: [row] })
  }
  return groups
}

export function TarifsComparison() {
  const groups = groupByCategory(COMPARISON_TABLE)

  return (
    <section
      aria-labelledby="tarifs-comparison-title"
      style={{
        background: "#F5F3EF",
        padding: "80px clamp(24px, 5vw, 80px)",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#5B4EC4",
              marginBottom: 12,
            }}
          >
            Comparaison
          </div>
          <h2
            id="tarifs-comparison-title"
            style={{
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              fontWeight: 800,
              letterSpacing: "-0.025em",
              color: "#1A1A2E",
              margin: 0,
              fontFamily: "var(--font-jakarta)",
            }}
          >
            Ce qui est inclus, par profil
          </h2>
        </div>

        {/* Desktop : table */}
        <div
          className="tarifs-comparison-table-wrap"
          style={{
            background: "#FFFFFF",
            border: "1px solid #E8ECF4",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 1px 2px rgba(26,26,46,0.04)",
          }}
        >
          <table
            role="table"
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 14,
            }}
          >
            <caption className="sr-only">Comparaison des tarifs et fonctionnalités par profil</caption>
            <thead>
              <tr style={{ background: "#FAFAF8", borderBottom: "1px solid #E8ECF4" }}>
                <th
                  scope="col"
                  style={{
                    textAlign: "left",
                    padding: "14px 20px",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#6B7280",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Fonctionnalité
                </th>
                <th
                  scope="col"
                  style={{
                    textAlign: "center",
                    padding: "14px 20px",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#1A1A2E",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Patient
                </th>
                <th
                  scope="col"
                  style={{
                    textAlign: "center",
                    padding: "14px 20px",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#1A1A2E",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Soignant libéral
                </th>
                <th
                  scope="col"
                  style={{
                    textAlign: "center",
                    padding: "14px 20px",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#1A1A2E",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Structure
                </th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => (
                <>
                  <tr key={`cat-${group.category}`} style={{ background: "#FAFAF8" }}>
                    <td
                      colSpan={4}
                      style={{
                        padding: "12px 20px",
                        fontSize: 11,
                        fontWeight: 800,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "#5B4EC4",
                      }}
                    >
                      {group.category}
                    </td>
                  </tr>
                  {group.rows.map((row, idx) => (
                    <tr
                      key={`${group.category}-${idx}`}
                      style={{ borderTop: "1px solid #F1F3F8" }}
                    >
                      <th
                        scope="row"
                        style={{
                          textAlign: "left",
                          padding: "14px 20px",
                          fontSize: 14,
                          fontWeight: 500,
                          color: "#1A1A2E",
                        }}
                      >
                        {row.feature}
                      </th>
                      <td style={{ textAlign: "center", padding: "14px 20px" }}>
                        {renderCell(row.patient, "Patient")}
                      </td>
                      <td style={{ textAlign: "center", padding: "14px 20px" }}>
                        {renderCell(row.soignant, "Soignant libéral")}
                      </td>
                      <td style={{ textAlign: "center", padding: "14px 20px" }}>
                        {renderCell(row.structure, "Structure")}
                      </td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile : accordions */}
        <div className="tarifs-comparison-accordion" style={{ display: "none", flexDirection: "column", gap: 12 }}>
          {(["patient", "soignant", "structure"] as const).map((audience) => {
            const label = audience === "patient" ? "Patient" : audience === "soignant" ? "Soignant libéral" : "Structure"
            return (
              <details
                key={audience}
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E8ECF4",
                  borderRadius: 12,
                  padding: "16px 20px",
                }}
              >
                <summary
                  style={{
                    cursor: "pointer",
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#1A1A2E",
                    listStyle: "none",
                    fontFamily: "var(--font-jakarta)",
                  }}
                >
                  {label}
                </summary>
                <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 14 }}>
                  {groups.map((group) => (
                    <div key={`m-${audience}-${group.category}`}>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "#5B4EC4",
                          marginBottom: 8,
                        }}
                      >
                        {group.category}
                      </div>
                      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                        {group.rows.map((row, idx) => (
                          <li
                            key={`m-${audience}-${group.category}-${idx}`}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: 12,
                              fontSize: 13,
                              color: "#1A1A2E",
                              padding: "6px 0",
                            }}
                          >
                            <span>{row.feature}</span>
                            <span>{renderCell(row[audience], label)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </details>
            )
          })}
        </div>
      </div>

      <style>{`
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0,0,0,0);
          white-space: nowrap;
          border: 0;
        }
        @media (max-width: 767px) {
          .tarifs-comparison-table-wrap { display: none !important; }
          .tarifs-comparison-accordion { display: flex !important; }
        }
      `}</style>
    </section>
  )
}
