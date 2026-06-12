/**
 * NotificationSection — section "À faire" ou "Activité récente" du panneau.
 *
 * Titre eyebrow violet primaire, empty state textuel.
 */

import { NotificationItem } from "./NotificationItem";
import type { NotificationFeedItem } from "@/lib/api";

type Props = {
  title: string;
  items: NotificationFeedItem[];
  emptyMessage: string;
};

export function NotificationSection({ title, items, emptyMessage }: Props) {
  return (
    <section className="p-4">
      <h3
        className="text-[11px] font-extrabold uppercase text-[#5B4EC4] mb-3"
        style={{ letterSpacing: "0.1em", fontFamily: "var(--font-data)" }}
      >
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="text-sm text-[#6B7280] py-4" style={{ fontFamily: "var(--font-sans)" }}>
          {emptyMessage}
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <NotificationItem item={item} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
