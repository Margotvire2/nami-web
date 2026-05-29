import Link from "next/link";
import { FileHeart, Upload } from "lucide-react";

const C = {
  card: "#FFFFFF",
  border: "rgba(26,26,46,0.08)",
  text: "#1A1A2E",
  textSoft: "#6B7280",
  primary: "#5B4EC4",
};

export function BilanEmptyState() {
  return (
    <div
      role="status"
      style={{
        textAlign: "center",
        padding: "56px 24px",
        background: C.card,
        borderRadius: 16,
        border: `1px dashed ${C.border}`,
      }}
    >
      <FileHeart
        size={36}
        aria-hidden="true"
        style={{ margin: "0 auto 16px", opacity: 0.4, color: C.primary }}
      />
      <p style={{ fontSize: 15, color: C.text, fontWeight: 600 }}>
        Aucun bilan pour le moment
      </p>
      <p
        style={{
          fontSize: 13,
          color: C.textSoft,
          marginTop: 8,
          maxWidth: 360,
          margin: "8px auto 0",
          lineHeight: 1.5,
        }}
      >
        Ajoutez vos bilans biologiques pour les conserver au même endroit et les
        partager avec vos soignants.
      </p>
      <Link
        href="/mes-bilans/upload"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          marginTop: 20,
          padding: "10px 18px",
          borderRadius: 10,
          background: C.primary,
          color: "#FFFFFF",
          fontSize: 14,
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        <Upload size={16} strokeWidth={2.2} aria-hidden="true" />
        Ajouter un bilan
      </Link>
    </div>
  );
}
