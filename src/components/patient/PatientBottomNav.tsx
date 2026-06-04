"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Calendar,
  Route,
  MessageCircle,
  MoreHorizontal,
  Search,
  TrendingUp,
  Bell,
  FileText,
  User as UserIcon,
} from "lucide-react";
import { PatientNavItem } from "./PatientNavItem";
import { usePatientNotifications } from "@/hooks/usePatientNotifications";

const PRIMARY = [
  { href: "/accueil", icon: Home, label: "Accueil", disabled: false },
  { href: "/rendez-vous", icon: Calendar, label: "RDV", disabled: false },
  { href: "/notifications", icon: Bell, label: "Notifs", disabled: false },
  { href: "/parcours", icon: Route, label: "Parcours", disabled: false },
  { href: "/mes-messages", icon: MessageCircle, label: "Messages", disabled: false },
] as const;

const SECONDARY_IN_MORE_MENU = [
  {
    href: "/trouver-un-soignant",
    icon: Search,
    label: "Trouver un soignant",
    disabled: false,
  },
  { href: "/suivi", icon: TrendingUp, label: "Mon suivi", disabled: false },
  { href: "/mes-documents", icon: FileText, label: "Mes documents", disabled: false },
  { href: "/mon-compte", icon: UserIcon, label: "Mon compte", disabled: false },
] as const;

interface PatientBottomNavProps {
  className?: string;
}

export function PatientBottomNav({ className = "" }: PatientBottomNavProps) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Même query que PatientHeader/PatientSidebar → cache mutualisé.
  const { data: notifications } = usePatientNotifications();
  const unreadCount = notifications?.unreadCount ?? 0;

  useEffect(() => {
    if (!moreOpen) return;
    function handleClick(e: MouseEvent) {
      if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [moreOpen]);

  return (
    <>
      <nav
        aria-label="Navigation mobile"
        className={`fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[rgba(26,26,46,0.06)] flex justify-around items-center pt-1 pb-[env(safe-area-inset-bottom)] ${className}`}
      >
        {PRIMARY.map((item) => (
          <PatientNavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            disabled={item.disabled}
            badge={item.href === "/notifications" ? unreadCount : undefined}
            variant="bottom"
          />
        ))}

        <button
          type="button"
          onClick={() => setMoreOpen((o) => !o)}
          aria-expanded={moreOpen}
          aria-haspopup="menu"
          aria-label="Plus d'options"
          className={`flex flex-col items-center gap-0.5 py-2 px-2 min-w-[60px] transition-colors ${
            moreOpen ? "text-[#5B4EC4]" : "text-[#6B7280] hover:text-[#5B4EC4]"
          }`}
        >
          <MoreHorizontal size={22} strokeWidth={moreOpen ? 2.2 : 1.8} />
          <span className={`text-[10px] ${moreOpen ? "font-bold" : "font-medium"}`}>Plus</span>
        </button>
      </nav>

      {/* Sheet "Plus" — overlay + panel bas */}
      {moreOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 animate-in fade-in duration-200"
            onClick={() => setMoreOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={sheetRef}
            role="menu"
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl border-t border-[rgba(26,26,46,0.06)] pt-2 pb-[max(env(safe-area-inset-bottom),24px)] animate-in slide-in-from-bottom duration-200"
          >
            <div className="mx-auto w-10 h-1 rounded-full bg-[#E8ECF4] mb-3" />
            <div className="flex flex-col gap-1 px-3 pb-2">
              {SECONDARY_IN_MORE_MENU.map((item) => {
                const Icon = item.icon;
                const active =
                  !item.disabled &&
                  (pathname === item.href || pathname.startsWith(item.href + "/"));

                if (item.disabled) {
                  return (
                    <div
                      key={item.href}
                      title="Bientôt disponible"
                      aria-disabled="true"
                      role="menuitem"
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#6B7280] opacity-50 cursor-not-allowed select-none pointer-events-none"
                    >
                      <Icon size={20} strokeWidth={1.8} />
                      <span className="flex-1">{item.label}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#B0B0BA]">
                        Bientôt
                      </span>
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    role="menuitem"
                    onClick={() => setMoreOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      active
                        ? "bg-[rgba(91,78,196,0.10)] text-[#5B4EC4]"
                        : "text-[#374151] hover:bg-[rgba(91,78,196,0.06)] hover:text-[#5B4EC4]"
                    }`}
                  >
                    <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
}
