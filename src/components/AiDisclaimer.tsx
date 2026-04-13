"use client";

import { cn } from "@/lib/utils";
import { AlertTriangle, Info } from "lucide-react";

interface AiDisclaimerProps {
  variant?: "inline" | "banner" | "compact";
  className?: string;
}

/**
 * Mention légale obligatoire sur tout contenu généré de manière assistée.
 * Conforme MDR/DM — évite toute qualification de dispositif médical actif.
 */
export function AiDisclaimer({ variant = "inline", className }: AiDisclaimerProps) {
  if (variant === "compact") {
    return (
      <span className={cn("inline-flex items-center gap-1 text-[10px] text-amber-600 font-medium", className)}>
        <AlertTriangle size={9} />
        Brouillon — à valider par le professionnel de santé
      </span>
    );
  }

  if (variant === "banner") {
    return (
      <div className={cn(
        "flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2.5",
        className
      )}>
        <Info size={13} className="text-amber-600 mt-0.5 shrink-0" />
        <p className="text-[11px] text-amber-700 leading-snug">
          Ce contenu est généré de manière assistée à partir des informations du dossier.{" "}
          <strong>Il ne constitue pas un avis médical.</strong>{" "}
          Toute décision clinique reste sous la responsabilité du professionnel de santé.
        </p>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center gap-1.5 text-[10px] text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-2 py-1",
      className
    )}>
      <AlertTriangle size={10} className="shrink-0" />
      <span>Synthèse assistée — à relire et valider avant toute utilisation clinique</span>
    </div>
  );
}
