"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";

interface PatientNavItemProps {
  href: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  label: string;
  disabled?: boolean;
  tooltip?: string;
  variant?: "sidebar" | "bottom";
  /**
   * Badge numérique optionnel (ex : compteur de notifications non lues).
   * Affiché seulement si > 0. Cap visuel à 9+ pour la lisibilité.
   * Le aria-label de l'item enrichi automatiquement avec le count.
   */
  badge?: number;
}

export function PatientNavItem({
  href,
  icon: Icon,
  label,
  disabled = false,
  tooltip,
  variant = "sidebar",
  badge,
}: PatientNavItemProps) {
  const pathname = usePathname();
  const active = !disabled && (pathname === href || pathname.startsWith(href + "/"));

  if (variant === "bottom") {
    return (
      <BottomItem
        href={href}
        Icon={Icon}
        label={label}
        active={active}
        disabled={disabled}
        tooltip={tooltip}
        badge={badge}
      />
    );
  }

  return (
    <SidebarItem
      href={href}
      Icon={Icon}
      label={label}
      active={active}
      disabled={disabled}
      tooltip={tooltip}
      badge={badge}
    />
  );
}

type ItemInternalProps = {
  href: string;
  Icon: PatientNavItemProps["icon"];
  label: string;
  active: boolean;
  disabled: boolean;
  tooltip?: string;
  badge?: number;
};

function formatBadge(n: number): string {
  return n > 9 ? "9+" : String(n);
}

function buildAriaLabel(label: string, badge: number | undefined, active: boolean): string | undefined {
  if (!badge || badge <= 0) return undefined;
  const suffix = badge === 1 ? "1 non lue" : `${badge} non lues`;
  const base = `${label}, ${suffix}`;
  return active ? `${base}, page actuelle` : base;
}

function SidebarItem({ href, Icon, label, active, disabled, tooltip, badge }: ItemInternalProps) {
  const base =
    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40";

  if (disabled) {
    return (
      <div
        title={tooltip ?? "Bientôt disponible"}
        aria-disabled="true"
        className={`${base} cursor-not-allowed opacity-50 text-[#6B7280] select-none pointer-events-none`}
      >
        <Icon size={18} strokeWidth={1.8} />
        <span className="flex-1">{label}</span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#B0B0BA]">
          Bientôt
        </span>
      </div>
    );
  }

  const hasBadge = !!badge && badge > 0;

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      aria-label={buildAriaLabel(label, badge, active)}
      className={`${base} ${
        active
          ? "bg-[rgba(91,78,196,0.10)] text-[#5B4EC4]"
          : "text-[#374151] hover:bg-[rgba(91,78,196,0.06)] hover:text-[#5B4EC4]"
      }`}
    >
      <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
      <span className="flex-1">{label}</span>
      {hasBadge && (
        <span
          aria-hidden="true"
          className="min-w-[20px] h-5 px-1.5 rounded-full bg-[#DC2626] text-white text-[10px] font-bold flex items-center justify-center"
        >
          {formatBadge(badge!)}
        </span>
      )}
    </Link>
  );
}

function BottomItem({ href, Icon, label, active, disabled, tooltip, badge }: ItemInternalProps) {
  const base = "relative flex flex-col items-center gap-0.5 py-2 px-2 min-w-[60px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40 rounded-lg";

  if (disabled) {
    return (
      <div
        title={tooltip ?? "Bientôt disponible"}
        aria-disabled="true"
        className={`${base} cursor-not-allowed opacity-50 text-[#6B7280] select-none pointer-events-none`}
      >
        <Icon size={22} strokeWidth={1.8} />
        <span className="text-[10px] font-medium">{label}</span>
      </div>
    );
  }

  const hasBadge = !!badge && badge > 0;

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      aria-label={buildAriaLabel(label, badge, active)}
      className={`${base} ${active ? "text-[#5B4EC4]" : "text-[#6B7280] hover:text-[#5B4EC4]"}`}
    >
      <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
      <span className={`text-[10px] ${active ? "font-bold" : "font-medium"}`}>{label}</span>
      {hasBadge && (
        <span
          aria-hidden="true"
          className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#DC2626] text-white text-[9px] font-bold flex items-center justify-center"
        >
          {formatBadge(badge!)}
        </span>
      )}
    </Link>
  );
}
