"use client";

/**
 * Sandbox NotificationBell — page de test isolée pour Sprint 2.
 * À supprimer en Sprint 3 après intégration sidebar.
 */

import { NotificationBell } from "@/components/cockpit/notifications/NotificationBell";

export default function NotificationsSandboxPage() {
  return (
    <div className="p-8 max-w-2xl">
      <h1
        className="text-2xl font-bold text-[#1A1A2E] mb-2"
        style={{ fontFamily: "Plus Jakarta Sans" }}
      >
        Sandbox — NotificationBell
      </h1>
      <p className="text-sm text-[#6B7280] mb-8" style={{ fontFamily: "Plus Jakarta Sans" }}>
        Test du composant cloche en isolation. À supprimer après Sprint 3.
      </p>
      <div
        className="border rounded-xl p-6 bg-white flex items-center gap-4"
        style={{ borderColor: "rgba(26,26,46,0.06)" }}
      >
        <span className="text-sm text-[#4A4A5A]" style={{ fontFamily: "Inter" }}>
          Cliquez sur la cloche :
        </span>
        <NotificationBell />
      </div>
    </div>
  );
}
