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
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact & support — Nami",
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
      style={{ fontFamily: "var(--font-jakarta), system-ui, sans-serif" }}
    >
      <ContactHero />
      <ContactGrid />
      <ContactForm />
      <ContactCompliance />
      <ContactFinalCTA />
    </main>
  );
}
