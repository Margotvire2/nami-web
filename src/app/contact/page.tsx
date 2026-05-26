import type { Metadata } from "next";
import { ContactHero } from "./ContactHero";
import { ContactGrid } from "./ContactGrid";
import { ContactCompliance } from "./ContactCompliance";
import { ContactFinalCTA } from "./ContactFinalCTA";

export const metadata: Metadata = {
  title: "Contact — Nami",
  description:
    "Contactez l'équipe Nami : patient, professionnel de santé, protection des données (DPO), presse, sécurité ou partenariat institutionnel.",
  keywords: [
    "contact Nami",
    "DPO Nami",
    "protection des données",
    "presse Nami",
    "partenariat santé",
    "coordination soins",
  ],
  openGraph: {
    title: "Contact — Nami",
    description:
      "Six canaux dédiés pour joindre l'équipe Nami : patient, soignant, DPO, presse, sécurité, partenariat.",
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
      <ContactCompliance />
      <ContactFinalCTA />
    </main>
  );
}
