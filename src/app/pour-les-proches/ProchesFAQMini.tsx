import Link from "next/link";
import { ChevronDown, ArrowRight } from "lucide-react";
import { PROCHES_FAQ } from "./proches-data";

export function ProchesFAQMini() {
  return (
    <section
      aria-labelledby="proches-faq-title"
      className="py-16 md:py-24 px-4"
      style={{ background: "#fff" }}
    >
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10 md:mb-12">
          <h2
            id="proches-faq-title"
            className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4"
            style={{
              color: "#1A1A2E",
              fontFamily: "var(--font-jakarta)",
              letterSpacing: "-0.03em",
            }}
          >
            Questions fréquentes des proches
          </h2>
          <p
            className="text-base md:text-lg"
            style={{ color: "#6B7280" }}
          >
            Les essentielles avant de commencer.
          </p>
        </div>

        <div className="flex flex-col gap-3 mb-8">
          {PROCHES_FAQ.map((faq) => (
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
                <span className="text-base md:text-lg font-semibold leading-snug flex-1">
                  {faq.question}
                </span>
                <ChevronDown
                  size={20}
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

        {/* Lien FAQ complète */}
        <div className="text-center">
          <Link
            href="/faq"
            className="inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(91,78,196,0.4)] focus-visible:ring-offset-2 rounded-full px-3 py-1"
            style={{ color: "#5B4EC4" }}
          >
            Voir toutes les questions fréquentes
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
