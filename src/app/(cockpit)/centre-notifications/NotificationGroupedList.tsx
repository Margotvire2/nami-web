"use client";

import { NotificationItem } from "@/components/cockpit/notifications/NotificationItem";
import type { NotificationFeedItem } from "@/lib/api";

type Bucket = "today" | "week" | "older";

const BUCKET_ORDER: Bucket[] = ["today", "week", "older"];

const BUCKET_LABELS: Record<Bucket, string> = {
  today: "Aujourd'hui",
  week: "Cette semaine",
  older: "Plus ancien",
};

const DAY_MS = 86_400_000;

function getBucket(createdAt: string, now: Date): Bucket {
  const created = new Date(createdAt);
  const sameDay =
    created.getFullYear() === now.getFullYear() &&
    created.getMonth() === now.getMonth() &&
    created.getDate() === now.getDate();
  if (sameDay) return "today";
  const diffMs = now.getTime() - created.getTime();
  if (diffMs < 7 * DAY_MS) return "week";
  return "older";
}

type Props = {
  items: NotificationFeedItem[];
};

export function NotificationGroupedList({ items }: Props) {
  const now = new Date();
  const grouped: Record<Bucket, NotificationFeedItem[]> = {
    today: [],
    week: [],
    older: [],
  };
  for (const item of items) {
    grouped[getBucket(item.createdAt, now)].push(item);
  }

  return (
    <div
      className="bg-white rounded-2xl border overflow-hidden"
      style={{
        borderColor: "rgba(26,26,46,0.06)",
        boxShadow: "0 20px 60px rgba(26,26,46,0.04)",
      }}
    >
      {BUCKET_ORDER.map((bucket) => {
        const bucketItems = grouped[bucket];
        if (bucketItems.length === 0) return null;
        const headingId = `notif-group-${bucket}`;
        return (
          <section
            key={bucket}
            aria-labelledby={headingId}
            className="p-4 border-b last:border-b-0"
            style={{ borderColor: "rgba(26,26,46,0.06)" }}
          >
            <h2
              id={headingId}
              className="text-[11px] font-extrabold uppercase text-[#5B4EC4] mb-3"
              style={{ letterSpacing: "0.1em", fontFamily: "var(--font-data)" }}
            >
              {BUCKET_LABELS[bucket]}
            </h2>
            <ul role="list" className="space-y-2">
              {bucketItems.map((item) => (
                <li key={item.id}>
                  <NotificationItem item={item} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
