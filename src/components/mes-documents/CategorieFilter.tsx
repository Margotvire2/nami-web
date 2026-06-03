"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  GRID_CATEGORIES,
  ALL_CATEGORY_META,
  type GridCategoryKey,
  type GridCounts,
} from "./grid-categories";

interface CategorieFilterProps {
  current: GridCategoryKey;
  counts: GridCounts;
}

/**
 * Chips switcher au-dessus de la sous-vue ?cat=. Permet de basculer
 * rapidement entre les 4 catégories grid + "Tous". Inclut un retour
 * "Toutes les catégories" qui ramène à la grid racine.
 */
export function CategorieFilter({ current, counts }: CategorieFilterProps) {
  const items: { key: GridCategoryKey; label: string; emoji: string }[] = [
    ...GRID_CATEGORIES.map((c) => ({ key: c.key, label: c.label, emoji: c.emoji })),
    { key: ALL_CATEGORY_META.key, label: ALL_CATEGORY_META.label, emoji: ALL_CATEGORY_META.emoji },
  ];

  return (
    <div style={{ marginBottom: 20, display: "flex", flexDirection: "column", gap: 12 }}>
      <Link
        href="/mes-documents"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 13,
          color: "var(--nami-text-muted)",
          textDecoration: "none",
          padding: "4px 0",
          width: "max-content",
        }}
        aria-label="Retour à toutes les catégories"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        Toutes les catégories
      </Link>

      <div
        role="group"
        aria-label="Filtrer par catégorie"
        style={{
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
        }}
      >
        {items.map((item) => {
          const active = item.key === current;
          const count = counts[item.key];
          return (
            <Link
              key={item.key}
              href={`/mes-documents?cat=${item.key}`}
              aria-current={active ? "page" : undefined}
              style={{
                padding: "6px 12px",
                borderRadius: 20,
                border: `1px solid ${active ? "var(--nami-primary)" : "var(--nami-border)"}`,
                background: active ? "rgba(91,78,196,0.08)" : "var(--nami-card)",
                color: active ? "var(--nami-primary)" : "var(--nami-text-muted)",
                fontSize: 12,
                fontWeight: active ? 600 : 400,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                transition: "background 120ms ease, border-color 120ms ease",
              }}
            >
              <span aria-hidden="true">{item.emoji}</span>
              {item.label}
              <span
                aria-hidden="true"
                style={{
                  fontSize: 11,
                  padding: "1px 6px",
                  borderRadius: 999,
                  background: active ? "rgba(91,78,196,0.16)" : "rgba(26,26,46,0.04)",
                  color: active ? "var(--nami-primary)" : "var(--nami-text-muted)",
                  fontWeight: 600,
                  minWidth: 18,
                  textAlign: "center",
                }}
              >
                {count}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
