"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { Settings } from "lucide-react";
import { NotificationCenter } from "@/components/NotificationCenter";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

/*
  Sidebar Nami 2.0 — 3 blocs mentaux :
  1. Mon activité (dashboard + agenda)
  2. Mes patients (patients + alertes + documents)
  3. Mon réseau (adressages + collaboration + équipe)
*/

const NAV_ACTIVITY = [
  { href: "/aujourd-hui",  label: "Aujourd'hui",       emoji: "🏠" },
  { href: "/agenda",       label: "Agenda",             emoji: "📅" },
  { href: "/facturation",  label: "Facturation",        emoji: "💳" },
];

const NAV_PATIENTS = [
  { href: "/patients",     label: "Patients",           emoji: "👥" },
  { href: "/alertes",      label: "Rappels",            emoji: "🔔" },
  { href: "/taches",       label: "Tâches",             emoji: "✅" },
  { href: "/protocoles",   label: "Références",         emoji: "📋" },
  { href: "/intelligence", label: "Base documentaire",  emoji: "🔬" },
  { href: "/documents",    label: "Documents",          emoji: "📄" },
];

const NAV_NETWORK = [
  { href: "/messages",      label: "Messages",      emoji: "💬" },
  { href: "/adressages",    label: "Adressages",    emoji: "↔️" },
  { href: "/reseau",        label: "Vue réseau",    emoji: "🌐" },
  { href: "/collaboration", label: "Collaboration", emoji: "📡" },
  { href: "/equipe",        label: "Équipe",        emoji: "👤" },
  { href: "/annuaire",      label: "Annuaire",      emoji: "📖" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, accessToken } = useAuthStore();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (user?.roleType !== "ADMIN" || !accessToken) return;
    fetch(`${API_URL}/admin/pending-count`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((r) => r.json())
      .then((d: { count: number }) => setPendingCount(d.count ?? 0))
      .catch(() => {});
  }, [user, accessToken]);

  function isActive(href: string) {
    if (href === "/aujourd-hui") return pathname === "/aujourd-hui" || pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <aside className="w-[220px] shrink-0 bg-white border-r border-[#E8ECF4] flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 h-[56px] flex items-center gap-2.5 shrink-0">
        <div className="w-8 h-8 rounded-[10px] flex items-center justify-center text-[15px] font-black text-white shrink-0" style={{ background: "linear-gradient(135deg, #5B4EC4 0%, #2BA89C 100%)" }}>
          N
        </div>
        <span className="text-[15px] font-bold text-[#0F172A] tracking-tight flex-1" style={{ fontFamily: "var(--font-jakarta)" }}>Nami</span>
        <NotificationCenter />
      </div>

      {/* Navigation — 3 blocs */}
      <nav className="flex-1 px-3 pt-3 overflow-y-auto">
        <NavGroup items={NAV_ACTIVITY} isActive={isActive} />
        <div className="my-3 mx-2 h-px bg-[#F1F5F9]" />
        <NavGroup items={NAV_PATIENTS} isActive={isActive} />
        <div className="my-3 mx-2 h-px bg-[#F1F5F9]" />
        <NavGroup items={NAV_NETWORK} isActive={isActive} />

        {/* Administration — ADMIN uniquement */}
        {user?.roleType === "ADMIN" && (
          <>
            <div className="my-3 mx-2 h-px bg-[#F1F5F9]" />
            <Link
              href="/admin"
              className="flex items-center gap-2.5 h-9 rounded-[10px] text-[13px] transition-all duration-150"
              style={{
                fontFamily: "var(--font-jakarta)",
                paddingLeft: "12px",
                paddingRight: "12px",
                fontWeight: pathname.startsWith("/admin") ? 600 : 400,
                color: pathname.startsWith("/admin") ? "#5B4EC4" : "#64748B",
                background: pathname.startsWith("/admin") ? "rgba(91,78,196,0.08)" : "transparent",
                textDecoration: "none",
              }}
              onMouseEnter={e => {
                if (!pathname.startsWith("/admin")) {
                  (e.currentTarget as HTMLAnchorElement).style.background = "rgba(91,78,196,0.06)";
                  (e.currentTarget as HTMLAnchorElement).style.color = "#5B4EC4";
                }
              }}
              onMouseLeave={e => {
                if (!pathname.startsWith("/admin")) {
                  (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  (e.currentTarget as HTMLAnchorElement).style.color = "#64748B";
                }
              }}
            >
              <span style={{ fontSize: 15, opacity: pathname.startsWith("/admin") ? 1 : 0.5, lineHeight: 1 }}>🛡️</span>
              <span className="truncate flex-1">Administration</span>
              {pendingCount > 0 && (
                <span
                  style={{
                    minWidth: 18,
                    height: 18,
                    padding: "0 5px",
                    fontSize: 10,
                    fontWeight: 700,
                    background: "#D94F4F",
                    color: "#fff",
                    borderRadius: 9,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    animation: "pulse-badge 0.6s ease-out",
                  }}
                >
                  {pendingCount}
                </span>
              )}
            </Link>
          </>
        )}
        <style>{`@keyframes pulse-badge { 0%{transform:scale(1)} 50%{transform:scale(1.3)} 100%{transform:scale(1)} }`}</style>
      </nav>

      {/* Legal footer */}
      <div className="px-4 py-2 shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/cgu" target="_blank" className="text-[10px] text-[#94A3B8] hover:text-[#5B4EC4] transition-colors">CGU</Link>
          <span className="text-[#E2E8F0] text-[10px]">·</span>
          <Link href="/confidentialite" target="_blank" className="text-[10px] text-[#94A3B8] hover:text-[#5B4EC4] transition-colors">Confidentialité</Link>
          <span className="text-[#E2E8F0] text-[10px]">·</span>
          <Link href="/mentions-legales" target="_blank" className="text-[10px] text-[#94A3B8] hover:text-[#5B4EC4] transition-colors">Mentions légales</Link>
        </div>
      </div>

      {/* User */}
      <div className="px-3 py-3 shrink-0 border-t border-[#F1F5F9]">
        <button
          onClick={() => router.push("/reglages")}
          className="flex items-center gap-2.5 w-full px-2 py-2 rounded-[10px] transition-all duration-150 group text-left"
          style={{ }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(91,78,196,0.05)"}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "transparent"}
          title="Réglages du profil"
        >
          <div className="w-8 h-8 rounded-[10px] flex items-center justify-center text-[11px] font-bold text-white shrink-0" style={{ background: "linear-gradient(135deg, #5B4EC4 0%, #2BA89C 100%)" }}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-[#0F172A] truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-[10px] text-[#94A3B8] truncate">{user?.email}</p>
          </div>
          <Settings size={14} className="text-[#94A3B8] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
    </aside>
  );
}

function NavItem({ href, label, emoji, active }: { href: string; label: string; emoji: string; active: boolean }) {
  return (
    <Link
      href={href}
      title={label}
      className="flex items-center gap-2.5 h-9 rounded-[10px] text-[13px] transition-all duration-150"
      style={{
        fontFamily: "var(--font-jakarta)",
        paddingLeft: "12px",
        paddingRight: "12px",
        fontWeight: active ? 600 : 400,
        color: active ? "#5B4EC4" : "#64748B",
        background: active ? "rgba(91,78,196,0.08)" : "transparent",
      }}
      onMouseEnter={e => {
        if (!active) {
          (e.currentTarget as HTMLAnchorElement).style.background = "rgba(91,78,196,0.06)";
          (e.currentTarget as HTMLAnchorElement).style.color = "#5B4EC4";
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
          (e.currentTarget as HTMLAnchorElement).style.color = "#64748B";
        }
      }}
    >
      <span style={{ fontSize: 15, opacity: active ? 1 : 0.5, lineHeight: 1, width: 18, textAlign: "center", flexShrink: 0 }}>{emoji}</span>
      <span className="truncate">{label}</span>
    </Link>
  );
}

function NavGroup({ items, isActive }: { items: typeof NAV_ACTIVITY; isActive: (href: string) => boolean }) {
  return (
    <div className="space-y-0.5">
      {items.map((item) => (
        <NavItem key={item.href} href={item.href} label={item.label} emoji={item.emoji} active={isActive(item.href)} />
      ))}
    </div>
  );
}
