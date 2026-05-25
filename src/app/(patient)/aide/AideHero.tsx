import { HelpCircle } from "lucide-react";

export function AideHero() {
  return (
    <header
      className="text-center mb-8 md:mb-12"
      aria-labelledby="aide-hero-title"
    >
      <div
        className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-5"
        style={{ background: "rgba(91,78,196,0.08)", color: "#5B4EC4" }}
        aria-hidden="true"
      >
        <HelpCircle size={26} strokeWidth={1.8} />
      </div>

      <h1
        id="aide-hero-title"
        className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3"
        style={{
          color: "#1A1A2E",
          letterSpacing: "-0.03em",
          fontFamily: "var(--font-jakarta)",
        }}
      >
        Comment pouvons-nous vous aider&nbsp;?
      </h1>

      <p
        className="text-base md:text-lg"
        style={{
          color: "#6B7280",
          lineHeight: 1.6,
          maxWidth: 540,
          margin: "0 auto",
        }}
      >
        Trouvez rapidement les réponses à vos questions sur les rendez-vous,
        messages, documents, votre compte et la confidentialité de vos données.
      </p>
    </header>
  );
}
