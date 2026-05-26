import Link from "next/link";
import { Mail, MessageCircle, Sparkles } from "lucide-react";

export function AideContactCTA() {
  return (
    <section
      aria-labelledby="aide-contact-title"
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
          id="aide-contact-title"
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
        className="text-sm leading-relaxed mb-5"
        style={{ color: "#374151" }}
      >
        Notre équipe est là pour vous aider. Vous pouvez contacter votre
        soignant directement, ou nous écrire pour toute question concernant
        Nami.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/mes-messages"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(91,78,196,0.4)] focus-visible:ring-offset-2"
          style={{
            background: "#5B4EC4",
            color: "#fff",
            boxShadow: "0 2px 8px rgba(91,78,196,0.25)",
          }}
        >
          <MessageCircle size={15} aria-hidden="true" />
          Contacter mon soignant
        </Link>
        <a
          href="mailto:support@namipourlavie.com"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(91,78,196,0.4)] focus-visible:ring-offset-2"
          style={{
            background: "transparent",
            color: "#5B4EC4",
            border: "1.5px solid rgba(91,78,196,0.2)",
          }}
        >
          <Mail size={15} aria-hidden="true" />
          Écrire à l&apos;équipe Nami
        </a>
      </div>
    </section>
  );
}
