"use client";

/**
 * AdressageDetailSheet — glass-strong sheet droite.
 *
 * Pattern inspiré de KnowledgeDetailModal (cockpit RAG) :
 *   - Sheet right side, largeur 540px, max-w 90vw
 *   - Body scrollable, header + footer sticky
 *   - Footer légal MDR "Outil de coordination · Non dispositif médical · Conforme RGPD"
 *
 * Actions disponibles selon le rôle :
 *   - Recipient + status="RECEIVED" : Accepter, Refuser (modal motif obligatoire)
 *   - Owner + status in [SENT/RECEIVED/UNDER_REVIEW] : Annuler
 *   - Toujours : Voir fiche patient (lien vers /patients/[careCaseId])
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, FileText, Calendar } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import type { Referral } from "@/lib/api";
import { PriorityPill } from "./PriorityPill";
import { StatusBadge } from "./StatusBadge";
import { ConsentChip } from "./ConsentChip";
import { DeclineReasonModal } from "./DeclineReasonModal";
import {
  patientName,
  targetProviderName,
  targetSpecialty,
  senderName,
  formatBirthDate,
  daysAgo,
} from "./_utils";
import { cn } from "@/lib/utils";

interface AdressageDetailSheetProps {
  referral: Referral | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isRecipient: boolean;
  isOwner: boolean;
  onAccept?: (id: string) => Promise<void> | void;
  onDecline?: (id: string, reason: string) => Promise<void> | void;
  onCancel?: (id: string) => Promise<void> | void;
}

export function AdressageDetailSheet({
  referral,
  open,
  onOpenChange,
  isRecipient,
  isOwner,
  onAccept,
  onDecline,
  onCancel,
}: AdressageDetailSheetProps) {
  const router = useRouter();
  const [declineModalOpen, setDeclineModalOpen] = useState(false);

  if (!referral) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="glass-strong !w-[540px] !max-w-[90vw] !p-0 !border-l-[0.5px] !border-l-white/60"
        >
          <SheetTitle className="sr-only">Détail de l'adressage</SheetTitle>
          <SheetDescription className="sr-only">
            Aucun adressage sélectionné.
          </SheetDescription>
        </SheetContent>
      </Sheet>
    );
  }

  const specialty = targetSpecialty(referral);
  const birth = formatBirthDate(referral.careCase?.patient?.birthDate);
  const canAccept = isRecipient && referral.status === "RECEIVED";
  const canDecline = isRecipient && referral.status === "RECEIVED";
  const canCancel =
    isOwner &&
    (["SENT", "RECEIVED", "UNDER_REVIEW"] as Referral["status"][]).includes(
      referral.status,
    );

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
          {/* Header sticky */}
          <div className="px-6 py-5 flex items-center gap-3 border-b border-white/30 shrink-0">
            <PriorityPill priority={referral.priority} />
            <StatusBadge status={referral.status} />
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="ml-auto p-1.5 rounded-lg hover:bg-white/40 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40"
              aria-label="Fermer"
            >
              <X className="size-5 text-[#4A4A5A]" />
            </button>
          </div>

          {/* Body scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {/* Patient */}
            <section>
              <SheetTitle className="text-xl font-bold text-[#1A1A2E]">
                {patientName(referral)}
              </SheetTitle>
              {birth && (
                <SheetDescription className="text-sm text-[#4A4A5A] mt-0.5 font-mono">
                  Né(e) le {birth}
                </SheetDescription>
              )}
              {!birth && (
                <SheetDescription className="sr-only">
                  Détail de l'adressage pour {patientName(referral)}
                </SheetDescription>
              )}
            </section>

            {/* De / Vers / Spécialité / Type */}
            <section className="glass-soft rounded-xl p-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <Field label="De" value={senderName(referral)} />
              <Field label="Vers" value={targetProviderName(referral)} />
              <Field label="Spécialité" value={specialty ?? "—"} />
              <Field label="Mode" value={referral.mode === "DIRECT" ? "Direct" : "Pool de candidats"} />
              {referral.preferredZone && (
                <Field label="Zone" value={referral.preferredZone} />
              )}
              <Field label="Créé" value={daysAgo(referral.createdAt)} />
            </section>

            {/* Motif clinique */}
            <section>
              <SectionLabel>Motif clinique</SectionLabel>
              <div className="glass-soft rounded-xl p-4 text-sm text-[#1A1A2E] whitespace-pre-wrap">
                {referral.clinicalReason || "—"}
              </div>
              {referral.urgencyNote && (
                <div className="mt-2 glass-soft rounded-xl p-4 text-sm">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-[#D14545] mb-1">
                    Note d'urgence
                  </div>
                  <p className="text-[#1A1A2E] whitespace-pre-wrap">
                    {referral.urgencyNote}
                  </p>
                </div>
              )}
              {referral.personalMessage && (
                <div className="mt-2 glass-soft rounded-xl p-4 text-sm">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-[#5B4EC4] mb-1">
                    Message personnel
                  </div>
                  <p className="text-[#1A1A2E] whitespace-pre-wrap">
                    {referral.personalMessage}
                  </p>
                </div>
              )}
            </section>

            {/* RDV souhaité */}
            {referral.desiredAppointmentDate && (
              <section>
                <SectionLabel>RDV souhaité</SectionLabel>
                <div className="glass-soft rounded-xl p-4 text-sm text-[#1A1A2E] inline-flex items-center gap-2">
                  <Calendar className="size-4 text-[#5B4EC4]" />
                  {new Date(referral.desiredAppointmentDate).toLocaleDateString(
                    "fr-FR",
                    { weekday: "long", day: "2-digit", month: "long", year: "numeric" },
                  )}
                </div>
              </section>
            )}

            {/* Consentement */}
            <section>
              <SectionLabel>Consentement patient</SectionLabel>
              <ConsentChip hasConsent={null} />
            </section>

            {/* Réponse (si déjà traité) */}
            {referral.respondedAt && (
              <section>
                <SectionLabel>Réponse</SectionLabel>
                <div className="glass-soft rounded-xl p-4 text-sm">
                  <div className="text-[11px] text-[#8A8A96] font-mono mb-1">
                    {new Date(referral.respondedAt).toLocaleString("fr-FR")}
                  </div>
                  {referral.declineReason && (
                    <div>
                      <span className="font-semibold text-[#D14545]">
                        Motif de refus :
                      </span>{" "}
                      <span className="text-[#1A1A2E] whitespace-pre-wrap">
                        {referral.declineReason}
                      </span>
                    </div>
                  )}
                  {referral.responseNote && !referral.declineReason && (
                    <div className="text-[#1A1A2E] whitespace-pre-wrap">
                      {referral.responseNote}
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Footer actions */}
          <div className="px-6 py-4 border-t border-white/30 flex items-center gap-2 flex-wrap shrink-0">
            {referral.careCase?.id && (
              <button
                type="button"
                onClick={() => router.push(`/patients/${referral.careCase.id}`)}
                className={cn(
                  "px-4 py-2 rounded-lg glass-soft text-sm font-medium text-[#1A1A2E]",
                  "hover:bg-white/60 transition inline-flex items-center gap-1.5",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40",
                )}
              >
                <FileText className="size-4" />
                Voir fiche patient
              </button>
            )}
            <div className="flex-1" />
            {canDecline && (
              <button
                type="button"
                onClick={() => setDeclineModalOpen(true)}
                className={cn(
                  "px-4 py-2 rounded-lg bg-white text-[#D14545]",
                  "ring-1 ring-[#D14545]/20",
                  "text-sm font-semibold hover:bg-[#FCE9E9] transition",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D14545]/40",
                )}
              >
                Refuser
              </button>
            )}
            {canAccept && (
              <button
                type="button"
                onClick={() => onAccept?.(referral.id)}
                className={cn(
                  "px-4 py-2 rounded-lg bg-[#5B4EC4] text-white",
                  "hover:bg-[#4c44b0] transition shadow-sm",
                  "text-sm font-semibold",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40",
                )}
              >
                Accepter
              </button>
            )}
            {canCancel && (
              <button
                type="button"
                onClick={() => onCancel?.(referral.id)}
                className={cn(
                  "px-4 py-2 rounded-lg glass-soft text-sm font-medium text-[#4A4A5A]",
                  "hover:bg-white/60 transition",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40",
                )}
              >
                Annuler l'adressage
              </button>
            )}
          </div>

          {/* Footer légal MDR */}
          <div className="px-6 py-2.5 text-center text-[11px] text-[#1A1A2E]/50 border-t border-white/30 shrink-0">
            Outil de coordination · Non dispositif médical · Conforme RGPD
          </div>
        </SheetContent>
      </Sheet>

      <DeclineReasonModal
        open={declineModalOpen}
        onOpenChange={setDeclineModalOpen}
        onConfirm={async (reason) => {
          await onDecline?.(referral.id, reason);
          setDeclineModalOpen(false);
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

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] text-[#8A8A96] uppercase tracking-wide font-semibold">
        {label}
      </div>
      <div className="text-[#1A1A2E] mt-0.5">{value}</div>
    </div>
  );
}
