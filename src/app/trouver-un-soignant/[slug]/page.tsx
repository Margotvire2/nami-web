import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { PublicProviderDetail } from "@/lib/api";
import { PublicFooter } from "@/components/public/PublicFooter";
import { ProviderHero } from "./ProviderHero";
import { ProviderBioCard } from "./ProviderBioCard";
import { ProviderAddressesCard } from "./ProviderAddressesCard";
import { ProviderActionsCard } from "./ProviderActionsCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function fetchProvider(slug: string): Promise<PublicProviderDetail | null> {
  try {
    const res = await fetch(`${API_URL}/providers/public/${slug}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return (await res.json()) as PublicProviderDetail;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const provider = await fetchProvider(slug);
  if (!provider) {
    return {
      title: "Soignant introuvable — Nami",
      robots: { index: false, follow: false },
    };
  }

  const fullName = `${provider.firstName} ${provider.lastName}`;
  const primary = provider.specialties[0] ?? provider.publicSpecialties[0] ?? null;
  const city = provider.consultationCity ?? null;
  const title = primary
    ? `${fullName} — ${primary}${city ? ` à ${city}` : ""} | Nami`
    : `${fullName} | Nami`;

  const bioExcerpt = provider.publicBio
    ? provider.publicBio.replace(/\s+/g, " ").slice(0, 140)
    : null;
  const description = primary
    ? `${primary}${city ? ` à ${city}` : ""}.${bioExcerpt ? ` ${bioExcerpt}` : ""} Prenez rendez-vous en ligne sur Nami.`
    : `Profil de ${fullName} sur Nami.${bioExcerpt ? ` ${bioExcerpt}` : ""}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      locale: "fr_FR",
    },
    alternates: { canonical: `/trouver-un-soignant/${provider.slug}` },
    robots: { index: true, follow: true },
  };
}

export default async function ProviderPublicProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const provider = await fetchProvider(slug);
  if (!provider) notFound();

  const fullName = `${provider.firstName} ${provider.lastName}`;

  return (
    <>
      <main
        id="main"
        aria-label={`Profil de ${fullName}`}
        style={{ background: "#FAFAF8" }}
        className="min-h-screen"
      >
        <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
          {/* Breadcrumb */}
          <nav aria-label="Fil d'Ariane" className="mb-6">
            <Link
              href="/trouver-un-soignant"
              className="inline-flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(91,78,196,0.4)] focus-visible:ring-offset-2 rounded-full px-2 py-1"
              style={{ color: "#5B4EC4" }}
            >
              <ArrowLeft size={14} aria-hidden="true" />
              Retour à l&apos;annuaire
            </Link>
          </nav>

          <ProviderHero provider={provider} />

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            <div className="space-y-6 min-w-0">
              <ProviderBioCard provider={provider} />
              <ProviderAddressesCard provider={provider} />
            </div>

            <ProviderActionsCard provider={provider} />
          </div>
        </div>
      </main>

      <PublicFooter />
    </>
  );
}
