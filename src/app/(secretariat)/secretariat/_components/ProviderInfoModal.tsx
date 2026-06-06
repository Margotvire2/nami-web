"use client";

// INIT-628 — Modal info léger affiché au clic sur le nom d'un soignant
// dans l'agenda secrétaire ou la card salle d'attente.
//
// Scope MDR-safe : strictement administratif (identité, contact, lien
// "Mes rattachements"). Aucun élément clinique, aucun compteur de patients,
// aucun statut médical. Drawer riche = V2.

import Link from "next/link";
import { X, Phone, Mail, ExternalLink } from "lucide-react";

export interface ProviderContactInfo {
  providerName: string;
  specialties?: string[];
  providerPhone?: string | null;
  providerEmail?: string | null;
  providerPhotoUrl?: string | null;
}

function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function ProviderInfoModal({
  provider,
  onClose,
}: {
  provider: ProviderContactInfo;
  onClose: () => void;
}) {
  const hasPhone = Boolean(provider.providerPhone);
  const hasEmail = Boolean(provider.providerEmail);
  const specialties = (provider.specialties ?? []).filter(Boolean);

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="provider-info-title"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[360px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#E8ECF4]">
          <h3 id="provider-info-title" className="text-sm font-semibold text-[#1A1A2E]">
            Soignant
          </h3>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="text-[#6B7280] hover:text-[#1A1A2E]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          {/* Identité */}
          <div className="flex items-center gap-3 mb-4">
            {provider.providerPhotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={provider.providerPhotoUrl}
                alt=""
                className="w-12 h-12 rounded-full object-cover border border-[#E8ECF4]"
              />
            ) : (
              <div
                aria-hidden="true"
                className="w-12 h-12 rounded-full bg-[#EEEDFB] text-[#5B4EC4] font-semibold flex items-center justify-center text-[13px]"
              >
                {initials(provider.providerName)}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-[#1A1A2E] truncate">
                {provider.providerName}
              </p>
              {specialties.length > 0 && (
                <p className="text-[11px] text-[#6B7280] truncate">
                  {specialties.join(" · ")}
                </p>
              )}
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-1.5">
            {hasPhone ? (
              <a
                href={`tel:${provider.providerPhone}`}
                className="flex items-center gap-2 text-[12px] text-[#1A1A2E] hover:text-[#5B4EC4] hover:bg-[#F5F3EF] rounded-md px-2 py-1.5 -mx-2 transition-colors"
              >
                <Phone size={13} className="text-[#5B4EC4] shrink-0" />
                <span className="truncate">{provider.providerPhone}</span>
              </a>
            ) : (
              <div className="flex items-center gap-2 text-[12px] text-[#9CA3AF] px-2 py-1.5 -mx-2">
                <Phone size={13} className="shrink-0" />
                <span>Téléphone non renseigné</span>
              </div>
            )}
            {hasEmail ? (
              <a
                href={`mailto:${provider.providerEmail}`}
                className="flex items-center gap-2 text-[12px] text-[#1A1A2E] hover:text-[#5B4EC4] hover:bg-[#F5F3EF] rounded-md px-2 py-1.5 -mx-2 transition-colors"
              >
                <Mail size={13} className="text-[#5B4EC4] shrink-0" />
                <span className="truncate">{provider.providerEmail}</span>
              </a>
            ) : (
              <div className="flex items-center gap-2 text-[12px] text-[#9CA3AF] px-2 py-1.5 -mx-2">
                <Mail size={13} className="shrink-0" />
                <span>Email non renseigné</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer : lien rattachements */}
        <div className="px-5 py-3 border-t border-[#E8ECF4] bg-[#FAFAF8] rounded-b-2xl">
          <Link
            href="/secretariat/parametres"
            onClick={onClose}
            className="flex items-center justify-between text-[12px] font-medium text-[#5B4EC4] hover:underline"
          >
            <span>Mes rattachements</span>
            <ExternalLink size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}
