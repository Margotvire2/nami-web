"use client";

import { useQuery } from "@tanstack/react-query";
import { apiWithToken } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { ListChecks, CalendarPlus, ArrowRight, Loader2 } from "lucide-react";

type Props = {
  careCaseId: string;
  consultationId: string;
};

export function ActionsSummarySection({ careCaseId, consultationId }: Props) {
  const { accessToken } = useAuthStore();
  const api = apiWithToken(accessToken!);

  const tasksQuery = useQuery({
    queryKey: ["careCaseTasks", careCaseId],
    queryFn: () => api.tasks.list(careCaseId),
    enabled: !!accessToken && !!careCaseId,
  });

  const appointmentsQuery = useQuery({
    queryKey: ["careCaseAppointments", careCaseId],
    queryFn: () => api.appointments.list({ careCaseId }),
    enabled: !!accessToken && !!careCaseId,
  });

  const isLoading = tasksQuery.isLoading || appointmentsQuery.isLoading;

  const taskCount = (tasksQuery.data ?? []).filter(
    (t) => t.createdBy?.id && (t.status === "PENDING" || t.status === "IN_PROGRESS"),
  ).length;

  const appointmentCount = (appointmentsQuery.data ?? []).filter((a) => {
    const start = new Date(a.startAt).getTime();
    return start >= Date.now();
  }).length;

  return (
    <section className="bg-white rounded-2xl border border-[rgba(26,26,46,0.06)] p-6">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[#1A1A2E]">
          <ListChecks size={15} className="text-[#5B4EC4]" />
          Actions générées par Nami
        </h2>
        <span className="text-xs text-gray-400">depuis cette consultation</span>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 size={14} className="animate-spin" />
          Chargement…
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" data-testid="actions-summary">
          <SummaryCard
            icon={<CalendarPlus size={16} className="text-[#5B4EC4]" />}
            label="Rendez-vous à venir"
            count={appointmentCount}
            href={`/agenda?careCaseId=${careCaseId}`}
            emptyText="Aucun RDV planifié"
          />
          <SummaryCard
            icon={<ListChecks size={16} className="text-[#5B4EC4]" />}
            label="Tâches actives"
            count={taskCount}
            href={`/taches?careCaseId=${careCaseId}`}
            emptyText="Aucune tâche active"
          />
        </div>
      )}

      <p
        className="mt-4 text-xs text-gray-500 leading-relaxed"
        data-testid="actions-summary-disclaimer"
      >
        Nami a préparé ces éléments depuis la transcription. Vous pouvez les
        ajuster depuis l&apos;agenda et l&apos;onglet tâches. Référence : ticket{" "}
        <code className="text-[10px] bg-gray-100 px-1 py-0.5 rounded">{consultationId.slice(0, 8)}</code>.
      </p>
    </section>
  );
}

function SummaryCard({
  icon,
  label,
  count,
  href,
  emptyText,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  href: string;
  emptyText: string;
}) {
  return (
    <a
      href={href}
      className="group flex items-center justify-between gap-3 p-4 rounded-xl border border-gray-100 hover:border-[#5B4EC4]/30 hover:bg-[#EEEDFB]/30 transition-colors"
    >
      <div className="flex items-center gap-3">
        <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#EEEDFB]">
          {icon}
        </span>
        <div>
          <div className="text-sm font-semibold text-[#1A1A2E]">
            {count > 0 ? `${count} ${label.toLowerCase()}` : emptyText}
          </div>
          <div className="text-xs text-gray-500">{label}</div>
        </div>
      </div>
      <ArrowRight size={14} className="text-gray-400 group-hover:text-[#5B4EC4]" />
    </a>
  );
}
