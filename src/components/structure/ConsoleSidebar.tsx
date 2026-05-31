"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Megaphone,
  Library,
  Search,
  MessageSquare,
  Settings,
  type LucideIcon,
} from "lucide-react";

interface SidebarItem {
  label: string;
  icon: LucideIcon;
  href?: string;
  comingSoon?: boolean;
}

interface ConsoleSidebarProps {
  orgId: string;
  active: "dashboard" | "discussions";
}

export function ConsoleSidebar({ orgId, active }: ConsoleSidebarProps) {
  void orgId;

  const items: SidebarItem[] = [
    {
      label: "Tableau de bord",
      icon: LayoutDashboard,
      href: `/structure/${orgId}/admin`,
    },
    { label: "Membres", icon: Users, comingSoon: true },
    { label: "Événements", icon: CalendarDays, comingSoon: true },
    { label: "Actualités", icon: Megaphone, comingSoon: true },
    { label: "Ressources", icon: Library, comingSoon: true },
    { label: "Recherche", icon: Search, comingSoon: true },
    { label: "Discussions", icon: MessageSquare, href: "/messages" },
    { label: "Paramètres", icon: Settings, comingSoon: true },
  ];

  return (
    <nav
      aria-label="Navigation console d'animation"
      className="flex flex-wrap items-center gap-1 rounded-xl border border-[#E8ECF4] bg-white p-2"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive =
          (active === "dashboard" && item.label === "Tableau de bord") ||
          (active === "discussions" && item.label === "Discussions");

        const base =
          "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors";

        if (item.comingSoon) {
          return (
            <span
              key={item.label}
              role="button"
              aria-disabled
              title="Disponible en V2"
              className={`${base} text-[#6B7280] opacity-50 cursor-not-allowed`}
              style={{ fontFamily: "var(--font-jakarta)" }}
            >
              <Icon size={13} />
              {item.label}
            </span>
          );
        }

        return (
          <Link
            key={item.label}
            href={item.href!}
            aria-current={isActive ? "page" : undefined}
            className={`${base} ${
              isActive
                ? "bg-[#5B4EC4] text-white"
                : "text-[#374151] hover:bg-[#F0F2FA] hover:text-[#5B4EC4]"
            }`}
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            <Icon size={13} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
