"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/lib/store"
import { apiWithToken, type TaskWithContext } from "@/lib/api"
import { format, parseISO, isPast } from "date-fns"
import { fr } from "date-fns/locale"
import Link from "next/link"
import { toast } from "sonner"
import {
  CheckSquare, Circle, Clock, AlertTriangle, User,
  Loader2,
} from "lucide-react"
import { EmptyState } from "@/components/nami/EmptyState"
import { NamiCard } from "@/components/ui/NamiCard"
import { ShimmerCard } from "@/components/ui/shimmer"

const N = {
  primary: "#5B4EC4", primaryLight: "#EDE9FC", text: "#2D2B3D",
  textSoft: "#8A879C", border: "#ECEAF5", bg: "#F6F5FB", card: "#FFF",
  success: "#4E9A7C", successBg: "#EDF7F2",
  danger: "#C4574E", dangerBg: "#FDF0EF",
  warning: "#E6A23C", warningBg: "#FFF8EC",
}

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: "À faire", color: N.warning, bg: N.warningBg },
  IN_PROGRESS: { label: "En cours", color: N.primary, bg: N.primaryLight },
  COMPLETED: { label: "Terminée", color: N.success, bg: N.successBg },
  CANCELLED: { label: "Annulée", color: N.textSoft, bg: "#ECEAF5" },
}

const PRIORITY_LABEL: Record<string, { label: string; color: string }> = {
  URGENT: { label: "Urgente", color: N.danger },
  HIGH: { label: "Haute", color: N.danger },
  MEDIUM: { label: "Moyenne", color: N.warning },
  LOW: { label: "Basse", color: N.textSoft },
}

const FILTERS = [
  { key: "", label: "Toutes" },
  { key: "PENDING", label: "À faire" },
  { key: "IN_PROGRESS", label: "En cours" },
  { key: "COMPLETED", label: "Terminées" },
]

export default function TachesPage() {
  const { accessToken } = useAuthStore()
  const api = apiWithToken(accessToken!)
  const qc = useQueryClient()
  const [filter, setFilter] = useState("")

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks-mine", filter],
    queryFn: () => api.tasksMine.list(filter || undefined),
  })

  const patchMutation = useMutation({
    mutationFn: ({ task, status }: { task: TaskWithContext; status: string }) =>
      api.tasks.update(task.careCase.id, task.id, { status } as any),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks-mine"] })
      toast.success("Tâche mise à jour")
    },
    onError: () => toast.error("Erreur"),
  })

  const pending = (tasks ?? []).filter(t => t.status === "PENDING" || t.status === "IN_PROGRESS")
  const completed = (tasks ?? []).filter(t => t.status === "COMPLETED")
  const shown = filter === "COMPLETED" ? completed : filter ? pending : [...pending, ...completed]

  return (
    <div style={{ height: "100%", overflow: "auto", background: N.bg, fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "28px 16px", paddingBottom: 80 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: N.text, display: "flex", alignItems: "center", gap: 8 }}>
              <CheckSquare size={20} /> Mes tâches
            </h1>
            <p style={{ fontSize: 13, color: N.textSoft, marginTop: 2 }}>
              {pending.length} en cours · {completed.length} terminées
            </p>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 4, background: "#ECEAF5", borderRadius: 12, padding: 4, marginBottom: 20 }}>
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              style={{ flex: 1, padding: "8px 0", borderRadius: 10, border: "none", fontSize: 13,
                fontWeight: filter === f.key ? 600 : 400, cursor: "pointer", fontFamily: "inherit",
                background: filter === f.key ? N.primary : "transparent",
                color: filter === f.key ? "#fff" : N.textSoft }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[...Array(4)].map((_, i) => <ShimmerCard key={i} />)}
          </div>
        )}

        {/* Empty */}
        {!isLoading && shown.length === 0 && (
          <EmptyState
            icon={CheckSquare}
            title="Aucune tâche en cours"
            description="Vos tâches sur tous vos dossiers apparaîtront ici."
          />
        )}

        {/* Tasks list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {shown.map(task => {
            const st = STATUS_LABEL[task.status] ?? STATUS_LABEL.PENDING
            const pr = PRIORITY_LABEL[task.priority] ?? PRIORITY_LABEL.MEDIUM
            const isOverdue = task.dueDate && isPast(parseISO(task.dueDate)) && task.status !== "COMPLETED"
            const isDone = task.status === "COMPLETED"

            return (
              <NamiCard key={task.id} variant={isDone ? "flat" : "lift"} padding="none"
                className="nami-stagger-item"
                style={{ padding: "14px 16px", opacity: isDone ? 0.6 : 1, animationDelay: `${shown.indexOf(task) * 40}ms` }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  {/* Check button */}
                  <button
                    onClick={() => {
                      if (isDone) return
                      patchMutation.mutate({ task, status: "COMPLETED" })
                    }}
                    style={{ marginTop: 2, background: "none", border: "none", cursor: isDone ? "default" : "pointer", padding: 0 }}>
                    {isDone
                      ? <CheckSquare size={18} style={{ color: N.success }} />
                      : <Circle size={18} style={{ color: N.border }} />
                    }
                  </button>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Title */}
                    <div style={{ fontSize: 14, fontWeight: 600, color: isDone ? N.textSoft : N.text, textDecoration: isDone ? "line-through" : "none" }}>
                      {task.title}
                    </div>

                    {/* Patient + case */}
                    <Link href={`/patients/${task.careCase.id}`} style={{ fontSize: 12, color: N.primary, textDecoration: "none", marginTop: 2, display: "inline-block" }}>
                      {task.careCase.patient.firstName} {task.careCase.patient.lastName} — {task.careCase.caseTitle}
                    </Link>

                    {/* Meta row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                      {/* Status badge */}
                      <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 6, background: st.bg, color: st.color }}>
                        {st.label}
                      </span>

                      {/* Priority */}
                      <span style={{ fontSize: 10, fontWeight: 600, color: pr.color, display: "flex", alignItems: "center", gap: 2 }}>
                        {task.priority === "URGENT" || task.priority === "HIGH" ? <AlertTriangle size={10} /> : null}
                        {pr.label}
                      </span>

                      {/* Due date */}
                      {task.dueDate && (
                        <span style={{ fontSize: 10, color: isOverdue ? N.danger : N.textSoft, display: "flex", alignItems: "center", gap: 3 }}>
                          <Clock size={10} />
                          {format(parseISO(task.dueDate), "d MMM", { locale: fr })}
                          {isOverdue && " — en retard"}
                        </span>
                      )}

                      {/* Assigned to */}
                      {task.assignedTo && (
                        <span style={{ fontSize: 10, color: N.textSoft, display: "flex", alignItems: "center", gap: 3 }}>
                          <User size={10} />
                          {task.assignedTo.firstName} {task.assignedTo.lastName}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    {task.description && (
                      <p style={{ fontSize: 12, color: N.textSoft, marginTop: 6, lineHeight: 1.4 }}>{task.description}</p>
                    )}
                  </div>

                  {/* Quick actions */}
                  {!isDone && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {task.status === "PENDING" && (
                        <button onClick={() => patchMutation.mutate({ task, status: "IN_PROGRESS" })}
                          style={{ ...smallBtn, background: N.primaryLight, color: N.primary }}>
                          En cours
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </NamiCard>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const smallBtn: React.CSSProperties = {
  padding: "4px 10px", borderRadius: 6, border: "none", fontSize: 10,
  fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
}
