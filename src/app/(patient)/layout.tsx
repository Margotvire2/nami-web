"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import Link from "next/link";
import { Home, Calendar, FileText, MessageCircle, User, LogOut } from "lucide-react";

const NAV = [
  { href: "/accueil",     icon: Home,           label: "Accueil" },
  { href: "/rendez-vous", icon: Calendar,       label: "Rendez-vous" },
  { href: "/documents",   icon: FileText,       label: "Documents" },
  { href: "/messages",    icon: MessageCircle,  label: "Messages" },
  { href: "/mon-compte",  icon: User,           label: "Mon compte" },
];

const C = {
  bg: "#F8FAFB",
  sidebar: "#FFFFFF",
  primary: "#0F766E",        // teal-700
  primaryLight: "#CCFBF1",  // teal-100
  text: "#1C2B2A",
  textSoft: "#6B7280",
  border: "#E5E7EB",
  active: "#F0FDF9",
};

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  // Auth + role guard
  useEffect(() => {
    if (!accessToken) { router.replace("/login"); return; }
    if (user && user.roleType !== "PATIENT") { router.replace("/aujourd-hui"); }
  }, [accessToken, user, router]);

  if (!accessToken || !user) return null;

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}>
      {/* ── Sidebar desktop ── */}
      <aside style={{
        width: 240, flexShrink: 0, background: C.sidebar,
        borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column",
        position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 40,
      }}
        className="hidden md:flex"
      >
        {/* Logo */}
        <div style={{ padding: "24px 20px 16px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>N</span>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Nami</div>
              <div style={{ fontSize: 11, color: C.textSoft }}>Espace patient</div>
            </div>
          </div>
        </div>

        {/* Greeting */}
        <div style={{ padding: "16px 20px 8px" }}>
          <div style={{ fontSize: 13, color: C.textSoft }}>Connecté en tant que</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginTop: 2 }}>
            {user.firstName} {user.lastName}
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "8px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link key={href} href={href} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
                borderRadius: 10, textDecoration: "none", fontSize: 14, fontWeight: active ? 600 : 400,
                background: active ? C.active : "transparent",
                color: active ? C.primary : C.textSoft,
                transition: "all 0.15s",
              }}>
                <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: "12px 12px 20px", borderTop: `1px solid ${C.border}` }}>
          <button onClick={handleLogout} style={{
            display: "flex", alignItems: "center", gap: 10, width: "100%",
            padding: "9px 12px", borderRadius: 10, border: "none", background: "transparent",
            cursor: "pointer", fontSize: 14, color: C.textSoft, fontFamily: "inherit",
          }}>
            <LogOut size={18} strokeWidth={1.8} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main style={{ flex: 1, marginLeft: 0 }} className="md:ml-60">
        {children}
      </main>

      {/* ── Bottom tab bar mobile ── */}
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
        background: C.sidebar, borderTop: `1px solid ${C.border}`,
        display: "flex", justifyContent: "space-around", padding: "8px 0 env(safe-area-inset-bottom)",
      }}
        className="flex md:hidden"
      >
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              padding: "4px 12px", textDecoration: "none", borderRadius: 8,
              color: active ? C.primary : C.textSoft,
            }}>
              <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
              <span style={{ fontSize: 10, fontWeight: active ? 600 : 400 }}>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
