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
}

export function PatientNavItem({
  href,
  icon: Icon,
  label,
  disabled = false,
  tooltip,
  variant = "sidebar",
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
};

function SidebarItem({ href, Icon, label, active, disabled, tooltip }: ItemInternalProps) {
  const base =
    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200";

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

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`${base} ${
        active
          ? "bg-[rgba(91,78,196,0.10)] text-[#5B4EC4]"
          : "text-[#374151] hover:bg-[rgba(91,78,196,0.06)] hover:text-[#5B4EC4]"
      }`}
    >
      <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
      <span>{label}</span>
    </Link>
  );
}

function BottomItem({ href, Icon, label, active, disabled, tooltip }: ItemInternalProps) {
  const base = "flex flex-col items-center gap-0.5 py-2 px-2 min-w-[60px] transition-colors";

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

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`${base} ${active ? "text-[#5B4EC4]" : "text-[#6B7280] hover:text-[#5B4EC4]"}`}
    >
      <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
      <span className={`text-[10px] ${active ? "font-bold" : "font-medium"}`}>{label}</span>
    </Link>
  );
}
