"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AppointmentCancelReason } from "@/lib/api";

/**
 * Modal d'annulation RDV — F-G4-WIRING-FRONTEND.
 *
 * Exige la sélection d'un motif AppointmentCancelReason avant validation
 * pour ne pas perdre la granularité MDR côté backend (le service inferre
 * le AppointmentStatus.CANCELLED_BY_* à partir de la reason).
 *
 * Note technique : utilise un <select> HTML natif (pas shadcn Select) car
 * le composant shadcn n'est pas installé dans le repo et l'install via
 * `npx shadcn add select` échoue sur components.json invalide (format ancien).
 * Ticket dérivé F-COMPONENTS-JSON-MIGRATION pour fixer ça plus tard.
 */

const REASON_OPTIONS: Array<{ value: AppointmentCancelReason; label: string }> = [
  { value: "PATIENT_UNAVAILABLE", label: "Patient indisponible" },
  { value: "PATIENT_NO_LONGER_NEEDED", label: "Patient plus besoin du RDV" },
  { value: "PATIENT_FINANCIAL", label: "Patient — raison financière" },
  { value: "PROVIDER_UNAVAILABLE", label: "Soignant indisponible" },
  { value: "PROVIDER_EMERGENCY", label: "Soignant — urgence" },
  { value: "SECRETARY_CONFLICT", label: "Conflit d'agenda secrétariat" },
  { value: "SYSTEM_TEAM_CHANGE", label: "Changement d'équipe (système)" },
  { value: "OTHER", label: "Autre motif" },
];

interface CancelAppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: { reason: AppointmentCancelReason; note?: string }) => Promise<void>;
  isPending: boolean;
}

export function CancelAppointmentModal({
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: CancelAppointmentModalProps) {
  const [reason, setReason] = useState<AppointmentCancelReason | "">("");
  const [note, setNote] = useState("");

  const handleConfirm = async () => {
    if (!reason) return;
    await onConfirm({ reason, note: note.trim() || undefined });
    setReason("");
    setNote("");
  };

  const handleCancel = () => {
    setReason("");
    setNote("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Annuler le rendez-vous</DialogTitle>
          <DialogDescription>
            Précisez le motif d&apos;annulation pour la traçabilité dossier.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="cancel-reason">Motif</Label>
            <select
              id="cancel-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value as AppointmentCancelReason | "")}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isPending}
            >
              <option value="">Sélectionner un motif</option>
              {REASON_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cancel-note">Note (optionnelle)</Label>
            <Textarea
              id="cancel-note"
              placeholder="Précisions internes..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={1000}
              rows={3}
              disabled={isPending}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isPending}>
            Retour
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!reason || isPending}
          >
            {isPending ? "Annulation..." : "Annuler le RDV"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
