import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion — Nami",
  description: "Connectez-vous à votre cockpit clinique Nami.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
