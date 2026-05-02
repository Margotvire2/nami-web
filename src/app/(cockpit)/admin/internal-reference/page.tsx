"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// ─── Types ───────────────────────────────────────────────────────────────────

type SearchScope = "A" | "B" | "both";

interface BaseAEntry {
  id: string;
  source: string;
  category: string;
  subcategory: string | null;
  title: string;
  contentExcerpt: string;
  status: string;
  rank: number;
}

interface BaseAChunk {
  id: string;
  slug: string;
  sectionTitle: string;
  contentExcerpt: string;
  rank: number;
  isQuarantined?: boolean;
}

interface BaseBEntry {
  id: string;
  source: string;
  internalCategory: string;
  legalStatus: string;
  rightsHolder: string | null;
  title: string;
  contentExcerpt: string;
  rank: number;
}

interface BaseBChunk {
  id: string;
  entryId: string;
  entryTitle: string;
  entryCategory: string;
  contentExcerpt: string;
  rank: number;
}

interface SourceCount {
  source: string;
  count: number;
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

interface SearchResults {
  baseA: { entries: BaseAEntry[]; chunks: BaseAChunk[] } | null;
  baseB: { entries: BaseBEntry[]; chunks: BaseBChunk[] } | null;
}

interface EntryDetail {
  entry: any;
  chunks: any[];
  base: "a" | "b";
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function InternalReferencePage() {
  const { accessToken } = useAuthStore();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [purpose, setPurpose] = useState("");
  const [category, setCategory] = useState<string>("");
  const [scope, setScope] = useState<SearchScope>("B");
  const [sourceFilter, setSourceFilter] = useState<string>("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [sources, setSources] = useState<SourceCount[]>([]);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [logs, setLogs] = useState<AccessLog[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalDetail, setModalDetail] = useState<EntryDetail | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

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

    fetch(`${API_URL}/admin/internal-reference/sources`, { headers: authHeader })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => setSources(j?.data ?? []))
      .catch(() => {});

    refreshLogs();
  }, [accessToken]); // eslint-disable-line react-hooks/exhaustive-deps

  // ESC ferme le modal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && modalOpen) closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen]);

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
          scope,
          sourceFilter:
            scope === "A" || scope === "both" ? sourceFilter || undefined : undefined,
          limit: 10,
        }),
      });

      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error((err as any).error ?? `HTTP ${r.status}`);
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

  async function openEntry(entryId: string, base: "a" | "b") {
    setModalOpen(true);
    setModalLoading(true);
    setModalError(null);
    setModalDetail(null);

    try {
      const params = new URLSearchParams({
        purpose: purpose.trim() || "Consultation détail",
        base,
      });
      const r = await fetch(
        `${API_URL}/admin/internal-reference/entries/${entryId}?${params}`,
        { headers: authHeader }
      );
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error((err as any).error ?? `HTTP ${r.status}`);
      }
      const json = await r.json();
      setModalDetail({ ...json.data, base });
      await refreshLogs();
    } catch (e: any) {
      setModalError(e.message ?? "Erreur");
    } finally {
      setModalLoading(false);
    }
  }

  function closeModal() {
    setModalOpen(false);
    setModalDetail(null);
    setModalError(null);
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
            Admin · Référentiels cliniques · Accès restreint
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
            Consultation BASE A + B
          </h1>
          <p
            style={{
              fontSize: "16px",
              color: "#4A4A5A",
              marginTop: "12px",
              maxWidth: "720px",
            }}
          >
            <strong>BASE A</strong> : HAS, Orphanet, CIS, guidelines publiques —{" "}
            <strong>BASE B 🔒</strong> : DSM-5, FFAB, ICHD-3 (copyrighted, Margot uniquement).
            Chaque accès est tracé dans l'audit log RGPD.
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
            {/* Scope toggle */}
            <div>
              <label style={labelStyle}>Périmètre</label>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {(
                  [
                    { value: "both", label: "Toutes" },
                    { value: "A", label: "BASE A · Public" },
                    { value: "B", label: "🔒 BASE B · Privé" },
                  ] as { value: SearchScope; label: string }[]
                ).map((opt) => {
                  const active = scope === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setScope(opt.value)}
                      style={{
                        padding: "10px 18px",
                        fontSize: "14px",
                        fontWeight: 600,
                        borderRadius: "10px",
                        border: active ? "none" : "1px solid rgba(26,26,46,0.12)",
                        background: active
                          ? "linear-gradient(135deg, #5B4EC4, #2BA89C)"
                          : "#FAFAF8",
                        color: active ? "#FFFFFF" : "#4A4A5A",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        letterSpacing: "0.02em",
                        boxShadow: active ? "0 4px 12px rgba(91,78,196,0.25)" : "none",
                        transition: "all 0.2s",
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              <p
                style={{
                  fontSize: "12px",
                  color: "#8A8A96",
                  marginTop: "8px",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {scope === "B" && "DSM-5 · FFAB · ICHD-3"}
                {scope === "A" && `HAS · Orphanet · CIS · guidelines · ${sources.length} sources`}
                {scope === "both" && "Recherche simultanée dans les deux bases"}
              </p>
            </div>

            {/* Query */}
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

            {/* Purpose */}
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
              <p
                style={{
                  fontSize: "12px",
                  color: "#8A8A96",
                  marginTop: "6px",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Tracé dans InternalAccessLog · Rétention 1 an.
              </p>
            </div>

            {/* Source filter (BASE A) */}
            {(scope === "A" || scope === "both") && sources.length > 0 && (
              <div>
                <label style={labelStyle}>Source BASE A (optionnel)</label>
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Toutes sources</option>
                  {sources.map((s) => (
                    <option key={s.source} value={s.source}>
                      {s.source} ({s.count.toLocaleString("fr-FR")} entrées)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Category filter (BASE B) */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: "16px",
                alignItems: "end",
              }}
            >
              <div>
                <label style={labelStyle}>Catégorie BASE B (optionnel)</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ ...inputStyle, opacity: scope === "A" ? 0.4 : 1 }}
                  disabled={scope === "A"}
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
            {/* BASE A */}
            {results.baseA && (
              <div style={{ marginBottom: "40px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "16px",
                  }}
                >
                  <h2
                    style={{
                      fontSize: "20px",
                      fontWeight: 700,
                      margin: 0,
                      color: "#1A1A2E",
                    }}
                  >
                    BASE A · Sources publiques
                  </h2>
                  <span
                    style={{
                      fontSize: "11px",
                      fontFamily: "Inter, sans-serif",
                      color: "#2BA89C",
                      fontWeight: 600,
                    }}
                  >
                    {results.baseA.entries.length} entrées · {results.baseA.chunks.length} chunks
                  </span>
                </div>

                {results.baseA.entries.length === 0 &&
                results.baseA.chunks.length === 0 ? (
                  <p style={{ color: "#8A8A96", fontStyle: "italic" }}>
                    Aucun résultat BASE A.
                  </p>
                ) : (
                  <>
                    {results.baseA.entries.length > 0 && (
                      <div
                        style={{ display: "grid", gap: "12px", marginBottom: "16px" }}
                      >
                        {results.baseA.entries.map((e) => (
                          <button
                            key={e.id}
                            type="button"
                            onClick={() => openEntry(e.id, "a")}
                            style={{
                              ...cardButtonStyle,
                            }}
                            onMouseEnter={(ev) => {
                              ev.currentTarget.style.borderColor =
                                "rgba(43,168,156,0.4)";
                              ev.currentTarget.style.boxShadow =
                                "0 4px 16px rgba(43,168,156,0.12)";
                            }}
                            onMouseLeave={(ev) => {
                              ev.currentTarget.style.borderColor =
                                "rgba(26,26,46,0.06)";
                              ev.currentTarget.style.boxShadow =
                                "0 1px 3px rgba(26,26,46,0.04)";
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                gap: "10px",
                                marginBottom: "8px",
                                flexWrap: "wrap",
                                alignItems: "center",
                              }}
                            >
                              <Tag color="#2BA89C">{e.source}</Tag>
                              <Tag color="#5B4EC4">{e.category}</Tag>
                              {e.subcategory && (
                                <Tag color="#8A8A96">{e.subcategory}</Tag>
                              )}
                              <Tag color="#2BA89C" style={{ marginLeft: "auto" }}>
                                rank {e.rank.toFixed(3)}
                              </Tag>
                            </div>
                            <h3
                              style={{
                                fontSize: "16px",
                                fontWeight: 700,
                                margin: "0 0 6px 0",
                                lineHeight: 1.3,
                                color: "#1A1A2E",
                                textAlign: "left",
                              }}
                            >
                              {e.title}
                            </h3>
                            <p
                              style={{
                                fontSize: "14px",
                                color: "#4A4A5A",
                                lineHeight: 1.6,
                                margin: "0 0 10px 0",
                                textAlign: "left",
                              }}
                            >
                              {e.contentExcerpt}…
                            </p>
                            <div
                              style={{
                                fontSize: "11px",
                                color: "#2BA89C",
                                fontFamily: "Inter, sans-serif",
                                fontWeight: 600,
                              }}
                            >
                              Cliquer pour voir le détail →
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {results.baseA.chunks.length > 0 && (
                      <div style={{ display: "grid", gap: "10px" }}>
                        {results.baseA.chunks.slice(0, 5).map((c) => (
                          <div
                            key={c.id}
                            style={{
                              background: "#F0FDF4",
                              borderRadius: "10px",
                              padding: "14px 18px",
                              border: "1px solid rgba(43,168,156,0.15)",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "12px",
                                fontFamily: "Inter, sans-serif",
                                color: "#2BA89C",
                                fontWeight: 600,
                                marginBottom: "5px",
                              }}
                            >
                              {c.slug} · {c.sectionTitle} · rank {c.rank.toFixed(3)}
                              {c.isQuarantined && (
                                <span style={{ color: "#991B1B", marginLeft: "8px" }}>
                                  · QUARANTINE
                                </span>
                              )}
                            </div>
                            <p
                              style={{
                                fontSize: "14px",
                                color: "#4A4A5A",
                                lineHeight: 1.6,
                                margin: 0,
                              }}
                            >
                              {c.contentExcerpt}…
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {results.baseA && results.baseB && (
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid rgba(26,26,46,0.06)",
                  margin: "32px 0",
                }}
              />
            )}

            {/* BASE B */}
            {results.baseB && (
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "16px",
                  }}
                >
                  <h2
                    style={{
                      fontSize: "20px",
                      fontWeight: 700,
                      margin: 0,
                      color: "#5B4EC4",
                    }}
                  >
                    🔒 BASE B · Sources privées Margot
                  </h2>
                  <span
                    style={{
                      fontSize: "10px",
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      color: "#FFFFFF",
                      background: "#5B4EC4",
                      padding: "3px 8px",
                      borderRadius: "4px",
                    }}
                  >
                    PRIVÉ
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      fontFamily: "Inter, sans-serif",
                      color: "#5B4EC4",
                      fontWeight: 600,
                    }}
                  >
                    {results.baseB.entries.length} entrées · {results.baseB.chunks.length} chunks
                  </span>
                </div>

                {results.baseB.entries.length === 0 &&
                results.baseB.chunks.length === 0 ? (
                  <p style={{ color: "#8A8A96", fontStyle: "italic" }}>
                    Aucun résultat BASE B.
                  </p>
                ) : (
                  <>
                    {results.baseB.entries.length > 0 && (
                      <div
                        style={{ display: "grid", gap: "16px", marginBottom: "16px" }}
                      >
                        {results.baseB.entries.map((e) => (
                          <button
                            key={e.id}
                            type="button"
                            onClick={() => openEntry(e.id, "b")}
                            style={{
                              ...cardButtonStyle,
                              borderColor: "rgba(91,78,196,0.12)",
                            }}
                            onMouseEnter={(ev) => {
                              ev.currentTarget.style.borderColor =
                                "rgba(91,78,196,0.4)";
                              ev.currentTarget.style.boxShadow =
                                "0 4px 16px rgba(91,78,196,0.12)";
                            }}
                            onMouseLeave={(ev) => {
                              ev.currentTarget.style.borderColor =
                                "rgba(91,78,196,0.12)";
                              ev.currentTarget.style.boxShadow =
                                "0 1px 3px rgba(26,26,46,0.04)";
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                gap: "12px",
                                marginBottom: "8px",
                                flexWrap: "wrap",
                              }}
                            >
                              <Tag color="#5B4EC4">{e.internalCategory}</Tag>
                              <Tag color="#8A8A96">{e.legalStatus}</Tag>
                              {e.rightsHolder && (
                                <Tag color="#8A8A96">{e.rightsHolder}</Tag>
                              )}
                              <Tag color="#5B4EC4" style={{ marginLeft: "auto" }}>
                                rank {e.rank.toFixed(3)}
                              </Tag>
                            </div>
                            <h3
                              style={{
                                fontSize: "17px",
                                fontWeight: 700,
                                margin: "0 0 8px 0",
                                lineHeight: 1.3,
                                color: "#1A1A2E",
                                textAlign: "left",
                              }}
                            >
                              {e.title}
                            </h3>
                            <p
                              style={{
                                fontSize: "14px",
                                color: "#4A4A5A",
                                lineHeight: 1.6,
                                margin: "0 0 10px 0",
                                textAlign: "left",
                              }}
                            >
                              {e.contentExcerpt}…
                            </p>
                            <div
                              style={{
                                fontSize: "11px",
                                color: "#5B4EC4",
                                fontFamily: "Inter, sans-serif",
                                fontWeight: 600,
                              }}
                            >
                              Cliquer pour voir le détail →
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {results.baseB.chunks.length > 0 && (
                      <div style={{ display: "grid", gap: "12px" }}>
                        {results.baseB.chunks.slice(0, 5).map((c) => (
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
                              {c.entryTitle} · {c.entryCategory} · rank{" "}
                              {c.rank.toFixed(3)}
                            </div>
                            <p
                              style={{
                                fontSize: "14px",
                                color: "#4A4A5A",
                                lineHeight: 1.6,
                                margin: 0,
                              }}
                            >
                              {c.contentExcerpt}…
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* ─── Access logs ─────────────────────────────────── */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
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
              type="button"
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
              <div
                style={{
                  padding: "20px",
                  color: "#8A8A96",
                  fontSize: "14px",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Aucun accès enregistré.
              </div>
            ) : (
              logs.map((l, i) => (
                <div
                  key={l.id}
                  style={{
                    padding: "14px 20px",
                    borderBottom:
                      i < logs.length - 1 ? "1px solid rgba(26,26,46,0.04)" : "none",
                    display: "grid",
                    gridTemplateColumns: "180px 130px 1fr 80px",
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
                    {l.queryText && (
                      <em style={{ marginRight: "8px" }}>"{l.queryText}"</em>
                    )}
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

      {/* ─── Modal détail ─────────────────────────────────── */}
      {modalOpen && (
        <ModalDetail
          loading={modalLoading}
          detail={modalDetail}
          error={modalError}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

// ─── Style tokens ─────────────────────────────────────────────────────────────

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

const cardButtonStyle: React.CSSProperties = {
  background: "#FFFFFF",
  borderRadius: "12px",
  padding: "20px 24px",
  border: "1px solid rgba(26,26,46,0.06)",
  boxShadow: "0 1px 3px rgba(26,26,46,0.04)",
  cursor: "pointer",
  textAlign: "left",
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  color: "inherit",
  width: "100%",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

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

function Meta({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div>
      <div
        style={{
          color: "#8A8A96",
          fontSize: "10px",
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          marginBottom: "2px",
        }}
      >
        {label}
      </div>
      <div style={{ color: "#1A1A2E", fontSize: "13px", fontFamily: "Inter, sans-serif" }}>
        {value}
      </div>
    </div>
  );
}

function ModalDetail({
  loading,
  detail,
  error,
  onClose,
}: {
  loading: boolean;
  detail: EntryDetail | null;
  error: string | null;
  onClose: () => void;
}) {
  const isBaseB = detail?.base === "b";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Détail de l'entrée"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(26,26,46,0.5)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: "16px",
          maxWidth: "900px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 24px 48px rgba(26,26,46,0.2)",
        }}
      >
        {/* Bandeau privé BASE B */}
        {isBaseB && (
          <div
            style={{
              padding: "10px 24px",
              background: "linear-gradient(135deg, #5B4EC4, #2BA89C)",
              color: "#FFFFFF",
              fontSize: "12px",
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              letterSpacing: "0.04em",
            }}
          >
            🔒 BASE B · Sources copyrightées (consultation Margot uniquement · audit RGPD tracé)
          </div>
        )}

        {/* Header */}
        <div
          style={{
            padding: "24px 32px",
            borderBottom: "1px solid rgba(26,26,46,0.06)",
            display: "flex",
            alignItems: "flex-start",
            gap: "16px",
          }}
        >
          <div style={{ flex: 1 }}>
            {loading && (
              <div
                style={{
                  color: "#8A8A96",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "14px",
                }}
              >
                Chargement…
              </div>
            )}
            {detail?.entry && (
              <>
                <div
                  style={{
                    fontSize: "11px",
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 600,
                    color: "#5B4EC4",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: "6px",
                  }}
                >
                  {isBaseB
                    ? `${detail.entry.internalCategory ?? ""} · ${detail.entry.source ?? ""}`
                    : detail.entry.source}
                </div>
                <h2
                  style={{
                    fontSize: "22px",
                    fontWeight: 700,
                    margin: 0,
                    color: "#1A1A2E",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    lineHeight: 1.2,
                  }}
                >
                  {detail.entry.title ?? "(sans titre)"}
                </h2>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            style={{
              background: "#FAFAF8",
              border: "1px solid rgba(26,26,46,0.08)",
              borderRadius: "8px",
              padding: "8px 14px",
              cursor: "pointer",
              fontSize: "18px",
              color: "#4A4A5A",
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>

        {/* Body scrollable */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px 32px",
          }}
        >
          {error && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "10px",
                background: "rgba(220,38,38,0.08)",
                border: "1px solid rgba(220,38,38,0.2)",
                color: "#991B1B",
                fontSize: "14px",
                marginBottom: "20px",
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {detail?.entry && (
            <>
              {/* Métadonnées */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                  gap: "16px",
                  marginBottom: "24px",
                  padding: "16px 20px",
                  background: "#FAFAF8",
                  borderRadius: "10px",
                }}
              >
                {isBaseB ? (
                  <>
                    <Meta label="Statut légal" value={detail.entry.legalStatus} />
                    <Meta label="Rights holder" value={detail.entry.rightsHolder} />
                    <Meta
                      label="Migré le"
                      value={
                        detail.entry.migratedAt
                          ? new Date(detail.entry.migratedAt).toLocaleDateString("fr-FR")
                          : undefined
                      }
                    />
                    <Meta
                      label="Consultations"
                      value={String(detail.entry.consultCount ?? 0)}
                    />
                  </>
                ) : (
                  <>
                    <Meta label="Source" value={detail.entry.source} />
                    <Meta label="Catégorie" value={detail.entry.category} />
                    <Meta
                      label="ID"
                      value={
                        detail.entry.id ? `${detail.entry.id.slice(0, 12)}…` : undefined
                      }
                    />
                  </>
                )}
              </div>

              {/* Content */}
              <h3
                style={{
                  fontSize: "12px",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 700,
                  color: "#4A4A5A",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  margin: "0 0 12px 0",
                }}
              >
                Contenu
              </h3>
              <div
                style={{
                  background: "#FAFAF8",
                  borderRadius: "10px",
                  padding: "20px",
                  fontSize: "14px",
                  color: "#1A1A2E",
                  lineHeight: 1.7,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  marginBottom: "24px",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {detail.entry.content ?? "(contenu vide)"}
              </div>

              {/* Chunks */}
              {detail.chunks && detail.chunks.length > 0 && (
                <>
                  <h3
                    style={{
                      fontSize: "12px",
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 700,
                      color: "#4A4A5A",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      margin: "0 0 12px 0",
                    }}
                  >
                    Chunks associés ({detail.chunks.length})
                  </h3>
                  <div style={{ display: "grid", gap: "8px" }}>
                    {detail.chunks.map((c: any, i: number) => (
                      <div
                        key={c.id ?? i}
                        style={{
                          background: "#F5F3EF",
                          borderRadius: "8px",
                          padding: "12px 16px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "11px",
                            fontFamily: "Inter, sans-serif",
                            color: "#8A8A96",
                            marginBottom: "6px",
                            fontWeight: 600,
                          }}
                        >
                          Chunk #{c.chunkIndex ?? i + 1}
                          {c.isQuarantined && (
                            <span style={{ color: "#991B1B", marginLeft: "8px" }}>
                              · QUARANTINE
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: "13px",
                            color: "#4A4A5A",
                            lineHeight: 1.6,
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          }}
                        >
                          {c.content ?? "(vide)"}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 32px",
            borderTop: "1px solid rgba(26,26,46,0.06)",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "10px 24px",
              fontSize: "14px",
              fontWeight: 600,
              borderRadius: "10px",
              border: "1px solid rgba(26,26,46,0.12)",
              background: "#FAFAF8",
              color: "#1A1A2E",
              cursor: "pointer",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
