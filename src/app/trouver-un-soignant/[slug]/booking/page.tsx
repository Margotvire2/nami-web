import { Metadata } from "next";
import { notFound } from "next/navigation";
import BookingPageClient from "./page-client";
import type { PublicBookingSlot } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// ─── Types alignés sur GET /providers/public (cf. /soignants/[slug]/page.tsx) ─

interface PublicProviderRaw {
  id: string;
  personId: string;
  firstName: string;
  lastName: string;
  photoUrl: string | null;
  specialties: string[];
  publicSpecialties: string[];
  publicBio: string | null;
  teleconsultAvailable: boolean;
  consultationCity: string | null;
  structures: { name: string; city: string | null; role: string | null }[];
  slug: string;
}

export interface BookingProviderHero {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  photoUrl: string | null;
  specialty: string;
  city: string | null;
  teleconsultAvailable: boolean;
}

// ─── Fetchers serveur (Next.js App Router) ───────────────────────────────────

async function getProviderBySlug(slug: string): Promise<PublicProviderRaw | null> {
  try {
    const res = await fetch(`${API_URL}/providers/public`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const list: PublicProviderRaw[] = data.results ?? [];
    return list.find((p) => p.slug === slug) ?? null;
  } catch {
    return null;
  }
}

async function getPublicSlots(providerId: string): Promise<PublicBookingSlot[]> {
  try {
    const res = await fetch(
      `${API_URL}/appointment-requests/public-slots/${providerId}`,
      { cache: "no-store" },
    );
    if (!res.ok) return [];
    return (await res.json()) as PublicBookingSlot[];
  } catch {
    return [];
  }
}

// ─── Metadata SEO (page non-indexable — flow privé) ─────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const provider = await getProviderBySlug(slug);
  if (!provider) {
    return { title: "Demande de rendez-vous — Nami", robots: { index: false } };
  }
  return {
    title: `Demande de rendez-vous — ${provider.firstName} ${provider.lastName} | Nami`,
    description: `Envoyez une demande de rendez-vous à ${provider.firstName} ${provider.lastName}.`,
    robots: { index: false, follow: false },
  };
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function BookingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const provider = await getProviderBySlug(slug);
  if (!provider) notFound();

  const slots = await getPublicSlots(provider.id);

  const heroProvider: BookingProviderHero = {
    id: provider.id,
    slug: provider.slug,
    firstName: provider.firstName,
    lastName: provider.lastName,
    photoUrl: provider.photoUrl,
    specialty: provider.specialties[0] ?? "Professionnel de santé",
    city: provider.structures?.[0]?.city ?? provider.consultationCity ?? null,
    teleconsultAvailable: provider.teleconsultAvailable,
  };

  return <BookingPageClient provider={heroProvider} initialSlots={slots} />;
}
