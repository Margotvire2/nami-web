import { ChevronDown } from "lucide-react";
import type { FAQItem } from "./faq-data";

/**
 * Parseur markdown léger (sans lib externe) :
 * - **gras** → <strong>
 * - *italique* → <em>
 * - [texte](url) → <a> (interne uniquement, sécurité)
 *
 * Échappement HTML basique pour les caractères dangereux.
 * Cas d'usage : FAQ statique trustée (pas user input) — pas d'XSS.
 */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderMarkdown(md: string): string {
  let html = escapeHtml(md);
  // Liens [texte](url) — autorise uniquement / interne, http(s) externe avec rel
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_, text: string, url: string) => {
      const isInternal = url.startsWith("/");
      const safeUrl = url.replace(/"/g, "");
      const attrs = isInternal
        ? `href="${safeUrl}"`
        : `href="${safeUrl}" target="_blank" rel="noopener noreferrer"`;
      return `<a ${attrs} style="color:#5B4EC4;text-decoration:underline;text-underline-offset:3px">${text}</a>`;
    },
  );
  // Gras **text** (sur du HTML déjà échappé)
  html = html.replace(
    /\*\*([^*]+)\*\*/g,
    "<strong style=\"font-weight:600;color:#1A1A2E\">$1</strong>",
  );
  // Italique *text* (après gras pour éviter conflit)
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  return html;
}

interface AideFAQItemProps {
  item: FAQItem;
  /** ID région ARIA parent (catégorie) pour aria-labelledby */
  categoryId: string;
}

export function AideFAQItem({ item, categoryId }: AideFAQItemProps) {
  const summaryId = `${categoryId}-${item.id}-summary`;
  const contentId = `${categoryId}-${item.id}-content`;

  return (
    <details
      className="group rounded-xl transition-all"
      style={{
        background: "#fff",
        border: "1px solid rgba(26,26,46,0.06)",
        boxShadow: "0 1px 3px rgba(26,26,46,0.03)",
      }}
    >
      <summary
        id={summaryId}
        className="flex items-center justify-between gap-3 px-4 py-4 cursor-pointer list-none rounded-xl transition-colors hover:bg-[rgba(91,78,196,0.02)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(91,78,196,0.4)]"
        style={{ color: "#1A1A2E" }}
      >
        <span className="text-sm md:text-base font-medium leading-snug flex-1">
          {item.question}
        </span>
        <ChevronDown
          size={18}
          className="shrink-0 transition-transform duration-200 group-open:rotate-180"
          style={{ color: "#5B4EC4" }}
          aria-hidden="true"
        />
      </summary>
      <div
        id={contentId}
        className="px-4 pb-4 text-sm leading-relaxed"
        style={{ color: "#374151" }}
        dangerouslySetInnerHTML={{ __html: renderMarkdown(item.answerMarkdown) }}
      />
    </details>
  );
}
