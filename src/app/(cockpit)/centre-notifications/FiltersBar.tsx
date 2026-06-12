"use client";

export type FilterKey =
  | "all"
  | "unread"
  | "rdv"
  | "patients"
  | "equipe"
  | "rcp"
  | "consentements";

const TAB_ORDER: FilterKey[] = [
  "all",
  "unread",
  "rdv",
  "patients",
  "equipe",
  "rcp",
  "consentements",
];

const TAB_LABELS: Record<FilterKey, string> = {
  all: "Toutes",
  unread: "Non lues",
  rdv: "RDV",
  patients: "Patients",
  equipe: "Équipe",
  rcp: "RCP",
  consentements: "Consentements",
};

type Props = {
  selected: FilterKey;
  onChange: (filter: FilterKey) => void;
  counts: Record<FilterKey, number>;
};

export function FiltersBar({ selected, onChange, counts }: Props) {
  return (
    <nav
      role="tablist"
      aria-label="Filtrer les notifications"
      className="flex gap-1 mb-6 border-b overflow-x-auto"
      style={{ borderColor: "rgba(26,26,46,0.06)" }}
    >
      {TAB_ORDER.map((key) => {
        const isActive = selected === key;
        const count = counts[key];
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-current={isActive ? "page" : undefined}
            onClick={() => onChange(key)}
            className={`px-3 md:px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              isActive
                ? "border-[#5B4EC4] text-[#5B4EC4]"
                : "border-transparent text-[#6B7280] hover:text-[#1A1A2E]"
            }`}
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {TAB_LABELS[key]}
            {count > 0 && (
              <span
                className="ml-1.5 text-xs"
                style={{ fontFamily: "var(--font-data)" }}
                aria-label={`${count} élément${count > 1 ? "s" : ""}`}
              >
                ({count})
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
