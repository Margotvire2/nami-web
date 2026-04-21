import type { Metadata } from "next";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";

export const metadata: Metadata = {
  title: "Demander une démo | Nami — Coordination des parcours de soins",
  description:
    "Découvrez Nami en 30 minutes. Agenda, parcours de soins, intelligence clinique — voyez comment Nami simplifie votre coordination au quotidien.",
  alternates: { canonical: "/demander-une-demo" },
  openGraph: {
    title: "Demander une démo | Nami",
    description:
      "30 minutes avec Margot. On part de votre parcours de soins le plus complexe et on construit le dossier ensemble.",
  },
};

export default function DemoRequestLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicNavbar />
      {children}
      <PublicFooter />
    </>
  );
}
