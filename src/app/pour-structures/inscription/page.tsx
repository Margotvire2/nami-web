"use client";

import Link from "next/link";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { SignupWizard } from "@/components/signup/SignupWizard";

export default function InscriptionPage() {
  return (
    <>
      <PublicNavbar />
      <main
        style={{
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          background: "#FAFAF8",
          color: "#1A1A2E",
          minHeight: "100vh",
          padding: "120px 24px 80px",
        }}
      >
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <Link
            href="/pour-structures"
            style={{
              fontSize: 13,
              color: "#5B4EC4",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            ← Retour à la présentation
          </Link>
          <h1
            style={{
              fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
              fontWeight: 700,
              marginTop: 16,
              marginBottom: 8,
              letterSpacing: "-0.02em",
            }}
          >
            Inscrire ma structure
          </h1>
          <p
            style={{
              fontSize: 16,
              color: "#374151",
              marginBottom: 32,
              lineHeight: 1.55,
            }}
          >
            5 étapes courtes. Vous pouvez sauvegarder votre progression à tout
            moment en revenant en arrière. L&apos;équipe Nami examinera votre
            demande sous 24 à 48&nbsp;heures.
          </p>
          <SignupWizard />
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
