"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { GlassSurface } from "@/components/ui/glass-surface";
import { computeAge } from "@/lib/age";
import type { SwitchableProfile } from "@/lib/api";

interface ProfileSwitcherProps {
  profiles: SwitchableProfile[];
  currentPersonId: string;
  onSwitch: (personId: string) => void;
}

/**
 * Switcher de profil patient — affiche l'avatar + nom du profil actif (self ou
 * enfant via délégation), avec menu déroulant pour basculer.
 *
 * Rend `null` si un seul profil disponible (pas de délégation active).
 */
export function ProfileSwitcher({ profiles, currentPersonId, onSwitch }: ProfileSwitcherProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fermer le menu au clic en dehors
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

  if (profiles.length <= 1) return null;

  const current = profiles.find((p) => p.personId === currentPersonId);
  if (!current) return null;

  const others = profiles.filter((p) => p.personId !== currentPersonId);

  return (
    <div ref={containerRef}>
      <GlassSurface variant="medium" className="rounded-2xl p-3">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-haspopup="listbox"
          className="flex items-center gap-3 w-full text-left"
        >
          <Avatar firstName={current.firstName} lastName={current.lastName} />
          <div className="flex-1">
            <p className="text-[11px] font-extrabold tracking-[0.1em] uppercase text-[var(--nami-primary)]">
              {current.isSelf ? "Vous" : `Au nom de ${current.firstName}`}
            </p>
            <p className="font-bold text-[var(--nami-dark)]">
              {current.firstName} {current.lastName}
            </p>
            {!current.isSelf && current.birthDate && (
              <p className="text-xs text-[var(--nami-text-muted)]">
                {computeAge(current.birthDate)} ans
              </p>
            )}
          </div>
          <ChevronDown
            size={18}
            className={`text-[var(--nami-text-muted)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {open && (
          <ul
            role="listbox"
            className="mt-2 space-y-1 animate-in fade-in slide-in-from-top-1 duration-200"
          >
            {others.map((p) => (
              <li key={p.personId}>
                <button
                  type="button"
                  onClick={() => {
                    onSwitch(p.personId);
                    setOpen(false);
                  }}
                  className="
                    flex items-center gap-3 w-full p-2 rounded-xl
                    hover:bg-white/40 transition-colors duration-200
                    text-left
                  "
                >
                  <Avatar firstName={p.firstName} lastName={p.lastName} />
                  <div>
                    <p className="font-medium text-[var(--nami-dark)]">
                      {p.firstName} {p.lastName}
                    </p>
                    {!p.isSelf && p.birthDate && (
                      <p className="text-xs text-[var(--nami-text-muted)]">
                        {computeAge(p.birthDate)} ans
                      </p>
                    )}
                    {p.isSelf && (
                      <p className="text-xs text-[var(--nami-text-muted)]">Vous-même</p>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </GlassSurface>
    </div>
  );
}

/**
 * Avatar minimal (initiales) — pas d'image puisque l'API ne retourne pas photoUrl
 * sur SwitchableProfile (out of scope V1, à enrichir si besoin design).
 */
function Avatar({ firstName, lastName }: { firstName: string; lastName: string }) {
  const initials = `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
  return (
    <div
      className="
        w-10 h-10 rounded-full shrink-0
        bg-gradient-to-br from-[var(--nami-primary)] to-[var(--nami-teal)]
        flex items-center justify-center
        text-white font-bold text-sm
      "
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}
