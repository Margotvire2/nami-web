import type { Metadata } from "next";
import { DUTCALayout } from "@/components/pitch/DUTCALayout";

export const metadata: Metadata = {
  title: "Protocole de recherche · Margot Vire",
  description: "Synopsis de protocole et revue de littérature — Conséquences somatiques à long terme de l'anorexie mentale précoce chez l'adulte. DU TCA Enfant-Adolescent, Université de Rouen · Hôpital Cochin.",
  robots: { index: false, follow: false },
};

export default function ProtocoleRecherchePage() {
  return <DUTCALayout />;
}
