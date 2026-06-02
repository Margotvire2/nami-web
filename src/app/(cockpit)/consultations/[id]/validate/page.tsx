"use client";

import { use } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken } from "@/lib/api";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { CRSection } from "./CRSection";
import { PrescriptionSection } from "./PrescriptionSection";
import { ActionsSummarySection } from "./ActionsSummarySection";

export default function ValidateConsultationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
    } else {
      router.push(`/consultations/${consultationId}?careCaseId=${careCaseId}`);
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
          Retour à la consultation
        </button>

        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-[#1A1A2E] mb-1">
            Valider et partager
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            Vérifiez le compte-rendu, la prescription et les éléments préparés par
            Nami avant de les partager avec l&apos;équipe et le patient.
          </p>
        </header>

        {!careCaseId && (
          <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 mb-4">
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
            {(error as { status?: number })?.status === 403
              ? "Vous n'êtes pas autorisé à valider cette consultation."
              : "Consultation introuvable."}
          </div>
        )}

        {consultation && consultation.status !== "COMPLETED" && (
          <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 mb-4">
            <AlertCircle size={16} className="shrink-0" />
            La consultation n&apos;est pas encore terminée. La validation n&apos;est possible
            qu&apos;après finalisation de la prise de notes.
          </div>
        )}

        {consultation && consultation.status === "COMPLETED" && (
          <div className="space-y-4">
            <CRSection consultation={consultation} careCaseId={careCaseId} />
            <PrescriptionSection
              careCaseId={careCaseId}
              clinicalNoteId={consultation.generatedNote?.id ?? null}
            />
            <ActionsSummarySection
              careCaseId={careCaseId}
              consultationId={consultation.id}
            />
          </div>
        )}
      </div>
    </div>
  );
}
