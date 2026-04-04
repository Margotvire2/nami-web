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
    <aside className="w-56 shrink-0 border-r border-border/60 bg-sidebar flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-sm">
            <span className="text-primary-foreground text-xs font-bold tracking-tight">N</span>
          </div>
          <span className="font-semibold text-[15px] tracking-tight text-foreground">Nami</span>
          <span className="ml-auto text-[10px] text-muted-foreground bg-accent px-1.5 py-0.5 rounded-md font-medium">
            Cockpit
          </span>
        </div>
      </div>

      {/* Nav principale */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-all group",
                active
                  ? "bg-primary text-primary-foreground font-medium shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <div className={cn(
                "w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-colors",
                active
                  ? "bg-primary-foreground/15"
                  : "bg-transparent group-hover:bg-muted/50"
              )}>
                <Icon size={15} className="shrink-0" />
              </div>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate text-foreground">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0 p-1 rounded-md hover:bg-accent"
            title="Se déconnecter"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
