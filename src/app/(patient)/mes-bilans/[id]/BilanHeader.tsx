import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import type { PatientBilan } from "@/lib/api";

const C = {
  text: "#1A1A2E",
  textSoft: "#6B7280",
  primary: "#5B4EC4",
  border: "rgba(26,26,46,0.08)",
};

export function BilanHeader({ bilan }: { bilan: PatientBilan }) {
  return (
    <header style={{ marginBottom: 20 }}>
      <Link
        href="/mes-bilans"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 13,
          color: C.textSoft,
          textDecoration: "none",
          marginBottom: 16,
        }}
      >
        <ArrowLeft size={14} strokeWidth={2.2} aria-hidden="true" />
        Mes bilans
      </Link>

      <h1
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: C.text,
          letterSpacing: "-0.4px",
          margin: 0,
          wordBreak: "break-word",
        }}
      >
        {bilan.title}
      </h1>
      <p
        style={{
          fontSize: 13,
          color: C.textSoft,
          marginTop: 6,
        }}
      >
        Reçu le{" "}
        {format(parseISO(bilan.createdAt), "d MMMM yyyy", { locale: fr })}
      </p>
    </header>
  );
}
