"use client";

import {
  Home,
  Search,
  Calendar,
  Bell,
  TrendingUp,
  MessageCircle,
  FileText,
  FileHeart,
} from "lucide-react";
import { PatientNavItem } from "./PatientNavItem";
import { PatientNavParcoursItem } from "./PatientNavParcoursItem";
import { usePatientNotifications } from "@/hooks/usePatientNotifications";

// Item "Mon parcours" extrait dans <PatientNavParcoursItem/> (adaptatif
// 0/1/N CareCases). Position préservée : juste après "Notifications".
const NAV_ITEMS = [
  { href: "/accueil", icon: Home, label: "Accueil", disabled: false },
  {
    href: "/trouver-un-soignant",
    icon: Search,
    label: "Trouver un soignant",
    disabled: true,
    tooltip: "Bientôt disponible",
  },
  { href: "/rendez-vous", icon: Calendar, label: "Mes rendez-vous", disabled: false },
  { href: "/mes-bilans", icon: FileHeart, label: "Mes bilans", disabled: false },
  { href: "/notifications", icon: Bell, label: "Notifications", disabled: false },
  { href: "/suivi", icon: TrendingUp, label: "Mon suivi", disabled: false },
  { href: "/mes-messages", icon: MessageCircle, label: "Mes messages", disabled: false },
  { href: "/mes-documents", icon: FileText, label: "Mes documents", disabled: false },
] as const;

// Position d'insertion de <PatientNavParcoursItem/> (juste après cet href —
// préserve l'ordre de l'ancienne sidebar : Notifications → Parcours → Suivi).
const PARCOURS_INSERT_AFTER_HREF: string = "/notifications";

interface PatientSidebarProps {
  className?: string;
}

export function PatientSidebar({ className = "" }: PatientSidebarProps) {
  // Réutilise la query "patient-notifications" du PatientHeader (même cache
  // TanStack) → un seul fetch pour les deux composants. Badge mis à jour
  // par polling 60s + invalidation au markRead.
  const { data: notifications } = usePatientNotifications();
  const unreadCount = notifications?.unreadCount ?? 0;

  return (
    <aside
      aria-label="Navigation principale"
      className={`w-60 flex-col gap-1 border-r border-[rgba(26,26,46,0.06)] bg-white px-3 py-6 sticky top-[64px] h-[calc(100vh-64px)] ${className}`}
    >
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <span key={item.href} className="contents">
            <PatientNavItem
              href={item.href}
              icon={item.icon}
              label={item.label}
              disabled={item.disabled}
              tooltip={"tooltip" in item ? item.tooltip : undefined}
              badge={item.href === "/notifications" ? unreadCount : undefined}
              variant="sidebar"
            />
            {item.href === PARCOURS_INSERT_AFTER_HREF && (
              <PatientNavParcoursItem variant="sidebar" />
            )}
          </span>
        ))}
      </nav>
    </aside>
  );
}
