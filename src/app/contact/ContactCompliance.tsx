import { MapPin, ExternalLink } from "lucide-react";

export function ContactCompliance() {
  return (
    <section
      aria-labelledby="contact-compliance-title"
      className="border-t border-[#E8ECF4] bg-white"
    >
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
        <h2
          id="contact-compliance-title"
          className="text-2xl font-bold tracking-tight text-[#1A1A2E] sm:text-3xl"
          style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
        >
          Adresse postale et CNIL
        </h2>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-[#E8ECF4] bg-white p-6">
            <div className="flex items-center gap-2">
              <span
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEEDFB] text-[#5B4EC4]"
                aria-hidden="true"
              >
                <MapPin size={16} strokeWidth={2} />
              </span>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#1A1A2E]">
                Adresse postale
              </h3>
            </div>
            <address className="mt-4 text-sm not-italic leading-relaxed text-[#374151]">
              Margot Vire — Nami
              <br />
              Hôpital Américain de Paris
              <br />
              55 boulevard du Château
              <br />
              92200 Neuilly-sur-Seine
              <br />
              France
            </address>
          </div>

          <div className="rounded-xl border border-[#E8ECF4] bg-white p-6">
            <div className="flex items-center gap-2">
              <span
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEEDFB] text-[#5B4EC4]"
                aria-hidden="true"
              >
                <ExternalLink size={16} strokeWidth={2} />
              </span>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#1A1A2E]">
                Réclamation CNIL
              </h3>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-[#374151]">
              Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de la CNIL :
            </p>
            <a
              href="https://www.cnil.fr/plaintes"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#5B4EC4] underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-sm"
            >
              cnil.fr/plaintes
              <ExternalLink size={12} strokeWidth={2.25} aria-hidden="true" />
            </a>
          </div>
        </div>

        <p className="mt-8 text-xs text-[#6B7280]">
          Conforme RGPD · Hébergement Supabase eu-west-3 (Paris)
        </p>
      </div>
    </section>
  );
}
