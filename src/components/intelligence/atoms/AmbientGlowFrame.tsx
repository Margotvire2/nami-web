"use client";

/**
 * AmbientGlowFrame — halo radial subtil + border gradient violet→teal pour
 * la card featured rang 1. Phase 3.B.3.
 *
 * Border : mask trick (WebkitMask + maskComposite) pour avoir un dégradé
 * uniquement sur la bordure. Halo : 2 radial-gradient blur 8px en zIndex -1.
 *
 * Sémantique distincte de `src/components/pitch/AmbientGlow` (sections pitch
 * dark publiques) — décision Phase 3.B.3 audit doublons.
 */

export default function AmbientGlowFrame() {
  return (
    <>
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: -1,
          borderRadius: 13,
          padding: 1,
          background:
            "linear-gradient(135deg, rgba(91,78,196,0.35), rgba(43,168,156,0.25))",
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          pointerEvents: "none",
          opacity: 0.7,
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: "-40px -30px",
          background:
            "radial-gradient(ellipse at 20% 0%, rgba(91,78,196,0.10), transparent 55%), radial-gradient(ellipse at 100% 100%, rgba(43,168,156,0.08), transparent 55%)",
          pointerEvents: "none",
          zIndex: -1,
          filter: "blur(8px)",
        }}
      />
    </>
  );
}
