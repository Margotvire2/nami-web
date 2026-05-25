import type { Metadata } from "next";
import AidePageClient from "./page-client";

export const metadata: Metadata = {
  title: "Aide — Espace patient · Nami",
  description:
    "Trouvez rapidement les réponses à vos questions sur Nami : rendez-vous, messages, documents, compte et confidentialité.",
  // Page authentifiée — pas d'indexation Google
  robots: { index: false, follow: false },
};

export default function AidePage() {
  return <AidePageClient />;
}
