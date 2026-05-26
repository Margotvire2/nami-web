import type { Metadata } from "next";
import { MesDonneesPageClient } from "./page-client";

export const metadata: Metadata = {
  title: "Mes données et mes droits — Nami",
  description:
    "Exercez vos droits RGPD sur vos données personnelles : accès, rectification, portabilité, suppression.",
  robots: { index: false, follow: false },
};

export default function MesDonneesPage() {
  return <MesDonneesPageClient />;
}
