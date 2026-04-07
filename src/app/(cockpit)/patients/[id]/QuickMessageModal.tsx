"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/lib/store"
import { apiWithToken } from "@/lib/api"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const N = {
  primary: "#5B4EC4", primaryLight: "#EDE9FC", text: "#2D2B3D",
  textSoft: "#8A879C", border: "#ECEAF5", warning: "#E6A23C", warningBg: "#FFF8EC",
}

interface QuickMessageModalProps {
  careCaseId: string
  patientName: string
  onClose: () => void
}

export function QuickMessageModal({ careCaseId, patientName, onClose }: QuickMessageModalProps) {
  const { accessToken } = useAuthStore()
  const api = apiWithToken(accessToken!)
  const qc = useQueryClient()

  const [body, setBody] = useState("")

  const mutation = useMutation({
    mutationFn: () => api.messages.send(careCaseId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["messages", careCaseId] })
      qc.invalidateQueries({ queryKey: ["timeline", careCaseId] })
      qc.invalidateQueries({ queryKey: ["care-case", careCaseId] })
      toast.success("Message envoye")
      onClose()
    },
    onError: () => toast.error("Erreur lors de l'envoi"),
  })

  const canSend = body.trim().length > 0

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.2)" }} />
      <div style={{ position: "relative", width: 480, maxWidth: "94vw", maxHeight: "90vh", overflowY: "auto", background: "#fff", borderRadius: 16, boxShadow: "0 16px 48px rgba(0,0,0,0.12)", fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif", padding: 24 }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: N.text }}>Message a l&apos;equipe</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, color: N.textSoft, cursor: "pointer" }}>x</button>
        </div>

        <div style={{ fontSize: 12, color: N.textSoft, marginBottom: 12 }}>Dossier : {patientName}</div>

        <div style={{ background: N.warningBg, border: `1px solid ${N.warning}30`, borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: N.warning, lineHeight: 1.5 }}>
          Coordination uniquement. En cas d&apos;urgence, contactez le 15 (SAMU) ou le 112.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={labelSt}>Message</label>
            <textarea style={{ ...inputSt, minHeight: 120, resize: "vertical" as const, fontFamily: "inherit" }}
              value={body} onChange={e => setBody(e.target.value)}
              placeholder="Partagez une information avec l'equipe de soin..."
              autoFocus />
          </div>

          <div style={{ fontSize: 12, color: N.textSoft, lineHeight: 1.4 }}>
            Ce message sera visible par tous les membres de l&apos;equipe de soin de {patientName}.
          </div>

          <button onClick={() => mutation.mutate()} disabled={!canSend || mutation.isPending}
            style={{ width: "100%", padding: 12, borderRadius: 10, border: "none", background: canSend ? N.primary : "#ddd", color: "#fff", fontSize: 14, fontWeight: 600, fontFamily: "inherit", cursor: canSend ? "pointer" : "not-allowed", opacity: mutation.isPending ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {mutation.isPending && <Loader2 size={14} className="animate-spin" />}
            Envoyer le message
          </button>
        </div>
      </div>
    </div>
  )
}

const labelSt: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: N.textSoft, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 6, display: "block" }
const inputSt: React.CSSProperties = { width: "100%", padding: "9px 12px", border: `1.5px solid ${N.border}`, borderRadius: 10, fontSize: 14, fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif", color: N.text, background: "#FAFAFD", outline: "none" }
