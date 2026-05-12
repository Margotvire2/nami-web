"use client";

/**
 * KnowledgeContentRenderer — rendu structuré du contenu d'une fiche RAG
 * dans le modal détail (`KnowledgeDetailModal`).
 *
 * ⚠️ La branche `source === "FFAB"` (ci-dessous) est confirmée dead code
 * (Phase 0). Elle est préservée INTACTE — fix réservé Phase 3.B.2.
 *
 * Helpers `headingEmoji` et `renderInline` exclusifs à ce composant.
 */

function headingEmoji(text: string): string {
  const t = text.toLowerCase();
  if (t.includes("définition") || t.includes("introduction") || t.includes("à propos")) return "📖";
  if (t.includes("diagnostic") || t.includes("critère") || t.includes("dsm") || t.includes("classification")) return "🔍";
  if (t.includes("traitement") || t.includes("prise en charge") || t.includes("thérapeutique") || t.includes("prescription")) return "💊";
  if (t.includes("signe") || t.includes("symptôme") || t.includes("clinique") || t.includes("manifestation")) return "🩺";
  if (t.includes("examen") || t.includes("bilan") || t.includes("biologie") || t.includes("paraclinique")) return "🧪";
  if (t.includes("compli") || t.includes("risque")) return "⚠️";
  if (t.includes("épidémio") || t.includes("prévalence") || t.includes("incidence") || t.includes("fréquence")) return "📊";
  if (t.includes("étiologie") || t.includes("cause") || t.includes("physiopathologie") || t.includes("mécanisme")) return "🔬";
  if (t.includes("pronostic") || t.includes("évolution") || t.includes("guérison")) return "📈";
  if (t.includes("prévention") || t.includes("prophylaxie") || t.includes("vaccination")) return "🛡️";
  if (t.includes("urgence") || t.includes("hospitalisation")) return "🚨";
  if (t.includes("suivi") || t.includes("surveillance") || t.includes("monitoring")) return "📅";
  if (t.includes("source") || t.includes("référence") || t.includes("bibliographie")) return "📚";
  if (t.includes("nutrition") || t.includes("alimentaire") || t.includes("apport")) return "🥗";
  if (t.includes("médicament") || t.includes("pharmaco") || t.includes("posologie") || t.includes("dose")) return "💉";
  if (t.includes("psycho") || t.includes("mental") || t.includes("psychiatrie") || t.includes("comportement")) return "🧠";
  if (t.includes("chirurgi")) return "🔪";
  return "";
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i} className="font-semibold text-gray-800">{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*"))
      return <em key={i} className="italic text-gray-600">{part.slice(1, -1)}</em>;
    if (part.startsWith("`") && part.endsWith("`"))
      return <code key={i} className="font-mono text-[11px] bg-gray-100 text-gray-700 px-1 py-0.5 rounded">{part.slice(1, -1)}</code>;
    return part;
  });
}

export default function KnowledgeContentRenderer({ content, source }: { content: string; source: string }) {
  // FFAB : slides séparés par "--- Slide X ---"
  if (source === "FFAB") {
    const slides = content.split(/^--- Slide \d+ ---$/m).filter(Boolean);
    return (
      <div className="space-y-3">
        {slides.map((slide, i) => {
          const lines = slide.trim().split("\n").filter(Boolean);
          const title = lines[0];
          const body = lines.slice(1).join("\n");
          return (
            <div key={i} className="rounded-xl bg-purple-50/60 border border-purple-100 p-4">
              <p className="text-[11px] font-bold text-purple-600 uppercase tracking-wide mb-2">
                📋 Slide {i + 1}{title ? ` — ${title}` : ""}
              </p>
              {body && (
                <div className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-line">{body}</div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // FICHE / HAS / ORPHANET / ALGORITHME : markdown structuré
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  const listBuffer: string[] = [];
  let key = 0;

  const flushList = () => {
    if (listBuffer.length === 0) return;
    elements.push(
      <ul key={key++} className="my-2 space-y-1 pl-0">
        {listBuffer.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-[13px] text-gray-600 leading-relaxed">
            <span className="mt-[6px] shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-300" />
            <span>{renderInline(item)}</span>
          </li>
        ))}
      </ul>
    );
    listBuffer.length = 0;
  };

  for (const line of lines) {
    if (line.startsWith("# ")) {
      flushList();
      const text = line.slice(2);
      const emoji = headingEmoji(text);
      elements.push(
        <h1 key={key++} className="flex items-center gap-2 text-base font-bold mt-6 mb-3 first:mt-0 text-gray-900">
          {emoji && <span className="text-lg">{emoji}</span>}
          <span>{text}</span>
        </h1>
      );
    } else if (line.startsWith("## ")) {
      flushList();
      const text = line.slice(3);
      const emoji = headingEmoji(text);
      elements.push(
        <h2 key={key++} className="flex items-center gap-2 text-sm font-semibold mt-5 mb-2 text-gray-900 border-l-[3px] border-indigo-200 pl-3 py-0.5">
          {emoji && <span>{emoji}</span>}
          <span>{text}</span>
        </h2>
      );
    } else if (line.startsWith("### ")) {
      flushList();
      const text = line.slice(4);
      const emoji = headingEmoji(text);
      elements.push(
        <h3 key={key++} className="flex items-center gap-1.5 text-[11px] font-bold mt-4 mb-1.5 text-indigo-500 uppercase tracking-wider">
          {emoji && <span className="normal-case text-[13px]">{emoji}</span>}
          <span>{text}</span>
        </h3>
      );
    } else if (line.match(/^\|[-:\s|]+\|/)) {
      flushList();
      // séparateur tableau — ignoré
    } else if (line.startsWith("|")) {
      flushList();
      const cells = line.split("|").filter(Boolean).map(c => c.trim());
      elements.push(
        <div key={key++} className="flex gap-3 text-[12px] py-1.5 border-b border-gray-50 last:border-0">
          {cells.map((c, j) => (
            <span key={j} className={j === 0 ? "font-semibold text-gray-700 w-40 shrink-0" : "text-gray-600 flex-1"}>
              {renderInline(c)}
            </span>
          ))}
        </div>
      );
    } else if (line.startsWith("- ") || line.startsWith("* ") || /^\d+\.\s/.test(line)) {
      const text = /^\d+\.\s/.test(line) ? line.replace(/^\d+\.\s/, "") : line.slice(2);
      listBuffer.push(text);
    } else if (line.trim() === "---") {
      flushList();
      elements.push(<hr key={key++} className="border-gray-100 my-4" />);
    } else if (line.trim() === "") {
      flushList();
      elements.push(<div key={key++} className="h-1.5" />);
    } else {
      flushList();
      elements.push(
        <p key={key++} className="text-[13px] leading-relaxed text-gray-600">
          {renderInline(line)}
        </p>
      );
    }
  }

  flushList();

  return <div className="space-y-0 px-1">{elements}</div>;
}
