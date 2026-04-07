import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Créer un compte — Nami",
  description: "Rejoignez Nami — coordination clinique pour soignants et patients.",
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
