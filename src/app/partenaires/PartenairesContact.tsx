import Link from "next/link";
import { Mail, ArrowRight } from "lucide-react";

export function PartenairesContact() {
  return (
    <section
      aria-labelledby="contact-title"
      className="py-20 md:py-28 px-4 text-center"
      style={{ background: "#1A1A2E" }}
    >
      <div className="max-w-2xl mx-auto">
        <h2
          id="contact-title"
          className="text-2xl md:text-4xl font-extrabold tracking-tight mb-5"
          style={{
            color: "#FAFAF8",
            fontFamily: "var(--font-jakarta)",
            letterSpacing: "-0.02em",
          }}
        >
          Discuter d&apos;un partenariat
        </h2>
        <p
          className="text-base md:text-lg mb-10"
          style={{
            color: "rgba(238,236,234,0.7)",
            lineHeight: 1.55,
          }}
        >
          Présentez-nous votre structure et votre besoin de coordination. Nous
          revenons vers vous avec une proposition adaptée à votre périmètre.
          Une réponse personnalisée, sans promesse de délai automatique.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
          <a
            href="mailto:contact@namipourlavie.com?subject=Partenariat%20institutionnel%20Nami"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(91,78,196,0.5)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1A2E]"
            style={{
              background: "#5B4EC4",
              color: "#fff",
              boxShadow: "0 4px 24px rgba(91,78,196,0.4)",
            }}
          >
            <Mail size={16} aria-hidden="true" />
            contact@namipourlavie.com
          </a>
          <Link
            href="/comment-ca-marche"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-medium transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1A2E]"
            style={{
              border: "1.5px solid rgba(238,236,234,0.2)",
              color: "rgba(238,236,234,0.85)",
            }}
          >
            Voir comment ça marche
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>

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
