"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  content: string;
  compact?: boolean;
}

export function NoteMarkdown({ content, compact = false }: Props) {
  return (
    <div style={{ minWidth: 0 }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 style={{
              fontFamily: "var(--font-jakarta, 'Plus Jakarta Sans', sans-serif)",
              fontWeight: 700,
              color: "#1A1A2E",
              fontSize: compact ? "13px" : "15px",
              margin: compact ? "10px 0 4px" : "16px 0 8px",
              lineHeight: 1.3,
            }}>{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 style={{
              fontFamily: "var(--font-jakarta, 'Plus Jakarta Sans', sans-serif)",
              fontWeight: 600,
              color: "#1A1A2E",
              fontSize: compact ? "12px" : "13px",
              margin: compact ? "8px 0 3px" : "12px 0 6px",
              lineHeight: 1.3,
            }}>{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 style={{
              fontFamily: "var(--font-jakarta, 'Plus Jakarta Sans', sans-serif)",
              fontWeight: 600,
              color: "#4A4A5A",
              fontSize: "12px",
              margin: compact ? "6px 0 2px" : "10px 0 4px",
              lineHeight: 1.3,
            }}>{children}</h3>
          ),
          p: ({ children }) => (
            <p style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              color: "#4A4A5A",
              lineHeight: 1.6,
              fontSize: compact ? "12px" : "13px",
              margin: compact ? "2px 0" : "0 0 8px",
            }}>{children}</p>
          ),
          strong: ({ children }) => (
            <strong style={{ fontWeight: 600, color: "#1A1A2E" }}>{children}</strong>
          ),
          em: ({ children }) => (
            <em style={{ fontStyle: "italic", color: "#4A4A5A" }}>{children}</em>
          ),
          ul: ({ children }) => (
            <ul style={{
              listStyleType: "disc",
              paddingLeft: "18px",
              color: "#4A4A5A",
              fontSize: compact ? "12px" : "13px",
              margin: compact ? "2px 0" : "0 0 8px",
              fontFamily: "'Inter', system-ui, sans-serif",
            }}>{children}</ul>
          ),
          ol: ({ children }) => (
            <ol style={{
              listStyleType: "decimal",
              paddingLeft: "18px",
              color: "#4A4A5A",
              fontSize: compact ? "12px" : "13px",
              margin: compact ? "2px 0" : "0 0 8px",
              fontFamily: "'Inter', system-ui, sans-serif",
            }}>{children}</ol>
          ),
          li: ({ children }) => (
            <li style={{ marginBottom: "3px", lineHeight: 1.5 }}>{children}</li>
          ),
          hr: () => (
            <hr style={{ border: "none", borderTop: "1px solid rgba(26,26,46,0.06)", margin: "12px 0" }} />
          ),
          code: ({ children }) => (
            <code style={{
              fontFamily: "monospace",
              fontSize: "11px",
              background: "#F5F3EF",
              color: "#4A4A5A",
              padding: "1px 5px",
              borderRadius: "4px",
            }}>{children}</code>
          ),
          blockquote: ({ children }) => (
            <blockquote style={{
              borderLeft: "3px solid #5B4EC4",
              paddingLeft: "12px",
              margin: "8px 0",
              color: "#4A4A5A",
              fontFamily: "Playfair Display, Georgia, serif",
              fontStyle: "italic",
              fontSize: "13px",
            }}>{children}</blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
