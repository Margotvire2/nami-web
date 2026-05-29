"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { BilanUploadCard } from "../_components/BilanUploadCard";

const C = {
  bg: "#FAFAF8",
  text: "#1A1A2E",
  textSoft: "#6B7280",
  primary: "#5B4EC4",
};

export default function MesBilansUploadPage() {
  return (
    <main
      aria-label="Ajouter un bilan"
      style={{
        padding: "20px 0 80px",
        maxWidth: 560,
        margin: "0 auto",
        background: C.bg,
        minHeight: "100vh",
      }}
    >
      <Link
        href="/mes-bilans"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          fontSize: 13,
          color: C.primary,
          textDecoration: "none",
          marginBottom: 16,
          fontWeight: 500,
        }}
      >
        <ChevronLeft size={16} strokeWidth={2.2} aria-hidden="true" />
        Mes bilans
      </Link>

      <h1
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: C.text,
          letterSpacing: "-0.4px",
          marginBottom: 6,
        }}
      >
        Ajouter un bilan
      </h1>
      <p
        style={{
          fontSize: 13,
          color: C.textSoft,
          lineHeight: 1.5,
          marginBottom: 24,
        }}
      >
        Vos soignants y auront accès et pourront le retrouver dans votre dossier
        de coordination.
      </p>

      <BilanUploadCard />
    </main>
  );
}
