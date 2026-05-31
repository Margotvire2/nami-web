"use client";

import Link from "next/link";
import { Bell, ClipboardList, Home, Search, ArrowRight } from "lucide-react";

export function ConfirmNextSteps() {
  return (
    <section
      aria-labelledby="confirm-next-title"
      className="rounded-2xl p-6 md:p-8"
      style={{
        background: "#fff",
        border: "1px solid rgba(26,26,46,0.06)",
        boxShadow: "0 1px 3px rgba(26,26,46,0.04)",
      }}
    >
      <h2
        id="confirm-next-title"
        className="text-lg md:text-xl font-bold mb-2"
        style={{ color: "#1A1A2E", fontFamily: "var(--font-jakarta)" }}
      >
        Et maintenant&nbsp;?
      </h2>
      <p
        className="text-sm md:text-base mb-6"
        style={{ color: "#6B7280", lineHeight: 1.6 }}
      >
        Vous recevrez une notification dès que le soignant aura répondu. Vous
        pouvez suivre l&apos;avancement de votre demande à tout moment.
      </p>

      {/* Bullet explicatif */}
      <ul
        className="flex flex-col gap-3 mb-6"
        aria-label="Étapes à venir"
      >
        <li className="flex items-start gap-3">
          <div
            className="shrink-0 flex items-center justify-center rounded-full"
            style={{
              width: 28,
              height: 28,
              background: "rgba(91,78,196,0.10)",
              color: "#5B4EC4",
            }}
            aria-hidden="true"
          >
            <Bell size={14} />
          </div>
          <div className="text-sm" style={{ color: "#374151" }}>
            <span
              className="font-semibold"
              style={{ color: "#1A1A2E" }}
            >
              Notification immédiate
            </span>{" "}
            par email et dans votre espace dès la réponse du soignant.
          </div>
        </li>
        <li className="flex items-start gap-3">
          <div
            className="shrink-0 flex items-center justify-center rounded-full"
            style={{
              width: 28,
              height: 28,
              background: "rgba(91,78,196,0.10)",
              color: "#5B4EC4",
            }}
            aria-hidden="true"
          >
            <ClipboardList size={14} />
          </div>
          <div className="text-sm" style={{ color: "#374151" }}>
            <span
              className="font-semibold"
              style={{ color: "#1A1A2E" }}
            >
              Suivi en temps réel
            </span>{" "}
            depuis l&apos;onglet « Mes demandes » de votre espace.
          </div>
        </li>
      </ul>

      {/* 3 CTAs */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <Link
          href="/rendez-vous?tab=pending"
          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(91,78,196,0.4)] focus-visible:ring-offset-2 flex-1"
          style={{
            background: "#5B4EC4",
            color: "#fff",
            boxShadow: "0 4px 16px rgba(91,78,196,0.30)",
          }}
        >
          <ClipboardList size={14} aria-hidden="true" />
          Voir mes demandes
          <ArrowRight size={12} aria-hidden="true" />
        </Link>
        <Link
          href="/accueil"
          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-colors hover:bg-[rgba(91,78,196,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(91,78,196,0.4)] focus-visible:ring-offset-2 flex-1"
          style={{
            color: "#5B4EC4",
            border: "1px solid rgba(91,78,196,0.30)",
          }}
        >
          <Home size={14} aria-hidden="true" />
          Retour à l&apos;accueil
        </Link>
        <Link
          href="/trouver-un-soignant"
          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors hover:bg-[rgba(26,26,46,0.04)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(91,78,196,0.4)] focus-visible:ring-offset-2 flex-1"
          style={{
            color: "#374151",
            border: "1px solid rgba(26,26,46,0.12)",
          }}
        >
          <Search size={14} aria-hidden="true" />
          Trouver un autre soignant
        </Link>
      </div>
    </section>
  );
}
