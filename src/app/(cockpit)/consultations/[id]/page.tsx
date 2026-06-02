"use client";

import { use } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken } from "@/lib/api";
import { ViewConsultation } from "@/app/(cockpit)/patients/[id]/ViewConsultation";
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function ConsultationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: consultationId } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { accessToken } = useAuthStore();

  const careCaseId = searchParams.get("careCaseId") ?? "";

  const api = apiWithToken(accessToken!);

  const { data: consultation, isLoading, error } = useQuery({
    queryKey: ["consultation", consultationId, careCaseId],
    queryFn: () => api.consultations.getOne(careCaseId, consultationId),
    enabled: !!accessToken && !!careCaseId,
    retry: false,
  });

  const handleBack = () => {
    const fromPatientId = searchParams.get("from");
    if (fromPatientId) {
      router.push(`/patients/${fromPatientId}?tab=consultations`);
    } else if (careCaseId) {
      router.push(`/patients/${careCaseId}?tab=consultations`);
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-full bg-[#FAFAF8]">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={16} />
            Retour au dossier
          </button>
          {consultation?.status === "COMPLETED" && careCaseId && (
            <Link
              data-testid="validate-cta"
              href={`/consultations/${consultationId}/validate?careCaseId=${careCaseId}${searchParams.get("from") ? `&from=${searchParams.get("from")}` : ""}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5B4EC4] text-white text-sm font-medium hover:bg-[#4F44B0] transition-colors"
            >
              <CheckCircle2 size={14} />
              Valider et partager
            </Link>
          )}
        </div>

        {!careCaseId && (
          <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
            <AlertCircle size={16} className="shrink-0" />
            Paramètre careCaseId manquant dans l&apos;URL.
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-[#5B4EC4]" />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <AlertCircle size={16} className="shrink-0" />
            {(error as any)?.status === 403
              ? "Vous n'êtes pas autorisé à voir cette consultation."
              : "Consultation introuvable."}
          </div>
        )}

        {consultation && <ViewConsultation consultation={consultation} />}
      </div>
    </div>
  );
}
