"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAuthStore } from "@/lib/store"
import { authApi, mfaApi } from "@/lib/api"
import { EXPERTISE_THEMES, PROFESSION_THEME_MAP } from "@/lib/data/specialties"
import { ShimmerCard } from "@/components/ui/shimmer"
import {
  Loader2, Save, Plus, Trash2, LogOut, Download, Shield,
} from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

// ─── Constantes ───────────────────────────────────────────────────────────────

const EXERCISE_MODES = [
  { id: "LIBERAL",  label: "Libéral" },
  { id: "SALARIED", label: "Salarié" },
  { id: "MIXED",    label: "Mixte" },
  { id: "HOSPITAL", label: "Hospitalier" },
]

const CONVENTION_SECTORS = [
  { id: "SECTOR_1", label: "Secteur 1" },
  { id: "SECTOR_2", label: "Secteur 2" },
  { id: "SECTOR_3", label: "Non conventionné" },
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
  { id: "OVER_MONTH",   label: "Plus d&apos;un mois" },
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
  { id: "ALL",           label: "Profil public",                        sub: "Visible par tous les professionnels et patients · indexé Google" },
  { id: "VERIFIED_ONLY", label: "Professionnels vérifiés uniquement",   sub: "Visible uniquement par les soignants Nami avec RPPS/ADELI validé" },
  { id: "PRIVATE",       label: "Profil privé",                         sub: "Non visible dans l&apos;annuaire · introuvable publiquement" },
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
  firstName: string; lastName: string; email: string; phone?: string | null
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

// ─── Design tokens ────────────────────────────────────────────────────────────

const P = "#5B4EC4"
const PL = "rgba(91,78,196,0.08)"
const DARK = "#1A1A2E"
const MID = "#374151"
const LIGHT = "#6B7280"
const BG = "#FAFAF8"
const BGALT = "#F5F3EF"
const BORDER = "rgba(26,26,46,0.08)"
const BORDERMED = "rgba(26,26,46,0.14)"
const CARD = "#FFFFFF"
const SUCCESS = "#2BA84A"
const DANGER = "#D94F4F"
const WARNING = "#E6993E"

// ─── Primitives ───────────────────────────────────────────────────────────────

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 8, cursor: "pointer",
        border: active ? "none" : `1px solid ${BORDERMED}`,
        background: active ? P : CARD,
        color: active ? "#fff" : MID,
        transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  )
}

function Toggle({ label, sub, checked, onChange }: { label: string; sub?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0" }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, color: DARK }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: LIGHT, marginTop: 1 }}>{sub}</div>}
      </div>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 44, height: 24, borderRadius: 12, cursor: "pointer", padding: 2, flexShrink: 0,
          background: checked ? P : BORDERMED,
          transition: "background 0.2s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <div style={{
          width: 20, height: 20, borderRadius: "50%", background: "#fff",
          transform: checked ? "translateX(20px)" : "translateX(0)",
          transition: "transform 0.2s cubic-bezier(0.16,1,0.3,1)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
        }} />
      </div>
    </div>
  )
}

function SL({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: LIGHT, marginBottom: 10 }}>{children}</div>
}

function ReadOnlyField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: LIGHT, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 5 }}>{label}</div>
      <div style={{ padding: "10px 14px", borderRadius: 8, background: BGALT, fontSize: 14, color: LIGHT }}>{value || "—"}</div>
    </div>
  )
}

function InputField({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: LIGHT, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 5 }}>{label}</div>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", padding: "10px 14px", borderRadius: 8,
          border: `1px solid ${BORDER}`, background: CARD,
          fontSize: 14, fontFamily: "inherit", color: DARK, outline: "none",
        }}
      />
    </div>
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
  const [activeSection, setActiveSection] = useState("identite")

  // Structures
  const [structureModal, setStructureModal] = useState<{ open: boolean; editing: Structure | null }>({ open: false, editing: null })
  const [structForm, setStructForm] = useState({ name: "", type: "Cabinet libéral", address: "", city: "", postalCode: "", phone: "", fax: "" })

  // Certifications
  const [certModal, setCertModal] = useState(false)
  const [certForm, setCertForm] = useState({ name: "", organism: "", year: "" })

  // MFA
  const [totpEnabled, setTotpEnabled] = useState(false)
  const [mfaSetup, setMfaSetup] = useState<{ qrCodeDataUrl: string; secret: string } | null>(null)
  const [mfaCode, setMfaCode] = useState("")
  const [mfaLoading, setMfaLoading] = useState(false)
  const [mfaDisableMode, setMfaDisableMode] = useState(false)
  const [mfaDisableCode, setMfaDisableCode] = useState("")

  // ─── Load ─────────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    if (!accessToken) return
    try {
      const res = await fetch(`${API_URL}/providers/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setTotpEnabled(data.totpEnabled ?? false)
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

  // ─── Helpers ──────────────────────────────────────────────────────────────

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

  // ─── Save ──────────────────────────────────────────────────────────────────

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

  // ─── Logout ───────────────────────────────────────────────────────────────

  async function handleLogout() {
    if (refreshToken) await authApi.logout(refreshToken).catch(() => {})
    logout()
    router.push("/login")
    toast.success("Déconnecté")
  }

  // ─── Structures ───────────────────────────────────────────────────────────

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

  // ─── Certifications ───────────────────────────────────────────────────────

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

  // ─── MFA ──────────────────────────────────────────────────────────────────

  async function handleMfaSetup() {
    if (!accessToken) return
    setMfaLoading(true)
    try {
      const res = await mfaApi.setup(accessToken)
      setMfaSetup(res)
      setMfaCode("")
    } catch {
      toast.error("Erreur lors de la configuration MFA")
    } finally {
      setMfaLoading(false)
    }
  }

  async function handleMfaEnable() {
    if (!accessToken || !mfaSetup || mfaCode.length !== 6) return
    setMfaLoading(true)
    try {
      await mfaApi.enable(accessToken, mfaCode)
      setTotpEnabled(true)
      setMfaSetup(null)
      setMfaCode("")
      toast.success("Double authentification activée")
    } catch {
      toast.error("Code incorrect. Réessayez.")
      setMfaCode("")
    } finally {
      setMfaLoading(false)
    }
  }

  async function handleMfaDisable() {
    if (!accessToken || mfaDisableCode.length !== 6) return
    setMfaLoading(true)
    try {
      await mfaApi.disable(accessToken, mfaDisableCode)
      setTotpEnabled(false)
      setMfaDisableMode(false)
      setMfaDisableCode("")
      toast.success("Double authentification désactivée")
    } catch {
      toast.error("Code incorrect. Réessayez.")
      setMfaDisableCode("")
    } finally {
      setMfaLoading(false)
    }
  }

  // ─── Expertise themes ─────────────────────────────────────────────────────

  const relevantThemes = profile?.professionType
    ? EXPERTISE_THEMES.filter(t => (PROFESSION_THEME_MAP[profile.professionType!] ?? []).includes(t.id))
    : EXPERTISE_THEMES

  // ─── Nav sections ─────────────────────────────────────────────────────────

  const navSections = [
    { id: "identite",    icon: "👤", label: "Identité professionnelle" },
    { id: "exercice",    icon: "⚕️", label: "Mode d'exercice" },
    { id: "consultation",icon: "📋", label: "Consultation" },
    { id: "structures",  icon: "🏥", label: "Structures d'exercice" },
    { id: "visibilite",  icon: "🌐", label: "Réseau & Visibilité" },
    { id: "formations",  icon: "🎓", label: "Formations" },
    { id: "sep1", sep: true },
    { id: "securite",    icon: "🔒", label: "Sécurité" },
    { id: "compte",      icon: "⚙️", label: "Compte" },
    { id: "rgpd",        icon: "🛡️", label: "Confidentialité & RGPD" },
  ]

  const activeLabel = navSections.find(s => s.id === activeSection)?.label ?? ""

  // ─── Render ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ minHeight: "100%", background: BG }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px" }}>
          {[...Array(4)].map((_, i) => <ShimmerCard key={i} />)}
        </div>
      </div>
    )
  }

  if (!profile) return null

  const card: React.CSSProperties = {
    background: CARD,
    borderRadius: 12,
    border: `1px solid ${BORDER}`,
    boxShadow: "0 1px 3px rgba(26,26,46,0.04), 0 4px 12px rgba(26,26,46,0.03)",
  }

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif", background: BG, minHeight: "100%", padding: "24px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: DARK, letterSpacing: "-0.02em" }}>Réglages</div>
          <div style={{ fontSize: 13, color: LIGHT, marginTop: 2 }}>Mon profil professionnel, sécurité et préférences</div>
        </div>

        <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>

          {/* ── Left nav ── */}
          <div style={{ width: 220, flexShrink: 0 }}>
            <div style={{ ...card, padding: "8px 6px", position: "sticky", top: 24 }}>
              {navSections.map(s => {
                if (s.sep) return <div key={s.id} style={{ height: 1, background: BORDER, margin: "6px 10px" }} />
                const isActive = activeSection === s.id
                return (
                  <div
                    key={s.id}
                    onClick={() => setActiveSection(s.id!)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "9px 12px", borderRadius: 8, cursor: "pointer",
                      background: isActive ? PL : "transparent",
                      transition: "background 0.15s",
                    }}
                  >
                    <span style={{ fontSize: 14, width: 20, textAlign: "center" }}>{s.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 500, color: isActive ? P : MID }}>{s.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Content panel ── */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={card}>
              <div style={{ padding: "18px 24px", borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: DARK }}>{activeLabel}</div>
              </div>
              <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }}>

                {/* ── Identité ── */}
                {activeSection === "identite" && <>
                  <div style={{ display: "flex", gap: 12 }}>
                    <InputField label="Prénom" value={get("firstName") as string} onChange={v => set("firstName", v)} />
                    <InputField label="Nom" value={get("lastName") as string} onChange={v => set("lastName", v)} />
                  </div>
                  <ReadOnlyField label="Email (non modifiable)" value={profile.email} />
                  <InputField label="Téléphone" value={(get("phone") as string) ?? ""} onChange={v => set("phone", v || null)} placeholder="+33 6 …" />
                  {profile.rppsNumber && <ReadOnlyField label="N° RPPS" value={profile.rppsNumber} />}
                  {profile.adeliNumber && <ReadOnlyField label="N° ADELI" value={profile.adeliNumber} />}
                  <div>
                    <SL>Domaines d&apos;expertise</SL>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {relevantThemes.map(theme => (
                        <div key={theme.id}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: MID, marginBottom: 8 }}>{theme.icon} {theme.label}</div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
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
                </>}

                {/* ── Exercice ── */}
                {activeSection === "exercice" && <>
                  <div>
                    <SL>Mode d&apos;exercice</SL>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {EXERCISE_MODES.map(m => (
                        <Chip key={m.id} label={m.label} active={get("exerciseMode") === m.id} onClick={() => set("exerciseMode", m.id)} />
                      ))}
                    </div>
                  </div>
                  {(get("exerciseMode") === "LIBERAL" || get("exerciseMode") === "MIXED") && (
                    <div>
                      <SL>Secteur de convention</SL>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {CONVENTION_SECTORS.map(s => (
                          <Chip key={s.id} label={s.label} active={get("conventionSector") === s.id} onClick={() => set("conventionSector", s.id)} />
                        ))}
                      </div>
                    </div>
                  )}
                  <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 16 }}>
                    <Toggle label="Accepte la CMU-C / CSS" checked={get("acceptsCMU") as boolean} onChange={v => set("acceptsCMU", v)} />
                    <Toggle label="Accepte les patients ALD" checked={get("acceptsALD") as boolean} onChange={v => set("acceptsALD", v)} />
                    <Toggle label="Téléconsultation disponible" checked={get("acceptsTele") as boolean} onChange={v => set("acceptsTele", v)} />
                  </div>
                </>}

                {/* ── Consultation ── */}
                {activeSection === "consultation" && <>
                  <div>
                    <SL>Modes de consultation</SL>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {CONSULTATION_MODES.map(m => (
                        <Chip key={m.id} label={m.label} active={(get("consultationModes") as string[]).includes(m.id)} onClick={() => toggleArr("consultationModes", m.id)} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <SL>Types de patients acceptés</SL>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
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
                      <SL>Délai moyen d&apos;attente</SL>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {DELAY_OPTIONS.map(d => (
                          <Chip key={d.id} label={d.label} active={get("averageDelay") === d.id} onClick={() => set("averageDelay", d.id)} />
                        ))}
                      </div>
                    </div>
                  )}
                  <div style={{ padding: "12px 16px", borderRadius: 8, background: PL, fontSize: 13, color: P }}>
                    Pour les paramètres fins de l&apos;agenda (créneaux, durées, smart slots), rendez-vous sur{" "}
                    <a href="/agenda/parametrage" style={{ fontWeight: 700, color: P }}>Paramètres de l&apos;agenda →</a>
                  </div>
                </>}

                {/* ── Structures ── */}
                {activeSection === "structures" && <>
                  <div style={{ fontSize: 13, color: LIGHT }}>Vos structures d&apos;exercice. La structure principale apparaît en premier sur votre profil public.</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {(get("structures") as Structure[]).map((s, i) => (
                      <div key={s.id} style={{
                        display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
                        borderRadius: 8,
                        border: `1px solid ${i === 0 ? "rgba(91,78,196,0.2)" : BORDER}`,
                        background: i === 0 ? PL : CARD,
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: DARK }}>{s.name}</div>
                          <div style={{ fontSize: 12, color: LIGHT, marginTop: 2 }}>{s.type} · {s.address}, {s.postalCode} {s.city}</div>
                          {s.phone && <div style={{ fontSize: 12, color: LIGHT }}>{s.phone}</div>}
                        </div>
                        {i === 0 && (
                          <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 999, background: PL, color: P, whiteSpace: "nowrap" }}>Principale</span>
                        )}
                        <button
                          onClick={() => deleteStructure(s.id)}
                          style={{ color: DANGER, background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setStructForm({ name: "", type: "Cabinet libéral", address: "", city: "", postalCode: "", phone: "", fax: "" })
                      setStructureModal({ open: true, editing: null })
                    }}
                    style={{
                      padding: "12px", borderRadius: 8, border: `2px dashed ${BORDERMED}`,
                      background: "transparent", fontSize: 13, fontWeight: 600, color: P, cursor: "pointer", width: "100%",
                    }}
                  >
                    + Rejoindre une structure
                  </button>
                </>}

                {/* ── Visibilité ── */}
                {activeSection === "visibilite" && <>
                  <div>
                    <SL>Visibilité du profil</SL>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {VISIBILITY_OPTIONS.map(v => (
                        <div
                          key={v.id}
                          onClick={() => set("profileVisibility", v.id)}
                          style={{
                            padding: "14px 16px", borderRadius: 8, cursor: "pointer",
                            border: get("profileVisibility") === v.id ? `2px solid ${P}` : `1px solid ${BORDER}`,
                            background: get("profileVisibility") === v.id ? PL : CARD,
                          }}
                        >
                          <div style={{ fontSize: 14, fontWeight: 600, color: get("profileVisibility") === v.id ? P : DARK }}>{v.label}</div>
                          <div style={{ fontSize: 12, color: LIGHT, marginTop: 2 }}>{v.sub}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <SL>Zone d&apos;adressage</SL>
                    <div style={{ display: "flex", gap: 6 }}>
                      {ADDRESSING_SCOPE.map(s => (
                        <Chip key={s.id} label={s.label} active={get("addressingScope") === s.id} onClick={() => set("addressingScope", s.id)} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <SL>Langues parlées</SL>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {LANGUAGES.map(l => (
                        <Chip key={l.id} label={l.label} active={(get("languages") as string[]).includes(l.id)} onClick={() => toggleArr("languages", l.id)} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <SL>Biographie professionnelle</SL>
                    <textarea
                      value={(get("bio") as string) ?? ""}
                      onChange={e => set("bio", e.target.value || null)}
                      rows={4}
                      placeholder="Décrivez votre approche, vos spécificités, ce qui vous distingue…"
                      style={{
                        width: "100%", padding: "12px 14px", borderRadius: 8,
                        border: `1px solid ${BORDER}`, fontSize: 14, fontFamily: "inherit",
                        resize: "vertical", minHeight: 100, outline: "none", color: DARK,
                      }}
                    />
                  </div>
                </>}

                {/* ── Formations ── */}
                {activeSection === "formations" && <>
                  <div style={{ fontSize: 13, color: LIGHT }}>Vos diplômes et certifications renforcent la confiance des confrères qui consultent votre profil avant un adressage.</div>
                  {(get("certifications") as Certification[]).length === 0 && (
                    <div style={{ padding: "20px", borderRadius: 8, background: BG, textAlign: "center" }}>
                      <div style={{ fontSize: 13, color: LIGHT }}>Aucune formation renseignée</div>
                    </div>
                  )}
                  {(get("certifications") as Certification[]).map(c => (
                    <div key={c.id} style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: 12, padding: "12px 16px", borderRadius: 8, border: `1px solid ${BORDER}`, background: BGALT }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: DARK }}>{c.name}</div>
                        <div style={{ fontSize: 12, color: LIGHT, marginTop: 2 }}>{c.organism}{c.year ? ` · ${c.year}` : ""}</div>
                      </div>
                      <button onClick={() => deleteCertification(c.id)} style={{ color: DANGER, background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setCertModal(true)}
                    style={{ padding: "12px", borderRadius: 8, border: `2px dashed ${BORDERMED}`, background: "transparent", fontSize: 13, fontWeight: 600, color: P, cursor: "pointer", width: "100%" }}
                  >
                    + Ajouter une formation
                  </button>
                </>}

                {/* ── Sécurité ── */}
                {activeSection === "securite" && <>
                  {!totpEnabled && !mfaSetup && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <div style={{ padding: "16px 18px", borderRadius: 8, background: `rgba(230,153,62,0.08)`, border: `1px solid rgba(230,153,62,0.2)` }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: DARK, marginBottom: 4 }}>Authentification à deux facteurs désactivée</div>
                        <div style={{ fontSize: 13, color: MID, lineHeight: 1.6 }}>Recommandée pour les comptes accédant à des dossiers de coordination. Obligatoire pour le tier Intelligence et au-delà.</div>
                      </div>
                      <button
                        onClick={handleMfaSetup}
                        disabled={mfaLoading}
                        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 20px", borderRadius: 8, border: "none", background: P, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
                      >
                        {mfaLoading ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
                        Activer le 2FA
                      </button>
                    </div>
                  )}
                  {!totpEnabled && mfaSetup && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "18px", borderRadius: 8, border: `1px solid ${BORDER}` }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: DARK }}>Configuration du 2FA</div>
                      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                        <div style={{ width: 160, height: 160, borderRadius: 8, overflow: "hidden", border: `1px solid ${BORDER}`, flexShrink: 0 }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={mfaSetup.qrCodeDataUrl} alt="QR Code TOTP" style={{ width: "100%", height: "100%" }} />
                        </div>
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
                          <div style={{ fontSize: 13, color: MID, lineHeight: 1.6 }}>Scannez ce QR code avec Authy ou Google Authenticator, puis saisissez le code à 6 chiffres généré.</div>
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 600, color: LIGHT, textTransform: "uppercase", marginBottom: 4 }}>Clé manuelle</div>
                            <div style={{ padding: "8px 12px", borderRadius: 8, background: BGALT, fontSize: 13, fontFamily: "monospace", color: DARK, wordBreak: "break-all" }}>{mfaSetup.secret}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 600, color: LIGHT, textTransform: "uppercase", marginBottom: 4 }}>Code de vérification</div>
                            <input
                              type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6}
                              value={mfaCode}
                              onChange={e => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                              placeholder="_ _ _ _ _ _"
                              autoComplete="one-time-code"
                              style={{ width: 140, padding: "10px 14px", borderRadius: 8, border: `1px solid ${BORDER}`, fontSize: 18, fontFamily: "monospace", textAlign: "center", letterSpacing: "0.2em", outline: "none" }}
                            />
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => { setMfaSetup(null); setMfaCode("") }} style={{ fontSize: 13, padding: "10px 16px", borderRadius: 8, border: `1px solid ${BORDERMED}`, background: "transparent", color: MID, cursor: "pointer" }}>Annuler</button>
                            <button
                              onClick={handleMfaEnable}
                              disabled={mfaLoading || mfaCode.length !== 6}
                              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, padding: "10px 20px", borderRadius: 8, border: "none", background: SUCCESS, color: "#fff", cursor: "pointer", opacity: mfaLoading || mfaCode.length !== 6 ? 0.6 : 1 }}
                            >
                              {mfaLoading && <Loader2 size={13} className="animate-spin" />}
                              Vérifier et activer
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {totpEnabled && !mfaDisableMode && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <div style={{ padding: "16px 18px", borderRadius: 8, background: `rgba(43,168,74,0.06)`, border: `1px solid rgba(43,168,74,0.15)` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span style={{ color: SUCCESS, fontWeight: 700 }}>✓</span>
                          <span style={{ fontSize: 14, fontWeight: 600, color: SUCCESS }}>Authentification à deux facteurs activée</span>
                        </div>
                        <div style={{ fontSize: 12, color: MID }}>Votre compte est protégé par TOTP (RFC 6238)</div>
                      </div>
                      <button
                        onClick={() => setMfaDisableMode(true)}
                        style={{ fontSize: 13, padding: "10px 16px", borderRadius: 8, border: `1px solid ${BORDERMED}`, background: "transparent", color: DANGER, cursor: "pointer" }}
                      >
                        Désactiver la double authentification
                      </button>
                    </div>
                  )}
                  {totpEnabled && mfaDisableMode && (
                    <div style={{ padding: "16px 18px", borderRadius: 8, background: `rgba(217,79,79,0.06)`, border: `1px solid rgba(217,79,79,0.15)` }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: DANGER, marginBottom: 8 }}>Confirmer la désactivation du 2FA</div>
                      <div style={{ fontSize: 13, color: MID, lineHeight: 1.6, marginBottom: 12 }}>Saisissez votre code TOTP actuel pour confirmer.</div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <input
                          type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6}
                          value={mfaDisableCode}
                          onChange={e => setMfaDisableCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          placeholder="_ _ _ _ _ _"
                          autoComplete="one-time-code"
                          style={{ width: 140, padding: "10px 14px", borderRadius: 8, border: `1px solid ${BORDER}`, fontSize: 18, fontFamily: "monospace", textAlign: "center", letterSpacing: "0.2em", outline: "none" }}
                        />
                        <button
                          onClick={handleMfaDisable}
                          disabled={mfaLoading || mfaDisableCode.length !== 6}
                          style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, padding: "10px 20px", borderRadius: 8, border: "none", background: DANGER, color: "#fff", cursor: "pointer", opacity: mfaLoading || mfaDisableCode.length !== 6 ? 0.6 : 1 }}
                        >
                          {mfaLoading && <Loader2 size={13} className="animate-spin" />}
                          Confirmer
                        </button>
                        <button onClick={() => { setMfaDisableMode(false); setMfaDisableCode("") }} style={{ fontSize: 13, padding: "10px 14px", borderRadius: 8, border: `1px solid ${BORDERMED}`, background: "transparent", color: MID, cursor: "pointer" }}>Annuler</button>
                      </div>
                    </div>
                  )}
                </>}

                {/* ── Compte ── */}
                {activeSection === "compte" && <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div style={{ padding: "14px 16px", borderRadius: 8, background: BGALT }}>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: LIGHT, marginBottom: 4 }}>Email</div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: DARK }}>{user?.email}</div>
                    </div>
                    <div style={{ padding: "14px 16px", borderRadius: 8, background: BGALT }}>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: LIGHT, marginBottom: 4 }}>Nom</div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: DARK }}>{user?.firstName} {user?.lastName}</div>
                    </div>
                  </div>
                  <div style={{ padding: "12px 16px", borderRadius: 8, border: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: DARK }}>Abonnement actuel</div>
                      <div style={{ fontSize: 12, color: LIGHT, marginTop: 1 }}>Pour gérer votre abonnement, contactez support@namipourlavie.com</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: LIGHT }}>Pour changer votre mot de passe, utilisez la fonctionnalité &quot;Mot de passe oublié&quot; sur la page de connexion.</div>
                  <button
                    onClick={handleLogout}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderRadius: 8, border: `1px solid ${BORDERMED}`, background: "transparent", fontSize: 14, fontWeight: 500, color: DANGER, cursor: "pointer" }}
                  >
                    <LogOut size={14} /> Se déconnecter
                  </button>
                </>}

                {/* ── RGPD ── */}
                {activeSection === "rgpd" && <>
                  <div style={{ padding: "16px 18px", borderRadius: 8, border: `1px solid ${BORDER}`, background: CARD }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: DARK, marginBottom: 4 }}>Exporter mes données</div>
                    <div style={{ fontSize: 13, color: MID, lineHeight: 1.6, marginBottom: 12 }}>Téléchargez l&apos;ensemble de vos données personnelles et professionnelles au format JSON (RGPD Art. 20).</div>
                    <button
                      onClick={async () => {
                        if (!user?.personId || !accessToken) return
                        try {
                          const res = await fetch(`${API_URL}/persons/${user.personId}/data-export`, {
                            headers: { Authorization: `Bearer ${accessToken}` },
                          })
                          if (!res.ok) throw new Error("Erreur export")
                          const blob = await res.blob()
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement("a")
                          a.href = url
                          a.download = `export_rgpd_${new Date().toISOString().slice(0, 10)}.json`
                          a.click()
                          URL.revokeObjectURL(url)
                          toast.success("Export RGPD téléchargé")
                        } catch {
                          toast.error("Erreur lors de l&apos;export")
                        }
                      }}
                      style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 8, border: `1px solid ${BORDERMED}`, background: CARD, fontSize: 13, fontWeight: 600, color: P, cursor: "pointer" }}
                    >
                      <Download size={14} /> Télécharger mes données
                    </button>
                  </div>

                  <div style={{ padding: "16px 18px", borderRadius: 8, border: `1px solid ${BORDER}`, background: CARD }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: DARK, marginBottom: 4 }}>Consentements IA</div>
                    <div style={{ fontSize: 13, color: MID, lineHeight: 1.6, marginBottom: 12 }}>Vous pouvez révoquer le consentement aux traitements IA. Cela désactivera ces fonctionnalités sur votre compte.</div>
                    <Toggle label="Synthèses IA de dossiers patients" sub="Résumés cliniques générés par Claude" checked={true} onChange={() => {}} />
                    <Toggle label="Analyse automatique des notes" sub="Extraction de tâches et éléments signalés" checked={true} onChange={() => {}} />
                    <Toggle label="Génération de lettres d'adressage" sub="Brouillons de courriers de coordination" checked={true} onChange={() => {}} />
                  </div>

                  <div style={{ padding: "14px 16px", borderRadius: 8, background: `rgba(217,79,79,0.06)`, border: `1px solid rgba(217,79,79,0.15)` }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: DANGER, marginBottom: 4 }}>Supprimer mon compte</div>
                    <div style={{ fontSize: 13, color: MID, lineHeight: 1.6, marginBottom: 8 }}>La suppression nécessite un traitement manuel (archivage RGPD des dossiers associés).</div>
                    <a href="mailto:dpo@namipourlavie.com" style={{ fontSize: 12, padding: "7px 14px", borderRadius: 8, border: `1px solid rgba(217,79,79,0.3)`, color: DANGER, cursor: "pointer", textDecoration: "none", display: "inline-block" }}>
                      Contacter le support →
                    </a>
                  </div>
                </>}

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky save bar ── */}
      {hasChanges && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          padding: "12px 24px", background: CARD, borderTop: `1px solid ${BORDER}`,
          boxShadow: "0 -4px 16px rgba(26,26,46,0.06)",
          display: "flex", justifyContent: "center", alignItems: "center", gap: 12, zIndex: 50,
        }}>
          <span style={{ fontSize: 12, color: LIGHT }}>Modifications non enregistrées</span>
          <button
            onClick={() => setChanges({})}
            style={{ fontSize: 13, padding: "10px 24px", borderRadius: 8, border: `1px solid ${BORDERMED}`, background: "transparent", color: MID, cursor: "pointer" }}
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, padding: "10px 28px", borderRadius: 8, border: "none", background: P, color: "#fff", cursor: "pointer", opacity: saving ? 0.7 : 1 }}
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            Enregistrer
          </button>
        </div>
      )}

      {/* ── Modal structure ── */}
      {structureModal.open && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} onClick={() => setStructureModal({ open: false, editing: null })} />
          <div style={{ position: "relative", background: CARD, borderRadius: 16, boxShadow: "0 20px 60px rgba(26,26,46,0.2)", width: "100%", maxWidth: 440, margin: "0 16px", padding: 24, display: "flex", flexDirection: "column", gap: 12 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 15, fontWeight: 600, color: DARK }}>{structureModal.editing ? "Modifier la structure" : "Ajouter une structure"}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: LIGHT, textTransform: "uppercase", marginBottom: 4 }}>Nom *</div>
                <input value={structForm.name} onChange={e => setStructForm(f => ({ ...f, name: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${BORDER}`, fontSize: 13, outline: "none", fontFamily: "inherit" }} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: LIGHT, textTransform: "uppercase", marginBottom: 4 }}>Type *</div>
                <select value={structForm.type} onChange={e => setStructForm(f => ({ ...f, type: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${BORDER}`, fontSize: 13, outline: "none", background: CARD, fontFamily: "inherit" }}>
                  {STRUCTURE_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: LIGHT, textTransform: "uppercase", marginBottom: 4 }}>Adresse *</div>
                <input value={structForm.address} onChange={e => setStructForm(f => ({ ...f, address: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${BORDER}`, fontSize: 13, outline: "none", fontFamily: "inherit" }} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: LIGHT, textTransform: "uppercase", marginBottom: 4 }}>Code postal *</div>
                <input value={structForm.postalCode} onChange={e => setStructForm(f => ({ ...f, postalCode: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${BORDER}`, fontSize: 13, outline: "none", fontFamily: "inherit" }} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: LIGHT, textTransform: "uppercase", marginBottom: 4 }}>Ville *</div>
                <input value={structForm.city} onChange={e => setStructForm(f => ({ ...f, city: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${BORDER}`, fontSize: 13, outline: "none", fontFamily: "inherit" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button onClick={() => setStructureModal({ open: false, editing: null })} style={{ flex: 1, padding: "10px", borderRadius: 8, border: `1px solid ${BORDERMED}`, background: "transparent", fontSize: 13, fontWeight: 500, color: MID, cursor: "pointer", fontFamily: "inherit" }}>Annuler</button>
              <button onClick={saveStructure} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: P, fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer", fontFamily: "inherit" }}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal certification ── */}
      {certModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} onClick={() => setCertModal(false)} />
          <div style={{ position: "relative", background: CARD, borderRadius: 16, boxShadow: "0 20px 60px rgba(26,26,46,0.2)", width: "100%", maxWidth: 380, margin: "0 16px", padding: 24, display: "flex", flexDirection: "column", gap: 12 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 15, fontWeight: 600, color: DARK }}>Ajouter une formation</div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: LIGHT, textTransform: "uppercase", marginBottom: 4 }}>Intitulé *</div>
              <input value={certForm.name} onChange={e => setCertForm(f => ({ ...f, name: e.target.value }))} placeholder="ex: DU Nutrition clinique" style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${BORDER}`, fontSize: 13, outline: "none", fontFamily: "inherit" }} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: LIGHT, textTransform: "uppercase", marginBottom: 4 }}>Organisme *</div>
              <input value={certForm.organism} onChange={e => setCertForm(f => ({ ...f, organism: e.target.value }))} placeholder="ex: Université Paris VI" style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${BORDER}`, fontSize: 13, outline: "none", fontFamily: "inherit" }} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: LIGHT, textTransform: "uppercase", marginBottom: 4 }}>Année</div>
              <input value={certForm.year} onChange={e => setCertForm(f => ({ ...f, year: e.target.value }))} placeholder="ex: 2022" style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${BORDER}`, fontSize: 13, outline: "none", fontFamily: "inherit" }} />
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button onClick={() => setCertModal(false)} style={{ flex: 1, padding: "10px", borderRadius: 8, border: `1px solid ${BORDERMED}`, background: "transparent", fontSize: 13, fontWeight: 500, color: MID, cursor: "pointer", fontFamily: "inherit" }}>Annuler</button>
              <button onClick={saveCertification} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: P, fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer", fontFamily: "inherit" }}>Ajouter</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
