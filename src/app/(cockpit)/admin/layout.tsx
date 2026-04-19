"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/store";
import { LayoutDashboard, ShieldCheck, Users, Building2, Database, UserPlus, Megaphone } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const TABS = [
  { href: "/admin",              label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: "/admin/validations",  label: "Validations",    icon: ShieldCheck,    badge: true },
  { href: "/admin/utilisateurs", label: "Utilisateurs",   icon: Users },
  { href: "/admin/organisations",label: "Organisations",  icon: Building2 },
  { href: "/admin/donnees",      label: "Données",         icon: Database },
  { href: "/admin/inviter",      label: "Inviter",         icon: UserPlus },
  { href: "/admin/contenu",      label: "Contenu",         icon: Megaphone },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, accessToken } = useAuthStore();
  const [pendingCount, setPendingCount] = useState(0);
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  // Guard ADMIN
  useEffect(() => {
    if (user && user.roleType !== "ADMIN") {
      router.replace("/aujourd-hui");
    }
  }, [user, router]);

  // Charger le pending count pour badge
  useEffect(() => {
    if (!accessToken) return;
    fetch(`${API_URL}/admin/pending-count`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((r) => r.json())
      .then((d: { count: number }) => setPendingCount(d.count ?? 0))
      .catch(() => {});
  }, [accessToken]);

  // Sliding indicator
  useEffect(() => {
    const activeIdx = TABS.findIndex((t) =>
      t.href === "/admin" ? pathname === "/admin" : pathname.startsWith(t.href)
    );
    const el = tabRefs.current[activeIdx];
    if (el) {
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    }
  }, [pathname]);

  if (!user || user.roleType !== "ADMIN") return null;

  return (
    <div className="min-h-full" style={{ background: "#FAFAF8", fontFamily: "var(--font-jakarta)" }}>
      {/* Sub-nav */}
      <div style={{ background: "#fff", borderBottom: "1px solid rgba(26,26,46,0.06)" }}>
        <div className="px-6 pt-5 pb-0">
          <div className="flex items-baseline justify-between mb-4">
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1A1A2E", letterSpacing: "-0.02em" }}>
              Administration
            </h1>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                background: "rgba(91,78,196,0.08)",
                color: "#5B4EC4",
                padding: "3px 10px",
                borderRadius: 6,
              }}
            >
              ADMIN
            </span>
          </div>

          {/* Tabs with sliding indicator */}
          <div className="relative flex gap-1">
            {TABS.map((tab, i) => {
              const isActive =
                tab.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(tab.href);
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  ref={(el) => { tabRefs.current[i] = el; }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 14px 12px",
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? "#5B4EC4" : "#8A8A96",
                    textDecoration: "none",
                    transition: "color 0.2s",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) (e.currentTarget as HTMLAnchorElement).style.color = "#4A4A5A";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) (e.currentTarget as HTMLAnchorElement).style.color = "#8A8A96";
                  }}
                >
                  <Icon size={14} strokeWidth={1.75} />
                  {tab.label}
                  {tab.badge && pendingCount > 0 && (
                    <span
                      style={{
                        marginLeft: 2,
                        minWidth: 18,
                        height: 18,
                        padding: "0 5px",
                        fontSize: 10,
                        fontWeight: 700,
                        background: "#D94F4F",
                        color: "#fff",
                        borderRadius: 9,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        animation: "pulse-once 0.6s ease-out",
                      }}
                    >
                      {pendingCount}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Sliding underline */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: indicator.left,
                width: indicator.width,
                height: 2,
                background: "#5B4EC4",
                borderRadius: 1,
                transition: "left 0.3s cubic-bezier(0.16, 1, 0.3, 1), width 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-once {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.25); }
          100% { transform: scale(1); }
        }
        .admin-card {
          background: #fff;
          border: 1px solid rgba(26,26,46,0.05);
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(26,26,46,0.04);
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .admin-card:hover {
          border-color: rgba(91,78,196,0.12);
          box-shadow: 0 4px 12px rgba(26,26,46,0.06), 0 20px 40px rgba(91,78,196,0.06);
          transform: translateY(-4px) scale(1.005);
        }
        .admin-card-static {
          background: #fff;
          border: 1px solid rgba(26,26,46,0.05);
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(26,26,46,0.04);
        }
        .admin-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .admin-btn:active { transform: scale(0.97); }
        .admin-btn-validate {
          background: rgba(43,168,74,0.08);
          color: #2BA84A;
        }
        .admin-btn-validate:hover { background: rgba(43,168,74,0.15); }
        .admin-btn-reject {
          background: rgba(217,79,79,0.08);
          color: #D94F4F;
        }
        .admin-btn-reject:hover { background: rgba(217,79,79,0.15); }
        .admin-btn-contact {
          background: rgba(91,78,196,0.06);
          color: #5B4EC4;
        }
        .admin-btn-contact:hover { background: rgba(91,78,196,0.12); }
        .admin-row-hover:hover { background: rgba(91,78,196,0.02); }
        @keyframes admin-fade-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .admin-stagger { animation: admin-fade-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }
      `}</style>

      {/* Content */}
      <div className="p-6">{children}</div>
    </div>
  );
}
