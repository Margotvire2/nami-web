import Link from "next/link"
import { PRICING_REFERENCE_DATE } from "./tarifs-data"

export function TarifsCompliance() {
  return (
    <section
      aria-labelledby="tarifs-compliance-title"
      style={{
        background: "#F5F3EF",
        padding: "64px clamp(24px, 5vw, 80px)",
        borderTop: "1px solid #E8ECF4",
      }}
    >
      <div
        style={{
          maxWidth: 820,
          margin: "0 auto",
          padding: "28px clamp(20px, 3vw, 36px)",
          background: "#FFFFFF",
          border: "1px solid #E8ECF4",
          borderRadius: 12,
        }}
      >
        <h2
          id="tarifs-compliance-title"
          style={{
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#6B7280",
            margin: "0 0 14px",
            fontFamily: "var(--font-jakarta)",
          }}
        >
          Informations légales sur les tarifs
        </h2>
        <p
          style={{
            fontSize: 13,
            color: "#374151",
            lineHeight: 1.7,
            margin: "0 0 12px",
          }}
        >
          Tarification valable au {PRICING_REFERENCE_DATE}, sous réserve d'évolution. Les tarifs destinés aux soignants et aux structures sont indiqués hors taxes sauf mention contraire ; la TVA applicable s'ajoute selon la réglementation en vigueur.
        </p>
        <p
          style={{
            fontSize: 13,
            color: "#374151",
            lineHeight: 1.7,
            margin: "0 0 16px",
          }}
        >
          Conformément à l'article L113-3 du Code de la consommation, le tarif applicable à un contrat est celui en vigueur à la date de souscription. Les conditions tarifaires détaillées figurent dans les conditions générales acceptées lors de la souscription.
        </p>
        <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.7, margin: 0 }}>
          Pour plus d'informations, consultez les{" "}
          <Link
            href="/cgu"
            style={{ color: "#5B4EC4", fontWeight: 600, textDecoration: "underline" }}
          >
            conditions générales d'utilisation
          </Link>{" "}
          et les{" "}
          <Link
            href="/mentions-legales"
            style={{ color: "#5B4EC4", fontWeight: 600, textDecoration: "underline" }}
          >
            mentions légales
          </Link>
          .
        </p>
      </div>
    </section>
  )
}
