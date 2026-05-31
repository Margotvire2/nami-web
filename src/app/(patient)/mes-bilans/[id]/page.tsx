import type { Metadata } from "next";
import { BilanViewerPageClient } from "./page-client";

export const metadata: Metadata = {
  title: "Bilan — Nami",
};

export default async function MesBilansIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BilanViewerPageClient id={id} />;
}
