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
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact — Nami",
    description:
      "Six canaux dédiés pour joindre l'équipe Nami : patient, soignant, DPO, presse, sécurité, partenariat.",
    url: "https://namipourlavie.com/contact",
    type: "website",
    siteName: "Nami",
    locale: "fr_FR",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Nami — Contact" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact — Nami",
    description:
      "Six canaux dédiés pour joindre l'équipe Nami : patient, soignant, DPO, presse, sécurité, partenariat.",
    images: ["/og-default.png"],
  },
  robots: { index: true, follow: true },
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
