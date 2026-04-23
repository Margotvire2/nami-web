import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nami — Coordination des parcours de soins",
  description: "Outil de coordination pluridisciplinaire pour les réseaux de soins, les structures ambulatoires et les équipes hospitalières.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
