import type { Metadata } from "next";
import { CommentHero } from "./CommentHero";
import { CommentStepCard } from "./CommentStepCard";
import { CommentForWho } from "./CommentForWho";
import { CommentFAQMini } from "./CommentFAQMini";
import { CommentFinalCTA } from "./CommentFinalCTA";
import { PublicFooter } from "@/components/public/PublicFooter";
import { STEPS } from "./steps-data";

export const metadata: Metadata = {
  title: "Comment ça marche — Nami, votre coordination de soins",
  description:
    "4 étapes simples pour trouver votre soignant, prendre rendez-vous, préparer votre consultation et continuer votre parcours sereinement.",
  keywords: [
    "comment ça marche",
    "nami",
    "coordination soins",
    "prendre rendez-vous",
    "espace patient",
    "trouver soignant",
    "parcours patient",
  ],
  openGraph: {
    title: "Comment ça marche — Nami",
    description:
      "Coordination de soins simple et sécurisée en 4 étapes : trouver, prendre RDV, préparer, suivre.",
    type: "website",
    locale: "fr_FR",
  },
  alternates: { canonical: "/comment-ca-marche" },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Comment utiliser Nami pour coordonner vos soins",
  description:
    "4 étapes simples pour gérer vos rendez-vous, documents et parcours avec votre équipe soignante.",
  step: STEPS.map((s) => ({
    "@type": "HowToStep",
    position: s.number,
    name: s.title,
    text: s.description,
  })),
};

export default function CommentCaMarchePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main id="main" style={{ background: "#FAFAF8" }}>
        <CommentHero />

        {/* 4 étapes alternées gauche/droite desktop */}
        <section
          aria-labelledby="steps-heading"
          className="py-16 md:py-24 px-4"
          style={{ background: "#FAFAF8" }}
        >
          <div className="text-center mb-12 md:mb-16 max-w-3xl mx-auto">
            <h2
              id="steps-heading"
              className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4"
              style={{
                color: "#1A1A2E",
                fontFamily: "var(--font-jakarta)",
                letterSpacing: "-0.03em",
              }}
            >
              4 étapes simples
            </h2>
            <p
              className="text-base md:text-lg"
              style={{ color: "#6B7280" }}
            >
              De la recherche du bon soignant au suivi continu de votre parcours.
            </p>
          </div>

          <div className="max-w-5xl mx-auto flex flex-col gap-16 md:gap-24">
            {STEPS.map((step) => (
              <CommentStepCard
                key={step.number}
                step={step}
                reversed={step.number % 2 === 0}
              />
            ))}
          </div>
        </section>

        <CommentForWho />
        <CommentFAQMini />
        <CommentFinalCTA />
      </main>

      <PublicFooter />
    </>
  );
}
