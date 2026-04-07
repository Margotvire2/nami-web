"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/lib/store"
import { apiWithToken } from "@/lib/api"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const N = {
  primary: "#5B4EC4", primaryLight: "#EDE9FC", text: "#2D2B3D",
  textSoft: "#8A879C", border: "#ECEAF5", danger: "#C4574E",
}

const TASK_TYPES = [
  { id: "FOLLOW_UP", label: "Suivi" },
  { id: "PRESCRIPTION", label: "Ordonnance" },
  { id: "REFERRAL", label: "Adressage" },
  { id: "DOCUMENTATION", label: "Document" },
  { id: "COORDINATION", label: "Coordination" },
  { id: "OTHER", label: "Autre" },
]

const PRIORITIES = [
  { id: "LOW", label: "Basse", color: "#8A879C" },
  { id: "MEDIUM", label: "Moyenne", color: "#E6A23C" },
  { id: "HIGH", label: "Haute", color: "#C4574E" },
  { id: "URGENT", label: "Urgente", color: "#C4574E" },
]

interface QuickTaskModalProps {
  careCaseId: string
  patientName: string
  onClose: () => void
}

export function QuickTaskModal({ careCaseId, patientName, onClose }: QuickTaskModalProps) {
  const { accessToken } = useAuthStore()
  const api = apiWithToken(accessToken!)
  const qc = useQueryClient()

  const [title, setTitle] = useState("")
  const [taskType, setTaskType] = useState("FOLLOW_UP")
  const [priority, setPriority] = useState("MEDIUM")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [assignedTo, setAssignedTo] = useState("")

  // Fetch care team members for assignment
  const { data: teamMembers } = useQuery({
    queryKey: ["team", careCaseId],
    queryFn: () => api.team.list(careCaseId),
  })

  const mutation = useMutation({
    mutationFn: () => api.tasks.create(careCaseId, {
      title,
      taskType,
      priority,
      description: description || undefined,
      dueDate: dueDate || undefined,
      assignedToPersonId: assignedTo || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks", careCaseId] })
      qc.invalidateQueries({ queryKey: ["timeline", careCaseId] })
      qc.invalidateQueries({ queryKey: ["care-case", careCaseId] })
      toast.success("Tache creee")
      onClose()
    },
    onError: () => toast.error("Erreur lors de la creation"),
  })

  const canSave = title.trim().length > 0

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.2)" }} />
      <div style={{ position: "relative", width: 440, maxWidth: "94vw", maxHeight: "90vh", overflowY: "auto", background: "#fff", borderRadius: 16, boxShadow: "0 16px 48px rgba(0,0,0,0.12)", fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif", padding: 24 }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: N.text }}>Nouvelle tache</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, color: N.textSoft, cursor: "pointer" }}>x</button>
        </div>

        <div style={{ fontSize: 12, color: N.textSoft, marginBottom: 16 }}>Patient : {patientName}</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={labelSt}>Titre</label>
            <input style={inputSt} value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Recuperer bilan biologique" autoFocus />
          </div>

          <div>
            <label style={labelSt}>Type</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {TASK_TYPES.map(t => (
                <button key={t.id} onClick={() => setTaskType(t.id)}
                  style={{ ...chipSt, background: taskType === t.id ? N.primary : "#F3F2FA", color: taskType === t.id ? "#fff" : N.text }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={labelSt}>Priorite</label>
            <div style={{ display: "flex", gap: 6 }}>
              {PRIORITIES.map(p => (
                <button key={p.id} onClick={() => setPriority(p.id)}
                  style={{ ...chipSt, background: priority === p.id ? p.color : "#F3F2FA", color: priority === p.id ? "#fff" : N.text }}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={labelSt}>Echeance (optionnel)</label>
            <input type="date" style={inputSt} value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>

          {/* Assignation */}
          <div>
            <label style={labelSt}>Assigner à (optionnel)</label>
            <select style={inputSt} value={assignedTo} onChange={e => setAssignedTo(e.target.value)}>
              <option value="">Moi-même</option>
              {(teamMembers ?? []).filter(m => m.status === "ACCEPTED").map(m => (
                <option key={m.person.id} value={m.person.id}>
                  {m.person.firstName} {m.person.lastName} — {m.roleInCase}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelSt}>Description (optionnel)</label>
            <textarea style={{ ...inputSt, minHeight: 60, resize: "vertical" as const, fontFamily: "inherit" }}
              value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Details, instructions..." />
          </div>

          <button onClick={() => mutation.mutate()} disabled={!canSave || mutation.isPending}
            style={{ width: "100%", padding: 12, borderRadius: 10, border: "none", background: canSave ? N.primary : "#ddd", color: "#fff", fontSize: 14, fontWeight: 600, fontFamily: "inherit", cursor: canSave ? "pointer" : "not-allowed", opacity: mutation.isPending ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {mutation.isPending && <Loader2 size={14} className="animate-spin" />}
            Creer la tache
          </button>
        </div>
      </div>
    </div>
  )
}

const labelSt: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: N.textSoft, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 6, display: "block" }
const inputSt: React.CSSProperties = { width: "100%", padding: "9px 12px", border: `1.5px solid ${N.border}`, borderRadius: 10, fontSize: 14, fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif", color: N.text, background: "#FAFAFD", outline: "none" }
const chipSt: React.CSSProperties = { padding: "7px 12px", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }
