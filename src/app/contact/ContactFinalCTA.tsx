import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function ContactFinalCTA() {
  return (
    <section
      aria-labelledby="contact-final-cta-title"
      className="border-t border-[#E8ECF4] bg-[#FAFAF8]"
    >
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
        <h2
          id="contact-final-cta-title"
          className="text-2xl font-bold tracking-tight text-[#1A1A2E] sm:text-3xl"
          style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
        >
          Une question simple ?
        </h2>

        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#374151]">
          Découvrez Nami sur la page d&apos;accueil ou explorez la plateforme dédiée aux professionnels de santé.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-[#5B4EC4] px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#4D42AE] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFAF8]"
          >
            Découvrir Nami
            <ArrowRight size={14} strokeWidth={2.25} aria-hidden="true" />
          </Link>

          <Link
            href="/soignants"
            className="inline-flex items-center gap-2 rounded-lg border border-[#E8ECF4] bg-white px-5 py-2.5 text-sm font-semibold text-[#1A1A2E] transition-all duration-200 hover:border-[#5B4EC4]/30 hover:text-[#5B4EC4] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFAF8]"
          >
            Espace professionnels
          </Link>
        </div>

        <p className="mt-12 border-t border-[#E8ECF4] pt-6 text-xs text-[#6B7280]">
          Plateforme de coordination des parcours de soins · Conforme RGPD
        </p>
      </div>
    </section>
  );
}
