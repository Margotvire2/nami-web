"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, User as UserIcon } from "lucide-react";
import { useAuthStore } from "@/lib/store";

interface PatientAvatarMenuProps {
  firstName: string;
  lastName: string;
}

export function PatientAvatarMenu({ firstName, lastName }: PatientAvatarMenuProps) {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  const initials = `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Menu utilisateur"
        className="flex items-center gap-2 rounded-full p-1 pr-2 hover:bg-[rgba(91,78,196,0.08)] transition-colors"
      >
        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-[#5B4EC4] to-[#2BA89C] text-white text-sm font-bold">
          {initials}
        </div>
        <ChevronDown
          size={16}
          className={`text-[#6B7280] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-white border border-[rgba(26,26,46,0.06)] shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-200"
        >
          <div className="px-4 py-2 border-b border-[rgba(26,26,46,0.06)] mb-1">
            <p className="text-xs text-[#6B7280]">Connecté en tant que</p>
            <p className="text-sm font-bold text-[#1A1A2E] truncate">
              {firstName} {lastName}
            </p>
          </div>

          <Link
            href="/mon-compte"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#374151] hover:bg-[rgba(91,78,196,0.06)] hover:text-[#5B4EC4] transition-colors"
          >
            <UserIcon size={16} strokeWidth={1.8} />
            Mon compte
          </Link>

          <div className="border-t border-[rgba(26,26,46,0.06)] my-1" />

          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-[#374151] hover:bg-[rgba(217,79,79,0.08)] hover:text-[#D94F4F] transition-colors"
          >
            <LogOut size={16} strokeWidth={1.8} />
            Se déconnecter
          </button>
        </div>
      )}
    </div>
  );
}
