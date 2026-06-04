import Link from "next/link";
import { ArrowRight, Sparkles, Mail } from "lucide-react";

export function FAQFinalCTA() {
  return (
    <section
      aria-labelledby="faq-final-title"
      className="mt-12 md:mt-16 p-6 md:p-8 rounded-2xl"
      style={{
        background: "rgba(91,78,196,0.04)",
        border: "1px solid rgba(91,78,196,0.12)",
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles
          size={18}
          style={{ color: "#5B4EC4" }}
          aria-hidden="true"
        />
        <h2
          id="faq-final-title"
          className="text-lg md:text-xl font-bold tracking-tight"
          style={{
            color: "#1A1A2E",
            letterSpacing: "-0.02em",
            fontFamily: "var(--font-jakarta)",
          }}
        >
          Vous n&apos;avez pas trouvé votre réponse&nbsp;?
        </h2>
      </div>

      <p
        className="text-sm md:text-base leading-relaxed mb-5"
        style={{ color: "#374151" }}
      >
        Notre équipe est là pour vous accompagner. Vous pouvez également
        découvrir Nami plus en détail avant de créer un compte.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <Link
          href="/comment-ca-marche"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(91,78,196,0.4)] focus-visible:ring-offset-2"
          style={{
            background: "#5B4EC4",
            color: "#fff",
            boxShadow: "0 2px 8px rgba(91,78,196,0.25)",
          }}
        >
          Voir comment ça marche
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
        <Link
          href="/signup?role=patient"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-colors hover:bg-[rgba(91,78,196,0.04)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(91,78,196,0.4)] focus-visible:ring-offset-2"
          style={{
            background: "transparent",
            color: "#5B4EC4",
            border: "1.5px solid rgba(91,78,196,0.2)",
          }}
        >
          Créer un compte
        </Link>
        <a
          href="mailto:contact@namipourlavie.com"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-colors hover:bg-[rgba(91,78,196,0.04)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(91,78,196,0.4)] focus-visible:ring-offset-2"
          style={{
            background: "transparent",
            color: "#5B4EC4",
            border: "1.5px solid rgba(91,78,196,0.2)",
          }}
        >
          <Mail size={14} aria-hidden="true" />
          Nous écrire
        </a>
      </div>

      {/* Compliance MDR + RGPD */}
      <p
        className="text-xs italic mt-5"
        style={{ color: "#9CA3AF" }}
      >
        Outil de coordination · Non dispositif médical · Conforme RGPD
      </p>
    </section>
  );
}
