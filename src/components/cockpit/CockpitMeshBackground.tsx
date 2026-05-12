"use client";

/**
 * CockpitMeshBackground — mesh animé pour les pages cockpit avec Liquid Glass.
 * Phase 3.B.5 Vague 1.
 *
 * 4 blobs (violet/teal/coral) flottant en boucle 25s (keyframes `nami-float`
 * définies dans globals.css). Positionné `fixed inset-0 z-index -1`,
 * `pointer-events: none` — purement décoratif, derrière tout le contenu.
 *
 * À monter UNE FOIS par page cockpit utilisant le DS Liquid Glass × Nami.
 * Sans le mesh, le verre est posé sur du blanc statique → effet plat.
 */
export default function CockpitMeshBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <div
        className="nami-mesh-blob"
        style={{
          top: "-10%",
          left: "-10%",
          width: "50vw",
          height: "50vw",
          background: "rgba(91, 78, 196, 0.5)",
          animationDelay: "0s",
        }}
      />
      <div
        className="nami-mesh-blob"
        style={{
          top: "20%",
          right: "-15%",
          width: "45vw",
          height: "45vw",
          background: "rgba(43, 168, 156, 0.45)",
          animationDelay: "-8s",
        }}
      />
      <div
        className="nami-mesh-blob"
        style={{
          bottom: "-15%",
          left: "20%",
          width: "50vw",
          height: "50vw",
          background: "rgba(224, 123, 92, 0.35)",
          animationDelay: "-14s",
        }}
      />
      <div
        className="nami-mesh-blob"
        style={{
          top: "40%",
          left: "40%",
          width: "40vw",
          height: "40vw",
          background: "rgba(91, 78, 196, 0.4)",
          animationDelay: "-20s",
        }}
      />
    </div>
  );
}
