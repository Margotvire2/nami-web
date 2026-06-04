"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LifeBuoy, LogOut, User as UserIcon } from "lucide-react";
import { useAuthStore } from "@/lib/store";

interface PatientAvatarMenuProps {
  firstName: string;
  lastName: string;
}

const MENU_ID = "patient-avatar-menu-panel";

export function PatientAvatarMenu({ firstName, lastName }: PatientAvatarMenuProps) {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  // F-PATIENT-AVATAR-MENU-AUDIT-POLISH — focus initial 1er menuitem à l'ouverture
  const firstItemRef = useRef<HTMLAnchorElement>(null);

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

  // F-PATIENT-AVATAR-MENU-AUDIT-POLISH — fermer au Échap (a11y clavier)
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  // Focus 1er menuitem à l'ouverture (a11y clavier)
  useEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => firstItemRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
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
        aria-controls={MENU_ID}
        aria-label="Menu utilisateur"
        className="flex items-center gap-2 rounded-full p-1 pr-2 hover:bg-[rgba(91,78,196,0.08)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40 focus-visible:ring-offset-1"
      >
        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-[#5B4EC4] to-[#2BA89C] text-white text-sm font-bold" aria-hidden="true">
          {initials}
        </div>
        <ChevronDown
          size={16}
          className={`text-[#6B7280] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          id={MENU_ID}
          role="menu"
          aria-label={`Menu de ${firstName}`}
          className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-white border border-[rgba(26,26,46,0.06)] shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-200"
        >
          <div className="px-4 py-2 border-b border-[rgba(26,26,46,0.06)] mb-1">
            <p className="text-xs text-[#6B7280]">Connecté en tant que</p>
            <p className="text-sm font-bold text-[#1A1A2E] truncate">
              {firstName} {lastName}
            </p>
          </div>

          <Link
            ref={firstItemRef}
            href="/mon-compte"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#374151] hover:bg-[rgba(91,78,196,0.06)] hover:text-[#5B4EC4] transition-colors focus-visible:outline-none focus-visible:bg-[rgba(91,78,196,0.08)] focus-visible:text-[#5B4EC4]"
          >
            <UserIcon size={16} strokeWidth={1.8} aria-hidden="true" />
            Mon compte
          </Link>

          <Link
            href="/contact"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#374151] hover:bg-[rgba(91,78,196,0.06)] hover:text-[#5B4EC4] transition-colors focus-visible:outline-none focus-visible:bg-[rgba(91,78,196,0.08)] focus-visible:text-[#5B4EC4]"
          >
            <LifeBuoy size={16} strokeWidth={1.8} aria-hidden="true" />
            Aide &amp; contact
          </Link>

          <div className="border-t border-[rgba(26,26,46,0.06)] my-1" role="separator" />

          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-[#374151] hover:bg-[rgba(217,79,79,0.08)] hover:text-[#D94F4F] transition-colors focus-visible:outline-none focus-visible:bg-[rgba(217,79,79,0.08)] focus-visible:text-[#D94F4F]"
          >
            <LogOut size={16} strokeWidth={1.8} aria-hidden="true" />
            Se déconnecter
          </button>
        </div>
      )}
    </div>
  );
}
