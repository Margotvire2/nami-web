"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ConsoleSidebar } from "@/components/structure/ConsoleSidebar";
import { BroadcastComposer } from "@/components/broadcast/BroadcastComposer";
import { useOrgBroadcasts } from "@/hooks/useOrgBroadcasts";

export default function NouveauBroadcastPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = use(params);
  const router = useRouter();
  const { createDraft } = useOrgBroadcasts(orgId);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(input: { subject: string; body: string }) {
    setErrorMessage(null);
    try {
      const draft = await createDraft.mutateAsync(input);
      router.push(`/structure/${orgId}/admin/communications/${draft.id}`);
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Impossible d'enregistrer le brouillon.",
      );
    }
  }

  return (
    <div className="space-y-6" style={{ fontFamily: "var(--font-jakarta)" }}>
      <ConsoleSidebar orgId={orgId} active="communications" />

      <Link
        href={`/structure/${orgId}/admin/communications`}
        className="inline-flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#5B4EC4]"
      >
        <ArrowLeft size={12} /> Communications
      </Link>

      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-[#0F172A]">Nouveau broadcast</h1>
        <p className="text-sm text-[#6B7280]">
          Composez un email à envoyer aux membres actifs de votre réseau.
          L&apos;envoi se fait depuis la page de détail du brouillon.
        </p>
      </header>

      <BroadcastComposer
        isSubmitting={createDraft.isPending}
        onSubmit={handleSubmit}
        errorMessage={errorMessage}
      />
    </div>
  );
}
