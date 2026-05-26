"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { BOILERPLATE_COURT, BOILERPLATE_LONG } from "./presse-data";

type Variant = "court" | "long";

interface BoilerplateBlockProps {
  label: string;
  description: string;
  text: string;
  variant: Variant;
  copied: Variant | null;
  onCopy: (variant: Variant, text: string) => void;
}

function BoilerplateBlock({
  label,
  description,
  text,
  variant,
  copied,
  onCopy,
}: BoilerplateBlockProps) {
  const isCopied = copied === variant;

  return (
    <div
      className="rounded-2xl p-6 md:p-8"
      style={{
        background: "#fff",
        border: "1px solid rgba(26,26,46,0.06)",
        boxShadow: "0 1px 3px rgba(26,26,46,0.04)",
      }}
    >
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <h3
            className="text-lg md:text-xl font-bold"
            style={{
              color: "#1A1A2E",
              fontFamily: "var(--font-jakarta)",
              letterSpacing: "-0.01em",
            }}
          >
            {label}
          </h3>
          <p
            className="text-xs mt-1"
            style={{ color: "#6B7280" }}
          >
            {description}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onCopy(variant, text)}
          aria-label={`Copier le boilerplate ${label.toLowerCase()}`}
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(91,78,196,0.4)] focus-visible:ring-offset-2"
          style={{
            background: isCopied ? "#2BA89C" : "#5B4EC4",
            color: "#fff",
          }}
        >
          {isCopied ? (
            <>
              <Check size={14} aria-hidden="true" />
              Copié
            </>
          ) : (
            <>
              <Copy size={14} aria-hidden="true" />
              Copier
            </>
          )}
        </button>
      </div>

      <p
        className="mt-4 text-sm md:text-base whitespace-pre-line"
        style={{ color: "#374151", lineHeight: 1.7 }}
      >
        {text}
      </p>
    </div>
  );
}

export function PresseBoilerplate() {
  const [copied, setCopied] = useState<Variant | null>(null);

  const handleCopy = async (variant: Variant, text: string) => {
    try {
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard?.writeText
      ) {
        await navigator.clipboard.writeText(text);
        setCopied(variant);
        window.setTimeout(() => setCopied(null), 2000);
      }
    } catch {
      // Echec silencieux : l'utilisateur peut sélectionner manuellement.
    }
  };

  return (
    <section
      aria-labelledby="presse-boilerplate-title"
      className="py-16 md:py-24 px-4"
      style={{ background: "#FAFAF8" }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 md:mb-12">
          <h2
            id="presse-boilerplate-title"
            className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4"
            style={{
              color: "#1A1A2E",
              fontFamily: "var(--font-jakarta)",
              letterSpacing: "-0.03em",
            }}
          >
            Boilerplate Nami
          </h2>
          <p
            className="text-base md:text-lg max-w-2xl"
            style={{ color: "#6B7280" }}
          >
            À reprendre tel quel en fin d&apos;article ou de communiqué. Deux
            longueurs disponibles selon le format.
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <BoilerplateBlock
            label="Version courte"
            description="≈ 50 mots — encart fin d'article"
            text={BOILERPLATE_COURT}
            variant="court"
            copied={copied}
            onCopy={handleCopy}
          />
          <BoilerplateBlock
            label="Version longue"
            description="≈ 150 mots — fin de communiqué ou dossier de presse"
            text={BOILERPLATE_LONG}
            variant="long"
            copied={copied}
            onCopy={handleCopy}
          />
        </div>
      </div>
    </section>
  );
}
