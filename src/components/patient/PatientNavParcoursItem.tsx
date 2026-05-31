"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Route, ChevronDown, Loader2 } from "lucide-react";
import { PatientNavItem } from "./PatientNavItem";
import { usePatientCareCases } from "@/hooks/usePatientCareCases";

/**
 * Composant adaptatif "Mon/Mes parcours" pour la navigation patient.
 *
 * Branchements :
 * - isLoading        → ligne disabled + spinner discret (skeleton léger)
 * - 0 CareCase       → PatientNavItem disabled + tooltip "Bientôt — démarrez avec un soignant"
 * - 1 CareCase       → PatientNavItem actif, href = /parcours/[careCaseId]
 * - N>1 CareCases    → Bouton "Mes parcours" + badge count + accordéon sous-items
 *                       (chaque sous-item linkant vers /parcours/[careCaseId])
 *
 * Variant "sidebar" uniquement (l'accordéon n'est pas branché en bottom-nav
 * pour V1 ; le bottom-nav garde un lien simple vers /parcours).
 *
 * Wording strict MDR-safe : "parcours", "soignant" — aucune terminologie
 * clinique exposee par ce composant.
 */

interface PatientNavParcoursItemProps {
  variant?: "sidebar";
}

export function PatientNavParcoursItem({ variant = "sidebar" }: PatientNavParcoursItemProps) {
  const pathname = usePathname();
  const { data, isLoading } = usePatientCareCases();

  const careCases = data ?? [];
  const count = careCases.length;

  // Accordéon ouvert par défaut quand la route active est /parcours[...]
  const isOnParcoursRoute =
    pathname === "/parcours" || pathname.startsWith("/parcours/");

  // userToggled = override manuel utilisateur (null = pas encore touché → on
  // suit la route ; true/false = clic explicite qui prend le pas).
  const [userToggled, setUserToggled] = useState<boolean | null>(null);
  const open = userToggled ?? isOnParcoursRoute;
  const setOpen = (next: boolean | ((prev: boolean) => boolean)) => {
    setUserToggled((prev) => {
      const current = prev ?? isOnParcoursRoute;
      return typeof next === "function" ? next(current) : next;
    });
  };

  // Branche : loading — skeleton accessible
  if (isLoading) {
    return (
      <div
        aria-disabled="true"
        aria-busy="true"
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#6B7280] opacity-60 select-none"
      >
        <Loader2 size={18} strokeWidth={1.8} className="animate-spin" />
        <span className="flex-1">Mon parcours</span>
      </div>
    );
  }

  // Branche : 0 CareCase
  if (count === 0) {
    return (
      <PatientNavItem
        href="/parcours"
        icon={Route}
        label="Mon parcours"
        disabled
        tooltip="Bientôt — démarrez avec un soignant"
        variant={variant}
      />
    );
  }

  // Branche : 1 seul CareCase → lien direct
  if (count === 1) {
    const cc = careCases[0]!;
    return (
      <PatientNavItem
        href={`/parcours/${cc.id}`}
        icon={Route}
        label="Mon parcours"
        variant={variant}
      />
    );
  }

  // Branche : N > 1 → bouton accordéon + sous-items
  const accordionId = "patient-nav-parcours-accordion";

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={accordionId}
        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40 ${
          isOnParcoursRoute
            ? "bg-[rgba(91,78,196,0.10)] text-[#5B4EC4]"
            : "text-[#374151] hover:bg-[rgba(91,78,196,0.06)] hover:text-[#5B4EC4]"
        }`}
      >
        <Route size={18} strokeWidth={isOnParcoursRoute ? 2.2 : 1.8} />
        <span className="flex-1 text-left">Mes parcours</span>
        <span
          aria-label={`${count} parcours`}
          className="ml-auto inline-flex items-center justify-center min-w-[20px] h-[18px] px-1.5 rounded-lg bg-[#5B4EC4] text-white text-[10px] font-bold"
        >
          {count}
        </span>
        <ChevronDown
          size={16}
          strokeWidth={1.8}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div
        id={accordionId}
        role="region"
        aria-hidden={!open}
        className="overflow-hidden transition-[max-height] duration-200 ease-out"
        style={{ maxHeight: open ? `${careCases.length * 40 + 8}px` : "0px" }}
      >
        <ul className="flex flex-col gap-0.5 pt-1 pb-1">
          {careCases.map((cc) => {
            const href = `/parcours/${cc.id}`;
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <li key={cc.id}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-2 rounded-lg pl-8 pr-3 py-2 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40 ${
                    active
                      ? "bg-[rgba(91,78,196,0.10)] text-[#5B4EC4]"
                      : "text-[#6B7280] hover:bg-[rgba(91,78,196,0.06)] hover:text-[#5B4EC4]"
                  }`}
                >
                  <span className="truncate">{cc.caseTitle}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
