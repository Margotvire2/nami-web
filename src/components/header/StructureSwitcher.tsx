"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Stethoscope, Building2, Check } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { useAdminMemberships, type AdminMembership } from "@/hooks/useAdminMemberships";

const STORAGE_KEY = "nami_structure_switcher_choice";

type Choice =
  | { kind: "cockpit" }
  | { kind: "structure"; orgId: string };

function readChoice(): Choice | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.kind === "cockpit") return { kind: "cockpit" };
    if (parsed?.kind === "structure" && typeof parsed.orgId === "string") {
      return { kind: "structure", orgId: parsed.orgId };
    }
    return null;
  } catch {
    return null;
  }
}

function writeChoice(choice: Choice) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(choice));
}

// Switcher header pour les utilisateurs multi-casquette (PROVIDER ayant
// au moins une OrganizationMember avec memberRole=ADMIN). Ne s'affiche pas
// pour les profils simples (PROVIDER sans adhésion admin, ORG_ADMIN pur).
export function StructureSwitcher() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { memberships, hasAny, isLoading } = useAdminMemberships();
  const [open, setOpen] = useState(false);
  const [choice, setChoice] = useState<Choice>({ kind: "cockpit" });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = readChoice();
    if (stored) setChoice(stored);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  // Pas de switcher si : pas connecté, pas de provider profile, ou aucune
  // adhésion admin. Reste invisible pendant le loading initial pour éviter
  // le flash.
  if (!user || !user.providerProfile || isLoading || !hasAny) return null;

  function selectCockpit() {
    const next: Choice = { kind: "cockpit" };
    setChoice(next);
    writeChoice(next);
    setOpen(false);
    router.push("/aujourd-hui");
  }

  function selectStructure(m: AdminMembership) {
    const next: Choice = { kind: "structure", orgId: m.id };
    setChoice(next);
    writeChoice(next);
    setOpen(false);
    router.push(`/structure/${m.id}/admin`);
  }

  const currentLabel =
    choice.kind === "cockpit"
      ? "Cockpit soignant"
      : memberships.find((m) => m.id === choice.orgId)?.name ?? "Console d'animation";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E8ECF4] text-[#374151] text-xs font-medium hover:border-[#5B4EC4] hover:text-[#5B4EC4] transition-colors shrink-0"
        style={{ fontFamily: "var(--font-jakarta)" }}
      >
        {choice.kind === "cockpit" ? (
          <Stethoscope size={14} className="shrink-0" />
        ) : (
          <Building2 size={14} className="shrink-0" />
        )}
        <span className="truncate max-w-[180px]">{currentLabel}</span>
        <ChevronDown size={12} className="shrink-0 opacity-60" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1.5 w-[280px] rounded-xl border border-[#E8ECF4] bg-white shadow-lg z-50 py-1.5"
        >
          <button
            role="menuitem"
            type="button"
            onClick={selectCockpit}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-[#F8F9FA] text-left"
          >
            <Stethoscope size={15} className="shrink-0 text-[#5B4EC4]" />
            <span className="flex-1 truncate" style={{ fontFamily: "var(--font-jakarta)" }}>
              Cockpit soignant
            </span>
            {choice.kind === "cockpit" && <Check size={14} className="text-[#5B4EC4]" />}
          </button>

          <div className="my-1 border-t border-[#F1F5F9]" />
          <p className="px-3 py-1 text-[10px] uppercase tracking-wider text-[#94A3B8] font-semibold">
            Console d&apos;animation
          </p>

          {memberships.map((m) => {
            const isActive = choice.kind === "structure" && choice.orgId === m.id;
            return (
              <button
                key={m.id}
                role="menuitem"
                type="button"
                onClick={() => selectStructure(m)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-[#F8F9FA] text-left"
              >
                <Building2 size={15} className="shrink-0 text-[#2BA89C]" />
                <span className="flex-1 truncate" style={{ fontFamily: "var(--font-jakarta)" }}>
                  {m.name}
                </span>
                {isActive && <Check size={14} className="text-[#5B4EC4]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
