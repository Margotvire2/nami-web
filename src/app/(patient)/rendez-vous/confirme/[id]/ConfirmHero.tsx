"use client";

import { useEffect, useRef } from "react";
import { CheckCircle2 } from "lucide-react";

interface ConfirmHeroProps {
  providerName?: string | null;
}

export function ConfirmHero({ providerName }: ConfirmHeroProps) {
  const titleRef = useRef<HTMLHeadingElement | null>(null);

  // Focus automatique sur le H1 au chargement pour les lecteurs d'écran.
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const subtitle = providerName
    ? `Le Dr ${providerName} y répondra dans les 48 h ouvrées.`
    : "Le soignant y répondra dans les 48 h ouvrées.";

  return (
    <header
      aria-live="polite"
      className="rounded-2xl p-8 md:p-12 text-center relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #5B4EC4 0%, #2BA89C 100%)",
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, rgba(255,255,255,0.18) 0%, rgba(91,78,196,0) 70%)",
        }}
      />

      <div className="relative">
        <div
          className="inline-flex items-center justify-center rounded-full mx-auto mb-6 animate-in"
          style={{
            width: 72,
            height: 72,
            background: "rgba(255,255,255,0.18)",
            border: "2px solid rgba(255,255,255,0.30)",
            color: "#fff",
            animation: "scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both",
          }}
          aria-hidden="true"
        >
          <CheckCircle2 size={36} strokeWidth={2.2} />
        </div>

        <h1
          ref={titleRef}
          tabIndex={-1}
          className="text-2xl md:text-4xl font-extrabold tracking-tight mb-3 focus:outline-none"
          style={{
            color: "#fff",
            fontFamily: "var(--font-jakarta)",
            letterSpacing: "-0.03em",
            lineHeight: 1.15,
          }}
        >
          Votre demande a bien été envoyée
        </h1>

        <p
          className="text-base md:text-lg max-w-md mx-auto"
          style={{ color: "rgba(255,255,255,0.85)", lineHeight: 1.55 }}
        >
          {subtitle}
        </p>
      </div>

      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0.6); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </header>
  );
}
