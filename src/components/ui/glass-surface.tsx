import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type GlassVariant = "soft" | "medium" | "strong";

interface GlassSurfaceProps extends HTMLAttributes<HTMLDivElement> {
  variant?: GlassVariant;
  /**
   * Active le highlight spéculaire haut (gradient blanc translucide).
   * Recommandé pour les surfaces visibles plein écran (sheets, modals).
   * Désactivé par défaut sur les cards de liste pour éviter la surcharge visuelle.
   */
  withHighlight?: boolean;
  children?: ReactNode;
}

const variantClasses: Record<GlassVariant, string> = {
  soft: "glass-soft",
  medium: "glass-medium",
  strong: "glass-strong",
};

/**
 * Surface Liquid Glass × Nami — réutilisable pour le cockpit.
 *
 * Règle d'or :
 *   - Glass pour l'ambiance et la navigation (cards, sidebars, sheets)
 *   - Solid obligatoire pour la donnée clinique
 *     (priorité, statut, consentement, chiffres IMC/FC/glycémie)
 *
 * Le highlight ::before nécessite que les enfants soient en `relative z-2`
 * pour rester au-dessus du gradient. C'est géré automatiquement par le slot
 * `[&>*]:relative [&>*]:z-[2]` quand `withHighlight` est actif.
 *
 * @example
 *   <GlassSurface variant="soft" className="rounded-2xl p-4">
 *     <p>Contenu simple</p>
 *   </GlassSurface>
 *
 *   <GlassSurface variant="strong" withHighlight className="rounded-3xl p-6">
 *     <h2>Sheet de détail</h2>
 *   </GlassSurface>
 */
export const GlassSurface = forwardRef<HTMLDivElement, GlassSurfaceProps>(
  ({ variant = "medium", withHighlight = false, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative",
          variantClasses[variant],
          withHighlight && [
            "before:content-['']",
            "before:absolute",
            "before:inset-0",
            "before:rounded-[inherit]",
            "before:bg-gradient-to-b",
            "before:from-white/40",
            "before:to-transparent",
            "before:to-50%",
            "before:pointer-events-none",
            "before:z-[1]",
            "[&>*]:relative",
            "[&>*]:z-[2]",
          ],
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

GlassSurface.displayName = "GlassSurface";
