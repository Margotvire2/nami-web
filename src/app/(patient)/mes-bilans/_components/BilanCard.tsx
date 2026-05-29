import { FileText, Download } from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import type { PatientBilan } from "@/lib/api";
import { BilanStatusBadge } from "./BilanStatusBadge";

const C = {
  card: "#FFFFFF",
  border: "rgba(26,26,46,0.08)",
  text: "#1A1A2E",
  textSoft: "#6B7280",
  primary: "#5B4EC4",
  primaryLight: "rgba(91,78,196,0.08)",
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function BilanCard({ bilan }: { bilan: PatientBilan }) {
  return (
    <article
      className="nami-patient-card"
      style={{
        background: C.card,
        borderRadius: 14,
        border: `1px solid ${C.border}`,
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 42,
          height: 42,
          borderRadius: 10,
          background: "rgba(43,168,156,0.10)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: "#1F7A70",
        }}
      >
        <FileText size={20} strokeWidth={2} aria-hidden="true" />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: C.text,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {bilan.title}
        </div>
        <div
          style={{
            fontSize: 12,
            color: C.textSoft,
            marginTop: 4,
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <BilanStatusBadge bilan={bilan} />
          <span>·</span>
          <span>{format(parseISO(bilan.createdAt), "d MMM yyyy", { locale: fr })}</span>
          <span>·</span>
          <span>{formatSize(bilan.sizeBytes)}</span>
        </div>
      </div>

      <a
        href={bilan.fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Ouvrir ${bilan.title}`}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 34,
          height: 34,
          borderRadius: 8,
          background: C.primaryLight,
          flexShrink: 0,
          color: C.primary,
        }}
      >
        <Download size={16} strokeWidth={2} aria-hidden="true" />
      </a>
    </article>
  );
}
