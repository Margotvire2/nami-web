"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/lib/store";
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roleType: string;
  createdAt: string;
  providerProfile?: {
    subscriptionTier: string | null;
    validatedStatus: boolean;
    rppsNumber: string | null;
    specialties: string[];
  } | null;
}

interface UsersResponse {
  total: number;
  page: number;
  users: AdminUser[];
}

type RoleFilter = "" | "PROVIDER" | "PATIENT" | "ADMIN";

const TIER_STYLE: Record<string, { bg: string; color: string }> = {
  EXPERT:       { bg: "rgba(91,78,196,0.08)",  color: "#5B4EC4" },
  COORDINATION: { bg: "rgba(43,168,156,0.08)", color: "#2BA89C" },
  PRO:          { bg: "rgba(230,153,62,0.08)", color: "#E6993E" },
  PRESENCE:     { bg: "#F5F3EF",               color: "#6B7280" },
  FREE:         { bg: "#F5F3EF",               color: "#6B7280" },
};

const ROLE_STYLE: Record<string, { bg: string; color: string }> = {
  ADMIN:    { bg: "rgba(91,78,196,0.08)",  color: "#5B4EC4" },
  PROVIDER: { bg: "rgba(43,168,156,0.08)", color: "#2BA89C" },
  PATIENT:  { bg: "#F5F3EF",               color: "#6B7280" },
};

function Badge({ text, bg, color }: { text: string; bg: string; color: string }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 6, background: bg, color }}>
      {text}
    </span>
  );
}

function Avatar({ first, last, size = 32 }: { first: string; last: string; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.3,
      background: "linear-gradient(135deg, #5B4EC4, #2BA89C)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontSize: size * 0.35, fontWeight: 700, flexShrink: 0,
    }}>
      {first[0]}{last[0]}
    </div>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────
function DetailPanel({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  return (
    <>
      <div
        style={{ position: "fixed", inset: 0, background: "rgba(26,26,46,0.15)", zIndex: 50 }}
        onClick={onClose}
      />
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: 360,
          background: "#fff",
          boxShadow: "-4px 0 24px rgba(26,26,46,0.08)",
          zIndex: 51,
          padding: 24,
          overflow: "auto",
          animation: "panel-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
          fontFamily: "var(--font-jakarta)",
        }}
      >
        <style>{`
          @keyframes panel-in {
            from { transform: translateX(100%); }
            to   { transform: translateX(0); }
          }
        `}</style>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1A1A2E" }}>Détail utilisateur</h2>
          <button
            onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "rgba(26,26,46,0.05)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <X size={16} style={{ color: "#6B7280" }} />
          </button>
        </div>

        {/* Avatar + nom */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
          <Avatar first={user.firstName} last={user.lastName} size={48} />
          <div>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#1A1A2E" }}>{user.firstName} {user.lastName}</p>
            <p style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{user.email}</p>
          </div>
        </div>

        {/* Infos */}
        {[
          { label: "Rôle", value: user.roleType },
          { label: "Inscription", value: new Date(user.createdAt).toLocaleDateString("fr-FR") },
          user.providerProfile?.rppsNumber ? { label: "RPPS", value: user.providerProfile.rppsNumber } : null,
          user.providerProfile?.specialties?.length ? { label: "Spécialités", value: (user.providerProfile.specialties as string[]).slice(0, 3).join(", ") } : null,
        ].filter(Boolean).map((item) => item && (
          <div key={item.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, padding: "10px 0", borderBottom: "1px solid rgba(26,26,46,0.06)" }}>
            <span style={{ fontSize: 13, color: "#6B7280" }}>{item.label}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#1A1A2E" }}>{item.value}</span>
          </div>
        ))}

        {user.providerProfile && (
          <div style={{ marginTop: 8 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {user.providerProfile.subscriptionTier && (
                <Badge
                  text={user.providerProfile.subscriptionTier}
                  {...(TIER_STYLE[user.providerProfile.subscriptionTier] ?? TIER_STYLE.FREE)}
                />
              )}
              <Badge
                text={user.providerProfile.validatedStatus ? "Validé" : "En attente"}
                bg={user.providerProfile.validatedStatus ? "rgba(43,168,74,0.1)" : "rgba(230,153,62,0.1)"}
                color={user.providerProfile.validatedStatus ? "#2BA84A" : "#E6993E"}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminUtilisateursPage() {
  const { accessToken } = useAuthStore();
  const [data, setData] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadUsers = useCallback(async (role: RoleFilter, q: string, p: number) => {
    if (!accessToken) return;
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), limit: "20" });
    if (role) params.set("role", role);
    if (q) params.set("search", q);
    try {
      const r = await fetch(`${API_URL}/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const d = await r.json() as UsersResponse;
      setData(d);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => { loadUsers(roleFilter, search, page); }, [roleFilter, page, loadUsers]);

  function handleSearch(q: string) {
    setSearch(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      loadUsers(roleFilter, q, 1);
    }, 250);
  }

  const totalPages = data ? Math.ceil(data.total / 20) : 1;

  return (
    <div style={{ maxWidth: 1000, fontFamily: "var(--font-jakarta)" }}>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        {/* Search */}
        <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
          <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#6B7280" }} />
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Rechercher par nom, email…"
            style={{
              width: "100%",
              padding: "10px 12px 10px 36px",
              borderRadius: 12,
              border: "1px solid transparent",
              background: "#F5F3EF",
              fontSize: 13,
              color: "#1A1A2E",
              outline: "none",
              boxSizing: "border-box",
              transition: "all 0.2s",
            }}
            onFocus={(e) => {
              e.target.style.background = "#fff";
              e.target.style.border = "1px solid rgba(91,78,196,0.4)";
              e.target.style.boxShadow = "0 0 0 4px rgba(91,78,196,0.08)";
            }}
            onBlur={(e) => {
              e.target.style.background = search ? "#fff" : "#F5F3EF";
              e.target.style.border = "1px solid transparent";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Role filter */}
        <div style={{ display: "flex", gap: 4 }}>
          {([
            { value: "", label: `Tous (${data?.total ?? "…"})` },
            { value: "PROVIDER", label: "Soignants" },
            { value: "PATIENT", label: "Patients" },
            { value: "ADMIN", label: "Admins" },
          ] as const).map(({ value, label }) => (
            <button
              key={value}
              onClick={() => { setRoleFilter(value); setPage(1); }}
              style={{
                padding: "7px 12px",
                borderRadius: 8,
                border: "none",
                fontSize: 12,
                fontWeight: roleFilter === value ? 600 : 400,
                cursor: "pointer",
                background: roleFilter === value ? "rgba(91,78,196,0.08)" : "transparent",
                color: roleFilter === value ? "#5B4EC4" : "#6B7280",
                transition: "all 0.2s",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="admin-card-static" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(26,26,46,0.06)" }}>
              {["Nom", "Email", "Rôle", "Tier", "Date"].map((col) => (
                <th key={col} style={{ padding: "10px 16px", fontSize: 11, fontWeight: 700, color: "#6B7280", textAlign: "left", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ padding: 40, textAlign: "center", color: "#6B7280", fontSize: 13 }}>
                  Chargement…
                </td>
              </tr>
            ) : (data?.users ?? []).length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: 40, textAlign: "center", color: "#6B7280", fontSize: 13 }}>
                  Aucun utilisateur trouvé
                </td>
              </tr>
            ) : (
              (data?.users ?? []).map((user, i) => {
                const roleStyle = ROLE_STYLE[user.roleType] ?? ROLE_STYLE.PATIENT;
                const tierStyle = user.providerProfile?.subscriptionTier
                  ? TIER_STYLE[user.providerProfile.subscriptionTier] ?? TIER_STYLE.FREE
                  : null;
                return (
                  <tr
                    key={user.id}
                    className="admin-row-hover admin-stagger"
                    onClick={() => setSelectedUser(user)}
                    style={{
                      borderBottom: "1px solid rgba(26,26,46,0.04)",
                      cursor: "pointer",
                      animationDelay: `${i * 30}ms`,
                      transition: "background 0.15s",
                    }}
                  >
                    <td style={{ padding: "10px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar first={user.firstName} last={user.lastName} size={28} />
                        <span style={{ fontSize: 13, fontWeight: 500, color: "#1A1A2E" }}>
                          {user.firstName} {user.lastName}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "10px 16px", fontSize: 13, color: "#6B7280" }}>{user.email}</td>
                    <td style={{ padding: "10px 16px" }}>
                      <Badge text={user.roleType} bg={roleStyle.bg} color={roleStyle.color} />
                    </td>
                    <td style={{ padding: "10px 16px" }}>
                      {tierStyle && user.providerProfile?.subscriptionTier ? (
                        <Badge text={user.providerProfile.subscriptionTier} bg={tierStyle.bg} color={tierStyle.color} />
                      ) : (
                        <span style={{ fontSize: 12, color: "#E8ECF4" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "10px 16px", fontSize: 12, color: "#6B7280" }}>
                      {new Date(user.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 16 }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              width: 32, height: 32, borderRadius: 8, border: "1px solid rgba(26,26,46,0.1)",
              background: "transparent", cursor: page === 1 ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              opacity: page === 1 ? 0.4 : 1,
            }}
          >
            <ChevronLeft size={16} style={{ color: "#374151" }} />
          </button>
          <span style={{ fontSize: 13, color: "#374151" }}>
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{
              width: 32, height: 32, borderRadius: 8, border: "1px solid rgba(26,26,46,0.1)",
              background: "transparent", cursor: page === totalPages ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              opacity: page === totalPages ? 0.4 : 1,
            }}
          >
            <ChevronRight size={16} style={{ color: "#374151" }} />
          </button>
        </div>
      )}

      {/* Detail panel */}
      {selectedUser && (
        <DetailPanel user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
}
