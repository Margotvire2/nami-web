"use client";

/**
 * RagConsensusBlock — hero "Apparaît dans les sources" (Ligne 1 ambition V4).
 * Phase 3.B.3.
 *
 * Agrégation entités chiffrées multi-sources avec mini-bargraph par item et
 * sympathie cross-card (hover → highlight toutes les pills `data-crit`).
 *
 * Border violet→teal en mask trick + halo radial subtil (AmbientGlow inline).
 * Animation namiCardIn 520ms ease 40ms forwards.
 *
 * Items passés en props — agrégation backend = ticket dérivé D9. Pour
 * l'instant la page.tsx fournit MOCK_CONSENSUS hardcodé.
 */

import { NAMI } from "./atoms/_tokens";

export interface ConsensusItem {
  key: string;
  label: string;
  sourceCount: number;
  maxSources: number;
}

function ConsensusItemRow({
  item,
  onSympathy,
  onClick,
}: {
  item: ConsensusItem;
  onSympathy: (critKey: string, on: boolean) => void;
  onClick: () => void;
}) {
  return (
    <div
      data-crit-container={item.key}
      onMouseEnter={() => onSympathy(item.key, true)}
      onMouseLeave={() => onSympathy(item.key, false)}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "10px 14px",
        background: "#fff",
        border: `0.5px solid ${NAMI.border}`,
        borderRadius: 10,
        cursor: "pointer",
        transition: `all 180ms ${NAMI.ease}`,
      }}
    >
      <span
        data-crit={item.key}
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontWeight: 500,
          fontSize: 14,
          color: NAMI.text,
          background: NAMI.violetSoft,
          padding: "3px 9px",
          borderRadius: 5,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "-0.005em",
          transition: `background 320ms ${NAMI.ease}`,
        }}
      >
        {item.label}
      </span>
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontFamily: "Inter, system-ui, sans-serif",
          fontWeight: 400,
          fontSize: 11,
          color: NAMI.textFaint,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        <span style={{ display: "inline-flex", gap: 2 }}>
          {Array.from({ length: item.maxSources }).map((_, i) => (
            <span
              key={i}
              style={{
                width: 3,
                height: 10,
                borderRadius: 1,
                background:
                  i < item.sourceCount ? NAMI.violet : NAMI.borderStrong,
              }}
            />
          ))}
        </span>
        {item.sourceCount} sources
      </span>
    </div>
  );
}

export default function RagConsensusBlock({
  title,
  items,
  onSympathy,
  onClickCrit,
}: {
  title: string;
  items: ConsensusItem[];
  onSympathy: (critKey: string, on: boolean) => void;
  onClickCrit: (item: ConsensusItem) => void;
}) {
  if (items.length === 0) return null;

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #fff 0%, #FBFAF7 100%)",
        border: `0.5px solid ${NAMI.border}`,
        borderRadius: 14,
        padding: "18px 20px 16px",
        marginBottom: 18,
        position: "relative",
        overflow: "hidden",
        opacity: 0,
        transform: "translateY(8px)",
        animation: `namiCardIn 520ms ${NAMI.ease} 40ms forwards`,
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: -1,
          borderRadius: 15,
          padding: 1,
          background:
            "linear-gradient(135deg, rgba(91,78,196,0.40), rgba(43,168,156,0.28))",
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
          inset: "-50px -40px -50px -40px",
          background:
            "radial-gradient(ellipse at 15% 0%, rgba(91,78,196,0.10), transparent 55%), radial-gradient(ellipse at 100% 100%, rgba(43,168,156,0.08), transparent 55%)",
          pointerEvents: "none",
          zIndex: -1,
          filter: "blur(8px)",
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 14,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 500,
            fontSize: 10,
            color: NAMI.violet,
            letterSpacing: "0.10em",
            textTransform: "uppercase",
          }}
        >
          ▸ Apparaît dans les sources
        </span>
        <span
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 400,
            fontSize: 11,
            color: NAMI.textFaint,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          Agrégation des critères chiffrés présents dans 2+ sources
        </span>
      </div>

      <h3
        style={{
          fontFamily: "Plus Jakarta Sans, system-ui, sans-serif",
          fontWeight: 500,
          fontSize: 16,
          color: NAMI.text,
          margin: "0 0 14px",
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 8,
        }}
      >
        {items.map((item) => (
          <ConsensusItemRow
            key={item.key}
            item={item}
            onSympathy={onSympathy}
            onClick={() => onClickCrit(item)}
          />
        ))}
      </div>
    </div>
  );
}
