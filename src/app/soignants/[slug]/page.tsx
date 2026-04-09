import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  BadgeCheck, GraduationCap, MapPin, Video,
  Building2, ArrowLeft, Users,
} from "lucide-react"
import BookingSection from "./booking-section"

export const revalidate = 3600

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

interface PublicProvider {
  id: string
  personId: string
  firstName: string
  lastName: string
  photoUrl: string | null
  specialties: string[]
  publicSpecialties: string[]
  publicBio: string | null
  teleconsultAvailable: boolean
  consultationCity: string | null
  structures: { name: string; city: string | null; role: string | null }[]
  certifications: { title: string; issuer: string | null; year: number | null }[]
  badgeCount: number
  activePatientCount: string
  badges: { competenceVerified: boolean; rppsVerified: boolean }
  slug: string
}

async function getProviders(): Promise<PublicProvider[]> {
  try {
    const res = await fetch(`${API_URL}/providers/public`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.results ?? []
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const providers = await getProviders()
  const provider = providers.find((p) => p.slug === slug)
  if (!provider) {
    return { title: "Soignant introuvable — Nami" }
  }
  const specialty = provider.specialties[0] ?? "Soignant"
  const pathology = provider.publicSpecialties[0] ?? ""
  const title = `${provider.firstName} ${provider.lastName} — ${specialty}${pathology ? ` spécialisé(e) ${pathology}` : ""} | Nami`
  const description = provider.publicBio?.slice(0, 160) ??
    `${provider.firstName} ${provider.lastName}, ${specialty} sur Nami. Prenez rendez-vous en ligne.`
  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: "/og-default.png", width: 1200, height: 630 }] },
  }
}

export default async function ProfilSoignantPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const providers = await getProviders()
  const provider = providers.find((p) => p.slug === slug)

  if (!provider) notFound()

  const initials = `${provider.firstName[0] ?? ""}${provider.lastName[0] ?? ""}`.toUpperCase()
  const specialty = provider.specialties[0] ?? "Professionnel de santé"
  const city = provider.structures?.[0]?.city ?? provider.consultationCity ?? null

  // Schema.org JSON-LD — Physician / MedicalBusiness
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Physician",
    name: `${provider.firstName} ${provider.lastName}`,
    medicalSpecialty: specialty,
    description: provider.publicBio ?? `${provider.firstName} ${provider.lastName}, ${specialty} sur Nami.`,
    url: `https://nami-web-orpin.vercel.app/soignants/${provider.slug}`,
    ...(city ? { address: { "@type": "PostalAddress", addressLocality: city, addressCountry: "FR" } } : {}),
    ...(provider.teleconsultAvailable ? { availableService: { "@type": "MedicalTherapy", name: "Téléconsultation" } } : {}),
    ...(provider.badges.rppsVerified ? { identifier: { "@type": "PropertyValue", name: "RPPS", value: "Vérifié" } } : {}),
    memberOf: { "@type": "Organization", name: "Nami", url: "https://nami-web-orpin.vercel.app" },
    knowsAbout: provider.publicSpecialties.map((ps: string) => ({ "@type": "MedicalCondition", name: ps })),
  }

  return (
    <div className="min-h-screen bg-[#F0F2FA]">
      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Navbar */}
      <nav className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link href="/" className="text-lg font-bold text-[var(--color-primary,#4F46E5)]">
            nami
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-[var(--color-primary,#4F46E5)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            Se connecter
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Back */}
        <Link
          href="/soignants"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="size-4" /> Retour à l&apos;annuaire
        </Link>

        {/* Header card */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary,#4F46E5)]/10 text-[var(--color-primary,#4F46E5)] text-2xl font-bold">
              {initials}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900">
                {provider.firstName} {provider.lastName}
              </h1>
              <p className="text-sm text-gray-500">{provider.specialties.join(" · ")}</p>

              {/* Badges */}
              <div className="mt-3 flex flex-wrap gap-2">
                {provider.badges.rppsVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                    <BadgeCheck className="size-3.5" /> RPPS vérifié
                  </span>
                )}
                {provider.badges.competenceVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                    <GraduationCap className="size-3.5" /> Compétence vérifiée
                  </span>
                )}
                {provider.teleconsultAvailable && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                    <Video className="size-3.5" /> Téléconsultation
                  </span>
                )}
                {provider.consultationCity && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                    <MapPin className="size-3.5" /> {provider.consultationCity}
                  </span>
                )}
              </div>
            </div>

            {/* CTA handled by BookingSection below */}
          </div>
        </div>

        {/* Bio */}
        {provider.publicBio && (
          <div className="mt-4 rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Présentation</h2>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {provider.publicBio}
            </p>
          </div>
        )}

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {/* Pathologies */}
          {provider.publicSpecialties.length > 0 && (
            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Pathologies</h2>
              <div className="flex flex-wrap gap-2">
                {provider.publicSpecialties.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Formations */}
          {provider.certifications.length > 0 && (
            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Formations et certifications</h2>
              <ul className="space-y-2">
                {provider.certifications.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <GraduationCap className="size-4 text-indigo-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-700">{c.title}</p>
                      {(c.issuer || c.year) && (
                        <p className="text-xs text-gray-400">
                          {[c.issuer, c.year].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Structures */}
          {provider.structures.length > 0 && (
            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Lieux d&apos;exercice</h2>
              <ul className="space-y-2">
                {provider.structures.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Building2 className="size-4 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-700">{s.name}</p>
                      {s.city && <p className="text-xs text-gray-400">{s.city}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Activité */}
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Activité</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="size-4 text-gray-400" />
              <span>File active sur Nami</span>
            </div>
          </div>
        </div>

        {/* Booking: slots + modal */}
        <BookingSection
          providerId={provider.id}
          providerFirstName={provider.firstName}
          providerLastName={provider.lastName}
          providerSpecialties={provider.specialties}
        />
      </div>

      {/* Footer */}
      <footer className="mt-12 border-t bg-white py-8 text-center text-xs text-gray-400">
        <p>Nami — Système nerveux du parcours de soins complexes</p>
        <p className="mt-1">Données RPPS vérifiées via l&apos;Annuaire Santé (ANS)</p>
      </footer>
    </div>
  )
}
