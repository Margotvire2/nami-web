/**
 * useCareSocket — temps réel d'un dossier patient
 *
 * Se connecte au namespace /care-cases, rejoint la room "case:{careCaseId}",
 * invalide les queries React Query sur chaque événement reçu, et affiche
 * un toast non-intrusif pour les événements importants (nouvelles notes).
 *
 * Usage :
 *   useCareSocket(careCaseId)  // dans le composant patient
 */

"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store";
import { getCareSocket, disconnectCareSocket } from "@/lib/socket";

const NOTE_TYPE_LABELS: Record<string, string> = {
  CONSULTATION: "consultation",
  EVOLUTION:    "évolution",
  COORDINATION: "coordination",
  ALERT:        "alerte",
  SUMMARY:      "synthèse",
  TELECONSULTATION: "téléconsultation",
};

const ENTRY_LABELS: Record<string, string> = {
  MEAL:            "Repas",
  EMOTION:         "Émotion",
  SYMPTOM:         "Symptôme",
  NOTE:            "Note",
  PHYSICAL_ACTIVITY: "Activité physique",
  CRISIS_EVENT:    "Événement de crise",
  POSITIVE_THOUGHT:"Pensée positive",
  QUESTIONNAIRE:   "Questionnaire",
};

export function useCareSocket(careCaseId: string | null | undefined): void {
  const { accessToken, user } = useAuthStore();
  const queryClient = useQueryClient();
  // Garder une ref stable du careCaseId joined pour éviter leave/rejoin inutiles
  const joinedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!accessToken || !careCaseId) return;

    const socket = getCareSocket(accessToken);

    // Join la room si pas déjà dedans
    if (joinedRef.current !== careCaseId) {
      if (joinedRef.current) socket.emit("leave_case", joinedRef.current);
      socket.emit("join_case", careCaseId);
      joinedRef.current = careCaseId;
    }

    // ── note_created ──────────────────────────────────────────────────────────
    const onNoteCreated = (note: any) => {
      queryClient.invalidateQueries({ queryKey: ["notes", careCaseId] });
      // Toast seulement si c'est un autre soignant (pas soi-même)
      if (note.author?.id !== user?.id) {
        const who = note.author
          ? `Dr ${note.author.lastName ?? note.author.firstName}`
          : "Un soignant";
        const type = NOTE_TYPE_LABELS[note.noteType] ?? note.noteType?.toLowerCase() ?? "note";
        toast(`${who} a ajouté une note de ${type}`, {
          duration: 5000,
          action: { label: "Voir", onClick: () => {} },
        });
      }
    };

    // ── note_updated ──────────────────────────────────────────────────────────
    const onNoteUpdated = (note: any) => {
      queryClient.invalidateQueries({ queryKey: ["notes", careCaseId] });
      if (note.author?.id !== user?.id) {
        queryClient.invalidateQueries({ queryKey: ["note", note.id] });
      }
    };

    // ── note_deleted ──────────────────────────────────────────────────────────
    const onNoteDeleted = () => {
      queryClient.invalidateQueries({ queryKey: ["notes", careCaseId] });
    };

    // ── journal_entry ─────────────────────────────────────────────────────────
    const onJournalEntry = (entry: any) => {
      // Invalide les queries journal du cockpit
      queryClient.invalidateQueries({ queryKey: [`journal-${careCaseId}`] });
      queryClient.invalidateQueries({ queryKey: ["journal", careCaseId] });
      if (entry.author?.id !== user?.id) {
        const label = ENTRY_LABELS[entry.entryType] ?? entry.entryType;
        toast(`${entry.author?.firstName ?? "Patient"} a ajouté : ${label}`, {
          duration: 3000,
        });
      }
    };

    // ── observation ───────────────────────────────────────────────────────────
    const onObservation = () => {
      queryClient.invalidateQueries({ queryKey: ["observations", careCaseId] });
      queryClient.invalidateQueries({ queryKey: ["growth", careCaseId] });
    };

    // ── message ───────────────────────────────────────────────────────────────
    const onMessage = (msg: any) => {
      queryClient.invalidateQueries({ queryKey: ["messages", careCaseId] });
      if (msg.sender?.id !== user?.id) {
        const who = msg.sender?.firstName ?? "Un membre";
        const preview = msg.body?.slice(0, 50);
        toast(`💬 ${who} : ${preview}`, { duration: 4000 });
      }
    };

    socket.on("note_created",  onNoteCreated);
    socket.on("note_updated",  onNoteUpdated);
    socket.on("note_deleted",  onNoteDeleted);
    socket.on("journal_entry", onJournalEntry);
    socket.on("observation",   onObservation);
    socket.on("message",       onMessage);

    return () => {
      socket.off("note_created",  onNoteCreated);
      socket.off("note_updated",  onNoteUpdated);
      socket.off("note_deleted",  onNoteDeleted);
      socket.off("journal_entry", onJournalEntry);
      socket.off("observation",   onObservation);
      socket.off("message",       onMessage);
    };
  }, [accessToken, careCaseId, queryClient, user?.id]);

  // Quitter la room et déconnecter à l'unmount complet du composant patient
  useEffect(() => {
    return () => {
      if (joinedRef.current) {
        try {
          getCareSocket(accessToken ?? "").emit("leave_case", joinedRef.current);
        } catch {
          // socket peut déjà être fermé
        }
      }
      disconnectCareSocket();
      joinedRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
