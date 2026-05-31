import type { Metadata } from "next";
import { ParcoursHubPageClient } from "./page-client";

export const metadata: Metadata = {
  title: "Mon parcours — Espace patient · Nami",
  description:
    "Retrouvez les étapes, rendez-vous, soignants, documents et messages de votre parcours.",
  // Page authentifiée — pas d'indexation Google.
  robots: { index: false, follow: false },
};

interface ParcoursHubPageProps {
  params: Promise<{ careCaseId: string }>;
}

export default async function ParcoursHubPage({
  params,
}: ParcoursHubPageProps) {
  const { careCaseId } = await params;
  return <ParcoursHubPageClient careCaseId={careCaseId} />;
}
