"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { authApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  MessageSquare,
  FileText,
  CalendarDays,
  BellDot,
  LogOut,
  UsersRound,
} from "lucide-react";

/*
  Icônes uniques — aucune duplication :
  LayoutDashboard = grille (dashboard)
  Users           = silhouettes (patients)
  CalendarDays    = calendrier + chiffres (agenda)
  ArrowLeftRight  = double flèche (adressages)
  MessageSquare   = bulle carrée (messages patient)
  UsersRound      = groupe arrondi (communauté)
  FileText        = document (documents)
  BellDot         = cloche + point (alertes)
*/

const NAV_MAIN = [
  { href: "/aujourd-hui", label: "Aujourd'hui", icon: LayoutDashboard },
  { href: "/patients",    label: "Patients",     icon: Users },
  { href: "/agenda",      label: "Agenda",       icon: CalendarDays },
  { href: "/adressages",  label: "Adressages",   icon: ArrowLeftRight },
];

const NAV_TOOLS = [
  { href: "/messages",     label: "Messages",    icon: MessageSquare },
  { href: "/messages-pro", label: "Communauté",  icon: UsersRound },
  { href: "/documents",    label: "Documents",   icon: FileText },
  { href: "/alertes",      label: "Alertes",     icon: BellDot },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, refreshToken, logout } = useAuthStore();

  async function handleLogout() {
    if (refreshToken) {
      await authApi.logout(refreshToken).catch(() => {});
    }
    logout();
    router.push("/login");
    toast.success("Déconnecté");
  }

  function isActive(href: string) {
    if (href === "/aujourd-hui") return pathname === "/aujourd-hui" || pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <aside className="w-[220px] shrink-0 bg-white border-r border-[#E8ECF4] flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 h-[56px] flex items-center gap-2.5 shrink-0">
        <div className="w-8 h-8 rounded-[10px] bg-[#4F46E5] flex items-center justify-center">
          <span className="text-white text-xs font-extrabold">N</span>
        </div>
        <span className="text-[15px] font-bold text-[#0F172A] tracking-tight" style={{ fontFamily: "var(--font-jakarta)" }}>Nami</span>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 pt-3 overflow-y-auto">
        <div className="space-y-0.5">
          {NAV_MAIN.map((item) => <NavItem key={item.href} item={item} active={isActive(item.href)} />)}
        </div>

        <div className="my-3 mx-2 h-px bg-[#F1F5F9]" />

        <div className="space-y-0.5">
          {NAV_TOOLS.map((item) => <NavItem key={item.href} item={item} active={isActive(item.href)} />)}
        </div>
      </nav>

      {/* User */}
      <div className="px-3 py-3 shrink-0 border-t border-[#F1F5F9]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 w-full px-2 py-2 rounded-[10px] hover:bg-[#F0F2FA] transition-all duration-150 group text-left"
          title="Se déconnecter"
        >
          <div className="w-8 h-8 rounded-[10px] flex items-center justify-center text-[11px] font-bold text-white shrink-0" style={{ background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)" }}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-[#0F172A] truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-[10px] text-[#94A3B8] truncate">{user?.email}</p>
          </div>
          <LogOut size={14} className="text-[#94A3B8] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
    </aside>
  );
}

function NavItem({ item, active }: { item: { href: string; label: string; icon: typeof LayoutDashboard }; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      title={item.label}
      className={cn(
        "flex items-center gap-2.5 px-3 h-9 rounded-[10px] text-[13px] transition-all duration-150",
        active
          ? "bg-[#EEF2FF] text-[#4F46E5] font-semibold border-l-[3px] border-[#4F46E5] pl-[9px]"
          : "text-[#64748B] hover:bg-[#EEF2FF] hover:text-[#4F46E5]"
      )}
      style={{ fontFamily: "var(--font-jakarta)" }}
    >
      <Icon size={16} strokeWidth={1.75} className="shrink-0" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}
