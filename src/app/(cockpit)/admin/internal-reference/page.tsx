"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// ─── Types ───────────────────────────────────────────────────────────────────

interface SearchEntry {
  id: string;
  source: string;
  internalCategory: string;
  legalStatus: string;
  rightsHolder: string | null;
  title: string;
  contentExcerpt: string;
  rank: number;
}

interface SearchChunk {
  id: string;
  entryId: string;
  entryTitle: string;
  entryCategory: string;
  contentExcerpt: string;
  rank: number;
}

interface Category {
  id: string;
  code: string;
  labelFr: string;
  legalStatus: string;
  description: string;
}

interface AccessLog {
  id: string;
  accessedAt: string;
  accessType: string;
  queryText: string | null;
  entryId: string | null;
  resultCount: number | null;
  purpose: string;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function InternalReferencePage() {
  const { accessToken } = useAuthStore();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [purpose, setPurpose] = useState("");
  const [category, setCategory] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [results, setResults] = useState<{
    entries: SearchEntry[];
    chunks: SearchChunk[];
  } | null>(null);
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authHeader: Record<string, string> = accessToken
    ? { Authorization: `Bearer ${accessToken}` }
    : {};

  const refreshLogs = useCallback(async () => {
    if (!accessToken) return;
    try {
      const r = await fetch(`${API_URL}/admin/internal-reference/logs?limit=10`, {
        headers: authHeader,
      });
      if (r.ok) {
        const json = await r.json();
        setLogs(json.data ?? []);
      }
    } catch {
      // non-bloquant
    }
  }, [accessToken]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!accessToken) {
      router.push("/login");
      return;
    }

    fetch(`${API_URL}/admin/internal-reference/categories`, { headers: authHeader })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => setCategories(j?.data ?? []))
      .catch(() => {});

    refreshLogs();
  }, [accessToken]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (purpose.trim().length < 5) {
      setError("Le motif (purpose) est obligatoire — min 5 caractères (audit RGPD).");
      return;
    }
    if (query.trim().length === 0) {
      setError("Tape une requête.");
      return;
    }

    setLoading(true);
    try {
      const r = await fetch(`${API_URL}/admin/internal-reference/search`, {
        method: "POST",
        headers: { ...authHeader, "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query.trim(),
          purpose: purpose.trim(),
          category: category || undefined,
          limit: 10,
        }),
      });

      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.error ?? `HTTP ${r.status}`);
      }

      const json = await r.json();
      setResults(json.data);
      await refreshLogs();
    } catch (e: any) {
      setError(e.message ?? "Erreur");
    } finally {
      setLoading(false);
    }
  }

  if (!accessToken) return null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FAFAF8",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        color: "#1A1A2E",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 24px" }}>

        {/* ─── Header ──────────────────────────────────────── */}
        <div style={{ marginBottom: "48px" }}>
          <div
            style={{
              fontSize: "12px",
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              color: "#8A8A96",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}
          >
            Admin · BASE B · Sources copyrighted
          </div>
          <h1
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 900,
              margin: 0,
              lineHeight: 1.05,
              background: "linear-gradient(135deg, #5B4EC4, #2BA89C)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Consultation BASE B
          </h1>
          <p
            style={{
              fontSize: "16px",
              color: "#4A4A5A",
              marginTop: "12px",
              maxWidth: "720px",
            }}
          >
            DSM-5 · FFAB · ICHD-3 · Accès Margot uniquement · Chaque accès est tracé
            dans l'audit log RGPD.
          </p>
        </div>

        {/* ─── Search form ─────────────────────────────────── */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "12px",
            padding: "32px",
            boxShadow: "0 1px 3px rgba(26,26,46,0.04)",
            border: "1px solid rgba(26,26,46,0.06)",
            marginBottom: "32px",
          }}
        >
          <form onSubmit={handleSearch} style={{ display: "grid", gap: "20px" }}>

            <div>
              <label style={labelStyle}>Recherche (français)</label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='ex : "anorexie nerveuse critères diagnostiques"'
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>
                Motif de consultation{" "}
                <span style={{ color: "#DC2626", fontWeight: 700 }}>* RGPD</span>
              </label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder='ex : "Préparation cours DU TCA"'
                style={inputStyle}
              />
              <p style={{ fontSize: "12px", color: "#8A8A96", marginTop: "6px", fontFamily: "Inter, sans-serif" }}>
                Tracé dans InternalAccessLog · Rétention 1 an.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "16px", alignItems: "end" }}>
              <div>
                <label style={labelStyle}>Catégorie (optionnel)</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Toutes catégories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.code}>
                      {c.labelFr} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "14px 28px",
                  fontSize: "15px",
                  fontWeight: 700,
                  borderRadius: "10px",
                  border: "none",
                  background: loading
                    ? "#8A8A96"
                    : "linear-gradient(135deg, #5B4EC4, #2BA89C)",
                  color: "#FFFFFF",
                  cursor: loading ? "wait" : "pointer",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  letterSpacing: "0.02em",
                  boxShadow: "0 4px 12px rgba(91,78,196,0.25)",
                  whiteSpace: "nowrap",
                }}
              >
                {loading ? "Recherche…" : "Rechercher"}
              </button>
            </div>

            {error && (
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "10px",
                  background: "rgba(220,38,38,0.08)",
                  border: "1px solid rgba(220,38,38,0.2)",
                  color: "#991B1B",
                  fontSize: "14px",
                }}
              >
                ⚠️ {error}
              </div>
            )}
          </form>
        </div>

        {/* ─── Results ─────────────────────────────────────── */}
        {results && (
          <div style={{ marginBottom: "48px" }}>
            <SectionTitle>📚 Entries ({results.entries.length})</SectionTitle>
            {results.entries.length === 0 ? (
              <p style={{ color: "#8A8A96", fontStyle: "italic" }}>Aucune entry trouvée.</p>
            ) : (
              <div style={{ display: "grid", gap: "16px" }}>
                {results.entries.map((e) => (
                  <div key={e.id} style={cardStyle}>
                    <div style={{ display: "flex", gap: "12px", marginBottom: "8px", flexWrap: "wrap" }}>
                      <Tag color="#5B4EC4">{e.internalCategory}</Tag>
                      <Tag color="#8A8A96">{e.legalStatus}</Tag>
                      {e.rightsHolder && <Tag color="#8A8A96">{e.rightsHolder}</Tag>}
                      <Tag color="#2BA89C" style={{ marginLeft: "auto" }}>
                        rank {e.rank.toFixed(3)}
                      </Tag>
                    </div>
                    <h3 style={{ fontSize: "17px", fontWeight: 700, margin: "0 0 8px 0", lineHeight: 1.3 }}>
                      {e.title}
                    </h3>
                    <p style={{ fontSize: "14px", color: "#4A4A5A", lineHeight: 1.6, margin: 0 }}>
                      {e.contentExcerpt}…
                    </p>
                  </div>
                ))}
              </div>
            )}

            {results.chunks.length > 0 && (
              <>
                <SectionTitle style={{ marginTop: "32px" }}>
                  📄 Chunks ({results.chunks.length}
                  {results.chunks.length > 5 ? `, 5 affichés` : ""})
                </SectionTitle>
                <div style={{ display: "grid", gap: "12px" }}>
                  {results.chunks.slice(0, 5).map((c) => (
                    <div
                      key={c.id}
                      style={{
                        background: "#F5F3EF",
                        borderRadius: "10px",
                        padding: "16px 20px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "12px",
                          fontFamily: "Inter, sans-serif",
                          color: "#5B4EC4",
                          fontWeight: 600,
                          marginBottom: "6px",
                        }}
                      >
                        {c.entryTitle} · {c.entryCategory} · rank {c.rank.toFixed(3)}
                      </div>
                      <p style={{ fontSize: "14px", color: "#4A4A5A", lineHeight: 1.6, margin: 0 }}>
                        {c.contentExcerpt}…
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ─── Access logs ─────────────────────────────────── */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <h2
              style={{
                fontSize: "14px",
                fontWeight: 700,
                margin: 0,
                fontFamily: "Inter, sans-serif",
                color: "#4A4A5A",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Mes derniers accès · Audit RGPD
            </h2>
            <button
              onClick={refreshLogs}
              style={{
                fontSize: "13px",
                color: "#5B4EC4",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
              }}
            >
              Actualiser
            </button>
          </div>
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "12px",
              border: "1px solid rgba(26,26,46,0.06)",
              overflow: "hidden",
            }}
          >
            {logs.length === 0 ? (
              <div style={{ padding: "20px", color: "#8A8A96", fontSize: "14px", fontFamily: "Inter, sans-serif" }}>
                Aucun accès enregistré.
              </div>
            ) : (
              logs.map((l, i) => (
                <div
                  key={l.id}
                  style={{
                    padding: "14px 20px",
                    borderBottom: i < logs.length - 1 ? "1px solid rgba(26,26,46,0.04)" : "none",
                    display: "grid",
                    gridTemplateColumns: "180px 90px 1fr 80px",
                    gap: "16px",
                    alignItems: "center",
                    fontSize: "13px",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  <span style={{ color: "#8A8A96" }}>
                    {new Date(l.accessedAt).toLocaleString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span
                    style={{
                      color: "#5B4EC4",
                      fontWeight: 600,
                      fontSize: "10px",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    {l.accessType}
                  </span>
                  <span style={{ color: "#1A1A2E", minWidth: 0 }}>
                    {l.queryText && <em style={{ marginRight: "8px" }}>"{l.queryText}"</em>}
                    {!l.queryText && l.entryId && (
                      <code style={{ marginRight: "8px", fontSize: "12px" }}>
                        {l.entryId.slice(0, 12)}…
                      </code>
                    )}
                    <span style={{ color: "#8A8A96" }}>— {l.purpose}</span>
                  </span>
                  <span
                    style={{
                      color: "#2BA89C",
                      textAlign: "right",
                      fontWeight: 600,
                      fontSize: "13px",
                    }}
                  >
                    {l.resultCount ?? "·"} rés.
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Mini design tokens ───────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "12px",
  fontFamily: "Inter, sans-serif",
  fontWeight: 600,
  color: "#4A4A5A",
  marginBottom: "6px",
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  fontSize: "15px",
  borderRadius: "10px",
  border: "1px solid rgba(26,26,46,0.12)",
  background: "#FAFAF8",
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  color: "#1A1A2E",
  outline: "none",
  boxSizing: "border-box",
};

const cardStyle: React.CSSProperties = {
  background: "#FFFFFF",
  borderRadius: "12px",
  padding: "20px 24px",
  border: "1px solid rgba(26,26,46,0.06)",
  boxShadow: "0 1px 3px rgba(26,26,46,0.04)",
};

function SectionTitle({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <h2
      style={{
        fontSize: "20px",
        fontWeight: 700,
        marginBottom: "16px",
        marginTop: 0,
        ...style,
      }}
    >
      {children}
    </h2>
  );
}

function Tag({
  children,
  color,
  style,
}: {
  children: React.ReactNode;
  color: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      style={{
        fontSize: "11px",
        fontFamily: "Inter, sans-serif",
        fontWeight: 600,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        color,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
