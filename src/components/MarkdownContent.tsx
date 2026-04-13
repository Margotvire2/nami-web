"use client";

import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

interface MarkdownContentProps {
  content: string;
  className?: string;
  /** compact : réduit les marges pour les contextes denses (cards, drawers) */
  compact?: boolean;
}

export function MarkdownContent({ content, className, compact = false }: MarkdownContentProps) {
  return (
    <div className={cn("min-w-0", className)}>
    <ReactMarkdown
      components={{
        h1: ({ children }) => (
          <h1 className={cn("font-bold text-neutral-900", compact ? "text-sm mt-3 mb-1" : "text-base mt-4 mb-2")}>
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className={cn("font-semibold text-neutral-800", compact ? "text-sm mt-2.5 mb-1" : "text-sm mt-4 mb-2")}>
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className={cn("font-medium text-neutral-700", compact ? "text-xs mt-2 mb-0.5" : "text-sm mt-3 mb-1")}>
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className={cn("text-neutral-600 leading-relaxed", compact ? "text-xs mb-1" : "text-sm mb-2")}>
            {children}
          </p>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-neutral-800">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic text-neutral-600">{children}</em>
        ),
        ul: ({ children }) => (
          <ul className={cn("list-disc list-inside text-neutral-600 space-y-0.5", compact ? "text-xs mb-1" : "text-sm mb-2")}>
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className={cn("list-decimal list-inside text-neutral-600 space-y-0.5", compact ? "text-xs mb-1" : "text-sm mb-2")}>
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className={compact ? "text-xs" : "text-sm"}>{children}</li>
        ),
        code: ({ children }) => (
          <code className="font-mono text-[11px] bg-neutral-100 text-neutral-700 px-1 py-0.5 rounded">
            {children}
          </code>
        ),
        hr: () => <hr className="border-neutral-100 my-2" />,
      }}
    >
      {content}
    </ReactMarkdown>
    </div>
  );
}
