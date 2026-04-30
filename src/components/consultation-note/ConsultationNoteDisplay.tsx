"use client";

import { NoteHeader } from "./NoteHeader";
import { NoteSection, type ParsedSection } from "./NoteSection";
import { NoteMarkdown } from "./NoteMarkdown";
import { DraftBadge } from "./DraftBadge";
import { InlineEditableContent } from "./InlineEditableContent";

// ─── Emoji mapping ────────────────────────────────────────────────────────────

const SECTION_EMOJI_MAP: Record<string, string> = {
  patient: "👤",
  motif: "🩺",
  "motif de consultation": "🩺",
  anamnese: "📋",
  histoire: "📋",
  "examen clinique": "🔍",
  examen: "🔍",
  evaluation: "🧠",
  "impression clinique": "🧠",
  "plan de soin": "💊",
  plan: "💊",
  "decisions therapeutiques": "💊",
  prescriptions: "💊",
  "prochaines etapes": "📅",
  suivi: "📅",
  objectifs: "🎯",
  "donnees anthropometriques": "📏",
  anthropometrie: "📏",
  "rapport a l alimentation": "🌱",
  "journee type": "📋",
  differential: "🔀",
  documents: "📨",
};

function getEmojiForSection(title: string): string {
  const normalized = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
  return SECTION_EMOJI_MAP[normalized] ?? "📝";
}

// ─── Markdown parser ──────────────────────────────────────────────────────────

function parseMarkdownIntoSections(markdown: string): ParsedSection[] | null {
  const headerRegex = /^(#{2,3})\s+(.+)$/gm;
  const matches = [...markdown.matchAll(headerRegex)];
  if (matches.length === 0) return null;

  const sections: ParsedSection[] = matches.map((match, i) => {
    const level = match[1].length as 2 | 3;
    const title = match[2].trim();
    const start = (match.index ?? 0) + match[0].length;
    const end =
      i < matches.length - 1
        ? matches[i + 1].index ?? markdown.length
        : markdown.length;
    const content = markdown.slice(start, end).trim();
    return { level, title, emoji: getEmojiForSection(title), content, defaultOpen: false };
  });

  // First and last sections open by default
  if (sections.length > 0) {
    sections[0].defaultOpen = true;
    if (sections.length > 1) sections[sections.length - 1].defaultOpen = true;
  }

  return sections;
}

function rebuildFullMarkdown(
  sections: ParsedSection[],
  changedIndex: number,
  newContent: string
): string {
  return sections
    .map((s, i) => {
      const hashes = "#".repeat(s.level);
      return `${hashes} ${s.title}\n${i === changedIndex ? newContent : s.content}`;
    })
    .join("\n\n");
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthorInfo {
  firstName: string;
  lastName: string;
  specialty?: string;
  avatarUrl?: string;
}

export interface NoteForDisplay {
  id: string;
  content: string;
  type?: string;
  author?: AuthorInfo;
  createdAt?: string;
  isDraft: boolean;
  canEdit: boolean;
  onUpdate?: (newContent: string) => Promise<void>;
}

interface Props {
  note: NoteForDisplay;
  onViewTranscript?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ConsultationNoteDisplay({ note, onViewTranscript }: Props) {
  const content = note.content || "";
  const sections = parseMarkdownIntoSections(content);
  const canSave = note.canEdit && !!note.onUpdate;

  // Show full NoteHeader when author info is available (future contexts)
  // In ViewDossier the author is already shown by the card — don't duplicate
  const showFullHeader = !!note.author;

  // Show minimal badge row when no full header but there's something to display
  const showMinimalBadge = !showFullHeader && (note.isDraft || !!onViewTranscript);

  return (
    <div style={{ fontFamily: "var(--font-jakarta, 'Plus Jakarta Sans', sans-serif)" }}>
      {showFullHeader && (
        <NoteHeader
          author={note.author}
          createdAt={note.createdAt}
          isDraft={note.isDraft}
          onViewTranscript={onViewTranscript}
        />
      )}

      {showMinimalBadge && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", flexWrap: "wrap" }}>
          {note.isDraft && <DraftBadge />}
          {onViewTranscript && (
            <button
              onClick={onViewTranscript}
              style={{
                fontSize: "12px",
                color: "#5B4EC4",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.textDecoration = "underline";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.textDecoration = "none";
              }}
            >
              Voir transcription brute →
            </button>
          )}
        </div>
      )}

      {sections ? (
        <div>
          {sections.map((section, i) => (
            <NoteSection
              key={`${section.title}-${i}`}
              section={section}
              canEdit={canSave}
              onSave={
                note.onUpdate
                  ? async (newContent) => {
                      await note.onUpdate!(rebuildFullMarkdown(sections, i, newContent));
                    }
                  : undefined
              }
            />
          ))}
        </div>
      ) : canSave ? (
        <InlineEditableContent
          initialContent={content}
          onSave={note.onUpdate!}
          canEdit
          ariaLabel="Modifier la note"
        />
      ) : (
        <NoteMarkdown content={content} />
      )}
    </div>
  );
}
