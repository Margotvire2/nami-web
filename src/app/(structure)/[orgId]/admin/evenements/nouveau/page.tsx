"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useOrgEvents, type CreateEventInput } from "@/hooks/useOrgEvents";
import { EventForm } from "@/components/event/EventForm";
import { ApiError } from "@/lib/api";

// Page de création d'événement organisationnel — admin only.
// L'auth guard est assuré par le layout (structure) parent ; le backend
// (assertOrganizationAdmin) rejette de toute façon les non-admins en 403.

export default function NewEventPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = use(params);
  const router = useRouter();
  const { create, isCreating, createError } = useOrgEvents(orgId);

  async function handleSubmit(input: CreateEventInput) {
    try {
      const created = await create(input);
      router.push(`/structure/${orgId}/admin/evenements/${created.id}`);
    } catch {
      // L'erreur est exposée via createError pour rendu dans le form
    }
  }

  const errorMessage =
    createError instanceof ApiError
      ? createError.message
      : createError
        ? "Une erreur est survenue. Réessayer."
        : null;

  return (
    <div className="space-y-6 max-w-2xl">
      <Link
        href={`/structure/${orgId}/admin/evenements`}
        className="inline-flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#5B4EC4]"
        style={{ fontFamily: "var(--font-jakarta)" }}
      >
        <ArrowLeft size={12} />
        Retour aux événements
      </Link>

      <header>
        <h1
          className="text-xl font-bold text-[#0F172A]"
          style={{ fontFamily: "var(--font-jakarta)" }}
        >
          Nouvel événement
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Planifiez une RCP, une formation DPC, un webinaire ou une
          réunion de groupe de travail.
        </p>
      </header>

      <section className="rounded-xl border border-[#E8ECF4] bg-white p-6">
        <EventForm
          onSubmit={handleSubmit}
          submitting={isCreating}
          errorMessage={errorMessage}
          onCancel={() => router.push(`/structure/${orgId}/admin/evenements`)}
        />
      </section>
    </div>
  );
}
