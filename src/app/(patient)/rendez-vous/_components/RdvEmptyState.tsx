"use client";

import Link from "next/link";
import { Calendar, Clock, History, XCircle, ArrowRight } from "lucide-react";
import type { AppointmentTab } from "@/lib/appointment-status";

interface RdvEmptyStateProps {
  variant: AppointmentTab;
  /**
   * Si fourni, le titre est personnalisé "Aucun RDV ... pour {firstName}".
   * Utilisé en mode délégation pour les parents qui consultent les RDV d'un enfant.
   */
  profileFirstName?: string;
}

const VARIANTS: Record<
  AppointmentTab,
  {
    Icon: typeof Calendar;
    title: string;
    description: string;
    cta?: { label: string; href: string };
  }
> = {
  upcoming: {
    Icon: Calendar,
    title: "Aucun rendez-vous à venir",
    description:
      "Trouvez un soignant et planifiez votre prochain rendez-vous en quelques clics.",
    cta: { label: "Prendre un rendez-vous", href: "/trouver-un-soignant" },
  },
  pending: {
    Icon: Clock,
    title: "Aucune demande en attente",
    description: "Vos demandes en cours de traitement apparaissent ici.",
    cta: { label: "Voir mes demandes en cours", href: "/rendez-vous/demandes" },
  },
  past: {
    Icon: History,
    title: "Aucun rendez-vous passé",
    description: "L'historique de vos rendez-vous passés apparaîtra ici.",
  },
  cancelled: {
    Icon: XCircle,
    title: "Aucun rendez-vous annulé",
    description: "Les rendez-vous annulés ou non honorés apparaîtront ici.",
  },
};

/**
 * Empty state contextuel pour la page /rendez-vous V2 — un design par tab.
 *
 * Pas d'image, pas d'illustration externe : icône Lucide neutre + texte centré.
 * Conforme MDR : pas de wording clinique, uniquement organisationnel.
 */
export function RdvEmptyState({ variant, profileFirstName }: RdvEmptyStateProps) {
  const cfg = VARIANTS[variant];
  const { Icon, description, cta } = cfg;

  // Personnalisation du titre quand on consulte les RDV d'un autre profil (enfant)
  const title = profileFirstName
    ? buildDelegatedTitle(variant, profileFirstName, cfg.title)
    : cfg.title;

  return (
    <div
      className="
        text-center py-14 px-6 rounded-2xl
        bg-white/60 border border-[var(--nami-border)]
      "
    >
      <div
        className="
          mx-auto mb-4 inline-flex items-center justify-center
          w-12 h-12 rounded-full bg-[var(--nami-bg-alt)]
          text-[var(--nami-text-muted)]
        "
      >
        <Icon size={22} aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-[var(--nami-dark)]">{title}</h3>
      <p className="mt-2 text-sm text-[var(--nami-text-muted)] max-w-sm mx-auto">
        {description}
      </p>
      {cta && (
        <Link
          href={cta.href}
          className="
            mt-5 inline-flex items-center gap-1.5 rounded-xl
            bg-[var(--nami-primary)] px-4 py-2 text-sm font-medium text-white
            shadow-sm hover:bg-[var(--nami-primary-hover)]
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nami-primary)]/40
            transition-colors
          "
        >
          {cta.label}
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

function buildDelegatedTitle(
  variant: AppointmentTab,
  firstName: string,
  fallback: string,
): string {
  switch (variant) {
    case "upcoming":
      return `Aucun rendez-vous à venir pour ${firstName}`;
    case "pending":
      return `Aucune demande en attente pour ${firstName}`;
    case "past":
      return `Aucun rendez-vous passé pour ${firstName}`;
    case "cancelled":
      return `Aucun rendez-vous annulé pour ${firstName}`;
    default:
      return fallback;
  }
}
