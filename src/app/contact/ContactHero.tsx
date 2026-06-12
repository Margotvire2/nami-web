import { Mail } from "lucide-react";

export function ContactHero() {
  return (
    <section
      aria-labelledby="contact-hero-title"
      className="border-b border-[#E8ECF4] bg-white"
    >
      <div className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#EEEDFB] text-[#5B4EC4]"
            aria-hidden="true"
          >
            <Mail size={18} strokeWidth={2} />
          </span>
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5B4EC4]">
            Contact
          </span>
        </div>

        <h1
          id="contact-hero-title"
          className="mt-6 text-4xl font-bold tracking-tight text-[#1A1A2E] sm:text-5xl"
          style={{ fontFamily: "var(--font-jakarta), system-ui, sans-serif" }}
        >
          Nous contacter
        </h1>

        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[#374151]">
          Choisissez le canal qui correspond à votre demande. Chaque message est lu par une personne de l&apos;équipe Nami.
        </p>
      </div>
    </section>
  );
}
