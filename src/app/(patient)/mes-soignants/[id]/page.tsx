import type { Metadata } from "next";
import { ProviderDetailPageClient } from "./page-client";

export const metadata: Metadata = {
  title: "Profil soignant — Nami",
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProviderDetailPage({ params }: Props) {
  const { id } = await params;
  return <ProviderDetailPageClient providerId={id} />;
}
