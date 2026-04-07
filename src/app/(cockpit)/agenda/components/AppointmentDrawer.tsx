"use client"

import { format, parseISO, differenceInYears } from "date-fns"
import { fr } from "date-fns/locale"
import type { AgendaAppointment, AppointmentStatus } from "../hooks/useAgenda"
import { X, Video, Phone, MapPin, Clock, FileText, Sparkles, MessageSquare, Mail, ArrowDownLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const STATUS_META: Record<AppointmentStatus, { label: string; className: string }> = {
  PENDING:   { label: "En attente",  className: "bg-amber-50 text-amber-700 border-amber-200" },
  CONFIRMED: { label: "Confirmé",    className: "bg-blue-50 text-blue-700 border-blue-200" },
  COMPLETED: { label: "Réalisé",     className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  CANCELLED: { label: "Annulé",      className: "bg-muted text-muted-foreground border-border" },
  NO_SHOW:   { label: "Absent",      className: "bg-red-50 text-red-600 border-red-200" },
}

const LOCATION_ICON: Record<string, React.ReactNode> = {
  IN_PERSON: <MapPin size={13} />,
  VIDEO:     <Video size={13} />,
  PHONE:     <Phone size={13} />,
}

const LOCATION_LABEL: Record<string, string> = {
  IN_PERSON: "Cabinet",
  VIDEO:     "Téléconsultation",
  PHONE:     "Téléphone",
}

interface Props {
  apt: AgendaAppointment | null
  onClose: () => void
  onPatch: (id: string, data: { status: AppointmentStatus }) => Promise<unknown>
  isPatching: boolean
}

export function AppointmentDrawer({ apt, onClose, onPatch, isPatching }: Props) {
  if (!apt) return null

  const age = apt.patient.birthDate
    ? differenceInYears(new Date(), parseISO(apt.patient.birthDate))
    : null

  const status = STATUS_META[apt.status]
  const canConfirm  = apt.status === "PENDING"
  const canComplete = apt.status === "CONFIRMED"
  const canCancel   = apt.status === "PENDING" || apt.status === "CONFIRMED"

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-40" onClick={onClose} />

      <div className="fixed right-0 top-0 h-full w-[400px] bg-card shadow-xl z-50 flex flex-col border-l animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-base font-semibold truncate">
                {apt.patient.firstName} {apt.patient.lastName}
              </p>
              <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded border shrink-0", status.className)}>
                {status.label}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              {age !== null && <span className="text-[11px] text-muted-foreground">{age} ans</span>}
              {apt.patient.email && (
                <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                  <Mail size={9} /> {apt.patient.email}
                </span>
              )}
            </div>
            {apt.patient.phone && (
              <p className="text-[11px] text-muted-foreground mt-0.5">{apt.patient.phone}</p>
            )}
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors shrink-0 ml-2">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* RDV details */}
          <Section label="Rendez-vous">
            <Row icon={<Clock size={13} />}>
              {format(parseISO(apt.startAt), "EEEE d MMMM yyyy", { locale: fr })}
              {" · "}
              {format(parseISO(apt.startAt), "HH:mm")} – {format(parseISO(apt.endAt), "HH:mm")}
            </Row>
            <Row icon={LOCATION_ICON[apt.locationType]}>
              {LOCATION_LABEL[apt.locationType]}
            </Row>
            {apt.consultationType && (
              <Row icon={<FileText size={13} />}>
                {apt.consultationType.name} · {apt.consultationType.durationMinutes} min
              </Row>
            )}
            {apt.isFirstConsultation && (
              <span className="inline-block text-[10px] font-medium px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full border border-purple-200 mt-1">
                Première consultation
              </span>
            )}
          </Section>

          {/* Origine */}
          <Section label="Origine">
            <div className="bg-muted/30 rounded-lg p-3 flex items-start gap-2">
              <ArrowDownLeft size={13} className="text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                Prise de RDV directe
              </p>
            </div>
          </Section>

          {/* Notes */}
          {apt.notes && (
            <Section label="Notes">
              <p className="text-xs text-foreground/80 whitespace-pre-wrap leading-relaxed">{apt.notes}</p>
            </Section>
          )}

          {/* Résumé IA (placeholder) */}
          <Section label="Résumé IA">
            <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Sparkles size={11} className="text-primary" />
                <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">Brouillon IA</span>
              </div>
              <p className="text-[11px] text-muted-foreground italic">
                Le résumé IA sera disponible après la consultation.
              </p>
              <p className="text-[9px] text-muted-foreground/60 mt-1">
                Synthèse automatique extractive. Validation humaine requise avant tout usage.
              </p>
            </div>
          </Section>

          {/* Lien dossier patient */}
          {apt.careCaseId && (
            <Link
              href={`/patients/${apt.careCaseId}`}
              className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              <FileText size={12} /> Voir le dossier patient
            </Link>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-5 py-4 border-t space-y-2 shrink-0">
          {canComplete && (
            <Button
              className="w-full text-xs"
              disabled={isPatching}
              onClick={() => onPatch(apt.id, { status: "COMPLETED" })}
            >
              Démarrer la consultation
            </Button>
          )}
          {canConfirm && (
            <Button
              className="w-full text-xs"
              disabled={isPatching}
              onClick={() => onPatch(apt.id, { status: "CONFIRMED" })}
            >
              Confirmer le rendez-vous
            </Button>
          )}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs gap-1"
              onClick={() => {/* TODO: send message */}}
            >
              <MessageSquare size={11} /> Message
            </Button>
            {canCancel && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs text-destructive hover:text-destructive"
                disabled={isPatching}
                onClick={() => onPatch(apt.id, { status: "CANCELLED" })}
              >
                Annuler le RDV
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">{label}</p>
      <div className="space-y-1.5">{children}</div>
    </section>
  )
}

function Row({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-1.5 text-xs text-foreground/80">
      {icon && <span className="mt-0.5 text-muted-foreground shrink-0">{icon}</span>}
      <span>{children}</span>
    </div>
  )
}
