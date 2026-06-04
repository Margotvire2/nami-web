import {
  Compass,
  Smartphone,
  Wallet,
  Shield,
  Stethoscope,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { FAQSectionData, FAQIconName } from "@/data/faq-items";
import { AccordionItem } from "./AccordionItem";

const ICON_MAP: Record<FAQIconName, LucideIcon> = {
  compass: Compass,
  smartphone: Smartphone,
  wallet: Wallet,
  shield: Shield,
  stethoscope: Stethoscope,
  users: Users,
};

interface FAQSectionProps {
  section: FAQSectionData;
}

export function FAQSection({ section }: FAQSectionProps) {
  const Icon = ICON_MAP[section.iconName];
  const headingId = `faq-section-${section.id}`;

  return (
    <section
      role="region"
      aria-labelledby={headingId}
      className="mb-10 md:mb-12"
    >
      <div className="flex items-start gap-3 mb-5">
        <div
          className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-lg"
          style={{ background: "rgba(91,78,196,0.08)", color: "#5B4EC4" }}
          aria-hidden="true"
        >
          <Icon size={20} strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0">
          <h2
            id={headingId}
            className="text-xl md:text-2xl font-bold tracking-tight"
            style={{
              color: "#1A1A2E",
              letterSpacing: "-0.02em",
              fontFamily: "var(--font-jakarta)",
            }}
          >
            {section.title}
          </h2>
          <p className="text-sm mt-1" style={{ color: "#6B7280" }}>
            {section.description}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {section.items.map((item) => (
          <AccordionItem
            key={item.id}
            item={item}
            sectionId={section.id}
          />
        ))}
      </div>
    </section>
  );
}
