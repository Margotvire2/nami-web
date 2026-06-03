import type { Metadata } from "next";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { buildPageMetadata, buildServiceJsonLd, jsonLdScript, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Fonctionnalités — Coordination des parcours de soins | Nami",
  description:
    "Découvrez les fonctionnalités Nami : dossier de coordination pluridisciplinaire, adressage, brouillon IA sourcé, annuaire 564 000+ professionnels. Gratuit pour les soignants.",
  path: "/fonctionnalites",
  keywords: [
    "coordination soins",
    "dossier de coordination",
    "adressage médical",
    "annuaire professionnel santé",
    "logiciel coordination pluridisciplinaire",
  ],
});

const serviceJsonLd = buildServiceJsonLd({
  name: "Coordination des parcours de soins pluridisciplinaires",
  description:
    "Plateforme de coordination pluridisciplinaire : dossier partagé, adressage, brouillon IA sourcé.",
  url: `${SITE_URL}/fonctionnalites`,
  serviceType: "Coordination des soins",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(serviceJsonLd)} />
      <PublicNavbar />
      {children}
      <PublicFooter />
    </>
  );
}

