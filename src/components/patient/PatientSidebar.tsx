"use client";

import {
  Home,
  Search,
  Calendar,
  Route,
  TrendingUp,
  MessageCircle,
  FileText,
} from "lucide-react";
import { PatientNavItem } from "./PatientNavItem";

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
  {
    href: "/parcours",
    icon: Route,
    label: "Mon parcours",
    disabled: true,
    tooltip: "Bientôt disponible",
  },
  {
    href: "/suivi",
    icon: TrendingUp,
    label: "Mon suivi",
    disabled: true,
    tooltip: "Bientôt disponible",
  },
  { href: "/mes-messages", icon: MessageCircle, label: "Mes messages", disabled: false },
  { href: "/mes-documents", icon: FileText, label: "Mes documents", disabled: false },
] as const;

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
          <PatientNavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            disabled={item.disabled}
            tooltip={"tooltip" in item ? item.tooltip : undefined}
            variant="sidebar"
          />
        ))}
      </nav>
    </aside>
  );
}
