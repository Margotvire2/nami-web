import { HelpCircle, Sparkles } from "lucide-react";

export function FAQHero() {
  return (
    <header
      className="text-center mb-8 md:mb-12 pt-8 md:pt-12"
      aria-labelledby="faq-hero-title"
    >
      <div
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
        style={{
          background: "rgba(91,78,196,0.08)",
          color: "#5B4EC4",
          border: "1px solid rgba(91,78,196,0.15)",
        }}
      >
        <Sparkles size={12} aria-hidden="true" />
        FAQ
      </div>

      <div
        className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-5"
        style={{ background: "rgba(91,78,196,0.08)", color: "#5B4EC4" }}
        aria-hidden="true"
      >
        <HelpCircle size={26} strokeWidth={1.8} />
      </div>

      <h1
        id="faq-hero-title"
        className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4"
        style={{
          color: "#1A1A2E",
          letterSpacing: "-0.03em",
          fontFamily: "var(--font-jakarta)",
        }}
      >
        Foire aux questions
      </h1>

      <p
        className="text-base md:text-lg"
        style={{
          color: "#374151",
          lineHeight: 1.55,
          maxWidth: 560,
          margin: "0 auto",
        }}
      >
        Vos questions, nos réponses. Si vous ne trouvez pas ce que vous
        cherchez, contactez-nous via le formulaire en bas de page.
      </p>
    </header>
  );
}
