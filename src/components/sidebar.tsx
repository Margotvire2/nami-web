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
  Bell,
  LogOut,
  ChevronRight,
} from "lucide-react";

const NAV_MAIN = [
  { href: "/aujourd-hui", label: "Aujourd'hui", icon: LayoutDashboard },
  { href: "/patients",    label: "Patients",     icon: Users },
  { href: "/agenda",      label: "Agenda",       icon: CalendarDays },
  { href: "/adressages",  label: "Adressages",   icon: ArrowLeftRight },
];

const NAV_TOOLS = [
  { href: "/messages",     label: "Messages",    icon: MessageSquare },
  { href: "/messages-pro", label: "Communauté",  icon: Users },
  { href: "/documents",    label: "Documents",   icon: FileText },
  { href: "/alertes",      label: "Alertes",     icon: Bell },
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
    <aside className="w-[200px] shrink-0 bg-white flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 h-[60px] flex items-center gap-2.5 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-[#4F6AF5] flex items-center justify-center">
          <span className="text-white text-xs font-extrabold">N</span>
        </div>
        <span className="text-[15px] font-bold text-[#1E293B] tracking-tight" style={{ fontFamily: "var(--font-bricolage), system-ui" }}>Nami</span>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 pt-2 overflow-y-auto">
        <div className="space-y-0.5">
          {NAV_MAIN.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-3 h-9 rounded-lg text-[13px] transition-all duration-150 group",
                  active
                    ? "bg-[#4F6AF5] text-white font-semibold"
                    : "text-[#64748B] hover:bg-[#F0F2F8] hover:text-[#1E293B]"
                )}
              >
                <Icon size={16} strokeWidth={active ? 2.25 : 1.75} className="shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Separator */}
        <div className="my-3 mx-2 h-px bg-[#E2E8F0]" />

        <div className="space-y-0.5">
          {NAV_TOOLS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-3 h-9 rounded-lg text-[13px] transition-all duration-150",
                  active
                    ? "bg-[#4F6AF5] text-white font-semibold"
                    : "text-[#64748B] hover:bg-[#F0F2F8] hover:text-[#1E293B]"
                )}
              >
                <Icon size={16} strokeWidth={active ? 2.25 : 1.75} className="shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User */}
      <div className="px-3 py-3 shrink-0">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-[#F0F2F8] transition-colors group cursor-pointer" onClick={handleLogout} title="Se déconnecter">
          <div className="w-8 h-8 rounded-lg bg-[#EEF1FF] flex items-center justify-center text-[11px] font-bold text-[#4F6AF5] shrink-0">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-[#1E293B] truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-[10px] text-[#94A3B8] truncate">{user?.email}</p>
          </div>
          <LogOut size={14} className="text-[#94A3B8] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </aside>
  );
}
