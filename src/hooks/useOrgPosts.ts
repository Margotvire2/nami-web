"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export type OrgPostType =
  | "ANNOUNCEMENT"
  | "EVENT_PROMO"
  | "RESEARCH_CALL"
  | "COMMUNITY_UPDATE";

export type OrgPostVisibility = "PUBLIC" | "MEMBERS_ONLY" | "WORKING_GROUP";

export interface OrgPost {
  id: string;
  organizationId: string;
  type: OrgPostType;
  title: string;
  body: string;
  coverImageUrl: string | null;
  visibility: OrgPostVisibility;
  publishedAt: string | null;
  archivedAt: string | null;
  authorPersonId: string;
  createdAt: string;
  updatedAt: string;
}

export function orgPostsQueryKey(orgId: string) {
  return ["org-posts", orgId] as const;
}

export function useOrgPosts(orgId: string) {
  const accessToken = useAuthStore((s) => s.accessToken);

  const { data, isLoading, isError } = useQuery({
    queryKey: orgPostsQueryKey(orgId),
    queryFn: async (): Promise<OrgPost[]> => {
      if (!accessToken || !orgId) return [];
      const r = await fetch(`${API}/organizations/${orgId}/posts`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!r.ok) throw new Error(`Org posts fetch failed: ${r.status}`);
      const json = (await r.json()) as { posts?: OrgPost[] } | OrgPost[];
      return Array.isArray(json) ? json : (json.posts ?? []);
    },
    enabled: !!accessToken && !!orgId,
    staleTime: 30 * 1000,
  });

  return {
    posts: data ?? [],
    isLoading,
    isError,
  };
}
