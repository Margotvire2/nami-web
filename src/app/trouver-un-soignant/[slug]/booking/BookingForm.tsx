"use client";

import type { User } from "@/lib/api";

export type BookingMode = "IN_PERSON" | "VIDEO" | "PHONE";

interface BookingFormProps {
  user: User;
  mode: BookingMode;
  onModeChange: (mode: BookingMode) => void;
  motif: string;
  onMotifChange: (motif: string) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  teleconsultAvailable: boolean;
}

const MOTIF_MAX = 500;
const NOTES_MAX = 1000;

export default function BookingForm({
  user,
  mode,
  onModeChange,
  motif,
  onMotifChange,
  notes,
  onNotesChange,
  teleconsultAvailable,
}: BookingFormProps) {
  return (
    <section
      aria-labelledby="booking-form-heading"
      className="bg-white rounded-xl border border-[rgba(26,26,46,0.06)] p-5 sm:p-6 space-y-6"
    >
      <h2 id="booking-form-heading" className="text-lg font-semibold text-[#1A1A2E]">
        Détails de votre demande
      </h2>

      {/* ─── Mode de consultation ────────────────────────────────────────── */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-[#1A1A2E] mb-2">
          Mode de rendez-vous
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <label
            className={[
              "flex items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors text-sm",
              mode === "IN_PERSON"
                ? "border-[#5B4EC4] bg-[#EEEDFB] text-[#5B4EC4]"
                : "border-[rgba(26,26,46,0.12)] text-[#374151] hover:bg-[#FAFAF8]",
            ].join(" ")}
          >
            <input
              type="radio"
              name="booking-mode"
              value="IN_PERSON"
              checked={mode === "IN_PERSON"}
              onChange={() => onModeChange("IN_PERSON")}
              className="sr-only"
            />
            <span className="font-medium">Au cabinet</span>
          </label>

          <label
            className={[
              "flex items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors text-sm",
              !teleconsultAvailable ? "opacity-40 cursor-not-allowed" : "",
              mode === "VIDEO"
                ? "border-[#5B4EC4] bg-[#EEEDFB] text-[#5B4EC4]"
                : "border-[rgba(26,26,46,0.12)] text-[#374151] hover:bg-[#FAFAF8]",
            ].join(" ")}
          >
            <input
              type="radio"
              name="booking-mode"
              value="VIDEO"
              disabled={!teleconsultAvailable}
              checked={mode === "VIDEO"}
              onChange={() => onModeChange("VIDEO")}
              className="sr-only"
            />
            <span className="font-medium">
              Téléconsultation
              {!teleconsultAvailable && (
                <span className="block text-[11px] text-[#9CA3AF] mt-0.5 font-normal">
                  non proposée
                </span>
              )}
            </span>
          </label>

          <label
            className={[
              "flex items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors text-sm",
              mode === "PHONE"
                ? "border-[#5B4EC4] bg-[#EEEDFB] text-[#5B4EC4]"
                : "border-[rgba(26,26,46,0.12)] text-[#374151] hover:bg-[#FAFAF8]",
            ].join(" ")}
          >
            <input
              type="radio"
              name="booking-mode"
              value="PHONE"
              checked={mode === "PHONE"}
              onChange={() => onModeChange("PHONE")}
              className="sr-only"
            />
            <span className="font-medium">Téléphone</span>
          </label>
        </div>
      </fieldset>

      {/* ─── Motif ──────────────────────────────────────────────────────── */}
      <div>
        <label
          htmlFor="booking-motif"
          className="block text-sm font-medium text-[#1A1A2E] mb-1.5"
        >
          Motif de la demande
        </label>
        <textarea
          id="booking-motif"
          value={motif}
          onChange={(e) => onMotifChange(e.target.value.slice(0, MOTIF_MAX))}
          placeholder="Quelques mots sur votre demande (optionnel)"
          rows={3}
          maxLength={MOTIF_MAX}
          className="w-full px-3 py-2 rounded-lg border border-[rgba(26,26,46,0.12)] focus:outline-none focus:border-[#5B4EC4] focus:ring-2 focus:ring-[#5B4EC4]/20 text-sm text-[#1A1A2E] resize-none"
          aria-describedby="booking-motif-count"
        />
        <div
          id="booking-motif-count"
          className="mt-1 text-[11px] text-[#9CA3AF] text-right"
          aria-live="polite"
        >
          {motif.length} / {MOTIF_MAX}
        </div>
      </div>

      {/* ─── Notes ──────────────────────────────────────────────────────── */}
      <div>
        <label
          htmlFor="booking-notes"
          className="block text-sm font-medium text-[#1A1A2E] mb-1.5"
        >
          Informations utiles pour le soignant
          <span className="ml-1 text-xs font-normal text-[#6B7280]">(optionnel)</span>
        </label>
        <textarea
          id="booking-notes"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value.slice(0, NOTES_MAX))}
          placeholder="Disponibilités préférées, mode de contact souhaité, etc."
          rows={3}
          maxLength={NOTES_MAX}
          className="w-full px-3 py-2 rounded-lg border border-[rgba(26,26,46,0.12)] focus:outline-none focus:border-[#5B4EC4] focus:ring-2 focus:ring-[#5B4EC4]/20 text-sm text-[#1A1A2E] resize-none"
          aria-describedby="booking-notes-count"
        />
        <div
          id="booking-notes-count"
          className="mt-1 text-[11px] text-[#9CA3AF] text-right"
          aria-live="polite"
        >
          {notes.length} / {NOTES_MAX}
        </div>
      </div>

      {/* ─── Récap utilisateur (read-only) ──────────────────────────────── */}
      <div className="border-t border-[rgba(26,26,46,0.06)] pt-5">
        <h3 className="text-sm font-medium text-[#1A1A2E] mb-3">
          Vos coordonnées
        </h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div>
            <dt className="text-[#6B7280] text-xs">Nom</dt>
            <dd className="text-[#1A1A2E] font-medium">
              {user.firstName} {user.lastName}
            </dd>
          </div>
          <div>
            <dt className="text-[#6B7280] text-xs">Email</dt>
            <dd className="text-[#1A1A2E] font-medium break-all">{user.email}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-[#6B7280]">
          Pour modifier ces informations, rendez-vous dans votre espace personnel.
        </p>
      </div>
    </section>
  );
}
