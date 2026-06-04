import type { Metadata } from "next";
import { ContactHero } from "./ContactHero";
import { ContactGrid } from "./ContactGrid";
import { ContactForm } from "./ContactForm";
import { ContactCompliance } from "./ContactCompliance";
import { ContactFinalCTA } from "./ContactFinalCTA";

export const metadata: Metadata = {
  title: "Contact & support — Nami",
  description:
    "Contactez le support Nami via formulaire : patient, professionnel de santé, RGPD, partenariat. Réponse sous 48h. En cas d'urgence vitale, composez le 15, 112 ou 3114.",
  keywords: [
    "contact Nami",
    "support Nami",
    "DPO Nami",
    "protection des données",
    "partenariat santé",
    "coordination soins",
  ],
  openGraph: {
    title: "Contact & support — Nami",
    description:
      "Formulaire de contact direct vers l'équipe Nami. Réponse sous 48 heures ouvrées.",
  },
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <main
      id="main"
      className="bg-[#FAFAF8]"
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
    >
      <ContactHero />
      <ContactGrid />
      <ContactForm />
      <ContactCompliance />
      <ContactFinalCTA />
    </main>
  );
}
