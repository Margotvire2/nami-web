"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAuthStore } from "@/lib/store"
import { authApi } from "@/lib/api"
import { EXPERTISE_THEMES, PROFESSION_THEME_MAP } from "@/lib/data/specialties"
import {
  User, Mail, Phone, BadgeCheck, Loader2, Save,
  Plus, Trash2, LogOut, ChevronDown, ChevronUp,
  Building2, GraduationCap, Stethoscope, Globe, Settings,
} from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

// ─── Constantes (miroir exact de l'onboarding) ────────────────────────────────

const EXERCISE_MODES = [
  { id: "LIBERAL",  label: "Libéral" },
  { id: "SALARIED", label: "Salarié" },
  { id: "MIXED",    label: "Mixte" },
  { id: "HOSPITAL", label: "Hospitalier pur" },
]

const CONVENTION_SECTORS = [
  { id: "SECTOR_1", label: "Secteur 1" },
  { id: "SECTOR_2", label: "Secteur 2" },
  { id: "SECTOR_3", label: "Secteur 3 (non conventionné)" },
  { id: "OPTAM",    label: "OPTAM / OPTAM-CO" },
]

const CONSULTATION_MODES = [
  { id: "IN_PERSON",        label: "Présentiel" },
  { id: "TELECONSULTATION", label: "Téléconsultation" },
  { id: "HOME_VISIT",       label: "Visite à domicile" },
]

const PATIENT_TYPES = [
  { id: "adult",      label: "Adultes" },
  { id: "child",      label: "Enfants (< 12 ans)" },
  { id: "adolescent", label: "Adolescents (12–18 ans)" },
  { id: "elderly",    label: "Personnes âgées" },
  { id: "pregnant",   label: "Femmes enceintes" },
  { id: "perinatal",  label: "Périnatalité" },
  { id: "disability", label: "Situations de handicap" },
  { id: "precarity",  label: "Grande précarité" },
  { id: "athlete",    label: "Sportifs" },
]

const DELAY_OPTIONS = [
  { id: "WITHIN_WEEK",  label: "Sous une semaine" },
  { id: "WITHIN_MONTH", label: "Sous un mois" },
  { id: "OVER_MONTH",   label: "Plus d'un mois" },
]

const LANGUAGES = [
  { id: "fr", label: "Français" }, { id: "en", label: "Anglais" },
  { id: "es", label: "Espagnol" }, { id: "ar", label: "Arabe" },
  { id: "pt", label: "Portugais" }, { id: "de", label: "Allemand" },
  { id: "it", label: "Italien" }, { id: "ru", label: "Russe" },
  { id: "zh", label: "Mandarin" }, { id: "wo", label: "Wolof" },
  { id: "tr", label: "Turc" }, { id: "ro", label: "Roumain" },
  { id: "pl", label: "Polonais" }, { id: "lsf", label: "LSF" },
]

const VISIBILITY_OPTIONS = [
  { id: "ALL",           label: "Profil public",                       description: "Visible par tous les professionnels" },
  { id: "VERIFIED_ONLY", label: "Professionnels vérifiés uniquement",  description: "RPPS/ADELI validé requis" },
  { id: "PRIVATE",       label: "Profil privé",                        description: "Non visible dans l'annuaire" },
]

const ADDRESSING_SCOPE = [
  { id: "LOCAL",    label: "Local" },
  { id: "REGIONAL", label: "Régional" },
  { id: "NATIONAL", label: "National" },
]

const STRUCTURE_TYPES = ["Cabinet libéral", "Clinique", "Hôpital", "Centre de santé", "EHPAD", "IME", "CMP", "CMPP", "Autre"]

// ─── Types ────────────────────────────────────────────────────────────────────

interface Structure { id: string; name: string; type: string; address: string; city: string; postalCode: string; phone?: string | null; fax?: string | null }
interface Certification { id: string; name: string; organism: string; year?: string | null }
interface ProfileData {
  // Person
  firstName: string; lastName: string; email: string; phone?: string | null
  // ProviderProfile
  rppsNumber?: string | null; adeliNumber?: string | null
  specialties: string[]; subSpecialties: string[]
  bio?: string | null
  exerciseMode?: string | null; conventionSector?: string | null
  acceptsCMU: boolean; acceptsALD: boolean; acceptsTele: boolean
  consultationModes: string[]; acceptedPatientTypes: string[]
  acceptsNewPatients: boolean; averageDelay?: string | null
  profileVisibility: string; addressingScope?: string | null
  languages: string[]
  structures: Structure[]; certifications: Certification[]
  professionType?: string | null
}

// ─── Section card ─────────────────────────────────────────────────────────────

function Section({ title, icon, children, defaultOpen = true }: { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-white rounded-2xl border border-[#E8ECF4] overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-[#F8F9FC] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-[#4F46E5]">{icon}</span>
          <h2 className="text-[14px] font-semibold text-[#0F172A]">{title}</h2>
        </div>
        {open ? <ChevronUp size={16} className="text-[#94A3B8]" /> : <ChevronDown size={16} className="text-[#94A3B8]" />}
      </button>
      {open && <div className="px-6 pb-6 pt-2 space-y-4">{children}</div>}
    </div>
  )
}

function ReadOnlyField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <label className="text-[11px] font-medium text-[#94A3B8] uppercase tracking-wide">{label}</label>
      <p className="mt-1 px-3 py-2 rounded-lg bg-[#F8F9FC] border border-[#E8ECF4] text-[13px] text-[#64748B]">{value || "—"}</p>
    </div>
  )
}

function InputField({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="text-[11px] font-medium text-[#64748B] uppercase tracking-wide">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full px-3 py-2 rounded-lg border border-[#E8ECF4] text-[13px] text-[#0F172A] focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] outline-none bg-white"
      />
    </div>
  )
}

function Toggle({ label, sub, checked, onChange }: { label: string; sub?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-1">
      <div>
        <p className="text-[13px] text-[#0F172A]">{label}</p>
        {sub && <p className="text-[11px] text-[#94A3B8]">{sub}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors ${checked ? "bg-[#4F46E5]" : "bg-[#E2E8F0]"}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </div>
  )
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-colors ${
        active ? "bg-[#EEF2FF] border-[#4F46E5] text-[#4F46E5]" : "bg-white border-[#E8ECF4] text-[#64748B] hover:border-[#4F46E5]/40"
      }`}
    >
      {label}
    </button>
  )
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function ReglagesPage() {
  const router = useRouter()
  const { accessToken, refreshToken, user, logout } = useAuthStore()

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [changes, setChanges] = useState<Partial<ProfileData>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Structures
  const [structureModal, setStructureModal] = useState<{ open: boolean; editing: Structure | null }>({ open: false, editing: null })
  const [structForm, setStructForm] = useState({ name: "", type: "Cabinet libéral", address: "", city: "", postalCode: "", phone: "", fax: "" })

  // Certifications
  const [certModal, setCertModal] = useState(false)
  const [certForm, setCertForm] = useState({ name: "", organism: "", year: "" })

  // ─── Load ────────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    if (!accessToken) return
    try {
      const res = await fetch(`${API_URL}/providers/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setProfile({
        firstName: data.person?.firstName ?? "",
        lastName: data.person?.lastName ?? "",
        email: data.person?.email ?? "",
        phone: data.person?.phone ?? null,
        rppsNumber: data.rppsNumber,
        adeliNumber: data.adeliNumber,
        specialties: data.specialties ?? [],
        subSpecialties: data.subSpecialties ?? [],
        bio: data.bio,
        exerciseMode: data.exerciseMode,
        conventionSector: data.conventionSector,
        acceptsCMU: data.acceptsCMU ?? false,
        acceptsALD: data.acceptsALD ?? false,
        acceptsTele: data.acceptsTele ?? false,
        consultationModes: data.consultationModes ?? [],
        acceptedPatientTypes: data.acceptedPatientTypes ?? [],
        acceptsNewPatients: data.acceptsNewPatients ?? true,
        averageDelay: data.averageDelay,
        profileVisibility: data.profileVisibility ?? "PRIVATE",
        addressingScope: data.addressingScope,
        languages: data.languages ?? [],
        structures: data.structures ?? [],
        certifications: data.certifications ?? [],
        professionType: data.specialtyView,
      })
    } catch {
      toast.error("Erreur de chargement du profil")
    } finally {
      setLoading(false)
    }
  }, [accessToken])

  useEffect(() => { load() }, [load])

  // ─── Helpers ─────────────────────────────────────────────────────────────

  function get<K extends keyof ProfileData>(key: K): ProfileData[K] {
    return (changes[key] ?? profile?.[key]) as ProfileData[K]
  }

  function set<K extends keyof ProfileData>(key: K, value: ProfileData[K]) {
    setChanges(c => ({ ...c, [key]: value }))
  }

  function toggleArr(key: "specialties" | "consultationModes" | "acceptedPatientTypes" | "languages", id: string) {
    const current = get(key) as string[]
    set(key, current.includes(id) ? current.filter(v => v !== id) : [...current, id])
  }

  const hasChanges = Object.keys(changes).length > 0

  // ─── Save ────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!hasChanges || !accessToken) return
    setSaving(true)
    try {
      const res = await fetch(`${API_URL}/providers/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(changes),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Erreur serveur")
      }
      const updated = await res.json()
      // Merge updated data back into profile
      setProfile(p => p ? {
        ...p,
        ...changes,
        firstName: updated.person?.firstName ?? p.firstName,
        lastName: updated.person?.lastName ?? p.lastName,
        phone: updated.person?.phone ?? p.phone,
      } : p)
      setChanges({})
      toast.success("Modifications enregistrées")
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erreur")
    } finally {
      setSaving(false)
    }
  }

  // ─── Logout ──────────────────────────────────────────────────────────────

  async function handleLogout() {
    if (refreshToken) await authApi.logout(refreshToken).catch(() => {})
    logout()
    router.push("/login")
    toast.success("Déconnecté")
  }

  // ─── Structures ──────────────────────────────────────────────────────────

  function openAddStructure() {
    setStructForm({ name: "", type: "Cabinet libéral", address: "", city: "", postalCode: "", phone: "", fax: "" })
    setStructureModal({ open: true, editing: null })
  }

  async function saveStructure() {
    if (!accessToken) return
    const { editing } = structureModal
    try {
      const method = editing ? "PATCH" : "POST"
      const url = editing ? `${API_URL}/providers/me/structures/${editing.id}` : `${API_URL}/providers/me/structures`
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(structForm),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Erreur")
      toast.success(editing ? "Structure modifiée" : "Structure ajoutée")
      setStructureModal({ open: false, editing: null })
      await load()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erreur")
    }
  }

  async function deleteStructure(id: string) {
    if (!accessToken) return
    try {
      await fetch(`${API_URL}/providers/me/structures/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      toast.success("Structure supprimée")
      await load()
    } catch {
      toast.error("Erreur")
    }
  }

  // ─── Certifications ──────────────────────────────────────────────────────

  async function saveCertification() {
    if (!accessToken || !certForm.name || !certForm.organism) return
    try {
      const res = await fetch(`${API_URL}/providers/me/certifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(certForm),
      })
      if (!res.ok) throw new Error()
      toast.success("Formation ajoutée")
      setCertModal(false)
      setCertForm({ name: "", organism: "", year: "" })
      await load()
    } catch {
      toast.error("Erreur")
    }
  }

  async function deleteCertification(id: string) {
    if (!accessToken) return
    try {
      await fetch(`${API_URL}/providers/me/certifications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      toast.success("Formation supprimée")
      await load()
    } catch {
      toast.error("Erreur")
    }
  }

  // ─── Expertise themes ─────────────────────────────────────────────────────

  const relevantThemes = profile?.professionType
    ? EXPERTISE_THEMES.filter(t => (PROFESSION_THEME_MAP[profile.professionType!] ?? []).includes(t.id))
    : EXPERTISE_THEMES

  // ─── Render ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={24} className="animate-spin text-[#4F46E5]" />
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="min-h-full bg-[#F0F2FA]">
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-4 pb-32">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-[#EEF2FF] flex items-center justify-center">
            <Settings size={18} className="text-[#4F46E5]" />
          </div>
          <div>
            <h1 className="text-[18px] font-bold text-[#0F172A]">Mon profil professionnel</h1>
            <p className="text-[12px] text-[#94A3B8]">Informations renseignées lors de votre inscription</p>
          </div>
        </div>

        {/* ── Section 1 : Identité ───────────────────────────────────────── */}
        <Section title="Identité professionnelle" icon={<User size={16} />}>
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Prénom" value={get("firstName") as string} onChange={v => set("firstName", v)} />
            <InputField label="Nom" value={get("lastName") as string} onChange={v => set("lastName", v)} />
          </div>
          <ReadOnlyField label="Email (non modifiable)" value={profile.email} />
          <InputField label="Téléphone" value={(get("phone") as string) ?? ""} onChange={v => set("phone", v || null)} placeholder="+33 6 …" />
          {profile.rppsNumber && <ReadOnlyField label="N° RPPS" value={profile.rppsNumber} />}
          {profile.adeliNumber && <ReadOnlyField label="N° ADELI" value={profile.adeliNumber} />}

          {/* Domaines d'expertise */}
          <div>
            <label className="text-[11px] font-medium text-[#64748B] uppercase tracking-wide">Domaines d&apos;expertise</label>
            <p className="text-[11px] text-[#94A3B8] mt-0.5 mb-2">Sélectionnez autant de domaines que nécessaire</p>
            <div className="space-y-3">
              {relevantThemes.map(theme => (
                <div key={theme.id}>
                  <p className="text-[11px] font-semibold text-[#64748B] mb-1.5">{theme.icon} {theme.label}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {theme.domains.map(d => (
                      <Chip
                        key={d.id}
                        label={d.label}
                        active={(get("specialties") as string[]).includes(d.id)}
                        onClick={() => toggleArr("specialties", d.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── Section 2 : Mode d'exercice ──────────────────────────────────── */}
        <Section title="Mode d'exercice" icon={<Stethoscope size={16} />}>
          <div>
            <label className="text-[11px] font-medium text-[#64748B] uppercase tracking-wide mb-2 block">Mode d&apos;exercice</label>
            <div className="grid grid-cols-2 gap-2">
              {EXERCISE_MODES.map(m => (
                <button
                  key={m.id}
                  onClick={() => set("exerciseMode", m.id)}
                  className={`px-3 py-2 rounded-lg border text-[12px] font-medium transition-colors text-left ${
                    get("exerciseMode") === m.id ? "bg-[#EEF2FF] border-[#4F46E5] text-[#4F46E5]" : "bg-white border-[#E8ECF4] text-[#64748B] hover:border-[#4F46E5]/40"
                  }`}
                >{m.label}</button>
              ))}
            </div>
          </div>

          {(get("exerciseMode") === "LIBERAL" || get("exerciseMode") === "MIXED") && (
            <div>
              <label className="text-[11px] font-medium text-[#64748B] uppercase tracking-wide mb-2 block">Secteur de convention</label>
              <div className="grid grid-cols-2 gap-2">
                {CONVENTION_SECTORS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => set("conventionSector", s.id)}
                    className={`px-3 py-2 rounded-lg border text-[12px] font-medium transition-colors text-left ${
                      get("conventionSector") === s.id ? "bg-[#EEF2FF] border-[#4F46E5] text-[#4F46E5]" : "bg-white border-[#E8ECF4] text-[#64748B] hover:border-[#4F46E5]/40"
                    }`}
                  >{s.label}</button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2 pt-1">
            <Toggle label="Accepte la CMU-C / CSS" checked={get("acceptsCMU") as boolean} onChange={v => set("acceptsCMU", v)} />
            <Toggle label="Accepte les patients ALD" checked={get("acceptsALD") as boolean} onChange={v => set("acceptsALD", v)} />
            <Toggle label="Téléconsultation disponible" checked={get("acceptsTele") as boolean} onChange={v => set("acceptsTele", v)} />
          </div>
        </Section>

        {/* ── Section 3 : Consultation ─────────────────────────────────────── */}
        <Section title="Consultation" icon={<BadgeCheck size={16} />}>
          <div>
            <label className="text-[11px] font-medium text-[#64748B] uppercase tracking-wide mb-2 block">Modes de consultation</label>
            <div className="flex flex-wrap gap-2">
              {CONSULTATION_MODES.map(m => (
                <Chip key={m.id} label={m.label} active={(get("consultationModes") as string[]).includes(m.id)} onClick={() => toggleArr("consultationModes", m.id)} />
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-[#64748B] uppercase tracking-wide mb-2 block">Types de patients acceptés</label>
            <div className="flex flex-wrap gap-2">
              {PATIENT_TYPES.map(pt => (
                <Chip key={pt.id} label={pt.label} active={(get("acceptedPatientTypes") as string[]).includes(pt.id)} onClick={() => toggleArr("acceptedPatientTypes", pt.id)} />
              ))}
            </div>
          </div>

          <Toggle
            label="Accepte de nouveaux patients"
            checked={get("acceptsNewPatients") as boolean}
            onChange={v => set("acceptsNewPatients", v)}
          />

          {get("acceptsNewPatients") && (
            <div>
              <label className="text-[11px] font-medium text-[#64748B] uppercase tracking-wide mb-2 block">Délai moyen d&apos;attente</label>
              <div className="flex flex-wrap gap-2">
                {DELAY_OPTIONS.map(d => (
                  <Chip key={d.id} label={d.label} active={get("averageDelay") === d.id} onClick={() => set("averageDelay", d.id)} />
                ))}
              </div>
            </div>
          )}
        </Section>

        {/* ── Section 4 : Structures ───────────────────────────────────────── */}
        <Section title="Structures d'exercice" icon={<Building2 size={16} />}>
          <div className="space-y-2">
            {(get("structures") as Structure[]).map(s => (
              <div key={s.id} className="flex items-start justify-between gap-3 p-3 rounded-xl border border-[#E8ECF4] bg-[#F8F9FC]">
                <div>
                  <p className="text-[13px] font-semibold text-[#0F172A]">{s.name}</p>
                  <p className="text-[11px] text-[#64748B]">{s.type} · {s.address}, {s.postalCode} {s.city}</p>
                  {s.phone && <p className="text-[11px] text-[#94A3B8]">{s.phone}</p>}
                </div>
                <button onClick={() => deleteStructure(s.id)} className="text-[#EF4444] hover:text-[#DC2626] shrink-0 mt-0.5">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={openAddStructure}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-[#4F46E5]/40 text-[#4F46E5] text-[12px] font-medium hover:bg-[#EEF2FF] transition-colors w-full justify-center"
          >
            <Plus size={14} /> Ajouter une structure
          </button>
        </Section>

        {/* ── Section 5 : Réseau & Visibilité ─────────────────────────────── */}
        <Section title="Réseau & Visibilité" icon={<Globe size={16} />}>
          <div>
            <label className="text-[11px] font-medium text-[#64748B] uppercase tracking-wide mb-2 block">Visibilité du profil</label>
            <div className="space-y-2">
              {VISIBILITY_OPTIONS.map(v => (
                <button
                  key={v.id}
                  onClick={() => set("profileVisibility", v.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border text-[12px] transition-colors ${
                    get("profileVisibility") === v.id ? "bg-[#EEF2FF] border-[#4F46E5]" : "bg-white border-[#E8ECF4] hover:border-[#4F46E5]/40"
                  }`}
                >
                  <p className={`font-medium ${get("profileVisibility") === v.id ? "text-[#4F46E5]" : "text-[#0F172A]"}`}>{v.label}</p>
                  <p className="text-[#94A3B8] text-[11px]">{v.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-[#64748B] uppercase tracking-wide mb-2 block">Zone d&apos;adressage</label>
            <div className="flex flex-wrap gap-2">
              {ADDRESSING_SCOPE.map(s => (
                <Chip key={s.id} label={s.label} active={get("addressingScope") === s.id} onClick={() => set("addressingScope", s.id)} />
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-[#64748B] uppercase tracking-wide mb-2 block">Langues parlées</label>
            <div className="flex flex-wrap gap-1.5">
              {LANGUAGES.map(l => (
                <Chip key={l.id} label={l.label} active={(get("languages") as string[]).includes(l.id)} onClick={() => toggleArr("languages", l.id)} />
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-[#64748B] uppercase tracking-wide">Biographie professionnelle</label>
            <textarea
              value={(get("bio") as string) ?? ""}
              onChange={e => set("bio", e.target.value || null)}
              rows={4}
              placeholder="Décrivez votre approche, vos spécificités, ce qui vous distingue…"
              className="mt-1 w-full px-3 py-2 rounded-lg border border-[#E8ECF4] text-[13px] text-[#0F172A] focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] outline-none resize-none"
            />
          </div>
        </Section>

        {/* ── Section 6 : Formations ───────────────────────────────────────── */}
        <Section title="Formations & Certifications" icon={<GraduationCap size={16} />}>
          <div className="space-y-2">
            {(get("certifications") as Certification[]).map(c => (
              <div key={c.id} className="flex items-start justify-between gap-3 p-3 rounded-xl border border-[#E8ECF4] bg-[#F8F9FC]">
                <div>
                  <p className="text-[13px] font-semibold text-[#0F172A]">{c.name}</p>
                  <p className="text-[11px] text-[#64748B]">{c.organism}{c.year ? ` · ${c.year}` : ""}</p>
                </div>
                <button onClick={() => deleteCertification(c.id)} className="text-[#EF4444] hover:text-[#DC2626] shrink-0 mt-0.5">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => setCertModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-[#4F46E5]/40 text-[#4F46E5] text-[12px] font-medium hover:bg-[#EEF2FF] transition-colors w-full justify-center"
          >
            <Plus size={14} /> Ajouter une formation
          </button>
        </Section>

        {/* ── Section 7 : Compte ──────────────────────────────────────────── */}
        <Section title="Compte" icon={<Mail size={16} />} defaultOpen={false}>
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-[#F8F9FC] border border-[#E8ECF4]">
              <p className="text-[12px] text-[#64748B]">Connecté en tant que</p>
              <p className="text-[13px] font-semibold text-[#0F172A]">{user?.firstName} {user?.lastName}</p>
              <p className="text-[12px] text-[#94A3B8]">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl border border-[#E8ECF4] text-[13px] font-medium text-[#64748B] hover:bg-[#FEF2F2] hover:border-[#FCA5A5] hover:text-[#EF4444] transition-colors"
            >
              <LogOut size={14} /> Se déconnecter
            </button>
          </div>
        </Section>

      </div>

      {/* ── Sticky save bar ─────────────────────────────────────────────── */}
      {hasChanges && (
        <div className="fixed bottom-0 left-[220px] right-0 bg-white border-t border-[#E8ECF4] px-6 py-3 flex items-center justify-between z-40">
          <p className="text-[12px] text-[#94A3B8]">Modifications non enregistrées</p>
          <div className="flex gap-2">
            <button
              onClick={() => setChanges({})}
              className="px-4 py-2 rounded-lg text-[12px] font-medium text-[#64748B] hover:bg-[#F1F5F9] transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-medium text-white bg-[#4F46E5] hover:bg-[#4338CA] disabled:opacity-60 transition-colors"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              Enregistrer
            </button>
          </div>
        </div>
      )}

      {/* ── Modal structure ─────────────────────────────────────────────── */}
      {structureModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setStructureModal({ open: false, editing: null })} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-3" onClick={e => e.stopPropagation()}>
            <h3 className="text-[15px] font-semibold text-[#0F172A]">
              {structureModal.editing ? "Modifier la structure" : "Ajouter une structure"}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-[11px] font-medium text-[#64748B] uppercase tracking-wide">Nom *</label>
                <input value={structForm.name} onChange={e => setStructForm(f => ({ ...f, name: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-[#E8ECF4] text-[13px] outline-none focus:border-[#4F46E5]" />
              </div>
              <div className="col-span-2">
                <label className="text-[11px] font-medium text-[#64748B] uppercase tracking-wide">Type *</label>
                <select value={structForm.type} onChange={e => setStructForm(f => ({ ...f, type: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-[#E8ECF4] text-[13px] outline-none focus:border-[#4F46E5] bg-white">
                  {STRUCTURE_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-[11px] font-medium text-[#64748B] uppercase tracking-wide">Adresse *</label>
                <input value={structForm.address} onChange={e => setStructForm(f => ({ ...f, address: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-[#E8ECF4] text-[13px] outline-none focus:border-[#4F46E5]" />
              </div>
              <div>
                <label className="text-[11px] font-medium text-[#64748B] uppercase tracking-wide">Code postal *</label>
                <input value={structForm.postalCode} onChange={e => setStructForm(f => ({ ...f, postalCode: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-[#E8ECF4] text-[13px] outline-none focus:border-[#4F46E5]" />
              </div>
              <div>
                <label className="text-[11px] font-medium text-[#64748B] uppercase tracking-wide">Ville *</label>
                <input value={structForm.city} onChange={e => setStructForm(f => ({ ...f, city: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-[#E8ECF4] text-[13px] outline-none focus:border-[#4F46E5]" />
              </div>
              <div>
                <label className="text-[11px] font-medium text-[#64748B] uppercase tracking-wide">Téléphone</label>
                <input value={structForm.phone} onChange={e => setStructForm(f => ({ ...f, phone: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-[#E8ECF4] text-[13px] outline-none focus:border-[#4F46E5]" />
              </div>
              <div>
                <label className="text-[11px] font-medium text-[#64748B] uppercase tracking-wide">Fax</label>
                <input value={structForm.fax} onChange={e => setStructForm(f => ({ ...f, fax: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-[#E8ECF4] text-[13px] outline-none focus:border-[#4F46E5]" />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setStructureModal({ open: false, editing: null })}
                className="flex-1 py-2 rounded-lg text-[12px] font-medium text-[#64748B] border border-[#E8ECF4] hover:bg-[#F1F5F9]">
                Annuler
              </button>
              <button onClick={saveStructure}
                className="flex-1 py-2 rounded-lg text-[12px] font-medium text-white bg-[#4F46E5] hover:bg-[#4338CA]">
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal certification ─────────────────────────────────────────── */}
      {certModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCertModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 space-y-3" onClick={e => e.stopPropagation()}>
            <h3 className="text-[15px] font-semibold text-[#0F172A]">Ajouter une formation</h3>
            <div>
              <label className="text-[11px] font-medium text-[#64748B] uppercase tracking-wide">Intitulé *</label>
              <input value={certForm.name} onChange={e => setCertForm(f => ({ ...f, name: e.target.value }))}
                placeholder="ex: DU Nutrition clinique"
                className="mt-1 w-full px-3 py-2 rounded-lg border border-[#E8ECF4] text-[13px] outline-none focus:border-[#4F46E5]" />
            </div>
            <div>
              <label className="text-[11px] font-medium text-[#64748B] uppercase tracking-wide">Organisme *</label>
              <input value={certForm.organism} onChange={e => setCertForm(f => ({ ...f, organism: e.target.value }))}
                placeholder="ex: Université Paris VI"
                className="mt-1 w-full px-3 py-2 rounded-lg border border-[#E8ECF4] text-[13px] outline-none focus:border-[#4F46E5]" />
            </div>
            <div>
              <label className="text-[11px] font-medium text-[#64748B] uppercase tracking-wide">Année</label>
              <input value={certForm.year} onChange={e => setCertForm(f => ({ ...f, year: e.target.value }))}
                placeholder="ex: 2022"
                className="mt-1 w-full px-3 py-2 rounded-lg border border-[#E8ECF4] text-[13px] outline-none focus:border-[#4F46E5]" />
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setCertModal(false)}
                className="flex-1 py-2 rounded-lg text-[12px] font-medium text-[#64748B] border border-[#E8ECF4] hover:bg-[#F1F5F9]">
                Annuler
              </button>
              <button onClick={saveCertification}
                className="flex-1 py-2 rounded-lg text-[12px] font-medium text-white bg-[#4F46E5] hover:bg-[#4338CA]">
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
