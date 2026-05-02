"use client";

import { use } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken } from "@/lib/api";
import { ViewConsultation } from "@/app/(cockpit)/patients/[id]/v2/components/ViewConsultation";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";

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
      router.push(`/patients/${fromPatientId}/v2?tab=consultations`);
    } else if (careCaseId) {
      router.push(`/patients/${careCaseId}/v2?tab=consultations`);
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-full bg-[#FAFAF8]">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Retour au dossier
        </button>

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
