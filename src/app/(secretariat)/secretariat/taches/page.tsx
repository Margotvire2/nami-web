"use client";

import { ListChecks, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { SecretariatTasksSection } from "@/components/secretariat/SecretariatTasksSection";
import { useSecretariatTasks } from "@/hooks/useSecretariatTasks";
import { isPast, isToday, parseISO } from "date-fns";
import type { TaskWithContext } from "@/lib/api";
import { N } from "@/lib/design-tokens";

function TaskSideStats() {
  const { data: pending = [] } = useSecretariatTasks("PENDING");
  const { data: completed = [] } = useSecretariatTasks("COMPLETED");

  const overdue = (pending as TaskWithContext[]).filter(
    (t) => t.dueDate && isPast(parseISO(t.dueDate)) && !isToday(parseISO(t.dueDate)),
  );
  const dueToday = (pending as TaskWithContext[]).filter(
    (t) => t.dueDate && isToday(parseISO(t.dueDate)),
  );

  const stats = [
    {
      label: "À faire",
      value: (pending as TaskWithContext[]).length,
      icon: ListChecks,
      color: N.statusConfirmed,
      bg: N.statusConfirmedBg,
      border: N.statusConfirmedBorder,
    },
    {
      label: "En retard",
      value: overdue.length,
      icon: AlertCircle,
      color: overdue.length > 0 ? N.danger : N.ink3,
      bg: overdue.length > 0 ? N.dangerBg : N.bgAlt,
      border: overdue.length > 0 ? N.dangerBorder : N.border,
    },
    {
      label: "Pour aujourd'hui",
      value: dueToday.length,
      icon: Clock,
      color: dueToday.length > 0 ? N.warning : N.ink3,
      bg: dueToday.length > 0 ? N.warningBg : N.bgAlt,
      border: dueToday.length > 0 ? N.warningBorder : N.border,
    },
    {
      label: "Terminées",
      value: (completed as TaskWithContext[]).length,
      icon: CheckCircle2,
      color: N.success,
      bg: N.successBg,
      border: N.successBorder,
    },
  ];

  return (
    <div className="space-y-3">
      <p
        className="text-[11px] font-bold uppercase tracking-widest"
        style={{ color: N.ink3 }}
      >
        Résumé
      </p>
      {stats.map(({ label, value, icon: Icon, color, bg, border }) => (
        <div
          key={label}
          className="flex items-center justify-between rounded-xl px-4 py-3"
          style={{ background: bg, border: `1px solid ${border}` }}
        >
          <div className="flex items-center gap-2.5">
            <Icon size={14} style={{ color }} />
            <span className="text-[12px] font-medium" style={{ color: N.ink2 }}>
              {label}
            </span>
          </div>
          <span className="text-[15px] font-bold tabular-nums" style={{ color }}>
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}

function TasksPageHeader() {
  const { data: pendingTasks = [] } = useSecretariatTasks("PENDING");

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#E8ECF4]">
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: N.statusConfirmedBg }}
        >
          <ListChecks size={18} style={{ color: N.statusConfirmed }} />
        </div>
        <div>
          <h1 className="text-[15px] font-bold leading-tight" style={{ color: N.ink }}>
            Tâches
          </h1>
          <p className="text-[11px]" style={{ color: N.ink3 }}>
            {(pendingTasks as TaskWithContext[]).length === 0
              ? "Aucune tâche en attente"
              : (pendingTasks as TaskWithContext[]).length === 1
                ? "1 tâche en attente"
                : `${(pendingTasks as TaskWithContext[]).length} tâches en attente`}
          </p>
        </div>
      </div>
    </header>
  );
}

export default function SecretariatTasksPage() {
  return (
    <div className="min-h-screen" style={{ background: N.bg }}>
      <TasksPageHeader />
      <div className="flex gap-6 px-6 py-6">
        {/* Main — liste des tâches */}
        <div className="flex-1 min-w-0">
          <SecretariatTasksSection />
        </div>

        {/* Rail droit — stats */}
        <aside className="w-64 shrink-0">
          <TaskSideStats />
        </aside>
      </div>
    </div>
  );
}
