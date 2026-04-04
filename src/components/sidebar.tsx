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
    <aside className="w-16 shrink-0 bg-card flex flex-col items-center h-full py-4 shadow-[var(--shadow-sm)] z-10">
      {/* Logo */}
      <div className="mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-[var(--shadow-md)]">
          <span className="text-primary-foreground text-sm font-bold tracking-tight">N</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col items-center gap-1">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150",
                active
                  ? "bg-primary text-primary-foreground shadow-[var(--shadow-sm)]"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon size={20} strokeWidth={active ? 2 : 1.5} />
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="flex flex-col items-center gap-2 mt-4">
        <button
          onClick={handleLogout}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-150"
          title="Se déconnecter"
        >
          <LogOut size={18} strokeWidth={1.5} />
        </button>
        <div
          className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-xs font-bold text-primary cursor-default"
          title={`${user?.firstName} ${user?.lastName}`}
        >
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
      </div>
    </aside>
  );
}
