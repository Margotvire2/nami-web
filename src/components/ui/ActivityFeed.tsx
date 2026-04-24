"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store"
import { apiWithToken, type TaskWithContext, type Referral } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"
import { format, isToday, isYesterday, parseISO, differenceInHours } from "date-fns"
import { fr } from "date-fns/locale"
import { X, CheckSquare, Bell } from "lucide-react"

// ─── Feed item type ───────────────────────────────────────────────────────────

type FeedItem = {
  id: string
  type: "task" | "referral_in" | "patient"
  emoji: string
  title: string
  body: string
  date: Date
  href?: string
  action?: { label: string; href: string }
  unread?: boolean
}

// ─── Time grouping ────────────────────────────────────────────────────────────

function getGroup(date: Date): "now" | "today" | "yesterday" | "week" {
  const h = differenceInHours(new Date(), date)
  if (h < 2) return "now"
  if (isToday(date)) return "today"
  if (isYesterday(date)) return "yesterday"
  return "week"
}

const GROUP_LABEL: Record<string, string> = {
  now: "MAINTENANT",
  today: "AUJOURD'HUI",
  yesterday: "HIER",
  week: "CETTE SEMAINE",
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ActivityFeed() {
  const [open, setOpen] = useState(false)
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const { accessToken } = useAuthStore()
  const router = useRouter()
  const api = apiWithToken(accessToken ?? "")

  // Listen for global toggle
  useEffect(() => {
    const handler = () => setOpen((o) => !o)
    window.addEventListener("nami-feed-toggle", handler)
    return () => window.removeEventListener("nami-feed-toggle", handler)
  }, [])

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape" && open) setOpen(false) }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open])

  const { data: tasks = [] } = useQuery<TaskWithContext[]>({
    queryKey: ["tasks-mine"],
    queryFn: () => api.tasksMine.list(),
    enabled: !!accessToken && open,
    staleTime: 60_000,
  })

  const { data: incomingReferrals = [] } = useQuery<Referral[]>({
    queryKey: ["referrals-incoming"],
    queryFn: () => api.referrals.incoming(),
    enabled: !!accessToken && open,
    staleTime: 60_000,
  })

  const { data: cases = [] } = useQuery({
    queryKey: ["care-cases", "all"],
    queryFn: () => api.careCases.list(),
    enabled: !!accessToken && open,
    staleTime: 2 * 60_000,
  })

  // Build feed items
  const items: FeedItem[] = []

  // Tasks pending / overdue
  tasks
    .filter((t) => t.status === "PENDING" || t.status === "IN_PROGRESS")
    .slice(0, 6)
    .forEach((t) => {
      const isOverdue = t.dueDate && new Date(t.dueDate) < new Date()
      items.push({
        id: `task-${t.id}`,
        type: "task",
        emoji: isOverdue ? "⚠️" : "☑️",
        title: `${isOverdue ? "Tâche en retard" : "Tâche à faire"} · ${t.careCase.patient.firstName} ${t.careCase.patient.lastName}`,
        body: t.title,
        date: new Date(t.dueDate ?? t.createdAt),
        href: `/patients/${t.careCase.id}`,
        action: { label: "Voir →", href: `/patients/${t.careCase.id}` },
        unread: !!isOverdue,
      })
    })

  // Incoming referrals (new / to respond to)
  ;(incomingReferrals as Referral[])
    .filter((r) => r.status === "SENT" || r.status === "RECEIVED")
    .slice(0, 3)
    .forEach((r) => {
      items.push({
        id: `ref-${r.id}`,
        type: "referral_in",
        emoji: "↗",
        title: `Adressage reçu · ${r.careCase.caseTitle}`,
        body: (r.priority === "URGENT" || r.priority === "EMERGENCY") ? "Urgent — réponse attendue" : `De ${r.sender.firstName} ${r.sender.lastName}`,
        date: parseISO(r.createdAt),
        href: "/adressages",
        action: { label: "Répondre →", href: "/adressages" },
        unread: r.status === "SENT",
      })
    })

  // Recent care case activity (< 48h)
  ;(cases)
    .filter((c) => c.lastActivityAt && differenceInHours(new Date(), new Date(c.lastActivityAt)) < 48)
    .sort((a, b) => new Date(b.lastActivityAt!).getTime() - new Date(a.lastActivityAt!).getTime())
    .slice(0, 4)
    .forEach((c) => {
      items.push({
        id: `case-${c.id}`,
        type: "patient",
        emoji: "🌱",
        title: `Activité · ${c.patient.firstName} ${c.patient.lastName}`,
        body: c.caseTitle,
        date: new Date(c.lastActivityAt!),
        href: `/patients/${c.id}`,
        action: { label: "Voir →", href: `/patients/${c.id}` },
        unread: false,
      })
    })

  // Sort by date desc, filter dismissed
  const feed = items
    .filter((i) => !dismissed.has(i.id))
    .sort((a, b) => b.date.getTime() - a.date.getTime())

  // Group
  const grouped = new Map<string, FeedItem[]>()
  for (const item of feed) {
    const g = getGroup(item.date)
    if (!grouped.has(g)) grouped.set(g, [])
    grouped.get(g)!.push(item)
  }

  const unreadCount = feed.filter((i) => i.unread).length

  const navigate = useCallback((href: string) => {
    setOpen(false)
    router.push(href)
  }, [router])

  if (!open) return (
    // Bell badge exposed globally for CockpitHeader
    <div id="nami-feed-badge" data-unread={unreadCount} style={{ display: "none" }} />
  )

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 9990,
          background: "rgba(15,10,30,0.2)",
          animation: "feedBgIn 200ms ease forwards",
        }}
        onClick={() => setOpen(false)}
      />
      <style>{`
        @keyframes feedBgIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes feedPanelIn { from { opacity: 0; transform: translateX(20px) } to { opacity: 1; transform: translateX(0) } }
        @keyframes feedItemIn { from { opacity: 0; transform: translateX(8px) } to { opacity: 1; transform: translateX(0) } }
      `}</style>

      {/* Panel */}
      <div
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0,
          width: 380, maxWidth: "92vw",
          background: "#FFFFFF",
          zIndex: 9991,
          display: "flex", flexDirection: "column",
          boxShadow: "-8px 0 40px rgba(15,10,30,0.12)",
          borderLeft: "1px solid #E8ECF4",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          animation: "feedPanelIn 260ms cubic-bezier(0.16,1,0.3,1) forwards",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 20px 16px",
          borderBottom: "1px solid #F1F5F9",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Bell size={16} style={{ color: "#5B4EC4" }} />
            <span style={{ fontSize: 15, fontWeight: 700, color: "#1A1A2E" }}>Activité</span>
            {unreadCount > 0 && (
              <span style={{
                minWidth: 18, height: 18, borderRadius: 9, padding: "0 5px",
                background: "#5B4EC4", color: "#FFF",
                fontSize: 10, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#6B7280", display: "flex" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Feed */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {feed.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "#6B7280" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🌿</div>
              <p style={{ fontSize: 13 }}>Tout est à jour.</p>
              <p style={{ fontSize: 11, marginTop: 4, opacity: 0.7 }}>Aucune tâche en attente ni activité récente.</p>
            </div>
          ) : (
            Array.from(grouped.entries()).map(([group, groupItems]) => (
              <div key={group} style={{ paddingBottom: 8 }}>
                <div style={{
                  padding: "12px 20px 6px",
                  fontSize: 10, fontWeight: 700, color: "#6B7280",
                  letterSpacing: "0.08em", textTransform: "uppercase",
                }}>
                  {GROUP_LABEL[group]}
                </div>
                {groupItems.map((item, i) => (
                  <div
                    key={item.id}
                    style={{
                      margin: "0 12px 6px",
                      borderRadius: 12,
                      border: `1px solid ${item.unread ? "#EDE9FC" : "#F1F5F9"}`,
                      background: item.unread ? "#FAFAFE" : "#FFFFFF",
                      padding: "12px 14px",
                      cursor: item.href ? "pointer" : "default",
                      animation: `feedItemIn 200ms ${i * 40}ms both`,
                      position: "relative",
                    }}
                    onClick={() => item.href && navigate(item.href)}
                  >
                    {/* Unread dot */}
                    {item.unread && (
                      <div style={{
                        position: "absolute", top: 14, left: 14,
                        width: 6, height: 6, borderRadius: "50%", background: "#5B4EC4",
                        animation: "pulse 2s ease infinite",
                      }} />
                    )}
                    <style>{`@keyframes pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.3);opacity:0.6} }`}</style>

                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, paddingLeft: item.unread ? 14 : 0 }}>
                      <span style={{ fontSize: 16, flexShrink: 0, lineHeight: 1 }}>{item.emoji}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#1A1A2E", lineHeight: 1.3 }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: 11, color: "#374151", marginTop: 2, lineHeight: 1.4 }}>
                          {item.body}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
                          <span style={{ fontSize: 10, color: "#6B7280" }}>
                            {format(item.date, "d MMM · HH:mm", { locale: fr })}
                          </span>
                          {item.action && (
                            <button
                              onClick={(e) => { e.stopPropagation(); navigate(item.action!.href) }}
                              style={{
                                background: "none", border: "none", cursor: "pointer", padding: 0,
                                fontSize: 11, fontWeight: 600, color: "#5B4EC4", fontFamily: "inherit",
                                display: "flex", alignItems: "center", gap: 2,
                              }}
                            >
                              {item.action.label}
                            </button>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDismissed((s) => new Set([...s, item.id])) }}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "#CBD5E1", flexShrink: 0, display: "flex" }}
                        title="Ignorer"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 20px", borderTop: "1px solid #F1F5F9", flexShrink: 0 }}>
          <button
            onClick={() => navigate("/taches")}
            style={{
              width: "100%", background: "none", border: "1px solid #E8ECF4",
              borderRadius: 10, padding: "8px 14px", cursor: "pointer",
              fontSize: 12, fontWeight: 600, color: "#5B4EC4",
              fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}
          >
            <CheckSquare size={13} /> Voir toutes les tâches
          </button>
        </div>
      </div>
    </>
  )
}

// ─── Bell button (used in CockpitHeader) ─────────────────────────────────────

export function ActivityFeedBell({ className }: { className?: string }) {
  const { accessToken } = useAuthStore()
  const api = apiWithToken(accessToken ?? "")

  const { data: tasks = [] } = useQuery<TaskWithContext[]>({
    queryKey: ["tasks-mine"],
    queryFn: () => api.tasksMine.list(),
    enabled: !!accessToken,
    staleTime: 60_000,
    refetchInterval: 120_000,
  })

  const urgentCount = tasks.filter(
    (t) => (t.status === "PENDING" || t.status === "IN_PROGRESS") &&
      (t.priority === "URGENT" || t.priority === "HIGH" || (t.dueDate && new Date(t.dueDate) < new Date()))
  ).length

  return (
    <button
      onClick={() => window.dispatchEvent(new CustomEvent("nami-feed-toggle"))}
      className={className}
      style={{
        position: "relative",
        background: "none", border: "1px solid #E8ECF4",
        borderRadius: 10, padding: "7px 9px",
        cursor: "pointer", display: "flex", alignItems: "center",
        transition: "border-color 150ms, background 150ms",
        color: "#374151",
      }}
      title="Activité (notifications)"
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#5B4EC4"; (e.currentTarget as HTMLElement).style.color = "#5B4EC4" }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#E8ECF4"; (e.currentTarget as HTMLElement).style.color = "#374151" }}
    >
      <Bell size={15} />
      {urgentCount > 0 && (
        <span style={{
          position: "absolute", top: -4, right: -4,
          minWidth: 16, height: 16, borderRadius: 8,
          background: "#5B4EC4", color: "#FFF",
          fontSize: 9, fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "0 3px",
          border: "2px solid white",
        }}>
          {urgentCount}
        </span>
      )}
    </button>
  )
}
