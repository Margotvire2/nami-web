"use client";

/**
 * F-CROSS-GAP-Task-SECRETARIAT (audit cross-espaces §5.9).
 *
 * Surface dédiée aux tâches de la secrétaire (assignee OU createdBy).
 * Le backend `/tasks/mine` est déjà accessible à SECRETARY (cf. ticket).
 */

import { ListChecks } from "lucide-react";
import { SecretariatTasksSection } from "@/components/secretariat/SecretariatTasksSection";
import { useSecretariatTasks } from "@/hooks/useSecretariatTasks";

function TasksHeader() {
  const { data: pendingTasks } = useSecretariatTasks("PENDING");
  const pendingCount = pendingTasks?.length ?? 0;

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#E8ECF4]">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#EEEDFB] flex items-center justify-center">
          <ListChecks size={18} className="text-[#5B4EC4]" />
        </div>
        <div>
          <h1 className="text-[15px] font-bold text-[#1A1A2E] leading-tight">Tâches</h1>
          <p className="text-[11px] text-[#6B7280]">
            {pendingCount === 0
              ? "Aucune tâche en attente"
              : pendingCount === 1
                ? "1 tâche en attente"
                : `${pendingCount} tâches en attente`}
          </p>
        </div>
      </div>
    </header>
  );
}

export default function SecretariatTasksPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <TasksHeader />
      <div className="max-w-3xl mx-auto px-6 py-6">
        <SecretariatTasksSection />
      </div>
    </div>
  );
}
