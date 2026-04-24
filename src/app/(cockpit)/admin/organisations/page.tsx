"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store";
import { Building2, Users } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface Org {
  id: string;
  name: string;
  type?: string;
  createdAt: string;
  _count?: { members?: number };
}

export default function AdminOrganisationsPage() {
  const { accessToken } = useAuthStore();
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    fetch(`${API_URL}/organizations`, { headers: { Authorization: `Bearer ${accessToken}` } })
      .then((r) => r.json())
      .then((d) => setOrgs(Array.isArray(d) ? d : Array.isArray(d.organizations) ? d.organizations : []))
      .catch(() => setOrgs([]))
      .finally(() => setLoading(false));
  }, [accessToken]);

  return (
    <div style={{ maxWidth: 1000, fontFamily: "var(--font-jakarta)" }}>
      <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 24 }}>
        {loading ? "Chargement…" : `${orgs.length} organisation${orgs.length > 1 ? "s" : ""}`}
      </p>

      {!loading && orgs.length === 0 ? (
        <div className="admin-card-static" style={{ textAlign: "center", padding: "48px 24px" }}>
          <Building2 size={32} style={{ color: "#E8ECF4", margin: "0 auto 12px" }} />
          <p style={{ fontSize: 14, fontWeight: 600, color: "#6B7280" }}>Aucune organisation</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {orgs.map((org, i) => (
            <div
              key={org.id}
              className="admin-card admin-stagger"
              style={{ padding: 20, animationDelay: `${i * 80}ms`, cursor: "default" }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: "rgba(91,78,196,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 14,
                }}
              >
                <Building2 size={18} style={{ color: "#5B4EC4" }} />
              </div>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#1A1A2E", marginBottom: 4 }}>{org.name}</p>
              {org.type && (
                <p style={{ fontSize: 12, color: "#6B7280", marginBottom: 10 }}>{org.type}</p>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                <Users size={12} style={{ color: "#6B7280" }} />
                <span style={{ fontSize: 12, color: "#6B7280" }}>
                  {org._count?.members ?? "—"} membre{(org._count?.members ?? 0) > 1 ? "s" : ""}
                </span>
              </div>
              <p style={{ fontSize: 11, color: "#6B7280", marginTop: 8 }}>
                Créée le {new Date(org.createdAt).toLocaleDateString("fr-FR")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
