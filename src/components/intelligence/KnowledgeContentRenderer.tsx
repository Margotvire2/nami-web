"use client";

/**
 * KnowledgeContentRenderer — rendu structuré V4 (Phase 3.B.3).
 *
 * Préserve la logique Phase 3.B.2 INTACTE :
 *   - cleanRagContent() en preprocess universel
 *   - hasSlideMarkers() pour basculer sur SlideBlock visuel
 *   - splitSlides() pour découper les slide-decks
 *
 * Changement Phase 3.B.3 : visuel passé en palette Nami stricte (variables
 * inline NAMI tokens), suppression des Tailwind purple/indigo génériques.
 * SlideBlock formaté avec eyebrow violet uppercase + body lisible + dashed
 * separator entre slides. Markdown headings/lists/tables ré-stylés Nami.
 *
 * Helpers `headingEmoji` et `renderInline` conservés.
 */

import { Fragment, type ReactNode } from "react";
import { cleanRagContent, hasSlideMarkers, splitSlides } from "@/lib/ragContentCleanup";
import { NAMI } from "./atoms/_tokens";

function headingEmoji(text: string): string {
  const t = text.toLowerCase();
  if (t.includes("définition") || t.includes("introduction") || t.includes("à propos")) return "📖";
  if (t.includes("diagnostic") || t.includes("critère") || t.includes("dsm") || t.includes("classification")) return "🔍";
  if (t.includes("traitement") || t.includes("prise en charge") || t.includes("thérapeutique") || t.includes("prescription")) return "💊";
  if (t.includes("signe") || t.includes("symptôme") || t.includes("clinique") || t.includes("manifestation")) return "🩺";
  if (t.includes("examen") || t.includes("bilan") || t.includes("biologie") || t.includes("paraclinique")) return "🧪";
  if (t.includes("compli")) return "⚠️";
  if (t.includes("épidémio") || t.includes("prévalence") || t.includes("incidence") || t.includes("fréquence")) return "📊";
  if (t.includes("étiologie") || t.includes("cause") || t.includes("physiopathologie") || t.includes("mécanisme")) return "🔬";
  if (t.includes("pronostic") || t.includes("évolution") || t.includes("guérison")) return "📈";
  if (t.includes("prévention") || t.includes("prophylaxie") || t.includes("vaccination")) return "🛡️";
  if (t.includes("hospitalisation")) return "🚨";
  if (t.includes("source") || t.includes("référence") || t.includes("bibliographie")) return "📚";
  if (t.includes("nutrition") || t.includes("alimentaire") || t.includes("apport")) return "🥗";
  if (t.includes("médicament") || t.includes("pharmaco") || t.includes("posologie") || t.includes("dose")) return "💉";
  if (t.includes("psycho") || t.includes("mental") || t.includes("psychiatrie") || t.includes("comportement")) return "🧠";
  if (t.includes("chirurgi")) return "🔪";
  return "";
}

function renderInline(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} style={{ fontWeight: 600, color: NAMI.text }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={i} style={{ fontStyle: "italic", color: NAMI.textMuted }}>
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          style={{
            fontFamily: "Inter, monospace",
            fontSize: 11,
            background: NAMI.bgAlt,
            color: NAMI.textMuted,
            padding: "1px 5px",
            borderRadius: 4,
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function KnowledgeContentRenderer({
  content,
  source: _source,
}: {
  content: string;
  source: string;
}) {
  const cleaned = cleanRagContent(content);

  // Slide-deck : détection par contenu (Phase 3.B.2 acquis)
  if (hasSlideMarkers(cleaned)) {
    const slides = splitSlides(cleaned);
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          fontFamily: "Plus Jakarta Sans, system-ui, sans-serif",
        }}
      >
        {slides.map((slide, idx) => (
          <div
            key={slide.slideNumber}
            style={{
              paddingTop: idx === 0 ? 0 : 14,
              borderTop: idx === 0 ? "none" : `0.5px dashed ${NAMI.borderStrong}`,
            }}
          >
            <div
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
                fontWeight: 600,
                fontSize: 10,
                color: NAMI.violet,
                letterSpacing: "0.10em",
                textTransform: "uppercase",
                marginBottom: 6,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              ▸ Slide {slide.slideNumber}
            </div>
            {slide.title && (
              <h4
                style={{
                  fontFamily: "Plus Jakarta Sans, system-ui, sans-serif",
                  fontWeight: 500,
                  fontSize: 14,
                  color: NAMI.text,
                  margin: "0 0 8px",
                  letterSpacing: "-0.005em",
                }}
              >
                {slide.title}
              </h4>
            )}
            {slide.content && (
              <div
                style={{
                  fontFamily: "Plus Jakarta Sans, system-ui, sans-serif",
                  fontWeight: 400,
                  fontSize: 13,
                  lineHeight: 1.65,
                  color: NAMI.textMuted,
                  whiteSpace: "pre-line",
                  maxWidth: "60ch",
                }}
              >
                {slide.content}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Markdown structuré (HAS / fiches / algos)
  const lines = cleaned.split("\n");
  const elements: ReactNode[] = [];
  const listBuffer: string[] = [];
  let key = 0;

  const flushList = () => {
    if (listBuffer.length === 0) return;
    const items = listBuffer.slice();
    listBuffer.length = 0;
    elements.push(
      <ul key={key++} style={{ margin: "8px 0", padding: 0, listStyle: "none" }}>
        {items.map((item, i) => (
          <li
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              fontFamily: "Plus Jakarta Sans, system-ui, sans-serif",
              fontWeight: 400,
              fontSize: 13,
              lineHeight: 1.65,
              color: NAMI.textMuted,
              padding: "2px 0",
            }}
          >
            <span
              aria-hidden
              style={{
                marginTop: 7,
                flexShrink: 0,
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: NAMI.violetSoft3,
              }}
            />
            <span>{renderInline(item)}</span>
          </li>
        ))}
      </ul>,
    );
  };

  for (const line of lines) {
    if (line.startsWith("# ")) {
      flushList();
      const text = line.slice(2);
      const emoji = headingEmoji(text);
      elements.push(
        <h1
          key={key++}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontFamily: "Plus Jakarta Sans, system-ui, sans-serif",
            fontSize: 16,
            fontWeight: 600,
            color: NAMI.text,
            margin: "20px 0 10px",
            letterSpacing: "-0.01em",
          }}
        >
          {emoji && <span aria-hidden style={{ fontSize: 18 }}>{emoji}</span>}
          <span>{text}</span>
        </h1>,
      );
    } else if (line.startsWith("## ")) {
      flushList();
      const text = line.slice(3);
      const emoji = headingEmoji(text);
      elements.push(
        <h2
          key={key++}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontFamily: "Plus Jakarta Sans, system-ui, sans-serif",
            fontSize: 14,
            fontWeight: 600,
            color: NAMI.text,
            margin: "16px 0 6px",
            paddingLeft: 10,
            borderLeft: `3px solid ${NAMI.violetSoft3}`,
            letterSpacing: "-0.005em",
          }}
        >
          {emoji && <span aria-hidden>{emoji}</span>}
          <span>{text}</span>
        </h2>,
      );
    } else if (line.startsWith("### ")) {
      flushList();
      const text = line.slice(4);
      const emoji = headingEmoji(text);
      elements.push(
        <h3
          key={key++}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: 11,
            fontWeight: 600,
            color: NAMI.violet,
            margin: "14px 0 4px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {emoji && <span aria-hidden style={{ textTransform: "none", fontSize: 13 }}>{emoji}</span>}
          <span>{text}</span>
        </h3>,
      );
    } else if (line.match(/^\|[-:\s|]+\|/)) {
      flushList();
      // séparateur tableau — ignoré
    } else if (line.startsWith("|")) {
      flushList();
      const cells = line.split("|").filter(Boolean).map((c) => c.trim());
      elements.push(
        <div
          key={key++}
          style={{
            display: "flex",
            gap: 12,
            fontFamily: "Plus Jakarta Sans, system-ui, sans-serif",
            fontSize: 12,
            padding: "6px 0",
            borderBottom: `0.5px solid ${NAMI.border}`,
          }}
        >
          {cells.map((c, j) => (
            <span
              key={j}
              style={
                j === 0
                  ? {
                      fontWeight: 600,
                      color: NAMI.text,
                      width: 160,
                      flexShrink: 0,
                    }
                  : { color: NAMI.textMuted, flex: 1 }
              }
            >
              {renderInline(c)}
            </span>
          ))}
        </div>,
      );
    } else if (line.startsWith("- ") || line.startsWith("* ") || /^\d+\.\s/.test(line)) {
      const text = /^\d+\.\s/.test(line) ? line.replace(/^\d+\.\s/, "") : line.slice(2);
      listBuffer.push(text);
    } else if (line.trim() === "---") {
      flushList();
      elements.push(
        <hr
          key={key++}
          style={{
            border: "none",
            borderTop: `0.5px solid ${NAMI.border}`,
            margin: "14px 0",
          }}
        />,
      );
    } else if (line.trim() === "") {
      flushList();
      elements.push(<div key={key++} style={{ height: 6 }} />);
    } else {
      flushList();
      elements.push(
        <p
          key={key++}
          style={{
            fontFamily: "Plus Jakarta Sans, system-ui, sans-serif",
            fontWeight: 400,
            fontSize: 13,
            lineHeight: 1.65,
            color: NAMI.textMuted,
            margin: "4px 0",
            maxWidth: "60ch",
          }}
        >
          {renderInline(line)}
        </p>,
      );
    }
  }

  flushList();

  return <div style={{ padding: "0 2px" }}>{elements}</div>;
}
