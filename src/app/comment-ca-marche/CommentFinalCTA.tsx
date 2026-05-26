import Link from "next/link";
import { Search, ArrowRight } from "lucide-react";

export function CommentFinalCTA() {
  return (
    <section
      aria-labelledby="final-cta-title"
      className="py-20 md:py-28 px-4 text-center"
      style={{ background: "#1A1A2E" }}
    >
      <div className="max-w-2xl mx-auto">
        <h2
          id="final-cta-title"
          className="text-3xl md:text-5xl font-extrabold tracking-tight mb-5"
          style={{
            color: "#FAFAF8",
            fontFamily: "var(--font-jakarta)",
            letterSpacing: "-0.03em",
          }}
        >
          Prêt(e) à commencer&nbsp;?
        </h2>
        <p
          className="text-base md:text-lg mb-10"
          style={{
            color: "rgba(238,236,234,0.7)",
            lineHeight: 1.55,
          }}
        >
          Trouvez un soignant Nami et coordonnez vos soins dès aujourd&apos;hui.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
          <Link
            href="/trouver-un-soignant"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(91,78,196,0.5)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1A2E]"
            style={{
              background: "#5B4EC4",
              color: "#fff",
              boxShadow: "0 4px 24px rgba(91,78,196,0.4)",
            }}
          >
            <Search size={16} aria-hidden="true" />
            Trouver un soignant
          </Link>
          <Link
            href="/signup?role=patient"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-medium transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1A2E]"
            style={{
              border: "1.5px solid rgba(238,236,234,0.2)",
              color: "rgba(238,236,234,0.85)",
            }}
          >
            Créer un compte
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>

        {/* Mention compliance MDR + RGPD (cohérent PatientLegalFooter PR F1) */}
        <p
          className="mt-10 text-xs italic"
          style={{ color: "rgba(238,236,234,0.4)" }}
        >
          Outil de coordination · Non dispositif médical · Conforme RGPD
        </p>
      </div>
    </section>
  );
}
