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
} from "lucide-react";

const NAV = [
  { href: "/aujourd-hui", label: "Aujourd'hui", icon: LayoutDashboard },
  { href: "/patients",    label: "Patients",     icon: Users },
  { href: "/adressages",  label: "Adressages",   icon: ArrowLeftRight },
  { href: "/messages",    label: "Messages",     icon: MessageSquare },
  { href: "/documents",   label: "Documents",    icon: FileText },
  { href: "/agenda",      label: "Agenda",       icon: CalendarDays },
  { href: "/alertes",     label: "Alertes",      icon: Bell },
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
    <aside className="w-[220px] shrink-0 border-r bg-card flex flex-col h-full">
      {/* ── Logo ── */}
      <div className="px-5 h-16 flex items-center border-b">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-[var(--shadow-sm)]">
            <span className="text-primary-foreground text-[13px] font-bold tracking-tight">N</span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-[15px] tracking-tight leading-none text-foreground">Nami</span>
            <span className="text-micro text-muted-foreground leading-tight mt-0.5">Cockpit clinique</span>
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 pt-4 pb-2 space-y-0.5 overflow-y-auto">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 h-9 rounded-lg text-[13px] transition-all duration-150",
                active
                  ? "bg-primary text-primary-foreground font-medium shadow-[var(--shadow-xs)]"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon size={16} strokeWidth={active ? 2 : 1.75} className="shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── User ── */}
      <div className="px-3 py-3 border-t">
        <div className="flex items-center gap-2.5 px-2">
          <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium truncate leading-tight">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-micro text-muted-foreground truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0 p-1.5 -mr-1 rounded-md hover:bg-accent"
            title="Se déconnecter"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
