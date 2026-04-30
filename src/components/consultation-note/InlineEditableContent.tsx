"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { NoteMarkdown } from "./NoteMarkdown";

type SaveState = "idle" | "saving" | "saved" | "error";

interface Props {
  initialContent: string;
  onSave: (newContent: string) => Promise<void>;
  canEdit: boolean;
  ariaLabel?: string;
  saveDebounceMs?: number;
}

export function InlineEditableContent({
  initialContent,
  onSave,
  canEdit,
  ariaLabel,
  saveDebounceMs = 500,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(initialContent);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [savedAgo, setSavedAgo] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const originalRef = useRef(initialContent);

  useEffect(() => {
    originalRef.current = initialContent;
    setDraft(initialContent);
  }, [initialContent]);

  function adjustHeight() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }

  useEffect(() => {
    if (isEditing) {
      adjustHeight();
      textareaRef.current?.focus();
    }
  }, [isEditing]);

  const doSave = useCallback(
    async (content: string) => {
      if (content === originalRef.current) return;
      setSaveState("saving");
      setSavedAgo(0);
      try {
        await onSave(content);
        originalRef.current = content;
        setSaveState("saved");
      } catch {
        setSaveState("error");
      }
    },
    [onSave]
  );

  // Saved-ago ticker
  useEffect(() => {
    if (saveState !== "saved") return;
    const interval = setInterval(() => setSavedAgo((v) => v + 1), 1000);
    return () => clearInterval(interval);
  }, [saveState]);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setDraft(e.target.value);
    adjustHeight();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSave(e.target.value), saveDebounceMs);
  }

  function handleBlur() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    doSave(draft).finally(() => setIsEditing(false));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Escape") {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      setDraft(originalRef.current);
      setIsEditing(false);
      setSaveState("idle");
    }
  }

  if (!canEdit) {
    return <NoteMarkdown content={initialContent} />;
  }

  const saveLabel =
    saveState === "saving"
      ? "Enregistrement…"
      : saveState === "saved"
      ? `Enregistré · il y a ${savedAgo}s`
      : saveState === "error"
      ? "Erreur — modification non sauvegardée"
      : null;

  if (isEditing) {
    return (
      <div>
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          aria-label={ariaLabel ?? "Modifier le contenu"}
          style={{
            width: "100%",
            minHeight: "80px",
            padding: "10px 12px",
            border: "1.5px solid #5B4EC4",
            borderRadius: "8px",
            background: "#FAFAF8",
            fontSize: "13px",
            lineHeight: 1.6,
            fontFamily: "'Inter', system-ui, sans-serif",
            color: "#1A1A2E",
            resize: "none",
            outline: "none",
            boxShadow: "0 0 0 3px rgba(91,78,196,0.12)",
            boxSizing: "border-box",
            overflow: "hidden",
            display: "block",
          }}
        />
        {saveLabel && (
          <p style={{
            fontSize: "11px",
            color: saveState === "error" ? "#DC2626" : "#8A8A96",
            fontFamily: "'Inter', system-ui, sans-serif",
            marginTop: "4px",
            textAlign: "right",
          }}>
            {saveLabel}
          </p>
        )}
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsEditing(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsEditing(true);
          }
        }}
        title="Cliquer pour modifier"
        aria-label={ariaLabel ?? "Modifier le contenu"}
        style={{
          borderRadius: "8px",
          padding: "6px",
          margin: "-6px",
          cursor: "text",
          transition: "background 150ms ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.background = "rgba(91,78,196,0.03)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.background = "transparent";
        }}
      >
        <NoteMarkdown content={draft} />
      </div>
      {saveLabel && (
        <p style={{
          fontSize: "11px",
          color: saveState === "error" ? "#DC2626" : "#8A8A96",
          fontFamily: "'Inter', system-ui, sans-serif",
          marginTop: "4px",
          textAlign: "right",
        }}>
          {saveLabel}
        </p>
      )}
    </div>
  );
}
