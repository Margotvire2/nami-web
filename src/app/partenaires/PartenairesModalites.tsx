import { PROCESS_STEPS } from "./partenaires-data";

export function PartenairesModalites() {
  return (
    <section
      aria-labelledby="modalites-title"
      className="py-16 md:py-24 px-4"
      style={{ background: "#fff" }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 md:mb-14">
          <h2
            id="modalites-title"
            className="text-2xl md:text-4xl font-extrabold tracking-tight mb-4"
            style={{
              color: "#1A1A2E",
              fontFamily: "var(--font-jakarta)",
              letterSpacing: "-0.02em",
            }}
          >
            Modalités de partenariat
          </h2>
          <p
            className="text-base"
            style={{ color: "#6B7280", maxWidth: 560, margin: "0 auto" }}
          >
            Un process en quatre étapes pour cadrer un partenariat
            institutionnel.
          </p>
        </div>

        <ol className="flex flex-col gap-5">
          {PROCESS_STEPS.map((step) => (
            <li
              key={step.number}
              className="flex items-start gap-5 p-5 md:p-6 rounded-2xl"
              style={{
                background: "#FAFAF8",
                border: "1px solid rgba(26,26,46,0.06)",
              }}
            >
              <div
                className="shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-full text-lg font-bold"
                style={{
                  background: "#5B4EC4",
                  color: "#fff",
                  fontFamily: "var(--font-jakarta)",
                }}
                aria-hidden="true"
              >
                {step.number}
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  className="text-base md:text-lg font-bold mb-1 tracking-tight"
                  style={{
                    color: "#1A1A2E",
                    fontFamily: "var(--font-jakarta)",
                  }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-sm md:text-base"
                  style={{ color: "#374151", lineHeight: 1.55 }}
                >
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <p
          className="text-xs md:text-sm italic mt-8 text-center"
          style={{ color: "#9CA3AF", lineHeight: 1.55 }}
        >
          Tarification adaptée au volume et au périmètre. Aucun engagement
          long terme avant la phase pilote. Modalités détaillées en
          contractualisation.
        </p>
      </div>
    </section>
  );
}
