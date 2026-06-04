"use client";

/**
 * F-COCKPIT-PATIENT-360-REFONTE — PatientSidebar
 *
 * Sidebar gauche de la vue 360° patient.
 * - Active tab : indigo (#4F46E5) avec barre verticale gauche
 * - Indicateur animé framer-motion (layoutId)
 * - Fallback reduced-motion → pas d'animation
 * - URL state via ?tab=… (scroll: false)
 */

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface PatientSidebarTab {
  key: string;
  label: string;
  icon: React.ReactNode;
}

export interface PatientSidebarProps {
  activeTab: string;
  tabs: PatientSidebarTab[];
  counts?: Record<string, number>;
  className?: string;
}

export function PatientSidebar({
  activeTab,
  tabs,
  counts,
  className,
}: PatientSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefersReducedMotion = useReducedMotion();

  const handleTabClick = useCallback(
    (key: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", key);
      const query = params.toString();
      router.replace(`?${query}`, { scroll: false });
    },
    [router, searchParams],
  );

  return (
    <nav
      aria-label="Vue 360 patient"
      className={cn(
        "w-56 shrink-0 border-r border-[#E8ECF4] bg-white py-3 sticky top-0 self-start",
        className,
      )}
      data-testid="patient-sidebar"
    >
      <ul className="flex flex-col gap-0.5 px-2">
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;
          const count = counts?.[tab.key] ?? 0;

          return (
            <li key={tab.key}>
              <button
                type="button"
                onClick={() => handleTabClick(tab.key)}
                aria-current={isActive ? "page" : undefined}
                data-active={isActive ? "true" : "false"}
                data-testid={`patient-sidebar-tab-${tab.key}`}
                className={cn(
                  "relative w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
                  isActive
                    ? "text-[#4F46E5] bg-[#EEF0FB]"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                )}
              >
                {isActive && !prefersReducedMotion ? (
                  <motion.span
                    layoutId="patient-sidebar-active-indicator"
                    aria-hidden="true"
                    data-testid="patient-sidebar-active-indicator"
                    className="absolute left-0 top-1 bottom-1 w-1 rounded-r-full bg-[#4F46E5]"
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 38,
                    }}
                  />
                ) : isActive ? (
                  <span
                    aria-hidden="true"
                    data-testid="patient-sidebar-active-indicator-static"
                    className="absolute left-0 top-1 bottom-1 w-1 rounded-r-full bg-[#4F46E5]"
                  />
                ) : null}

                <span
                  className={cn(
                    "shrink-0",
                    isActive ? "text-[#4F46E5]" : "text-gray-400",
                  )}
                  aria-hidden="true"
                >
                  {tab.icon}
                </span>
                <span className="flex-1 truncate">{tab.label}</span>
                {count > 0 && (
                  <span
                    data-testid={`patient-sidebar-count-${tab.key}`}
                    className={cn(
                      "ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold",
                      isActive
                        ? "bg-[#4F46E5] text-white"
                        : "bg-[#E8ECF4] text-[#475569]",
                    )}
                  >
                    {count > 99 ? "99+" : count}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
