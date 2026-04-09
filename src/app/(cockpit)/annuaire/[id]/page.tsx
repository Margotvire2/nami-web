"use client"

import { use } from "react"
import { useQuery } from "@tanstack/react-query"
import { useAuthStore } from "@/lib/store"
import { annuaireApi } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  ArrowLeft, Phone, MapPin, CreditCard, Building2, User,
  Stethoscope, FileText, Globe, Copy, CheckCircle, Shield,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export default function AnnuaireFichePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { accessToken } = useAuthStore()
  const [copied, setCopied] = useState<string | null>(null)

  const { data: entry, isLoading } = useQuery({
    queryKey: ["annuaire-entry", id],
    queryFn: () => annuaireApi.get(accessToken!, id),
    enabled: !!accessToken,
  })

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text)
    setCopied(label)
    toast.success(`${label} copi\u00e9`)
    setTimeout(() => setCopied(null), 2000)
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    )
  }

  if (!entry) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <p className="text-sm text-muted-foreground">Professionnel introuvable.</p>
        <Link href="/annuaire" className="text-sm text-primary hover:underline mt-2 inline-block">
          Retour \u00e0 l&apos;annuaire
        </Link>
      </div>
    )
  }

  const e = entry as any
  const isCDS = e.entryType === "CDS"
  const fullName = e.name ?? (isCDS ? e.corporateName : `${e.civility ?? ""} ${e.firstName ?? ""} ${e.lastName}`.trim())
  const initials = isCDS ? "CDS" : `${(e.firstName ?? "?")[0]}${e.lastName[0]}`.toUpperCase()
  const fullAddress = [e.address, e.addressComplement, e.lieuDit, e.postalCode, e.city].filter(Boolean).join(", ")
  const nearbyColleagues = e.nearbyColleagues ?? []

  return (
    <div className="max-w-3xl mx-auto px-6 py-6">
      {/* Back */}
      <Link href="/annuaire" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft size={14} /> Retour \u00e0 l&apos;annuaire
      </Link>

      {/* Header card */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${
            isCDS ? "bg-emerald-50 text-emerald-700" : "bg-primary/10 text-primary"
          }`}>
            {isCDS ? <Building2 size={24} /> : initials}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold">{fullName}</h1>
            <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
              <Stethoscope size={13} />
              {e.specialtyLabel}
              {e.professionTypeLabel && e.professionTypeLabel !== e.specialtyLabel && (
                <span className="text-muted-foreground/60"> \u2014 {e.professionTypeLabel}</span>
              )}
            </p>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mt-3">
              {e.conventionLabel && (
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                  e.conventionCode === "1" ? "bg-emerald-50 text-emerald-700"
                    : e.conventionCode === "2" ? "bg-amber-50 text-amber-700"
                    : "bg-gray-100 text-gray-600"
                }`}>
                  <Shield size={11} /> {e.conventionLabel}
                </span>
              )}
              {e.optionLabel && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                  {e.optionLabel}
                </span>
              )}
              {e.exerciseTypeLabel && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                  {e.exerciseTypeLabel}
                </span>
              )}
              {e.carteVitale && (
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                  <CreditCard size={11} /> Carte Vitale
                </span>
              )}
              {e.activityLabel && (
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">
                  {e.activityLabel}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contact + Address */}
      <div className="grid sm:grid-cols-2 gap-4 mt-4">
        {/* Coordonn\u00e9es */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
            <Phone size={13} /> Coordonn\u00e9es
          </h2>
          <div className="space-y-2.5">
            {e.phone && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Phone size={12} className="text-muted-foreground" />
                  <span>{e.phone.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4 $5")}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(e.phone, "T\u00e9l\u00e9phone")}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {copied === "T\u00e9l\u00e9phone" ? <CheckCircle size={12} className="text-emerald-500" /> : <Copy size={12} />}
                </button>
              </div>
            )}
            {fullAddress && (
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 text-sm">
                  <MapPin size={12} className="text-muted-foreground shrink-0 mt-0.5" />
                  <span>{fullAddress}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(fullAddress, "Adresse")}
                  className="text-muted-foreground hover:text-foreground shrink-0"
                >
                  {copied === "Adresse" ? <CheckCircle size={12} className="text-emerald-500" /> : <Copy size={12} />}
                </button>
              </div>
            )}
            {e.finessNumber && (
              <div className="flex items-center gap-2 text-sm">
                <FileText size={12} className="text-muted-foreground" />
                <span className="text-muted-foreground">FINESS :</span>
                <span className="font-mono text-xs">{e.finessNumber}</span>
              </div>
            )}
            {e.corporateName && (
              <div className="flex items-center gap-2 text-sm">
                <Building2 size={12} className="text-muted-foreground" />
                <span className="text-muted-foreground truncate">{e.corporateName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Informations professionnelles */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
            <User size={13} /> Informations professionnelles
          </h2>
          <div className="space-y-2 text-sm">
            <InfoRow label="Sp\u00e9cialit\u00e9" value={e.specialtyLabel} />
            <InfoRow label="Code sp\u00e9cialit\u00e9" value={e.specialtyCode} />
            {e.professionTypeLabel && <InfoRow label="Profession" value={e.professionTypeLabel} />}
            {e.conventionLabel && <InfoRow label="Convention" value={e.conventionLabel} />}
            {e.optionLabel && <InfoRow label="Option tarifaire" value={e.optionLabel} />}
            {e.exerciseTypeLabel && <InfoRow label="Mode d&apos;exercice" value={e.exerciseTypeLabel} />}
            <InfoRow label="Carte Vitale" value={e.carteVitale ? "Oui" : "Non"} />
            <InfoRow label="Source" value="Annuaire Sant\u00e9 Ameli (data.gouv.fr)" />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="rounded-xl border bg-card p-4 mt-4 shadow-sm flex flex-wrap gap-2">
        {e.phone && (
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" asChild>
            <a href={`tel:${e.phone}`}>
              <Phone size={12} /> Appeler
            </a>
          </Button>
        )}
        {fullAddress && (
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" asChild>
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`} target="_blank" rel="noopener noreferrer">
              <MapPin size={12} /> Voir sur la carte
            </a>
          </Button>
        )}
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" asChild>
          <a href={`https://annuaire.sante.fr`} target="_blank" rel="noopener noreferrer">
            <Globe size={12} /> V\u00e9rifier sur l&apos;annuaire ANS
          </a>
        </Button>
      </div>

      {/* Nearby colleagues */}
      {nearbyColleagues.length > 0 && (
        <div className="rounded-xl border bg-card p-5 mt-4 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground mb-3">
            Autres {e.specialtyLabel.toLowerCase()}s \u00e0 {e.city}
          </h2>
          <div className="space-y-2">
            {nearbyColleagues.map((c: any) => (
              <Link
                key={c.id}
                href={`/annuaire/${c.id}`}
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-[10px] text-muted-foreground">{c.address}</p>
                </div>
                <div className="text-right shrink-0">
                  {c.convention && <p className="text-[10px] font-medium text-muted-foreground">{c.convention}</p>}
                  {c.phone && <p className="text-[10px] text-muted-foreground">{c.phone}</p>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Legal mention */}
      <p className="text-[9px] text-muted-foreground/50 mt-6 text-center">
        Donn\u00e9es issues de l&apos;Annuaire Sant\u00e9 Ameli (CNAM) publi\u00e9es sur data.gouv.fr sous Licence Ouverte 2.0.
        Mise \u00e0 jour : avril 2026.
      </p>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  )
}
