import Link from "next/link";
import {
  Search,
  Calendar,
  FileText,
  Users,
  Check,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import type { Step, StepIconName } from "./steps-data";

const ICON_MAP: Record<StepIconName, LucideIcon> = {
  search: Search,
  calendar: Calendar,
  "file-text": FileText,
  users: Users,
};

interface CommentStepCardProps {
  step: Step;
  /** Inverse l'ordre numéro/contenu (gauche/droite alterné desktop) */
  reversed?: boolean;
}

export function CommentStepCard({ step, reversed = false }: CommentStepCardProps) {
  const Icon = ICON_MAP[step.iconName];
  const stepLabel = String(step.number).padStart(2, "0");

  return (
    <article
      className={`grid md:grid-cols-2 gap-8 md:gap-12 items-center ${
        reversed ? "md:[&>*:first-child]:order-2" : ""
      }`}
    >
      {/* Numéro géant + icône */}
      <div className="flex flex-col items-center md:items-start">
        <span
          className="text-7xl md:text-8xl font-extrabold leading-none mb-4 select-none"
          style={{
            color: "rgba(91,78,196,0.15)",
            fontFamily: "var(--font-jakarta)",
            letterSpacing: "-0.05em",
          }}
          aria-hidden="true"
        >
          {stepLabel}
        </span>
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl"
          style={{ background: "rgba(91,78,196,0.08)", color: "#5B4EC4" }}
          aria-hidden="true"
        >
          <Icon size={28} strokeWidth={1.8} />
        </div>
      </div>

      {/* Titre + description + bullets + CTA */}
      <div className="flex flex-col">
        <p
          className="text-xs font-bold uppercase tracking-widest mb-2"
          style={{ color: "#5B4EC4" }}
        >
          Étape {step.number}
        </p>
        <h3
          className="text-2xl md:text-3xl font-bold mb-3 tracking-tight"
          style={{
            color: "#1A1A2E",
            fontFamily: "var(--font-jakarta)",
            letterSpacing: "-0.02em",
          }}
        >
          {step.title}
        </h3>
        <p
          className="text-base md:text-lg mb-5"
          style={{ color: "#374151", lineHeight: 1.55 }}
        >
          {step.description}
        </p>
        <ul className="flex flex-col gap-2.5 mb-6">
          {step.bullets.map((bullet, i) => (
            <li
              key={i}
              className="flex items-start gap-3 text-sm md:text-base"
              style={{ color: "#374151", lineHeight: 1.5 }}
            >
              <Check
                size={18}
                strokeWidth={2.4}
                style={{ color: "#5B4EC4", flexShrink: 0, marginTop: 2 }}
                aria-hidden="true"
              />
              {bullet}
            </li>
          ))}
        </ul>
        {step.cta && (
          <Link
            href={step.cta.href}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold self-start transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(91,78,196,0.4)] focus-visible:ring-offset-2"
            style={{
              background: "#5B4EC4",
              color: "#fff",
              boxShadow: "0 2px 8px rgba(91,78,196,0.25)",
            }}
          >
            {step.cta.label}
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        )}
      </div>
    </article>
  );
}
