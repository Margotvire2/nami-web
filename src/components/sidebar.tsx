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

const NAV = [
  { href: "/aujourd-hui", label: "Aujourd'hui", icon: LayoutDashboard },
  { href: "/patients",    label: "Patients",     icon: Users },
  { href: "/adressages",  label: "Adressages",   icon: ArrowLeftRight },
  { href: "/messages",    label: "Messages",     icon: MessageSquare },
  { href: "/documents",   label: "Documents",    icon: FileText },
  { href: "/agenda",      label: "Agenda",       icon: CalendarDays },
  { href: "/alertes",     label: "Alertes",      icon: Bell },
];

const NAV_BOTTOM: { href: string; label: string; icon: typeof LayoutDashboard }[] = [
  // Masqués pour V1 — pages non implémentées
  // { href: "/organisation", label: "Organisation", icon: Building2 },
  // { href: "/parametres",   label: "Paramètres",   icon: Settings },
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
    <aside className="w-56 shrink-0 border-r bg-card flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-xs font-bold">N</span>
          </div>
          <span className="font-semibold text-base tracking-tight">Nami</span>
          <span className="ml-auto text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            Cockpit
          </span>
        </div>
      </div>

      {/* Nav principale */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors group",
                active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon
                size={16}
                className={cn(
                  "shrink-0 transition-colors",
                  active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {item.label}
              {active && (
                <ChevronRight size={12} className="ml-auto text-primary/50" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Nav secondaire */}
      <div className="px-2 py-2 border-t space-y-0.5">
        {NAV_BOTTOM.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors group",
                active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon size={16} className="shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* User */}
      <div className="px-4 py-4 border-t">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
            title="Se déconnecter"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
