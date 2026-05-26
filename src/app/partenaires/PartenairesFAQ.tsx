import { ChevronDown } from "lucide-react";
import { INSTITUTIONAL_FAQ } from "./partenaires-data";

export function PartenairesFAQ() {
  return (
    <section
      aria-labelledby="partenaires-faq-title"
      className="py-16 md:py-24 px-4"
      style={{ background: "#fff" }}
    >
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10 md:mb-12">
          <h2
            id="partenaires-faq-title"
            className="text-2xl md:text-4xl font-extrabold tracking-tight mb-4"
            style={{
              color: "#1A1A2E",
              fontFamily: "var(--font-jakarta)",
              letterSpacing: "-0.02em",
            }}
          >
            Questions fréquentes
          </h2>
          <p
            className="text-base"
            style={{ color: "#6B7280", maxWidth: 540, margin: "0 auto" }}
          >
            Les essentielles pour cadrer un partenariat institutionnel.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {INSTITUTIONAL_FAQ.map((faq) => (
            <details
              key={faq.id}
              className="group rounded-xl"
              style={{
                background: "#FAFAF8",
                border: "1px solid rgba(26,26,46,0.06)",
                boxShadow: "0 1px 3px rgba(26,26,46,0.03)",
              }}
            >
              <summary
                className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer list-none rounded-xl transition-colors hover:bg-[rgba(91,78,196,0.02)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(91,78,196,0.4)]"
                style={{ color: "#1A1A2E" }}
              >
                <span className="text-sm md:text-base font-semibold leading-snug flex-1">
                  {faq.question}
                </span>
                <ChevronDown
                  size={18}
                  className="shrink-0 transition-transform duration-200 group-open:rotate-180"
                  style={{ color: "#5B4EC4" }}
                  aria-hidden="true"
                />
              </summary>
              <p
                className="px-5 pb-5 text-sm md:text-base"
                style={{ color: "#374151", lineHeight: 1.6 }}
              >
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
