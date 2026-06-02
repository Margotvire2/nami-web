"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, XCircle, MinusCircle, Eye } from "lucide-react";
import type { BroadcastRecipient } from "@/hooks/useBroadcast";

type FilterKey = "all" | "sent" | "opened" | "optedOut" | "failed";

interface RecipientsTableProps {
  recipients: BroadcastRecipient[];
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusFor(r: BroadcastRecipient): {
  key: FilterKey;
  label: string;
  color: string;
  bg: string;
  Icon: typeof CheckCircle2;
} {
  if (r.optedOut) {
    return {
      key: "optedOut",
      label: "Désinscrit",
      color: "#6B7280",
      bg: "#F3F4F6",
      Icon: MinusCircle,
    };
  }
  if (!r.emailSent) {
    return {
      key: "failed",
      label: "Non envoyé",
      color: "#DC2626",
      bg: "#FEE2E2",
      Icon: XCircle,
    };
  }
  if (r.openedAt) {
    return {
      key: "opened",
      label: "Ouvert",
      color: "#059669",
      bg: "#D1FAE5",
      Icon: Eye,
    };
  }
  return {
    key: "sent",
    label: "Envoyé",
    color: "#2563EB",
    bg: "#DBEAFE",
    Icon: CheckCircle2,
  };
}

export function RecipientsTable({ recipients }: RecipientsTableProps) {
  const [filter, setFilter] = useState<FilterKey>("all");

  const counts = useMemo(() => {
    const c = { all: recipients.length, sent: 0, opened: 0, optedOut: 0, failed: 0 };
    for (const r of recipients) {
      const k = statusFor(r).key;
      c[k] += 1;
    }
    return c;
  }, [recipients]);

  const filtered = useMemo(() => {
    if (filter === "all") return recipients;
    return recipients.filter((r) => statusFor(r).key === filter);
  }, [recipients, filter]);

  const filters: { key: FilterKey; label: string }[] = [
    { key: "all", label: `Tous (${counts.all})` },
    { key: "opened", label: `Ouverts (${counts.opened})` },
    { key: "sent", label: `Envoyés (${counts.sent})` },
    { key: "optedOut", label: `Désinscrits (${counts.optedOut})` },
    { key: "failed", label: `Non envoyés (${counts.failed})` },
  ];

  return (
    <div className="space-y-3" style={{ fontFamily: "var(--font-jakarta)" }}>
      <div role="tablist" aria-label="Filtre destinataires" className="flex flex-wrap gap-1.5">
        {filters.map((f) => (
          <button
            key={f.key}
            role="tab"
            aria-selected={filter === f.key}
            onClick={() => setFilter(f.key)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              filter === f.key
                ? "bg-[#5B4EC4] text-white"
                : "bg-white text-[#374151] border border-[#E8ECF4] hover:border-[#5B4EC4]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-[#E8ECF4]">
        <table className="min-w-full text-sm">
          <thead className="bg-[#FAFAF8] text-[11px] uppercase tracking-wide text-[#6B7280]">
            <tr>
              <th scope="col" className="px-3 py-2 text-left font-semibold">
                Destinataire
              </th>
              <th scope="col" className="px-3 py-2 text-left font-semibold">
                Email
              </th>
              <th scope="col" className="px-3 py-2 text-left font-semibold">
                Statut
              </th>
              <th scope="col" className="px-3 py-2 text-left font-semibold">
                Ouvert
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8ECF4] bg-white">
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-6 text-center text-xs text-[#6B7280]"
                >
                  Aucun destinataire dans cette catégorie.
                </td>
              </tr>
            )}
            {filtered.map((r) => {
              const s = statusFor(r);
              return (
                <tr key={r.id}>
                  <td className="px-3 py-2 text-[#0F172A]">
                    {r.person.firstName} {r.person.lastName}
                  </td>
                  <td className="px-3 py-2 text-[#374151]">{r.person.email}</td>
                  <td className="px-3 py-2">
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium"
                      style={{ color: s.color, backgroundColor: s.bg }}
                    >
                      <s.Icon size={11} />
                      {s.label}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs text-[#6B7280]">
                    {formatDate(r.openedAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
