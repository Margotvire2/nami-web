"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { FAQ_CATEGORIES } from "./faq-data";
import { AideHero } from "./AideHero";
import { AideSearchBar } from "./AideSearchBar";
import { AideCategorySection } from "./AideCategorySection";
import { AideContactCTA } from "./AideContactCTA";

export default function AidePageClient() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAQ_CATEGORIES;
    return FAQ_CATEGORIES
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) =>
            item.question.toLowerCase().includes(q) ||
            item.answerMarkdown.toLowerCase().includes(q) ||
            item.keywords.some((k) => k.toLowerCase().includes(q)),
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [query]);

  const totalResults = filtered.reduce((acc, c) => acc + c.items.length, 0);
  const hasQuery = query.trim().length > 0;

  return (
    <div
      className="max-w-3xl mx-auto py-8 md:py-12 px-2"
      style={{ minHeight: "100vh" }}
    >
      <AideHero />
      <AideSearchBar
        value={query}
        onChange={setQuery}
        totalResults={totalResults}
        hasQuery={hasQuery}
      />

      {filtered.length === 0 && hasQuery ? (
        <AideEmptyState query={query} onClear={() => setQuery("")} />
      ) : (
        filtered.map((cat) => (
          <AideCategorySection key={cat.id} category={cat} />
        ))
      )}

      <AideContactCTA />
    </div>
  );
}

function AideEmptyState({
  query,
  onClear,
}: {
  query: string;
  onClear: () => void;
}) {
  return (
    <div
      role="status"
      className="text-center py-16 px-6 rounded-2xl mb-12"
      style={{
        background: "rgba(91,78,196,0.03)",
        border: "1px dashed rgba(91,78,196,0.2)",
      }}
    >
      <Search
        size={32}
        className="mx-auto mb-3"
        style={{ color: "#9CA3AF", opacity: 0.6 }}
        aria-hidden="true"
      />
      <p
        className="text-base font-semibold mb-1"
        style={{ color: "#1A1A2E" }}
      >
        Aucune réponse pour « {query} »
      </p>
      <p
        className="text-sm mb-5"
        style={{ color: "#6B7280" }}
      >
        Essayez avec d&apos;autres mots, ou contactez-nous ci-dessous.
      </p>
      <button
        type="button"
        onClick={onClear}
        className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors hover:bg-[rgba(91,78,196,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(91,78,196,0.4)]"
        style={{
          color: "#5B4EC4",
          border: "1.5px solid rgba(91,78,196,0.2)",
          background: "transparent",
        }}
      >
        Effacer la recherche
      </button>
    </div>
  );
}
