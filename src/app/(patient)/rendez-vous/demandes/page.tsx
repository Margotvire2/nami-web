import type { Metadata } from "next";
import { DemandesPageClient } from "./page-client";

export const metadata: Metadata = {
  title: "Mes demandes de rendez-vous · Nami",
  description: "Suivez l'état de vos demandes de rendez-vous en attente.",
  robots: { index: false, follow: false }, // espace patient privé
};

export default function DemandesPage() {
  return <DemandesPageClient />;
}
