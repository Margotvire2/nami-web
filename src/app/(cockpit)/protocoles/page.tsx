"use client"

import { useState, useRef, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useAuthStore } from "@/lib/store"
import { apiWithToken, type SemanticSearchResult } from "@/lib/api"
import { DecisionTreeExplorer } from "@/components/nami/decision-tree-navigator"
import { CasCliniquePlayer } from "@/components/nami/cas-clinique"
import { ChecklistConsultation } from "@/components/nami/checklist-consultation"
import { Glossaire } from "@/components/nami/glossaire"
import { AnnuaireStructures } from "@/components/nami/annuaire-structures"
import { QuestionnaireInteractif } from "@/components/nami/questionnaire-interactif"
import { Flashcards } from "@/components/nami/flashcards"
import { MemoSeuils } from "@/components/nami/memo-seuils"
import { RechercheFFAB } from "@/components/nami/recherche-ffab"
import {
  BookOpen, GraduationCap, ClipboardCheck, BookA, MapPin,
  ChevronRight, FileText, Zap, FlipVertical2, Stethoscope,
  Activity, HeartPulse, Search, X, Sparkles, ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import casCliniques from "@/lib/data/cas-cliniques.json"
import checklists from "@/lib/data/checklists-consultation.json"
import questionnaires from "@/lib/data/questionnaires-tca.json"
import criteresDsm5 from "@/lib/data/criteres-dsm5.json"
import epidemio from "@/lib/data/epidemiologie-tca.json"
import fichesPatient from "@/lib/data/fiches-patient.json"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// ─── Sections par pathologie ─────────────────────────────────────────────────

const tcaSections = [
  { id: "recherche", label: "Recherche FFAB", icon: Search, count: "8K+" },
  { id: "protocoles", label: "Références cliniques", icon: BookOpen, count: "21" },
  { id: "questionnaires", label: "Questionnaires", icon: Stethoscope, count: "2" },
  { id: "checklists", label: "Checklists", icon: ClipboardCheck, count: "5" },
  { id: "dsm5", label: "Critères DSM-5", icon: FileText, count: "4" },
  { id: "seuils", label: "Seuils critiques", icon: Zap, count: null },
  { id: "epidemio", label: "Épidémiologie", icon: Activity, count: null },
  { id: "cas-cliniques", label: "Cas cliniques", icon: GraduationCap, count: "4" },
  { id: "flashcards", label: "Flashcards", icon: FlipVertical2, count: "36" },
  { id: "glossaire", label: "Glossaire", icon: BookA, count: "50+" },
  { id: "fiches-patient", label: "Fiches patient", icon: HeartPulse, count: "3" },
  { id: "annuaire", label: "Annuaire", icon: MapPin, count: "141" },
] as const

const obesiteSections = [
  { id: "ob-parcours", label: "Parcours", icon: BookOpen, count: "8" },
  { id: "ob-profils", label: "Profils A/B/C/D", icon: FileText, count: "4" },
  { id: "ob-specialistes", label: "Par spécialiste", icon: Stethoscope, count: "13" },
  { id: "ob-seuils", label: "Seuils & métriques", icon: Zap, count: "35" },
  { id: "ob-pieges", label: "Pièges diagnostiques", icon: Activity, count: "9" },
  { id: "ob-questionnaires", label: "Questionnaires", icon: ClipboardCheck, count: "20" },
  { id: "ob-medicaments", label: "Médicaments", icon: HeartPulse, count: null },
  { id: "ob-bariatrique", label: "Chirurgie bariatrique", icon: GraduationCap, count: null },
] as const

type TcaSectionId = (typeof tcaSections)[number]["id"]
type ObesiteSectionId = (typeof obesiteSections)[number]["id"]
type SectionId = TcaSectionId | ObesiteSectionId
type PathologyTab = "tca" | "obesite"

export default function ProtocolesPage() {
  const [tab, setTab] = useState<PathologyTab>("tca")
  const [activeSection, setActiveSection] = useState<SectionId>("recherche")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFiche, setSelectedFiche] = useState<{ slug: string; sectionTitle?: string } | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const sections = tab === "tca" ? tcaSections : obesiteSections

  function switchTab(t: PathologyTab) {
    setTab(t)
    setActiveSection(t === "tca" ? "recherche" : "ob-parcours")
  }

  const isSearching = searchQuery.trim().length >= 3

  return (
    <div className="flex h-full relative">
      {/* Sidebar menu */}
      <div className="w-[200px] shrink-0 border-r flex flex-col py-2 px-2">
        {/* Barre de recherche sémantique */}
        <div className="relative mb-3">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Trouver un protocole…"
            className="w-full pl-7 pr-7 py-1.5 text-[12px] bg-muted/40 border border-transparent rounded-lg focus:outline-none focus:border-primary/40 focus:bg-white transition-all placeholder:text-muted-foreground/60"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(""); searchInputRef.current?.focus() }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={11} />
            </button>
          )}
        </div>

        {/* Onglets TCA / Obésité */}
        <div className="flex gap-1 p-1 mb-3 bg-muted/50 rounded-lg">
          <button
            onClick={() => switchTab("tca")}
            className={cn(
              "flex-1 py-1.5 text-[11px] font-medium rounded-md transition-all",
              tab === "tca"
                ? "bg-white text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            TCA
          </button>
          <button
            onClick={() => switchTab("obesite")}
            className={cn(
              "flex-1 py-1.5 text-[11px] font-medium rounded-md transition-all",
              tab === "obesite"
                ? "bg-white text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Obésité
          </button>
        </div>

        <p className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {tab === "tca" ? "Base de savoir TCA" : "Base de savoir Obésité"}
        </p>
        {sections.map((s) => {
          const Icon = s.icon
          const active = activeSection === s.id
          return (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id as SectionId)}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] transition-all",
                active
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <Icon size={14} className="shrink-0" />
              <span className="flex-1 text-left truncate">{s.label}</span>
              {s.count && (
                <span className="text-[10px] opacity-60">{s.count}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {isSearching ? (
          <>
            <div className="border-b px-6 py-3 flex items-center gap-2">
              <Sparkles size={14} className="text-primary" />
              <h1 className="font-heading text-lg font-semibold">Résultats pour « {searchQuery} »</h1>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SemanticSearchPanel
                query={searchQuery}
                onOpenFiche={(slug, sectionTitle) => setSelectedFiche({ slug, sectionTitle })}
              />
            </div>
          </>
        ) : (
          <>
            <div className="border-b px-6 py-3">
              <h1 className="font-heading text-lg font-semibold">
                {sections.find((s) => s.id === activeSection)?.label}
              </h1>
            </div>
            <div className="flex-1 overflow-y-auto">
              {activeSection === "recherche" && <RechercheFFAB />}
              {activeSection === "protocoles" && <DecisionTreeExplorer />}
              {activeSection === "questionnaires" && <QuestionnairesSection />}
              {activeSection === "checklists" && <ChecklistsSection />}
              {activeSection === "dsm5" && <DSM5Section />}
              {activeSection === "seuils" && <div className="p-6"><MemoSeuils /></div>}
              {activeSection === "epidemio" && <EpidemioSection />}
              {activeSection === "cas-cliniques" && <CasCliniqueSection />}
              {activeSection === "flashcards" && <div className="p-6"><Flashcards /></div>}
              {activeSection === "glossaire" && <div className="p-6"><Glossaire /></div>}
              {activeSection === "fiches-patient" && <FichesPatientSection />}
              {activeSection === "annuaire" && <div className="p-6"><AnnuaireStructures /></div>}

              {/* ── Sections Obésité ── */}
              {activeSection === "ob-parcours" && <ObesiteParcoursSection />}
              {activeSection === "ob-profils" && <ObesiteProfilsSection />}
              {activeSection === "ob-specialistes" && <ObesiteSpecialistesSection />}
              {activeSection === "ob-seuils" && <ObesiteSeuilsSection />}
              {activeSection === "ob-pieges" && <ObesitePiegesSection />}
              {activeSection === "ob-questionnaires" && <ObesiteQuestionnairesSection />}
              {activeSection === "ob-medicaments" && <ObesiteMedicamentsSection />}
              {activeSection === "ob-bariatrique" && <ObesiteBariatriqueSection />}
            </div>
          </>
        )}
      </div>

      {/* Modal fiche */}
      {selectedFiche && (
        <FicheModal
          slug={selectedFiche.slug}
          sectionTitle={selectedFiche.sectionTitle}
          onClose={() => setSelectedFiche(null)}
        />
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTIONS OBÉSITÉ
// ═══════════════════════════════════════════════════════════════════════════════

import obesiteParSpe from "@/lib/data/obesite-par-specialiste.json"
import obesitePieges from "@/lib/data/obesite-pieges.json"
import obesitePCR from "@/lib/data/obesite-pcr.json"

function ObesiteParcoursSection() {
  const { accessToken } = useAuthStore()
  const api = apiWithToken(accessToken!)
  const { data: pathways = [], isLoading } = useQuery({
    queryKey: ["catalog-pathways-obesity"],
    queryFn: () => api.intelligence.pathways("obesity"),
    enabled: !!accessToken,
  })

  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (isLoading) return <div className="p-6 text-sm text-muted-foreground">Chargement…</div>

  return (
    <div className="p-6 space-y-4">
      <p className="text-xs text-muted-foreground">{(pathways as any[]).length} parcours obésité depuis la base Nami</p>
      {(pathways as any[]).map((p: any) => {
        const bp = p.baselinePlan as any
        const isOpen = expandedId === p.id
        return (
          <Card key={p.id}>
            <CardHeader className="border-b py-3 cursor-pointer" onClick={() => setExpandedId(isOpen ? null : p.id)}>
              <CardTitle className="flex items-center justify-between text-sm">
                <span>{p.label}</span>
                <div className="flex items-center gap-2">
                  {bp?.duration && <Badge variant="secondary" className="text-[10px]">{bp.duration}</Badge>}
                  <span className="text-muted-foreground text-xs">{isOpen ? "▲" : "▼"}</span>
                </div>
              </CardTitle>
            </CardHeader>
            {isOpen && (
              <CardContent className="pt-4 space-y-4">
                {bp?.objective && (
                  <div className="rounded-lg bg-primary/5 p-3">
                    <p className="text-xs font-medium text-primary">Objectif : {bp.objective}</p>
                  </div>
                )}
                {bp?.phases?.map((phase: any, pi: number) => (
                  <div key={pi} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">{pi + 1}</div>
                      <h4 className="text-xs font-semibold">{phase.name}</h4>
                      {phase.duration && <Badge variant="outline" className="text-[9px]">{phase.duration}</Badge>}
                    </div>
                    {phase.steps?.map((step: any, si: number) => (
                      <div key={si} className="ml-8 flex items-start gap-2 text-xs">
                        <span className="size-1.5 rounded-full bg-primary/30 shrink-0 mt-1.5" />
                        <div>
                          <span className="font-medium">{step.action}</span>
                          {step.specialist && <span className="text-muted-foreground"> — {step.specialist}</span>}
                          {step.detail && <p className="text-muted-foreground mt-0.5 leading-relaxed">{step.detail}</p>}
                        </div>
                      </div>
                    ))}
                    {phase.questionnaires && (
                      <div className="ml-8 flex gap-1 flex-wrap mt-1">
                        {phase.questionnaires.map((q: string) => (
                          <Badge key={q} variant="secondary" className="text-[9px]">{q}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {bp?.medications && bp.medications.length > 0 && (
                  <div className="border-t pt-3 mt-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Médicaments</p>
                    {bp.medications.map((m: any, mi: number) => (
                      <div key={mi} className="text-xs text-muted-foreground mb-1.5">
                        <span className="font-medium text-foreground">{m.name}</span>
                        {m.posology && <span> — {m.posology}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        )
      })}
    </div>
  )
}

function ObesiteProfilsSection() {
  const profils = obesitePCR.profils
  return (
    <div className="p-6 space-y-4">
      {Object.entries(profils).map(([key, profil]: [string, any]) => (
        <Card key={key} size="sm">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center justify-between">
              <span>Profil {key} — {profil.label}</span>
              <Badge className="text-[10px]">{profil.forfait} €</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3 space-y-3">
            <p className="text-sm text-muted-foreground">{profil.description}</p>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Interventions obligatoires</p>
              <div className="flex gap-1 flex-wrap">
                {Object.keys(profil.interventionsObligatoires || {}).map((k: string) => (
                  <Badge key={k} variant="secondary" className="text-[10px]">{k.replace(/_/g, " ")}</Badge>
                ))}
              </div>
            </div>
            {profil.interventionsRenforcees && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Interventions renforcées</p>
                <Badge variant="outline" className="text-[10px] border-violet-200 text-violet-700">
                  {typeof profil.interventionsRenforcees === "object" ? Object.keys(profil.interventionsRenforcees).join(", ") : "Aucune"}
                </Badge>
              </div>
            )}
            {profil.seancesCollectives && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Séances collectives</p>
                <p className="text-xs text-muted-foreground">{typeof profil.seancesCollectives === "object" ? profil.seancesCollectives.type + " — " + profil.seancesCollectives.quand : "Non"}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ObesiteSpecialistesSection() {
  const spes = obesiteParSpe.specialistes
  const [selected, setSelected] = useState<string | null>(null)

  if (selected) {
    const spe = (spes as any)[selected]
    return (
      <div className="p-6 space-y-4">
        <button onClick={() => setSelected(null)} className="text-sm text-muted-foreground hover:text-foreground">← Retour</button>
        <h3 className="font-heading text-lg font-semibold">{selected.replace(/_/g, " ")}</h3>
        <p className="text-sm text-muted-foreground">{spe.role}</p>
        {spe.quandIntervenir && <p className="text-xs text-primary font-medium">{spe.quandIntervenir}</p>}

        {/* Examens bio */}
        {spe.bilanInitial?.biologique && (
          <Card size="sm">
            <CardHeader className="border-b"><CardTitle>Bilan biologique</CardTitle></CardHeader>
            <CardContent className="pt-3 space-y-2">
              {spe.bilanInitial.biologique.map((exam: any, i: number) => (
                <div key={i} className="text-sm">
                  <p className="font-medium">{exam.examen}</p>
                  {exam.alertes?.map((a: any, j: number) => (
                    <div key={j} className="flex items-center gap-2 mt-0.5">
                      <Badge variant={a.severity === "CRITICAL" ? "destructive" : "secondary"} className="text-[9px]">{a.seuil}</Badge>
                      <span className="text-[11px] text-muted-foreground">{a.action}</span>
                    </div>
                  ))}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Orientations */}
        {spe.orientations && (
          <Card size="sm">
            <CardHeader className="border-b"><CardTitle>Orientations</CardTitle></CardHeader>
            <CardContent className="pt-3 space-y-2">
              {spe.orientations.map((o: any, i: number) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <ChevronRight size={12} className="mt-1 text-primary shrink-0" />
                  <div>
                    <span className="font-medium">{o.vers}</span>
                    <span className="text-muted-foreground"> — {o.si}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="p-6 space-y-2">
      {Object.entries(spes).map(([key, spe]: [string, any]) => (
        <button key={key} onClick={() => setSelected(key)}
          className="flex w-full items-center gap-3 rounded-xl border p-4 text-left hover:border-primary/20 hover:bg-primary/5 transition-all">
          <Stethoscope className="size-5 text-primary shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-sm">{key.replace(/_/g, " ")}</p>
            <p className="text-xs text-muted-foreground truncate">{spe.role}</p>
          </div>
          <ChevronRight className="size-4 text-muted-foreground" />
        </button>
      ))}
    </div>
  )
}

function ObesiteSeuilsSection() {
  const { accessToken } = useAuthStore()
  const api = apiWithToken(accessToken!)
  const { data: allMetrics = [], isLoading } = useQuery({
    queryKey: ["catalog-metrics"],
    queryFn: () => api.intelligence.metrics(),
    enabled: !!accessToken,
  })

  // Filter obesity-related metrics (keys starting with "obesity-")
  const filtered = (allMetrics as any[]).filter((m: any) => m.key?.startsWith("obesity-"))
  const grouped = filtered.reduce((acc: Record<string, any[]>, m: any) => {
    const d = m.domain ?? "other"
    if (!acc[d]) acc[d] = []
    acc[d].push(m)
    return acc
  }, {} as Record<string, any[]>)

  const DOMAIN_LABELS: Record<string, string> = {
    anthropometry: "Anthropométrie", biology: "Biologie", vital: "Paramètres vitaux",
  }

  if (isLoading) return <div className="p-6 text-sm text-muted-foreground">Chargement…</div>

  return (
    <div className="p-6 space-y-5">
      <p className="text-xs text-muted-foreground">{filtered.length} métriques cliniques obésité depuis la base Nami</p>
      {Object.entries(grouped).map(([domain, items]) => (
        <div key={domain}>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{DOMAIN_LABELS[domain] ?? domain}</h3>
          <div className="space-y-1.5">
            {(items as any[]).map((m: any) => (
              <div key={m.key} className="rounded-lg border p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{m.label}</span>
                  {m.unit && <span className="text-xs text-muted-foreground font-mono">{m.unit}</span>}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {m.normalMin != null && m.normalMax != null && (
                    <Badge variant="secondary" className="text-[9px]">Normal : {m.normalMin}–{m.normalMax}</Badge>
                  )}
                  {m.alertLow != null && <Badge className="text-[9px] bg-amber-100 text-amber-800 hover:bg-amber-100">Alerte bas : &lt;{m.alertLow}</Badge>}
                  {m.alertHigh != null && <Badge className="text-[9px] bg-amber-100 text-amber-800 hover:bg-amber-100">Alerte haut : &gt;{m.alertHigh}</Badge>}
                  {m.criticalLow != null && <Badge variant="destructive" className="text-[9px]">Critique bas : &lt;{m.criticalLow}</Badge>}
                  {m.criticalHigh != null && <Badge variant="destructive" className="text-[9px]">Critique haut : &gt;{m.criticalHigh}</Badge>}
                </div>
                {m.codeSystem && m.code && (
                  <p className="text-[10px] text-muted-foreground/50 mt-1">{m.codeSystem} {m.code}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function ObesitePiegesSection() {
  return (
    <div className="p-6 space-y-3">
      <p className="text-xs text-muted-foreground mb-2">Ce que les soignants doivent savoir pour ne pas se tromper</p>
      {obesitePieges.pieges.map((piege: any, i: number) => (
        <Card key={i} size="sm">
          <CardHeader className="border-b py-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity size={14} className="text-orange-500" />
              {piege.piege}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3 space-y-2">
            <p className="text-xs text-muted-foreground leading-relaxed">{piege.explication}</p>
            <div className="rounded-lg bg-orange-50 p-2.5">
              <p className="text-xs font-medium text-orange-800">{piege.consequence_clinique}</p>
            </div>
            <div className="flex gap-1 flex-wrap">
              {piege.concerne.map((c: string) => (
                <Badge key={c} variant="secondary" className="text-[9px]">{c}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ObesiteQuestionnairesSection() {
  const { accessToken } = useAuthStore()
  const api = apiWithToken(accessToken!)
  const { data: allQ = [], isLoading } = useQuery({
    queryKey: ["catalog-questionnaires"],
    queryFn: () => api.intelligence.questionnaires(),
    enabled: !!accessToken,
  })
  const [activeKey, setActiveKey] = useState<string | null>(null)

  const obesityDomains = ["bed_screening", "quality_of_life_obesity", "obesity_assessment", "eating_behavior", "sleep_screening", "sleep_severity", "sleep_quality", "physical_activity_assessment", "depression_screening", "body_image", "social_vulnerability", "diabetes_screening", "addiction_screening", "quality_of_life", "obesity_wellbeing", "bariatric_outcome", "neuropathic_pain", "motivation"]
  const filtered = (allQ as any[]).filter((q: any) => obesityDomains.includes(q.domain))

  const DOMAIN_LABELS: Record<string, string> = {
    bed_screening: "Dépistage hyperphagie", quality_of_life_obesity: "Qualité de vie obésité",
    obesity_assessment: "Évaluation obésité", eating_behavior: "Comportement alimentaire",
    sleep_screening: "Dépistage apnées", sleep_severity: "Sévérité sommeil", sleep_quality: "Qualité du sommeil",
    physical_activity_assessment: "Activité physique", depression_screening: "Dépression",
    body_image: "Image corporelle", social_vulnerability: "Précarité sociale",
    diabetes_screening: "Risque diabète", addiction_screening: "Addictions",
    quality_of_life: "Qualité de vie", obesity_wellbeing: "Bien-être obésité", bariatric_outcome: "Post-bariatrique",
    neuropathic_pain: "Douleur neuropathique", motivation: "Motivation",
  }

  const grouped = filtered.reduce((acc: Record<string, any[]>, q: any) => {
    const d = q.domain ?? "other"
    if (!acc[d]) acc[d] = []
    acc[d].push(q)
    return acc
  }, {} as Record<string, any[]>)

  // Active questionnaire player
  const activeQ = filtered.find((q: any) => q.key === activeKey)
  const activeData = activeQ?.scoringInfo ? (() => { try { return JSON.parse(activeQ.scoringInfo) } catch { return null } })() : null
  const hasItems = activeData?.items?.length > 0

  if (isLoading) return <div className="p-6 text-sm text-muted-foreground">Chargement…</div>

  // Player mode
  if (activeKey && activeQ && hasItems) {
    return <QuestionnairePlayer questionnaire={activeQ} data={activeData} onBack={() => setActiveKey(null)} />
  }

  return (
    <div className="p-6 space-y-5">
      <p className="text-xs text-muted-foreground">{filtered.length} questionnaires validés depuis la base Nami</p>
      {Object.entries(grouped).map(([domain, items]) => (
        <div key={domain}>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{DOMAIN_LABELS[domain] ?? domain}</h3>
          <div className="space-y-2">
            {(items as any[]).map((q: any) => {
              const si = q.scoringInfo ? (() => { try { return JSON.parse(q.scoringInfo) } catch { return null } })() : null
              const interactive = si?.items?.length > 0
              return (
                <button key={q.key} onClick={() => interactive && setActiveKey(q.key)} disabled={!interactive}
                  className={cn("w-full rounded-xl border p-4 text-left transition-colors", interactive ? "hover:border-primary/30 hover:bg-primary/5 cursor-pointer" : "opacity-70")}>
                  <div className="flex items-start gap-3">
                    <ClipboardCheck className={cn("size-4 shrink-0 mt-0.5", interactive ? "text-primary" : "text-muted-foreground")} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{q.label}</p>
                        {interactive && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">Interactif</span>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{q.itemCount} items · {q.scoringMethod}</p>
                      {q.description && <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{q.description}</p>}
                    </div>
                    {interactive && <ChevronRight className="size-4 text-muted-foreground shrink-0 mt-0.5" />}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Questionnaire Player ───────────────────────────────────────────────────

function QuestionnairePlayer({ questionnaire, data, onBack }: { questionnaire: any; data: any; onBack: () => void }) {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [showResult, setShowResult] = useState(false)
  const items = data.items ?? []
  const total = Object.values(answers).reduce((s: number, v: any) => s + (v as number), 0)
  const allAnswered = items.every((item: any) => answers[item.id] !== undefined)
  const interpretation = data.interpretation?.find((r: any) => total >= r.min && total <= r.max)

  return (
    <div className="p-6 max-w-2xl">
      <button onClick={onBack} className="mb-4 text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
        <ChevronRight className="size-3 rotate-180" /> Retour aux questionnaires
      </button>
      <h2 className="text-lg font-semibold mb-1">{questionnaire.label}</h2>
      <p className="text-xs text-muted-foreground mb-6">{questionnaire.description}</p>

      <div className="space-y-4">
        {items.map((item: any, idx: number) => (
          <div key={item.id} className="rounded-xl border p-4">
            <p className="text-sm font-medium mb-3">
              <span className="text-primary mr-2">{idx + 1}.</span>
              {item.text}
            </p>
            {item.type === "boolean" ? (
              <div className="flex gap-2">
                {[{ value: 1, text: "Oui" }, { value: 0, text: "Non" }].map((opt) => (
                  <button key={opt.value} onClick={() => setAnswers({ ...answers, [item.id]: opt.value })}
                    className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all border",
                      answers[item.id] === opt.value ? "bg-primary text-white border-primary" : "hover:bg-muted/50")}>
                    {opt.text}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-1.5">
                {(item.options ?? []).map((opt: any) => (
                  <button key={opt.value} onClick={() => setAnswers({ ...answers, [item.id]: opt.value })}
                    className={cn("w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all border",
                      answers[item.id] === opt.value ? "bg-primary text-white border-primary" : "hover:bg-muted/50")}>
                    {opt.text}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Score */}
      <div className="mt-6 sticky bottom-0 bg-background pt-4 pb-2 border-t">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-muted-foreground">Score : </span>
            <span className="text-lg font-bold">{total}</span>
            <span className="text-sm text-muted-foreground"> / {data.scoring?.maxScore ?? "?"}</span>
            <span className="text-xs text-muted-foreground ml-2">({Object.keys(answers).length}/{items.length} répondu{Object.keys(answers).length > 1 ? "s" : ""})</span>
          </div>
          <button onClick={() => setShowResult(true)} disabled={!allAnswered}
            className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all", allAnswered ? "bg-primary text-white hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed")}>
            Voir le résultat
          </button>
        </div>

        {showResult && interpretation && (
          <div className="mt-4 rounded-xl border p-4" style={{ borderLeftWidth: 4, borderLeftColor: interpretation.color }}>
            <p className="font-semibold text-sm" style={{ color: interpretation.color }}>{interpretation.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{interpretation.action}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function ObesiteMedicamentsSection() {
  const { accessToken } = useAuthStore()
  const api = apiWithToken(accessToken!)
  const { data: pathways = [], isLoading } = useQuery({
    queryKey: ["catalog-pathways-obesity"],
    queryFn: () => api.intelligence.pathways("obesity"),
    enabled: !!accessToken,
  })

  // Extract all medications from all obesity pathways
  const allMeds = (pathways as any[]).flatMap((p: any) => {
    const bp = p.baselinePlan as any
    return (bp?.medications ?? []).map((m: any) => ({ ...m, pathway: p.label }))
  })

  // Deduplicate by name
  const seen = new Set<string>()
  const meds = allMeds.filter((m: any) => {
    if (seen.has(m.name)) return false
    seen.add(m.name)
    return true
  })

  if (isLoading) return <div className="p-6 text-sm text-muted-foreground">Chargement…</div>

  return (
    <div className="p-6 space-y-4">
      <div className="rounded-xl border bg-amber-50/50 p-4">
        <p className="text-xs font-medium text-amber-800">Toujours en complément des mesures hygiéno-diététiques. Reprise quasi systématique à l&apos;arrêt → traitement au long cours.</p>
      </div>
      <p className="text-xs text-muted-foreground">{meds.length} molécules extraites des parcours obésité</p>
      {meds.map((m: any, i: number) => (
        <Card key={i}>
          <CardHeader className="border-b py-3">
            <CardTitle className="text-sm">{m.name}</CardTitle>
          </CardHeader>
          <CardContent className="pt-3 space-y-2">
            {m.indication && <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">Indication :</span> {m.indication}</p>}
            {m.posology && <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">Posologie :</span> {m.posology}</p>}
            {m.monitoring && <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">Surveillance :</span> {m.monitoring}</p>}
            {m.contraindications && <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">CI :</span> {m.contraindications}</p>}
            {m.details && <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">Détails :</span> {m.details}</p>}
            <p className="text-[10px] text-muted-foreground/60">Source : {m.pathway}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ObesiteBariatriqueSection() {
  const techniques = [
    { nom: "Gastrectomie longitudinale (sleeve)", type: "Restrictive", note: "Technique la plus pratiquée en France" },
    { nom: "Bypass gastrique Roux-en-Y", type: "Mixte", note: "Meilleur contrôle DT2, RGO pré-existant" },
    { nom: "Bypass en oméga (OAGB)", type: "Mixte", note: "Alternative au Roux-en-Y" },
    { nom: "Chirurgie de révision", type: "Variable", note: "Échec ou complication d'une première chirurgie" },
  ]

  return (
    <div className="p-6 space-y-4">
      <Card size="sm">
        <CardHeader className="border-b"><CardTitle>Critères d'inclusion</CardTitle></CardHeader>
        <CardContent className="pt-3 space-y-1">
          {["IMC ≥ 40 kg/m²", "IMC ≥ 35 + comorbidité améliorable", "Échec traitement médical 6-12 mois", "Évaluation pluridisciplinaire (RCP)", "Risque opératoire acceptable"].map((c, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className="size-1.5 rounded-full bg-primary/40 shrink-0" />
              <span className="text-muted-foreground">{c}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        {techniques.map((t) => (
          <Card key={t.nom} size="sm">
            <CardContent className="pt-4">
              <p className="font-medium text-sm">{t.nom}</p>
              <Badge variant="secondary" className="text-[9px] mt-1">{t.type}</Badge>
              <p className="text-[11px] text-muted-foreground mt-2">{t.note}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card size="sm">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Zap size={14} className="text-orange-500" />
            Suivi post-opératoire — À VIE
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3 space-y-2">
          <div className="rounded-lg bg-orange-50 p-3">
            <p className="text-xs font-medium text-orange-800">50% des opérés perdus de vue à 2 ans. Patient absent {">"} 6 mois = ALERTE ACTIVE.</p>
          </div>
          <p className="text-xs text-muted-foreground">Calendrier : J+15, M1, M3, M6, M12 puis annuel à vie</p>
          <p className="text-xs text-muted-foreground">Bilan annuel : NFS, ferritine, B12, folates, Vit D, calcium, PTH, zinc, cuivre, B1, albumine, bilan hépatique, glycémie/HbA1c, lipides</p>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 mt-2">Complications à dépister</p>
            <div className="flex gap-1 flex-wrap">
              {["Carences", "Dumping syndrome", "Hypoglycémies réactionnelles", "Lithiases biliaires", "Alcoolisme de transfert", "Reprise pondérale", "Hernie interne"].map((c) => (
                <Badge key={c} variant="secondary" className="text-[9px]">{c}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function QuestionnairesSection() {
  const [selected, setSelected] = useState<number | null>(null)
  if (selected !== null) {
    return (
      <div className="p-6">
        <button onClick={() => setSelected(null)} className="mb-4 text-sm text-muted-foreground hover:text-foreground">← Retour</button>
        <QuestionnaireInteractif questionnaire={questionnaires[selected]} />
      </div>
    )
  }
  return (
    <div className="p-6 space-y-2">
      {questionnaires.map((q, idx) => (
        <button key={q.id} onClick={() => setSelected(idx)}
          className="flex w-full items-center gap-3 rounded-xl border p-4 text-left hover:border-primary/20 hover:bg-primary/5 transition-all">
          <Stethoscope className="size-5 text-primary shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-sm">{q.nom_complet}</p>
            <p className="text-xs text-muted-foreground">{q.items.length} items · {q.seuil_label}</p>
          </div>
          <ChevronRight className="size-4 text-muted-foreground" />
        </button>
      ))}
    </div>
  )
}

function ChecklistsSection() {
  const [selected, setSelected] = useState<number | null>(null)
  if (selected !== null) {
    return (
      <div className="p-6">
        <button onClick={() => setSelected(null)} className="mb-4 text-sm text-muted-foreground hover:text-foreground">← Retour</button>
        <ChecklistConsultation checklist={checklists[selected]} />
      </div>
    )
  }
  return (
    <div className="p-6 space-y-2">
      {checklists.map((cl, idx) => (
        <button key={cl.id} onClick={() => setSelected(idx)}
          className="flex w-full items-center gap-3 rounded-xl border p-4 text-left hover:border-primary/20 hover:bg-primary/5 transition-all">
          <ClipboardCheck className="size-5 text-orange-500 shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-sm">{cl.title}</p>
            <p className="text-xs text-muted-foreground">{cl.sections.reduce((a, s) => a + s.items.length, 0)} items · {cl.source}</p>
          </div>
          <ChevronRight className="size-4 text-muted-foreground" />
        </button>
      ))}
    </div>
  )
}

function DSM5Section() {
  const [selected, setSelected] = useState<number | null>(null)
  if (selected !== null) {
    const tca = criteresDsm5[selected]
    return (
      <div className="p-6 space-y-4">
        <button onClick={() => setSelected(null)} className="text-sm text-muted-foreground hover:text-foreground">← Retour</button>
        <h3 className="font-heading text-lg font-semibold">{tca.nom}</h3>
        <p className="text-xs text-muted-foreground">{tca.source} · Code DSM-5 : {tca.code_dsm5}</p>

        <Card size="sm">
          <CardHeader className="border-b"><CardTitle>Critères diagnostiques</CardTitle></CardHeader>
          <CardContent className="space-y-3 pt-3">
            {tca.criteres.map((c) => (
              <div key={c.lettre} className="flex gap-3 text-sm">
                <Badge variant="secondary" className="shrink-0 size-6 justify-center font-bold">{c.lettre}</Badge>
                <p className="text-muted-foreground leading-relaxed">{c.texte}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {tca.sous_types.length > 0 && (
          <Card size="sm">
            <CardHeader className="border-b"><CardTitle>Sous-types</CardTitle></CardHeader>
            <CardContent className="space-y-2 pt-3">
              {tca.sous_types.map((st) => (
                <div key={st.nom} className="text-sm">
                  <p className="font-medium">{st.nom}</p>
                  <p className="text-muted-foreground">{st.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {tca.severite_imc.length > 0 && (
          <Card size="sm">
            <CardHeader className="border-b"><CardTitle>Niveaux de sévérité</CardTitle></CardHeader>
            <CardContent className="pt-3">
              <div className="space-y-1">
                {tca.severite_imc.map((s) => (
                  <div key={s.niveau} className="flex items-center gap-3 text-sm">
                    <Badge variant="outline" className="w-20 justify-center">{s.niveau}</Badge>
                    <span className="text-muted-foreground">{s.seuil}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {tca.notes.length > 0 && (
          <Card size="sm">
            <CardHeader className="border-b"><CardTitle>Notes importantes</CardTitle></CardHeader>
            <CardContent className="pt-3">
              <ul className="space-y-1.5">
                {tca.notes.map((n, i) => (
                  <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/40" />
                    {n}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="p-6 space-y-2">
      {criteresDsm5.map((tca, idx) => (
        <button key={tca.id} onClick={() => setSelected(idx)}
          className="flex w-full items-center gap-3 rounded-xl border p-4 text-left hover:border-primary/20 hover:bg-primary/5 transition-all">
          <FileText className="size-5 text-primary shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-sm">{tca.nom}</p>
            <p className="text-xs text-muted-foreground">{tca.criteres.length} critères · {tca.sous_types.length > 0 ? `${tca.sous_types.length} sous-types` : "Pas de sous-type"}</p>
          </div>
          <ChevronRight className="size-4 text-muted-foreground" />
        </button>
      ))}
    </div>
  )
}

function EpidemioSection() {
  return (
    <div className="p-6 space-y-4">
      <p className="text-xs text-muted-foreground">{epidemio.source}</p>

      {epidemio.troubles.map((t) => (
        <Card key={t.code} size="sm">
          <CardHeader className="border-b">
            <CardTitle>{t.nom} ({t.code})</CardTitle>
          </CardHeader>
          <CardContent className="pt-3 space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Prévalence</p>
              {Object.entries(t.prevalence).map(([k, v]) => (
                <p key={k} className="text-sm text-muted-foreground"><span className="font-medium text-foreground">{k.replace(/_/g, " ")} :</span> {v}</p>
              ))}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Incidence</p>
              {Object.entries(t.incidence).map(([k, v]) => (
                <p key={k} className="text-sm text-muted-foreground"><span className="font-medium text-foreground">{k.replace(/_/g, " ")} :</span> {v}</p>
              ))}
            </div>
            {t.sex_ratio && <p className="text-sm"><span className="font-medium">Sex ratio :</span> <span className="text-muted-foreground">{t.sex_ratio}</span></p>}
            {t.age_debut && <p className="text-sm"><span className="font-medium">Âge de début :</span> <span className="text-muted-foreground">{t.age_debut}</span></p>}
            {t.mortalite && Object.entries(t.mortalite).map(([k, v]) => (
              <p key={k} className="text-sm"><span className="font-medium">{k.replace(/_/g, " ")} :</span> <span className="text-muted-foreground">{v}</span></p>
            ))}
          </CardContent>
        </Card>
      ))}

      <Card size="sm">
        <CardHeader className="border-b"><CardTitle>Données générales</CardTitle></CardHeader>
        <CardContent className="pt-3 space-y-2">
          {Object.entries(epidemio.donnees_generales).map(([k, v]) => (
            <p key={k} className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{k.replace(/_/g, " ")} :</span> {v}
            </p>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function CasCliniqueSection() {
  const [selected, setSelected] = useState<number | null>(null)
  if (selected !== null) {
    return (
      <div className="p-6">
        <button onClick={() => setSelected(null)} className="mb-4 text-sm text-muted-foreground hover:text-foreground">← Retour</button>
        <CasCliniquePlayer cas={casCliniques[selected]} />
      </div>
    )
  }
  return (
    <div className="p-6 space-y-2">
      {casCliniques.map((cas, idx) => (
        <button key={cas.id} onClick={() => setSelected(idx)}
          className="flex w-full items-center gap-3 rounded-xl border p-4 text-left hover:border-primary/20 hover:bg-primary/5 transition-all">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">{idx + 1}</div>
          <div className="flex-1">
            <p className="font-medium text-sm">{cas.title}</p>
            <div className="mt-1 flex gap-1 flex-wrap">
              {cas.tags.map((tag) => <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>)}
              <Badge variant="outline" className="text-[10px]">{cas.questions.length} questions</Badge>
            </div>
          </div>
          <ChevronRight className="size-4 text-muted-foreground" />
        </button>
      ))}
    </div>
  )
}

function FichesPatientSection() {
  const [selected, setSelected] = useState<number | null>(null)
  if (selected !== null) {
    const fiche = fichesPatient[selected]
    return (
      <div className="p-6 space-y-4">
        <button onClick={() => setSelected(null)} className="text-sm text-muted-foreground hover:text-foreground">← Retour</button>
        <div>
          <h3 className="font-heading text-lg font-semibold">{fiche.titre}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Destinataire : {fiche.destinataire} · {fiche.source}</p>
        </div>
        {fiche.sections.map((s) => (
          <Card key={s.titre} size="sm">
            <CardHeader className="border-b"><CardTitle>{s.titre}</CardTitle></CardHeader>
            <CardContent className="pt-3">
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{s.contenu}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }
  return (
    <div className="p-6 space-y-2">
      {fichesPatient.map((f, idx) => (
        <button key={f.id} onClick={() => setSelected(idx)}
          className="flex w-full items-center gap-3 rounded-xl border p-4 text-left hover:border-primary/20 hover:bg-primary/5 transition-all">
          <HeartPulse className="size-5 text-pink-500 shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-sm">{f.titre}</p>
            <p className="text-xs text-muted-foreground">{f.destinataire} · {f.sections.length} sections</p>
          </div>
          <ChevronRight className="size-4 text-muted-foreground" />
        </button>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEMANTIC SEARCH PANEL
// ═══════════════════════════════════════════════════════════════════════════════

function SemanticSearchPanel({
  query,
  onOpenFiche,
}: {
  query: string
  onOpenFiche: (slug: string, sectionTitle?: string) => void
}) {
  const { accessToken } = useAuthStore()
  const api = apiWithToken(accessToken!)

  const { data, isLoading, isError } = useQuery({
    queryKey: ["semantic-search", query],
    queryFn: () => api.intelligence.semanticSearch(query, 10),
    enabled: query.trim().length >= 3,
    staleTime: 60_000,
  })

  if (isLoading) {
    return (
      <div className="p-6 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-muted/40 animate-pulse" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-6 text-center text-sm text-red-600">
        Erreur lors de la recherche. Vérifiez que la base est indexée.
      </div>
    )
  }

  const results: SemanticSearchResult[] = data?.results ?? []

  const bySlug = results.reduce<Record<string, SemanticSearchResult[]>>((acc, r) => {
    if (!acc[r.slug]) acc[r.slug] = []
    acc[r.slug].push(r)
    return acc
  }, {})

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-60 text-center px-6">
        <Search size={28} className="text-muted-foreground/30 mb-3" />
        <p className="text-sm font-medium text-muted-foreground">Aucun résultat trouvé</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Essayez avec d&apos;autres mots-clés</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-3">
      <p className="text-xs text-muted-foreground mb-4">
        {results.length} passage{results.length > 1 ? "s" : ""} dans {Object.keys(bySlug).length} fiche{Object.keys(bySlug).length > 1 ? "s" : ""}
      </p>

      {Object.entries(bySlug).map(([slug, chunks]) => {
        const best = chunks[0]
        const scorePercent = Math.round(best.score * 100)

        return (
          <div
            key={slug}
            className="rounded-xl border bg-card shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_8px_rgba(79,70,229,0.08)] transition-shadow cursor-pointer"
            onClick={() => onOpenFiche(slug, best.sectionTitle)}
          >
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {scorePercent}% pertinent
                    </span>
                    {chunks.length > 1 && (
                      <span className="text-[10px] text-muted-foreground">
                        {chunks.length} sections
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-foreground truncate">
                    {slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </p>
                  <p className="text-[11px] text-primary/80 mb-2">
                    § {best.sectionTitle}
                  </p>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {best.content.replace(/^#+\s.*\n+/, "").slice(0, 180)}…
                  </p>
                </div>
                <ExternalLink size={13} className="shrink-0 mt-1 text-muted-foreground/50" />
              </div>

              {chunks.length > 1 && (
                <div className="mt-2 pt-2 border-t flex flex-wrap gap-1">
                  {chunks.slice(1).map((c) => (
                    <button
                      key={c.id}
                      onClick={(e) => { e.stopPropagation(); onOpenFiche(slug, c.sectionTitle) }}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      § {c.sectionTitle}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// FICHE MODAL
// ═══════════════════════════════════════════════════════════════════════════════

function FicheModal({
  slug,
  sectionTitle,
  onClose,
}: {
  slug: string
  sectionTitle?: string
  onClose: () => void
}) {
  const { accessToken } = useAuthStore()
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

  const { data: markdown, isLoading } = useQuery({
    queryKey: ["fiche-content", slug],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/knowledge/pathology-content/${encodeURIComponent(slug)}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!res.ok) throw new Error("Fiche introuvable")
      const d = await res.json()
      return d.content as string
    },
    staleTime: 24 * 60 * 60 * 1000,
  })

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Fiche pathologique</p>
            <h2 className="text-base font-semibold">
              {slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </h2>
            {sectionTitle && (
              <p className="text-xs text-primary mt-0.5">§ {sectionTitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className={cn("h-4 rounded bg-muted/40 animate-pulse", i % 3 === 2 ? "w-2/3" : "w-full")} />
              ))}
            </div>
          ) : markdown ? (
            <MarkdownRenderer content={markdown} highlightSection={sectionTitle} />
          ) : (
            <p className="text-sm text-muted-foreground">Contenu indisponible.</p>
          )}
        </div>

        <div className="px-6 py-3 border-t shrink-0 bg-amber-50">
          <p className="text-[10px] text-amber-700">
            Brouillon · à valider — à vérifier par le professionnel de santé avant utilisation clinique.
          </p>
        </div>
      </div>
    </div>
  )
}

function MarkdownRenderer({ content, highlightSection }: { content: string; highlightSection?: string }) {
  const lines = content.split("\n")

  return (
    <div className="space-y-1 text-sm text-foreground">
      {lines.map((line, i) => {
        if (line.startsWith("# ")) {
          return <h1 key={i} className="text-lg font-bold mt-4 mb-2 first:mt-0">{line.slice(2)}</h1>
        }
        if (line.startsWith("## ")) {
          const title = line.slice(3)
          const isHighlighted = highlightSection && title.toLowerCase().includes(highlightSection.toLowerCase())
          return (
            <h2 key={i} className={cn(
              "text-base font-semibold mt-5 mb-1.5 pb-1 border-b",
              isHighlighted ? "text-primary border-primary/30 bg-primary/5 px-2 rounded-t-md -mx-2" : "border-muted"
            )}>
              {title}
            </h2>
          )
        }
        if (line.startsWith("### ")) {
          return <h3 key={i} className="text-sm font-semibold mt-3 mb-1 text-foreground/80">{line.slice(4)}</h3>
        }
        if (line.startsWith("- ") || line.startsWith("* ")) {
          return <li key={i} className="ml-4 list-disc text-[13px] text-foreground/80 leading-relaxed">{line.slice(2)}</li>
        }
        if (line.match(/^\d+\. /)) {
          return <li key={i} className="ml-4 list-decimal text-[13px] text-foreground/80 leading-relaxed">{line.replace(/^\d+\. /, "")}</li>
        }
        if (line.startsWith("> ")) {
          return <blockquote key={i} className="border-l-2 border-primary/30 pl-3 text-[12px] text-muted-foreground italic">{line.slice(2)}</blockquote>
        }
        if (line.trim() === "") {
          return <div key={i} className="h-2" />
        }
        const parts = line.split(/(\*\*[^*]+\*\*)/)
        return (
          <p key={i} className="text-[13px] leading-relaxed text-foreground/80">
            {parts.map((part, j) =>
              part.startsWith("**") && part.endsWith("**")
                ? <strong key={j} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>
                : part
            )}
          </p>
        )
      })}
    </div>
  )
}
