import { Mail, ArrowRight } from "lucide-react";
import { PRESSE_CONTACT } from "./presse-data";

export function PresseContact() {
  const mailto = `mailto:${PRESSE_CONTACT.email}?subject=${PRESSE_CONTACT.mailtoSubject}`;

  return (
    <section
      aria-labelledby="presse-contact-title"
      className="py-20 md:py-28 px-4 text-center"
      style={{ background: "#1A1A2E" }}
    >
      <div className="max-w-2xl mx-auto">
        <div
          className="inline-flex items-center justify-center rounded-full mx-auto mb-6"
          style={{
            width: 56,
            height: 56,
            background: "rgba(91,78,196,0.18)",
            color: "#C9C2F5",
            border: "1px solid rgba(91,78,196,0.30)",
          }}
          aria-hidden="true"
        >
          <Mail size={22} />
        </div>

        <h2
          id="presse-contact-title"
          className="text-3xl md:text-5xl font-extrabold tracking-tight mb-5"
          style={{
            color: "#FAFAF8",
            fontFamily: "var(--font-jakarta)",
            letterSpacing: "-0.03em",
          }}
        >
          Contact presse
        </h2>

        <p
          className="text-base md:text-lg mb-2"
          style={{
            color: "rgba(238,236,234,0.7)",
            lineHeight: 1.55,
          }}
        >
          Une interview, une demande d&apos;information, une vérification de
          chiffre ?
        </p>
        <p
          className="text-base md:text-lg mb-10"
          style={{
            color: "rgba(238,236,234,0.55)",
            lineHeight: 1.55,
          }}
        >
          Précisez votre média et votre échéance dans le sujet du message —
          retour sous 48 h ouvrées.
        </p>

        <a
          href={mailto}
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(91,78,196,0.5)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1A2E]"
          style={{
            background: "#5B4EC4",
            color: "#fff",
            boxShadow: "0 4px 24px rgba(91,78,196,0.4)",
          }}
        >
          Écrire à {PRESSE_CONTACT.email}
          <ArrowRight size={14} aria-hidden="true" />
        </a>

        <p
          className="mt-10 text-xs italic"
          style={{ color: "rgba(238,236,234,0.4)" }}
        >
          Le sujet du message est pré-rempli avec [PRESSE] pour faciliter le
          tri.
        </p>
      </div>
    </section>
  );
}
