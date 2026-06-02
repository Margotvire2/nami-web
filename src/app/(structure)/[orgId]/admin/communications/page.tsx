"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Plus, Mail, Megaphone, Loader2 } from "lucide-react";
import { ConsoleSidebar } from "@/components/structure/ConsoleSidebar";
import { BroadcastCard } from "@/components/broadcast/BroadcastCard";
import { useOrgBroadcasts } from "@/hooks/useOrgBroadcasts";
import { useOrgPosts, type OrgPost } from "@/hooks/useOrgPosts";

type Tab = "broadcasts" | "annonces";

export default function CommunicationsPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = use(params);
  const [tab, setTab] = useState<Tab>("broadcasts");
  const { broadcasts, isLoading: broadcastsLoading } = useOrgBroadcasts(orgId);
  const { posts, isLoading: postsLoading } = useOrgPosts(orgId);

  return (
    <div className="space-y-6" style={{ fontFamily: "var(--font-jakarta)" }}>
      <ConsoleSidebar orgId={orgId} active="communications" />

      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-[#0F172A]">Communications</h1>
        <p className="text-sm text-[#6B7280]">
          Envoyez des emails à vos membres et publiez des annonces dans le feed
          interne du réseau.
        </p>
      </header>

      <div
        role="tablist"
        aria-label="Type de communication"
        className="inline-flex rounded-lg border border-[#E8ECF4] bg-white p-1"
      >
        <button
          role="tab"
          aria-selected={tab === "broadcasts"}
          onClick={() => setTab("broadcasts")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            tab === "broadcasts"
              ? "bg-[#5B4EC4] text-white"
              : "text-[#374151] hover:bg-[#F0F2FA]"
          }`}
        >
          <Mail size={13} /> Broadcasts email
        </button>
        <button
          role="tab"
          aria-selected={tab === "annonces"}
          onClick={() => setTab("annonces")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            tab === "annonces"
              ? "bg-[#5B4EC4] text-white"
              : "text-[#374151] hover:bg-[#F0F2FA]"
          }`}
        >
          <Megaphone size={13} /> Annonces (feed interne)
        </button>
      </div>

      {tab === "broadcasts" ? (
        <BroadcastsTab
          orgId={orgId}
          isLoading={broadcastsLoading}
          broadcasts={broadcasts}
        />
      ) : (
        <AnnoncesTab posts={posts} isLoading={postsLoading} />
      )}
    </div>
  );
}

function BroadcastsTab({
  orgId,
  isLoading,
  broadcasts,
}: {
  orgId: string;
  isLoading: boolean;
  broadcasts: ReturnType<typeof useOrgBroadcasts>["broadcasts"];
}) {
  return (
    <section aria-label="Broadcasts email">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-[#6B7280]">
          Email envoyé à tous les membres actifs du réseau, avec opt-out RGPD.
        </p>
        <Link
          href={`/structure/${orgId}/admin/communications/nouveau`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#5B4EC4] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#4A3FB0] transition-colors"
        >
          <Plus size={13} /> Nouveau broadcast
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <Loader2 size={13} className="animate-spin" /> Chargement…
        </div>
      ) : broadcasts.length === 0 ? (
        <EmptyState
          title="Aucun broadcast pour l'instant"
          description="Créez votre premier email pour annoncer une réunion, un événement, ou partager une actualité avec vos membres."
          cta={
            <Link
              href={`/structure/${orgId}/admin/communications/nouveau`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#5B4EC4] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#4A3FB0] transition-colors"
            >
              <Plus size={13} /> Créer un broadcast
            </Link>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {broadcasts.map((b) => (
            <BroadcastCard key={b.id} orgId={orgId} broadcast={b} />
          ))}
        </div>
      )}
    </section>
  );
}

function AnnoncesTab({
  posts,
  isLoading,
}: {
  posts: OrgPost[];
  isLoading: boolean;
}) {
  return (
    <section aria-label="Annonces feed interne">
      <p className="mb-3 text-xs text-[#6B7280]">
        Posts visibles dans le feed in-app des membres soignants. La création
        de nouvelles annonces sera disponible prochainement.
      </p>

      {isLoading ? (
        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <Loader2 size={13} className="animate-spin" /> Chargement…
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          title="Aucune annonce publiée"
          description="Le feed interne du réseau est vide pour l'instant. La création d'annonces sera disponible dans une prochaine version."
        />
      ) : (
        <ul className="space-y-3">
          {posts.map((p) => (
            <li
              key={p.id}
              className="rounded-xl border border-[#E8ECF4] bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3 mb-1">
                <h3 className="font-semibold text-sm text-[#0F172A]">
                  {p.title}
                </h3>
                <span className="text-[11px] text-[#6B7280]">
                  {p.publishedAt
                    ? new Date(p.publishedAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "Brouillon"}
                </span>
              </div>
              <p className="text-xs text-[#374151] line-clamp-3 whitespace-pre-wrap">
                {p.body}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function EmptyState({
  title,
  description,
  cta,
}: {
  title: string;
  description: string;
  cta?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-[#E8ECF4] bg-white p-8 text-center">
      <h3 className="font-semibold text-sm text-[#0F172A] mb-1">{title}</h3>
      <p className="text-xs text-[#6B7280] mb-4 max-w-md mx-auto">
        {description}
      </p>
      {cta}
    </div>
  );
}
