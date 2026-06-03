"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Paperclip, Send } from "lucide-react";

export function ProComposer({
  onSend,
  placeholder,
  disabled,
}: {
  onSend: (text: string) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  const [text, setText] = useState("");

  function submit() {
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="bg-muted/30 rounded-xl p-3 focus-within:ring-2 focus-within:ring-primary/20 transition-shadow">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={1}
        disabled={disabled}
        className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none min-h-[24px] max-h-[100px] disabled:opacity-50"
        style={{ fieldSizing: "content" } as React.CSSProperties}
      />
      <div className="flex items-center justify-between mt-1.5">
        <div className="flex items-center gap-1">
          <button
            disabled
            title="Pièces jointes — prochainement"
            className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground/40 cursor-not-allowed"
          >
            <Paperclip size={14} />
          </button>
        </div>
        <button
          onClick={submit}
          disabled={!text.trim() || disabled}
          className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
            text.trim() && !disabled
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground",
          )}
        >
          <Send size={13} />
        </button>
      </div>
    </div>
  );
}
