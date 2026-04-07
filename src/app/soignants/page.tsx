import { Metadata } from "next"
import Link from "next/link"
import {
  Search, GraduationCap, MapPin, Video,
  Shield, BadgeCheck, ChevronRight, Users,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Soignants spécialisés — Nami",
  description:
    "Trouvez un professionnel de santé spécialisé en TCA, nutrition, obésité. Profils vérifiés RPPS, prise de rendez-vous en ligne.",
  openGraph: {
    title: "Soignants spécialisés — Nami",
    description: "Trouvez un professionnel de santé spécialisé en TCA, nutrition, obésité. Profils vérifiés RPPS.",
    images: [{ url: "/og-default.png", width: 1200, height: 630 }],
  },
}

export const revalidate = 3600 // ISR — revalidate toutes les heures

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

async function getProviders(params: Record<string, string> = {}): Promise<PublicProvider[]> {
  const qs = new URLSearchParams(params).toString()
  try {
    const res = await fetch(`${API_URL}/providers/public${qs ? `?${qs}` : ""}`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.results ?? []
  } catch {
    return []
  }
}

const SPECIALTIES = [
  "Diététicien", "Psychologue", "Médecin", "Endocrinologue",
  "Pédiatre", "Psychiatre",
]

const PATHOLOGIES = ["TCA", "Obésité", "Diabète", "Pédiatrie", "Maladies chroniques"]

function Initials({ firstName, lastName }: { firstName: string; lastName: string }) {
  const initials = `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase()
  return (
    <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary,#4F46E5)]/10 text-[var(--color-primary,#4F46E5)] text-lg font-bold">
      {initials}
    </div>
  )
}

function ProviderCard({ provider }: { provider: PublicProvider }) {
  return (
    <Link
      href={`/soignants/${provider.slug}`}
      className="group flex flex-col rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-[var(--color-primary,#4F46E5)]/20"
    >
      <div className="flex items-start gap-4">
        <Initials firstName={provider.firstName} lastName={provider.lastName} />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[15px] truncate">
            {provider.firstName} {provider.lastName}
          </h3>
          <p className="text-sm text-gray-500 truncate">
            {provider.specialties[0] ?? "Soignant"}
          </p>
        </div>
        <ChevronRight className="size-4 text-gray-300 group-hover:text-[var(--color-primary,#4F46E5)] transition-colors shrink-0 mt-1" />
      </div>

      {/* Badges */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {provider.badges.rppsVerified && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
            <BadgeCheck className="size-3" /> RPPS vérifié
          </span>
        )}
        {provider.certifications.slice(0, 2).map((c, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700"
          >
            <GraduationCap className="size-3" /> {c.title}
          </span>
        ))}
        {provider.structures.slice(0, 1).map((s, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700"
          >
            {s.name}
          </span>
        ))}
      </div>

      {/* Tags pathologies */}
      {provider.publicSpecialties.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {provider.publicSpecialties.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
        {provider.consultationCity && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3" /> {provider.consultationCity}
          </span>
        )}
        {provider.teleconsultAvailable && (
          <span className="inline-flex items-center gap-1 text-indigo-500">
            <Video className="size-3" /> Téléconsultation
          </span>
        )}
        <span className="inline-flex items-center gap-1 ml-auto">
          <Users className="size-3" /> File active
        </span>
      </div>
    </Link>
  )
}

export default async function SoignantsPage() {
  const providers = await getProviders()

  return (
    <div className="min-h-screen bg-[#F0F2FA]">
      {/* Navbar */}
      <nav className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
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

      {/* Hero */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-6xl px-4 py-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Trouvez le bon spécialiste,
            <br />
            <span className="text-[var(--color-primary,#4F46E5)]">pas juste le plus proche</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-gray-500">
            Sur Nami, la compétence est vérifiée — par le RPPS, les formations,
            et l&apos;activité réelle des soignants.
          </p>
        </div>
      </div>

      {/* Filtres */}
      <div className="sticky top-0 z-10 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 overflow-x-auto px-4 py-3">
          <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm">
            <Search className="size-4 text-gray-400" />
            <span className="text-gray-400 text-sm">Spécialité</span>
          </div>
          {SPECIALTIES.map((s) => (
            <button
              key={s}
              className="shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-[var(--color-primary,#4F46E5)]/30 hover:text-[var(--color-primary,#4F46E5)] transition-colors"
            >
              {s}
            </button>
          ))}
          <div className="ml-2 h-5 border-l" />
          {PATHOLOGIES.map((p) => (
            <button
              key={p}
              className="shrink-0 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Résultats */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        {providers.length === 0 ? (
          <div className="py-20 text-center">
            <Shield className="mx-auto size-12 text-gray-300" />
            <h2 className="mt-4 text-lg font-semibold text-gray-700">
              Aucun soignant publié pour le moment
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Les premiers profils vérifiés apparaîtront bientôt.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary,#4F46E5)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              Vous êtes soignant ? Créez votre profil
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-gray-500">
              {providers.length} soignant{providers.length > 1 ? "s" : ""} vérifié{providers.length > 1 ? "s" : ""}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {providers.map((p) => (
                <ProviderCard key={p.id} provider={p} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t bg-white py-8 text-center text-xs text-gray-400">
        <p>Nami — Système nerveux du parcours de soins complexes</p>
        <p className="mt-1">Données RPPS vérifiées via l&apos;Annuaire Santé (ANS)</p>
      </footer>
    </div>
  )
}
