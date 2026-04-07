"use client"

import { useState } from "react"
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
  Activity, HeartPulse, Search,
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

const sections = [
  { id: "recherche", label: "Recherche FFAB", icon: Search, count: "8K+" },
  { id: "protocoles", label: "Protocoles", icon: BookOpen, count: "21" },
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

type SectionId = (typeof sections)[number]["id"]

export default function ProtocolesPage() {
  const [activeSection, setActiveSection] = useState<SectionId>("recherche")

  return (
    <div className="flex h-full">
      {/* Sidebar menu */}
      <div className="w-[200px] shrink-0 border-r overflow-y-auto py-3 px-2">
        <p className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Base de savoir TCA
        </p>
        {sections.map((s) => {
          const Icon = s.icon
          const active = activeSection === s.id
          return (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
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
        </div>
      </div>
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
