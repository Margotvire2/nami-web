"use client";

/**
 * CockpitDmBadgeCard — carte cockpit /aujourd-hui pour les messages privés patients.
 *
 * Branches rendues :
 *  - 0 thread DM                 → return null (la carte n'apparaît pas)
 *  - N threads, 0 unread         → carte secondaire "N conversations privées en cours"
 *  - N threads, ≥ 1 unread       → carte primary avec count + preview 3 derniers threads
 *
 * Source : GET /care-team/messages/dm-inbox (backend PR #107).
 * Vocabulaire MDR-safe : aucun terme clinique. La carte agit comme une
 * notification organisationnelle, ne porte aucune information de santé.
 *
 * Synergie PR 13 frontend cockpit : le CTA pointe vers /messages?tab=dm pour
 * ouvrir l'onglet DM. Tant que PR 13 n'est pas mergée, /messages reste atteignable
 * normalement (le query param ?tab=dm est ignoré).
 */

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight, MessageCircle } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import {
  apiWithToken,
  type CockpitDmInboxThread,
} from "@/lib/api";

const PREVIEW_THREADS_MAX = 3;
const POLL_INTERVAL_MS = 30_000;

function relativeTime(dateStr: string): string {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60_000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins}min`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `il y a ${h}h`;
  const d = Math.floor(h / 24);
  return d === 1 ? "hier" : `il y a ${d}j`;
}

function patientFullName(t: CockpitDmInboxThread): string {
  return `${t.patient.firstName} ${t.patient.lastName}`.trim();
}

function patientInitials(t: CockpitDmInboxThread): string {
  const fn = t.patient.firstName?.[0] ?? "";
  const ln = t.patient.lastName?.[0] ?? "";
  return `${fn}${ln}`.toUpperCase() || "?";
}

export default function CockpitDmBadgeCard() {
  const { accessToken } = useAuthStore();
  const api = accessToken ? apiWithToken(accessToken) : null;

  const { data, isLoading } = useQuery<{ threads: CockpitDmInboxThread[] }>({
    queryKey: ["cockpit-dm-inbox-summary"],
    queryFn: async () => {
      if (!api) return { threads: [] };
      try {
        return await api.messages.dmInbox.list();
      } catch {
        // Backend pas encore livré ou erreur réseau → carte cachée
        return { threads: [] };
      }
    },
    enabled: !!accessToken,
    staleTime: POLL_INTERVAL_MS,
    refetchInterval: POLL_INTERVAL_MS,
  });

  if (isLoading) return null;

  const threads = data?.threads ?? [];
  if (threads.length === 0) return null;

  const totalUnread = threads.reduce((s, t) => s + (t.unreadCount ?? 0), 0);
  const sorted = [...threads].sort((a, b) => {
    const aTs = a.lastMessage?.createdAt
      ? new Date(a.lastMessage.createdAt).getTime()
      : 0;
    const bTs = b.lastMessage?.createdAt
      ? new Date(b.lastMessage.createdAt).getTime()
      : 0;
    return bTs - aTs;
  });

  // Cas 2 : threads sans unread → carte secondaire compacte
  if (totalUnread === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32, duration: 0.3 }}
        role="region"
        aria-label="Messages privés patients"
      >
        <Link
          href="/messages?tab=dm"
          className="block bg-white rounded-2xl p-4 hover:bg-[#FAFBFF] transition-colors group"
          style={{ border: "1px solid #E8ECF4" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "#EEEDFB" }}
            >
              <MessageCircle size={16} color="#5B4EC4" />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-[12px] font-semibold text-[#0F172A]"
                style={{ fontFamily: "var(--font-jakarta)" }}
              >
                {threads.length} conversation{threads.length > 1 ? "s" : ""} privée{threads.length > 1 ? "s" : ""} en cours
              </p>
              <p className="text-[11px] text-[#94A3B8] mt-0.5">
                Aucun message non lu
              </p>
            </div>
            <ChevronRight
              size={14}
              className="text-[#CBD5E1] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>
        </Link>
      </motion.div>
    );
  }

  // Cas 3 : threads avec unread → carte primary visible
  const preview = sorted.slice(0, PREVIEW_THREADS_MAX);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.32, duration: 0.3 }}
      role="region"
      aria-label="Messages privés patients"
    >
      <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid #E8ECF4" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageCircle size={18} color="#5B4EC4" aria-hidden />
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8]"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              MESSAGES PRIVÉS PATIENTS
            </p>
            <span
              className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-full"
              style={{
                background: "#FEE2E2",
                color: "#B91C1C",
                fontSize: 11,
                fontWeight: 700,
                fontFamily: "var(--font-inter)",
              }}
              data-testid="dm-unread-badge"
            >
              {totalUnread} non lu{totalUnread > 1 ? "s" : ""}
            </span>
          </div>
          <Link
            href="/messages?tab=dm"
            className="text-[12px] font-medium text-[#5B4EC4] hover:underline"
          >
            Tout voir →
          </Link>
        </div>

        <div className="space-y-1">
          {preview.map((t) => (
            <Link
              key={t.patientPersonId}
              href="/messages?tab=dm"
              className="flex gap-3 hover:bg-[#F8FAFC] -mx-2 px-2 py-2 rounded-lg transition-colors cursor-pointer group"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5"
                style={{
                  background:
                    "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
                }}
                aria-hidden
              >
                {patientInitials(t)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[13px] font-semibold text-[#0F172A] truncate">
                    {patientFullName(t)}
                  </span>
                  {t.lastMessage && (
                    <span
                      className="text-[11px] text-[#94A3B8] shrink-0"
                      style={{ fontFamily: "var(--font-inter)" }}
                    >
                      {relativeTime(t.lastMessage.createdAt)}
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-[#475569] mt-0.5 truncate">
                  {t.lastMessage?.body ?? ""}
                </p>
                {t.unreadCount > 0 && (
                  <span
                    className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: "#FEE2E2",
                      color: "#B91C1C",
                      fontFamily: "var(--font-inter)",
                    }}
                  >
                    {t.unreadCount} non lu{t.unreadCount > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <ChevronRight
                size={13}
                className="text-[#CBD5E1] shrink-0 mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </Link>
          ))}
        </div>

        <Link
          href="/messages?tab=dm"
          className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#5B4EC4] hover:underline"
        >
          Voir tous mes messages privés
          <ChevronRight size={13} />
        </Link>
      </div>
    </motion.div>
  );
}
