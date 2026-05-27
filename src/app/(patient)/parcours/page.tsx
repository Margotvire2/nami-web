import type { Metadata } from "next";
import { ParcoursPageClient } from "./page-client";

export const metadata: Metadata = {
  title: "Mon parcours — Espace patient · Nami",
  description:
    "Visualisez les phases de votre parcours de soins et l'état de chaque étape.",
  // Page authentifiée — pas d'indexation Google
  robots: { index: false, follow: false },
};

export default function ParcoursPage() {
  return <ParcoursPageClient />;
}
