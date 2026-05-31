"use client";

import { useState } from "react";
import { Check, MessageCircle, X } from "lucide-react";
import type { PendingMembershipRequestRow } from "@/hooks/usePendingMembershipRequests";
import { useAuthStore } from "@/lib/store";
import { membershipRequestsApi } from "@/lib/api";

interface MembershipRequestRowProps {
  request: PendingMembershipRequestRow;
  onResolved?: (id: string) => void;
}

export function MembershipRequestRow({
  request,
  onResolved,
}: MembershipRequestRowProps) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [pending, setPending] = useState<"ACCEPTED" | "REJECTED" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function review(status: "ACCEPTED" | "REJECTED") {
    if (!accessToken || pending) return;
    setPending(status);
    setError(null);
    try {
      await membershipRequestsApi.update(accessToken, request.id, { status });
      onResolved?.(request.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
      setPending(null);
    }
  }

  const applicant = request.applicant;
  const fullName = `${applicant.firstName} ${applicant.lastName}`.trim();
  const meta = [applicant.specialty, applicant.city].filter(Boolean).join(" · ");

  return (
    <div className="rounded-lg border border-[#E8ECF4] bg-white px-4 py-3">
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-full bg-[#5B4EC4]/10 text-[#5B4EC4] flex items-center justify-center text-sm font-semibold shrink-0"
          style={{ fontFamily: "var(--font-jakarta)" }}
        >
          {applicant.firstName[0]?.toUpperCase() ?? "?"}
          {applicant.lastName[0]?.toUpperCase() ?? ""}
        </div>
        <div className="flex-1 min-w-0">
          <div
            className="text-sm font-semibold text-[#0F172A] truncate"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            {fullName || "Demandeur"}
          </div>
          {meta && <div className="text-xs text-[#6B7280] truncate">{meta}</div>}
          {request.motivationMessage && (
            <p className="text-xs text-[#374151] mt-1.5 line-clamp-2">
              « {request.motivationMessage} »
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            disabled
            title="Disponible en V2"
            aria-disabled
            className="p-1.5 rounded-md border border-[#E8ECF4] text-[#6B7280] opacity-50 cursor-not-allowed"
          >
            <MessageCircle size={14} />
            <span className="sr-only">Contacter</span>
          </button>
          <button
            type="button"
            onClick={() => review("REJECTED")}
            disabled={!!pending}
            className="p-1.5 rounded-md border border-[#E8ECF4] text-[#6B7280] hover:border-[#DC2626] hover:text-[#DC2626] transition-colors disabled:opacity-50"
            title="Refuser"
          >
            <X size={14} />
            <span className="sr-only">Refuser</span>
          </button>
          <button
            type="button"
            onClick={() => review("ACCEPTED")}
            disabled={!!pending}
            className="px-2.5 py-1.5 rounded-md bg-[#5B4EC4] text-white text-xs font-semibold hover:bg-[#4A3FB0] transition-colors disabled:opacity-50 flex items-center gap-1"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            <Check size={12} />
            {pending === "ACCEPTED" ? "…" : "Valider"}
          </button>
        </div>
      </div>
      {error && (
        <p className="text-xs text-[#DC2626] mt-2" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
