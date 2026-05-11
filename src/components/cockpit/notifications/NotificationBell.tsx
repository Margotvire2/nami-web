"use client";

/**
 * NotificationBell — cloche cockpit unifiée.
 *
 * Affiche un badge avec le compteur d'éléments À faire.
 * Click ouvre le NotificationPanel slide-over droite.
 *
 * Vocabulaire MDR-safe. Aucun usage côté app patient.
 */

import { useState } from "react";
import { Bell } from "lucide-react";
import { useNotificationFeed } from "@/hooks/useNotificationFeed";
import { NotificationPanel } from "./NotificationPanel";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { data } = useNotificationFeed();
  const todoCount = data.counts.todo;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={
          todoCount > 0
            ? `Notifications (${todoCount} à traiter)`
            : "Notifications"
        }
        className="relative p-2 rounded-[10px] hover:bg-[rgba(91,78,196,0.06)] transition-colors"
        style={{ transition: "background-color 0.2s cubic-bezier(0.16,1,0.3,1)" }}
      >
        <Bell className="w-5 h-5 text-[#4A4A5A]" aria-hidden="true" />
        {todoCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#5B4EC4] text-white text-[10px] font-bold flex items-center justify-center"
            style={{ fontFamily: "Inter" }}
            aria-hidden="true"
          >
            {todoCount > 9 ? "9+" : todoCount}
          </span>
        )}
      </button>

      <NotificationPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        feed={data}
      />
    </>
  );
}
