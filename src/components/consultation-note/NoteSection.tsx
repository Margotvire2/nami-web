"use client";

import { useState } from "react";
import { NoteMarkdown } from "./NoteMarkdown";
import { InlineEditableContent } from "./InlineEditableContent";

export interface ParsedSection {
  level: 2 | 3;
  title: string;
  emoji: string;
  content: string;
  defaultOpen: boolean;
}

interface Props {
  section: ParsedSection;
  canEdit: boolean;
  onSave?: (newSectionContent: string) => Promise<void>;
}

export function NoteSection({ section, canEdit, onSave }: Props) {
  const [isOpen, setIsOpen] = useState(section.defaultOpen);

  return (
    <div style={{ borderBottom: "1px solid rgba(26,26,46,0.06)" }}>
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "10px 4px",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          borderRadius: "6px",
          transition: "background 150ms ease",
        }}
        onMouseEnter={(e) => {
          if (!isOpen) (e.currentTarget as HTMLButtonElement).style.background = "rgba(91,78,196,0.04)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "none";
        }}
      >
        <span style={{ fontSize: "14px", flexShrink: 0, lineHeight: 1 }}>{section.emoji}</span>
        <span style={{
          flex: 1,
          fontSize: section.level === 2 ? "13px" : "12px",
          fontWeight: 600,
          color: "#1A1A2E",
          fontFamily: "var(--font-jakarta, 'Plus Jakarta Sans', sans-serif)",
          lineHeight: 1.3,
        }}>
          {section.title}
        </span>
        <span style={{
          fontSize: "11px",
          color: "#8A8A96",
          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 180ms ease-out",
          flexShrink: 0,
          display: "inline-block",
          lineHeight: 1,
        }}>
          ▾
        </span>
      </button>

      {isOpen && (
        <div style={{ paddingBottom: "12px", paddingLeft: "4px" }}>
          {canEdit && onSave ? (
            <InlineEditableContent
              initialContent={section.content}
              onSave={onSave}
              canEdit
              ariaLabel={`Modifier la section ${section.title}`}
            />
          ) : (
            <NoteMarkdown content={section.content} />
          )}
        </div>
      )}
    </div>
  );
}
