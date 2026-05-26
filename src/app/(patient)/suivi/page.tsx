import type { Metadata } from "next";
import { SuiviPageClient } from "./page-client";

export const metadata: Metadata = {
  title: "Mon suivi · Nami",
  description: "Vos indicateurs de suivi avec votre équipe soignante.",
  robots: { index: false, follow: false }, // espace patient privé
};

export default function SuiviPage() {
  return <SuiviPageClient />;
}
