import { Heart, Stethoscope, Shield, Newspaper, Lock, Handshake, ArrowRight } from "lucide-react";
import type { ContactPoint, ContactIconName } from "./contact-data";

const ICONS: Record<ContactIconName, typeof Heart> = {
  Heart,
  Stethoscope,
  Shield,
  Newspaper,
  Lock,
  Handshake,
};

interface Props {
  point: ContactPoint;
}

export function ContactCard({ point }: Props) {
  const Icon = ICONS[point.iconName];
  const ariaLabel = `Envoyer un email à ${point.title.toLowerCase()} : ${point.email}`;

  return (
    <li role="listitem" className="list-none">
      <a
        href={`mailto:${point.email}`}
        aria-label={ariaLabel}
        className="group flex h-full flex-col rounded-xl border border-[#E8ECF4] bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#5B4EC4]/30 hover:shadow-[0_10px_30px_rgba(91,78,196,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFAF8]"
      >
        <span
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#EEEDFB] text-[#5B4EC4]"
          aria-hidden="true"
        >
          <Icon size={20} strokeWidth={2} />
        </span>

        <h3
          className="mt-5 text-lg font-semibold text-[#1A1A2E]"
          style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
        >
          {point.title}
        </h3>

        <p className="mt-2 flex-1 text-sm leading-relaxed text-[#6B7280]">
          {point.description}
        </p>

        <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#5B4EC4]">
          <span className="break-all">{point.emailLabel ?? point.email}</span>
          <ArrowRight
            size={14}
            strokeWidth={2.25}
            className="transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </span>
      </a>
    </li>
  );
}
