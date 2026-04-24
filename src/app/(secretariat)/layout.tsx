"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  Users,
  Armchair,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/secretariat",              label: "Agenda",          icon: CalendarDays },
  { href: "/secretariat/patients",     label: "Patients",        icon: Users },
  { href: "/secretariat/salle-attente", label: "Salle d'attente", icon: Armchair },
  { href: "/secretariat/parametres",   label: "Paramètres",      icon: Settings },
];

function SecretarySidebar() {
  const pathname = usePathname();
  const { logout: clearAuth, user } = useAuthStore();
  const router = useRouter();

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "S";

  return (
    <aside className="flex flex-col w-56 shrink-0 h-screen bg-white border-r border-[#E8ECF4] fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-[#E8ECF4]">
        <div className="w-7 h-7 rounded-lg bg-[#5B4EC4] flex items-center justify-center">
          <span className="text-white text-xs font-bold">N</span>
        </div>
        <div>
          <p className="text-[11px] font-bold text-[#1A1A2E] leading-none">Nami</p>
          <p className="text-[9px] text-[#6B7280] leading-none mt-0.5">Secrétariat</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/secretariat"
              ? pathname === "/secretariat"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium transition-colors",
                isActive
                  ? "bg-[#EEEDFB] text-[#5B4EC4]"
                  : "text-[#374151] hover:bg-[#F5F3EF] hover:text-[#1A1A2E]"
              )}
            >
              <Icon size={15} className={isActive ? "text-[#5B4EC4]" : "text-[#6B7280]"} />
              {label}
              {isActive && <ChevronRight size={12} className="ml-auto text-[#5B4EC4]" />}
            </Link>
          );
        })}
      </nav>

      {/* Profil + déconnexion */}
      <div className="px-3 py-3 border-t border-[#E8ECF4]">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg mb-1">
          <div className="w-7 h-7 rounded-full bg-[#EEEDFB] flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-[#5B4EC4]">{initials}</span>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-[#1A1A2E] truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[9px] text-[#6B7280] truncate">Secrétaire médicale</p>
          </div>
        </div>
        <button
          onClick={() => { clearAuth(); router.replace("/login"); }}
          className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-[11px] text-[#6B7280] hover:text-[#DC2626] hover:bg-red-50 transition-colors"
        >
          <LogOut size={13} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}

export default function SecretariatLayout({ children }: { children: React.ReactNode }) {
  const { accessToken, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!accessToken) {
      router.replace("/login");
      return;
    }
    if (user && user.roleType !== "SECRETARY" && user.roleType !== "ADMIN") {
      router.replace("/aujourd-hui");
    }
  }, [accessToken, user, router]);

  if (!accessToken) return null;

  return (
    <div className="flex min-h-screen bg-[#FAFAF8]">
      <SecretarySidebar />
      <main className="flex-1 ml-56 min-h-screen">
        {children}
      </main>
    </div>
  );
}
