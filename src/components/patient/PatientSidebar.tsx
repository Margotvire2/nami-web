"use client";

import {
  Home,
  Search,
  Calendar,
  TrendingUp,
  MessageCircle,
  FileText,
  Heart,
} from "lucide-react";
import { PatientNavItem } from "./PatientNavItem";
import { PatientNavParcoursItem } from "./PatientNavParcoursItem";

// Item "Mon parcours" extrait dans <PatientNavParcoursItem/> (adaptatif
// 0/1/N CareCases). Position préservée : juste après "Mes rendez-vous".
const NAV_ITEMS = [
  { href: "/accueil", icon: Home, label: "Accueil", disabled: false },
  {
    href: "/trouver-un-soignant",
    icon: Search,
    label: "Trouver un soignant",
    disabled: false,
  },
  { href: "/rendez-vous", icon: Calendar, label: "Mes rendez-vous", disabled: false },
  { href: "/suivi", icon: TrendingUp, label: "Mon suivi", disabled: false },
  { href: "/mes-messages", icon: MessageCircle, label: "Mes messages", disabled: false },
  { href: "/mes-documents", icon: FileText, label: "Mes documents", disabled: false },
] as const;

// Position d'insertion de <PatientNavParcoursItem/> (juste après cet href —
// préserve l'ordre de la sidebar : Rendez-vous → Parcours → Suivi).
const PARCOURS_INSERT_AFTER_HREF: string = "/rendez-vous";

// "Ma santé" rendu juste après <PatientNavParcoursItem/> (donc avant /suivi).
const MA_SANTE_INSERT_AFTER_PARCOURS = true;

interface PatientSidebarProps {
  className?: string;
}

export function PatientSidebar({ className = "" }: PatientSidebarProps) {
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
              variant="sidebar"
            />
            {item.href === PARCOURS_INSERT_AFTER_HREF && (
              <>
                <PatientNavParcoursItem variant="sidebar" />
                {MA_SANTE_INSERT_AFTER_PARCOURS && (
                  <PatientNavItem
                    href="/ma-sante"
                    icon={Heart}
                    label="Ma santé"
                    disabled={false}
                    variant="sidebar"
                  />
                )}
              </>
            )}
          </span>
        ))}
      </nav>
    </aside>
  );
}
