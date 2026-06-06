"use client";

/**
 * NotificationPanel — slide-over droite avec 2 sections (À faire + Activité récente).
 *
 * 400px max desktop / full mobile, overlay sombre semi-transparent,
 * design system Nami strict, vocabulaire MDR-safe.
 */

import { useEffect } from "react";
import Link from "next/link";
import { X, ArrowRight } from "lucide-react";
import { NotificationSection } from "./NotificationSection";
import type { NotificationFeed } from "@/lib/api";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  feed: NotificationFeed;
};

export function NotificationPanel({ isOpen, onClose, feed }: Props) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/20"
        style={{ transition: "opacity 0.3s cubic-bezier(0.16,1,0.3,1)" }}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className="fixed top-0 right-0 z-50 h-full w-full max-w-[400px] bg-[#FAFAF8] border-l flex flex-col"
        style={{
          borderColor: "rgba(26,26,46,0.06)",
          boxShadow: "0 20px 60px rgba(26,26,46,0.12)",
          transition: "transform 0.3s cubic-bezier(0.16,1,0.3,1)",
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Notifications"
      >
        <header
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: "rgba(26,26,46,0.06)" }}
        >
          <h2
            className="text-base font-bold text-[#1A1A2E]"
            style={{ fontFamily: "Plus Jakarta Sans" }}
          >
            Notifications
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer le panneau"
            className="p-1 rounded-[8px] hover:bg-[rgba(26,26,46,0.04)] transition-colors"
          >
            <X className="w-5 h-5 text-[#4A4A5A]" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          <NotificationSection
            title="À faire"
            items={feed.todo}
            emptyMessage="Aucun élément à traiter pour le moment."
          />
          <NotificationSection
            title="Activité récente"
            items={feed.activity}
            emptyMessage="Aucune activité récente."
          />
        </div>

        <footer
          className="shrink-0 border-t bg-white"
          style={{ borderColor: "rgba(26,26,46,0.06)" }}
        >
          <Link
            href="/centre-notifications"
            onClick={onClose}
            className="flex items-center justify-between gap-2 px-4 py-3 text-sm font-medium text-[#5B4EC4] hover:bg-[rgba(91,78,196,0.04)] transition-colors"
            style={{ fontFamily: "Plus Jakarta Sans" }}
          >
            <span>Voir toutes les notifications</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </footer>
      </aside>
    </>
  );
}
