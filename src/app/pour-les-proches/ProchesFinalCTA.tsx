import Link from "next/link";
import { ArrowRight, HelpCircle } from "lucide-react";

export function ProchesFinalCTA() {
  return (
    <section
      aria-labelledby="proches-final-cta-title"
      className="py-20 md:py-28 px-4 text-center"
      style={{ background: "#1A1A2E" }}
    >
      <div className="max-w-2xl mx-auto">
        <h2
          id="proches-final-cta-title"
          className="text-3xl md:text-5xl font-extrabold tracking-tight mb-5"
          style={{
            color: "#FAFAF8",
            fontFamily: "var(--font-jakarta)",
            letterSpacing: "-0.03em",
          }}
        >
          Prêt(e) à accompagner votre proche&nbsp;?
        </h2>
        <p
          className="text-base md:text-lg mb-10"
          style={{
            color: "rgba(238,236,234,0.7)",
            lineHeight: 1.55,
          }}
        >
          Créez votre compte et ajoutez le profil de votre proche pour
          centraliser sa coordination de soins.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
          <Link
            href="/signup?role=patient"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(91,78,196,0.5)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1A2E]"
            style={{
              background: "#5B4EC4",
              color: "#fff",
              boxShadow: "0 4px 24px rgba(91,78,196,0.4)",
            }}
          >
            Créer un compte
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
          <Link
            href="/faq"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-medium transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1A2E]"
            style={{
              border: "1.5px solid rgba(238,236,234,0.2)",
              color: "rgba(238,236,234,0.85)",
            }}
          >
            <HelpCircle size={14} aria-hidden="true" />
            Voir la FAQ
          </Link>
        </div>

        {/* Mention compliance MDR + RGPD */}
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
