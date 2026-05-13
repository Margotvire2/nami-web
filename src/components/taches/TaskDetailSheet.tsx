"use client";

/**
 * TaskDetailSheet — glass-strong, pattern AdressageDetailSheet.
 *
 * Édition inline (Q4) :
 *   - Titre   : click → input, Enregistrer / Annuler
 *   - Description : click → textarea
 *   - dueDate : click → input[type=date]
 *   - priority : click → select natif
 *
 * `scheduledPushAt` (Q5) : affiché READ-ONLY si présent côté payload.
 *
 * Actions footer :
 *   - "Annuler" : ouvre TaskCancelModal (motif ≥10 chars, Q6)
 *   - "Marquer terminée" : mutation status=COMPLETED
 *   - "Voir fiche patient" : lien vers /patients/[careCaseId]
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Pencil, Check, Calendar } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import type { TaskWithContext } from "@/lib/api";
import { PriorityPill } from "./PriorityPill";
import { StatusBadge } from "./StatusBadge";
import { TaskCancelModal } from "./TaskCancelModal";
import { PRIORITY_LABEL } from "./_constants";
import { formatDate, patientLabel, relativeDate } from "./_utils";
import { cn } from "@/lib/utils";

type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

interface TaskDetailSheetProps {
  task: TaskWithContext | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (
    careCaseId: string,
    taskId: string,
    payload: Partial<{
      title: string;
      description: string | null;
      dueDate: string | null;
      priority: string;
    }>,
  ) => Promise<void> | void;
  onComplete: (task: TaskWithContext) => Promise<void> | void;
  onCancel: (
    careCaseId: string,
    taskId: string,
    reason: string,
  ) => Promise<void> | void;
}

type EditField = "title" | "description" | "dueDate" | "priority" | null;

const PRIORITIES: Array<"URGENT" | "HIGH" | "MEDIUM" | "LOW"> = [
  "URGENT",
  "HIGH",
  "MEDIUM",
  "LOW",
];

export function TaskDetailSheet({
  task,
  open,
  onOpenChange,
  onUpdate,
  onComplete,
  onCancel,
}: TaskDetailSheetProps) {
  const router = useRouter();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [editing, setEditing] = useState<EditField>(null);
  const [titleDraft, setTitleDraft] = useState("");
  const [descDraft, setDescDraft] = useState("");
  const [dueDraft, setDueDraft] = useState("");

  if (!task) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="glass-strong !w-[540px] !max-w-[90vw] !p-0 !border-l-[0.5px] !border-l-white/60"
        >
          <SheetTitle className="sr-only">Détail de la tâche</SheetTitle>
          <SheetDescription className="sr-only">
            Aucune tâche sélectionnée.
          </SheetDescription>
        </SheetContent>
      </Sheet>
    );
  }

  const isTerminal = task.status === "COMPLETED" || task.status === "CANCELLED";
  const scheduledPushAt = (task as { scheduledPushAt?: string | null })
    .scheduledPushAt;

  async function saveTitle() {
    if (!task) return;
    const next = titleDraft.trim();
    if (!next || next === task.title) {
      setEditing(null);
      return;
    }
    await onUpdate(task.careCase.id, task.id, { title: next });
    setEditing(null);
  }

  async function saveDesc() {
    if (!task) return;
    const next = descDraft.trim();
    if (next === (task.description ?? "")) {
      setEditing(null);
      return;
    }
    await onUpdate(task.careCase.id, task.id, {
      description: next.length === 0 ? null : next,
    });
    setEditing(null);
  }

  async function saveDue() {
    if (!task) return;
    const next = dueDraft || null;
    const current = task.dueDate ? task.dueDate.slice(0, 10) : null;
    if (next === current) {
      setEditing(null);
      return;
    }
    await onUpdate(task.careCase.id, task.id, {
      dueDate: next ? new Date(next).toISOString() : null,
    });
    setEditing(null);
  }

  async function savePriority(next: string) {
    if (!task || next === task.priority) {
      setEditing(null);
      return;
    }
    await onUpdate(task.careCase.id, task.id, { priority: next });
    setEditing(null);
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className={cn(
            "glass-strong !w-[540px] !max-w-[90vw] !p-0",
            "!border-l-[0.5px] !border-l-white/60",
            "flex flex-col h-full",
          )}
        >
          {/* Header sticky — X natif du Sheet shadcn assure la fermeture (B1 fix) */}
          <div className="px-6 py-5 flex items-center gap-3 border-b border-white/30 shrink-0">
            <PriorityPill priority={task.priority} />
            <StatusBadge status={task.status} />
          </div>

          {/* Body scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {/* Titre éditable */}
            <section>
              {editing === "title" ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={titleDraft}
                    onChange={(e) => setTitleDraft(e.target.value)}
                    autoFocus
                    aria-label="Titre de la tâche"
                    className={cn(
                      "w-full rounded-lg border border-[#1A1A2E]/10 bg-white/70",
                      "px-3 py-2 text-xl font-bold text-[#1A1A2E]",
                      "focus:outline-none focus:ring-2 focus:ring-[#5B4EC4]/40",
                    )}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={saveTitle}
                      className="px-3 py-1 rounded-lg bg-[#5B4EC4] text-white text-xs font-semibold hover:bg-[#4c44b0] transition"
                    >
                      Enregistrer
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(null)}
                      className="glass-soft px-3 py-1 rounded-lg text-xs font-medium text-[#4A4A5A] hover:bg-white/60 transition"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (isTerminal) return;
                    setTitleDraft(task.title);
                    setEditing("title");
                  }}
                  disabled={isTerminal}
                  className={cn(
                    "w-full text-left group",
                    !isTerminal && "cursor-text",
                  )}
                >
                  <SheetTitle className="text-xl font-bold text-[#1A1A2E] flex items-start gap-2">
                    <span className="flex-1">{task.title}</span>
                    {!isTerminal && (
                      <Pencil
                        size={14}
                        className="text-[#8A8A96] opacity-0 group-hover:opacity-100 mt-1 transition shrink-0"
                        aria-hidden
                      />
                    )}
                  </SheetTitle>
                </button>
              )}
              {task.careCase?.caseTitle && (
                <SheetDescription className="text-sm text-[#4A4A5A] mt-1">
                  Parcours : {task.careCase.caseTitle}
                </SheetDescription>
              )}
            </section>

            {/* Patient */}
            {task.careCase?.patient && (
              <section>
                <SectionLabel>Patient associé</SectionLabel>
                <div className="glass-soft rounded-xl p-4 text-sm text-[#1A1A2E] font-medium">
                  {patientLabel(task)}
                </div>
              </section>
            )}

            {/* Description éditable */}
            <section>
              <SectionLabel>Description</SectionLabel>
              {editing === "description" ? (
                <div className="space-y-2">
                  <textarea
                    value={descDraft}
                    onChange={(e) => setDescDraft(e.target.value)}
                    rows={4}
                    autoFocus
                    aria-label="Description de la tâche"
                    className={cn(
                      "w-full rounded-lg border border-[#1A1A2E]/10 bg-white/70",
                      "px-3 py-2 text-sm",
                      "focus:outline-none focus:ring-2 focus:ring-[#5B4EC4]/40",
                    )}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={saveDesc}
                      className="px-3 py-1 rounded-lg bg-[#5B4EC4] text-white text-xs font-semibold hover:bg-[#4c44b0] transition"
                    >
                      Enregistrer
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(null)}
                      className="glass-soft px-3 py-1 rounded-lg text-xs font-medium text-[#4A4A5A] hover:bg-white/60 transition"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (isTerminal) return;
                    setDescDraft(task.description ?? "");
                    setEditing("description");
                  }}
                  disabled={isTerminal}
                  className="w-full text-left group"
                >
                  <div className="glass-soft rounded-xl p-4 text-sm text-[#1A1A2E] whitespace-pre-wrap min-h-[60px]">
                    {task.description || (
                      <span className="text-[#8A8A96] italic">
                        Aucune description — cliquez pour ajouter
                      </span>
                    )}
                  </div>
                </button>
              )}
            </section>

            {/* Dates + priorité éditables */}
            <section className="grid grid-cols-2 gap-4">
              <div>
                <SectionLabel>Échéance</SectionLabel>
                {editing === "dueDate" ? (
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={dueDraft}
                      onChange={(e) => setDueDraft(e.target.value)}
                      autoFocus
                      aria-label="Échéance"
                      className={cn(
                        "w-full rounded-lg border border-[#1A1A2E]/10 bg-white/70",
                        "px-3 py-2 text-sm",
                        "focus:outline-none focus:ring-2 focus:ring-[#5B4EC4]/40",
                      )}
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={saveDue}
                        className="px-2 py-1 rounded-lg bg-[#5B4EC4] text-white text-[11px] font-semibold hover:bg-[#4c44b0] transition"
                      >
                        OK
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(null)}
                        className="glass-soft px-2 py-1 rounded-lg text-[11px] font-medium text-[#4A4A5A] hover:bg-white/60 transition"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (isTerminal) return;
                      setDueDraft(task.dueDate ? task.dueDate.slice(0, 10) : "");
                      setEditing("dueDate");
                    }}
                    disabled={isTerminal}
                    className="w-full text-left"
                  >
                    <div className="glass-soft rounded-xl p-3 text-sm text-[#1A1A2E]">
                      {task.dueDate ? (
                        <>
                          <div className="font-medium">
                            {formatDate(task.dueDate)}
                          </div>
                          <div className="text-xs text-[#8A8A96] mt-0.5">
                            {relativeDate(task.dueDate)}
                          </div>
                        </>
                      ) : (
                        <span className="text-[#8A8A96] italic">
                          Pas d'échéance
                        </span>
                      )}
                    </div>
                  </button>
                )}
              </div>
              <div>
                <SectionLabel>Priorité</SectionLabel>
                {editing === "priority" ? (
                  <div className="glass-soft rounded-xl p-2 flex flex-col gap-1">
                    {PRIORITIES.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => savePriority(p)}
                        className={cn(
                          "px-2 py-1 rounded text-xs text-left hover:bg-white/60 transition",
                          p === task.priority
                            ? "bg-white/80 font-semibold text-[#1A1A2E]"
                            : "text-[#4A4A5A]",
                        )}
                      >
                        {PRIORITY_LABEL[p]}
                      </button>
                    ))}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (isTerminal) return;
                      setEditing("priority");
                    }}
                    disabled={isTerminal}
                    className="w-full text-left"
                  >
                    <div className="glass-soft rounded-xl p-3">
                      <PriorityPill priority={task.priority} />
                    </div>
                  </button>
                )}
              </div>
            </section>

            {/* Push programmé READ-ONLY (Q5) */}
            {scheduledPushAt && (
              <section>
                <SectionLabel>Notification programmée</SectionLabel>
                <div className="glass-soft rounded-xl p-3 text-sm text-[#4A4A5A] inline-flex items-center gap-2">
                  <Calendar className="size-4 text-[#5B4EC4]" aria-hidden />
                  <span className="font-mono">{formatDate(scheduledPushAt)}</span>
                </div>
              </section>
            )}

            {/* Informations — Q1 fix : wording "Audit" → "Informations", fusion créée par/le */}
            <section>
              <SectionLabel>Informations</SectionLabel>
              <div className="glass-soft rounded-xl p-4 text-xs text-[#6B7280] space-y-2">
                <div>
                  <span className="text-[10px] uppercase tracking-wide text-[#8A8A96] font-semibold">
                    Créée par{" "}
                  </span>
                  <span className="text-[#1A1A2E]">
                    {task.createdBy.firstName} {task.createdBy.lastName}
                  </span>
                  <span className="text-[10px] uppercase tracking-wide text-[#8A8A96] font-semibold">
                    {" "}le{" "}
                  </span>
                  <span className="text-[#1A1A2E] font-mono">
                    {formatDate(task.createdAt)}
                  </span>
                </div>
                {task.assignedTo && (
                  <div>
                    <span className="text-[10px] uppercase tracking-wide text-[#8A8A96] font-semibold">
                      Assignée à{" "}
                    </span>
                    <span className="text-[#1A1A2E]">
                      {task.assignedTo.firstName} {task.assignedTo.lastName}
                    </span>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Footer actions */}
          <div className="px-6 py-4 border-t border-white/30 flex items-center gap-2 flex-wrap shrink-0">
            {task.careCase?.id && (
              <button
                type="button"
                onClick={() =>
                  router.push(`/patients/${task.careCase.id}`)
                }
                className={cn(
                  "px-4 py-2 rounded-lg glass-soft text-sm font-medium text-[#1A1A2E]",
                  "hover:bg-white/60 transition inline-flex items-center gap-1.5",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40",
                )}
              >
                <FileText className="size-4" aria-hidden />
                Voir fiche patient
              </button>
            )}
            <div className="flex-1" />
            {!isTerminal && (
              <>
                <button
                  type="button"
                  onClick={() => setCancelOpen(true)}
                  className={cn(
                    "px-4 py-2 rounded-lg bg-white text-[#D14545]",
                    "ring-1 ring-[#D14545]/20",
                    "text-sm font-semibold hover:bg-[#FCE9E9] transition",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D14545]/40",
                  )}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => onComplete(task)}
                  className={cn(
                    "px-4 py-2 rounded-lg bg-[#5B4EC4] text-white",
                    "hover:bg-[#4c44b0] transition shadow-sm",
                    "text-sm font-semibold inline-flex items-center gap-1.5",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40",
                  )}
                >
                  <Check className="size-4" aria-hidden />
                  Marquer terminée
                </button>
              </>
            )}
          </div>

          {/* Footer légal MDR */}
          <div className="px-6 py-2.5 text-center text-[11px] text-[#1A1A2E]/50 border-t border-white/30 shrink-0">
            Outil de coordination · Non dispositif médical · Conforme RGPD
          </div>
        </SheetContent>
      </Sheet>

      <TaskCancelModal
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        onConfirm={async (reason) => {
          await onCancel(task.careCase.id, task.id, reason);
          setCancelOpen(false);
          onOpenChange(false);
        }}
      />
    </>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-bold uppercase tracking-wider text-[#5B4EC4] mb-2">
      {children}
    </h3>
  );
}
