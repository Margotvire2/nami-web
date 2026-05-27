"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, type PatientAppointmentDetail } from "@/lib/api";
import { RdvDetailHero } from "./RdvDetailHero";
import { RdvDetailProvider } from "./RdvDetailProvider";
import { RdvDetailActions } from "./RdvDetailActions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RendezVousDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  const { data: appointment, isLoading, isError } = useQuery<PatientAppointmentDetail>({
    queryKey: ["patient-appointment", id],
    queryFn: () => apiWithToken(accessToken!).patient.appointments.get(id),
    enabled: !!accessToken && !!id,
  });

  function handleCancelled() {
    queryClient.invalidateQueries({ queryKey: ["patient-appointment", id] });
    queryClient.invalidateQueries({ queryKey: ["patient-appointments"] });
  }

  return (
    <main
      aria-label="Détail du rendez-vous"
      className="max-w-3xl mx-auto p-4 md:p-6 space-y-6"
    >
      {/* Breadcrumb retour */}
      <nav aria-label="Fil d'Ariane">
        <Link
          href="/rendez-vous"
          className="inline-flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(91,78,196,0.4)] focus-visible:ring-offset-2 rounded-full px-2 py-1"
          style={{ color: "#5B4EC4" }}
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Retour à mes rendez-vous
        </Link>
      </nav>

      {isLoading && (
        <div
          className="flex items-center justify-center py-16"
          role="status"
          aria-live="polite"
          aria-label="Chargement du rendez-vous"
        >
          <Loader2
            className="animate-spin"
            size={22}
            style={{ color: "#5B4EC4" }}
            aria-hidden="true"
          />
        </div>
      )}

      {isError && (
        <div
          role="alert"
          className="rounded-2xl p-5 flex items-start gap-3"
          style={{
            background: "#FEF2F2",
            border: "1px solid #FCA5A5",
          }}
        >
          <AlertCircle
            size={18}
            aria-hidden="true"
            className="shrink-0 mt-0.5"
            style={{ color: "#B91C1C" }}
          />
          <div className="text-sm" style={{ color: "#7F1D1D" }}>
            <p className="font-semibold">Impossible de charger ce rendez-vous</p>
            <p className="mt-1">
              Le rendez-vous n&apos;a pas été trouvé ou vous n&apos;y avez pas accès.
            </p>
          </div>
        </div>
      )}

      {appointment && (
        <>
          <RdvDetailHero appointment={appointment} />
          <RdvDetailProvider appointment={appointment} />
          <RdvDetailActions
            appointment={appointment}
            onCancelled={handleCancelled}
          />
        </>
      )}
    </main>
  );
}
