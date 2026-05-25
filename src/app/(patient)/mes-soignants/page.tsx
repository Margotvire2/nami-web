import type { Metadata } from "next";
import { MesSoignantsPageClient } from "./page-client";

/**
 * /mes-soignants — Gestion de l'équipe soignante (espace patient)
 *
 * Server component minimal : metadata noindex + délègue au composant client.
 * La page elle-même reste behind auth (layout (patient) gate accessToken).
 */
export const metadata: Metadata = {
  title: "Mes soignants — Nami",
  description: "Gérez les soignants autorisés à accéder à votre dossier de coordination.",
  robots: { index: false, follow: false },
};

export default function MesSoignantsPage() {
  return <MesSoignantsPageClient />;
}
