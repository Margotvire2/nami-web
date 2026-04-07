"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, type CreateLocationInput, type ConsultationLocation } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Stethoscope,
  Settings2,
  Plus,
  Pencil,
  Trash2,
  Check,
  Video,
  Home,
  Loader2,
  CalendarOff,
} from "lucide-react";
import type { AgendaSettings } from "@/lib/api";

// ─── Constants ──────────────────────────────────────────────────────────────

const DAYS = [
  { key: "MON", label: "Lun" },
  { key: "TUE", label: "Mar" },
  { key: "WED", label: "Mer" },
  { key: "THU", label: "Jeu" },
  { key: "FRI", label: "Ven" },
  { key: "SAT", label: "Sam" },
  { key: "SUN", label: "Dim" },
];

const LOCATION_COLORS = [
  "#6B7FA3", "#7A9E7E", "#C4956A", "#B8A99A",
  "#8B9BB4", "#C4A0B0", "#9B8EC4", "#8B9B6E",
];

const LOCATION_TYPE_LABEL: Record<string, { label: string; icon: typeof MapPin }> = {
  PHYSICAL: { label: "Présentiel", icon: MapPin },
  VIDEO: { label: "Visio", icon: Video },
  HOME_VISIT: { label: "Domicile", icon: Home },
};

const TABS = [
  { key: "locations", label: "Cabinets", icon: MapPin },
  { key: "types", label: "Consultations", icon: Stethoscope },
  { key: "rules", label: "Règles", icon: Settings2 },
  { key: "absences", label: "Absences", icon: CalendarOff },
] as const;

type Tab = (typeof TABS)[number]["key"];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function ParametragePage() {
  const { accessToken } = useAuthStore();
  const api = apiWithToken(accessToken!);
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("locations");

  const { data: settings, isLoading } = useQuery({
    queryKey: ["agenda-settings"],
    queryFn: () => api.agendaSettings.get(),
  });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-muted/10">
      {/* Header */}
      <div className="border-b bg-card px-6 py-4 shrink-0">
        <Link href="/agenda" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2">
          <ArrowLeft size={12} /> Retour à l&apos;agenda
        </Link>
        <h1 className="text-base font-semibold flex items-center gap-2">
          <Settings2 size={16} /> Paramétrage de l&apos;agenda
        </h1>
      </div>

      {/* Tabs */}
      <div className="border-b bg-card px-6 flex gap-1 shrink-0">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2.5 border-b-2 transition-colors ${
              tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-6">
          {tab === "locations" && <LocationsTab api={api} locations={settings?.locations ?? []} consultationTypes={settings?.consultationTypes ?? []} qc={qc} />}
          {tab === "types" && <TypesTab api={api} types={settings?.consultationTypes ?? []} locations={settings?.locations ?? []} qc={qc} />}
          {tab === "rules" && <RulesTab api={api} settings={settings!} qc={qc} />}
          {tab === "absences" && <AbsencesTab api={api} absences={settings?.absences ?? []} locations={settings?.locations ?? []} qc={qc} />}
        </div>
      </div>
    </div>
  );
}

// ─── Locations Tab ──────────────────────────────────────────────────────────

function LocationsTab({ api, locations, consultationTypes, qc }: {
  api: ReturnType<typeof apiWithToken>;
  locations: ConsultationLocation[];
  consultationTypes: Array<{ id: string; name: string; durationMinutes: number }>;
  qc: ReturnType<typeof useQueryClient>;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<CreateLocationInput>>({});

  function startNew() {
    setEditing("new");
    setForm({
      name: "",
      locationType: "PHYSICAL",
      color: "#6B7FA3",
      activeDays: ["MON", "TUE", "WED", "THU", "FRI"],
      openTime: "09:00",
      closeTime: "18:00",
    });
  }

  function startEdit(loc: ConsultationLocation) {
    setEditing(loc.id);
    setForm({
      name: loc.name,
      address: loc.address ?? undefined,
      postalCode: loc.postalCode ?? undefined,
      city: loc.city ?? undefined,
      accessCode: loc.accessCode ?? undefined,
      instructions: loc.instructions ?? undefined,
      locationType: loc.locationType as CreateLocationInput["locationType"],
      color: loc.color ?? "#6B7FA3",
      activeDays: (loc as any).activeDays ?? [],
      openTime: (loc as any).openTime ?? "09:00",
      closeTime: (loc as any).closeTime ?? "18:00",
      lunchStart: (loc as any).lunchStart ?? null,
      lunchEnd: (loc as any).lunchEnd ?? null,
      allowedConsultTypes: (loc as any).allowedConsultTypes ?? [],
      allowsVideo: (loc as any).allowsVideo ?? false,
    });
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing === "new") {
        return api.locations.create(form as CreateLocationInput);
      } else {
        return api.locations.update(editing!, form);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agenda-settings"] });
      qc.invalidateQueries({ queryKey: ["locations"] });
      setEditing(null);
      toast.success(editing === "new" ? "Lieu ajouté" : "Lieu modifié");
    },
    onError: () => toast.error("Erreur lors de la sauvegarde"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.locations.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agenda-settings"] });
      qc.invalidateQueries({ queryKey: ["locations"] });
      toast.success("Lieu désactivé");
    },
  });

  function toggleDay(day: string) {
    const current = form.activeDays ?? [];
    setForm({
      ...form,
      activeDays: current.includes(day) ? current.filter((d) => d !== day) : [...current, day],
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Mes lieux de consultation</h2>
        {editing === null && (
          <Button size="sm" variant="outline" className="text-xs gap-1.5" onClick={startNew}>
            <Plus size={12} /> Ajouter un lieu
          </Button>
        )}
      </div>

      {/* Existing locations */}
      {locations.map((loc) =>
        editing === loc.id ? null : (
          <div key={loc.id} className="rounded-xl border bg-card p-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: loc.color ?? "#6B7FA3" }} />
              <span className="text-sm font-medium">{loc.name}</span>
              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {LOCATION_TYPE_LABEL[loc.locationType]?.label ?? loc.locationType}
              </span>
              <div className="ml-auto flex gap-1">
                <button className="p-1 rounded hover:bg-muted" onClick={() => startEdit(loc)}>
                  <Pencil size={12} className="text-muted-foreground" />
                </button>
                <button className="p-1 rounded hover:bg-muted" onClick={() => deleteMutation.mutate(loc.id)}>
                  <Trash2 size={12} className="text-muted-foreground" />
                </button>
              </div>
            </div>
            {loc.address && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin size={10} /> {loc.address}{loc.city ? `, ${loc.city}` : ""}
              </p>
            )}
            {(loc as any).activeDays?.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock size={10} />
                {((loc as any).activeDays as string[]).map((d) => DAYS.find((dd) => dd.key === d)?.label).filter(Boolean).join(" · ")}
                {" — "}{(loc as any).openTime ?? "09:00"} → {(loc as any).closeTime ?? "18:00"}
              </div>
            )}
            {(loc as any).allowedConsultTypes?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {((loc as any).allowedConsultTypes as string[]).map((ctId) => {
                  const ct = consultationTypes.find((t) => t.id === ctId);
                  return ct ? (
                    <span key={ctId} className="text-[9px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{ct.name}</span>
                  ) : null;
                })}
              </div>
            )}
            {((loc as any).allowedConsultTypes ?? []).length === 0 && (
              <p className="text-[9px] text-amber-600 mt-1">⚠ Aucun type de consultation affecté</p>
            )}
          </div>
        )
      )}

      {/* Form (new or edit) */}
      {editing !== null && (
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <h3 className="text-sm font-semibold">{editing === "new" ? "Nouveau lieu" : "Modifier le lieu"}</h3>

          {/* Name + type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-muted-foreground">Nom</label>
              <Input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Cabinet Paris 10" className="h-8 text-xs mt-1" />
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground">Type</label>
              <div className="flex gap-1.5 mt-1">
                {(["PHYSICAL", "VIDEO", "HOME_VISIT"] as const).map((t) => (
                  <button key={t} onClick={() => setForm({ ...form, locationType: t })} className={`text-[10px] px-2 py-1 rounded border ${form.locationType === t ? "bg-primary text-white border-primary" : "border-border"}`}>
                    {LOCATION_TYPE_LABEL[t]?.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-[11px] font-medium text-muted-foreground">Adresse</label>
              <Input value={form.address ?? ""} onChange={(e) => setForm({ ...form, address: e.target.value })} className="h-8 text-xs mt-1" />
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground">Ville</label>
              <Input value={form.city ?? ""} onChange={(e) => setForm({ ...form, city: e.target.value })} className="h-8 text-xs mt-1" />
            </div>
          </div>

          {/* Days */}
          <div>
            <label className="text-[11px] font-medium text-muted-foreground">Jours d&apos;ouverture</label>
            <div className="flex gap-1.5 mt-1.5">
              {DAYS.map((d) => (
                <button key={d.key} onClick={() => toggleDay(d.key)} className={`w-8 h-8 rounded-lg text-[11px] font-medium ${(form.activeDays ?? []).includes(d.key) ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                  {d.label[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Hours */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-muted-foreground">Ouverture</label>
              <Input type="time" value={form.openTime ?? "09:00"} onChange={(e) => setForm({ ...form, openTime: e.target.value })} className="h-8 text-xs mt-1" />
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground">Fermeture</label>
              <Input type="time" value={form.closeTime ?? "18:00"} onChange={(e) => setForm({ ...form, closeTime: e.target.value })} className="h-8 text-xs mt-1" />
            </div>
          </div>

          {/* Allowed consultation types */}
          <div>
            <label className="text-[11px] font-medium text-muted-foreground">Types de consultation pratiqués dans ce lieu</label>
            {consultationTypes.length === 0 ? (
              <p className="text-[10px] text-muted-foreground mt-1.5">
                Créez d&apos;abord vos types de consultation dans l&apos;onglet &quot;Consultations&quot;.
              </p>
            ) : (
              <div className="space-y-1.5 mt-1.5">
                {consultationTypes.map((ct) => {
                  const checked = (form.allowedConsultTypes ?? []).includes(ct.id);
                  return (
                    <label key={ct.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          const current = form.allowedConsultTypes ?? [];
                          setForm({
                            ...form,
                            allowedConsultTypes: checked
                              ? current.filter((id) => id !== ct.id)
                              : [...current, ct.id],
                          });
                        }}
                        className="rounded border-border"
                      />
                      <span className="text-xs">{ct.name}</span>
                      <span className="text-[10px] text-muted-foreground">{ct.durationMinutes} min</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Color */}
          <div>
            <label className="text-[11px] font-medium text-muted-foreground">Couleur</label>
            <div className="flex gap-2 mt-1.5">
              {LOCATION_COLORS.map((c) => (
                <button key={c} onClick={() => setForm({ ...form, color: c })} className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${form.color === c ? "border-foreground" : "border-transparent"}`} style={{ backgroundColor: c }}>
                  {form.color === c && <Check size={12} className="text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button size="sm" className="text-xs" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !form.name?.trim()}>
              {saveMutation.isPending ? <Loader2 size={12} className="animate-spin mr-1" /> : null}
              Enregistrer
            </Button>
            <Button size="sm" variant="outline" className="text-xs" onClick={() => setEditing(null)}>
              Annuler
            </Button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {locations.length === 0 && editing === null && (
        <div className="text-center py-12 space-y-2">
          <MapPin size={32} className="mx-auto text-muted-foreground/30" />
          <p className="text-sm font-medium">Aucun lieu configuré</p>
          <p className="text-xs text-muted-foreground">Ajoutez votre premier cabinet pour organiser votre agenda.</p>
          <Button size="sm" className="text-xs gap-1.5 mt-2" onClick={startNew}>
            <Plus size={12} /> Ajouter un lieu
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Types Tab ──────────────────────────────────────────────────────────────

function TypesTab({ api, types, locations, qc }: {
  api: ReturnType<typeof apiWithToken>;
  types: Array<{ id: string; name: string; durationMinutes: number; code?: string | null; color?: string | null }>;
  locations: ConsultationLocation[];
  qc: ReturnType<typeof useQueryClient>;
}) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [duration, setDuration] = useState(45);

  const createMutation = useMutation({
    mutationFn: () =>
      api.appointments.createConsultationType({ name, durationMinutes: duration, price: 0 }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agenda-settings"] });
      qc.invalidateQueries({ queryKey: ["consultation-types"] });
      setAdding(false);
      setName("");
      toast.success("Type de consultation ajouté");
    },
    onError: () => toast.error("Erreur"),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Types de consultation</h2>
        <Button size="sm" variant="outline" className="text-xs gap-1.5" onClick={() => setAdding(true)}>
          <Plus size={12} /> Ajouter un type
        </Button>
      </div>

      {/* Existing types */}
      <div className="space-y-2">
        {types.map((t) => (
          <div key={t.id} className="rounded-lg border bg-card p-3">
            <div className="flex items-center gap-3">
              <Stethoscope size={14} className="text-muted-foreground" />
              <span className="text-sm font-medium flex-1">{t.name}</span>
              <span className="text-xs text-muted-foreground">{t.durationMinutes} min</span>
            </div>
            {(() => {
              const assignedLocs = locations.filter((l) => ((l as any).allowedConsultTypes ?? []).includes(t.id));
              return assignedLocs.length > 0 ? (
                <div className="flex flex-wrap gap-1 mt-1.5 ml-7">
                  {assignedLocs.map((l) => (
                    <span key={l.id} className="text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1" style={{ backgroundColor: `${l.color ?? "#6B7FA3"}15`, color: l.color ?? "#6B7FA3" }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: l.color ?? "#6B7FA3" }} />
                      {l.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[9px] text-amber-600 mt-1 ml-7">⚠ Non affecté à un cabinet</p>
              );
            })()}
          </div>
        ))}
      </div>

      {/* Add form */}
      {adding && (
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <h3 className="text-sm font-semibold">Nouveau type</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-muted-foreground">Nom</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Consultation de crise" className="h-8 text-xs mt-1" />
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground">Durée (min)</label>
              <div className="flex gap-1.5 mt-1">
                {[15, 30, 45, 60, 90].map((d) => (
                  <button key={d} onClick={() => setDuration(d)} className={`text-[10px] px-2 py-1 rounded border ${duration === d ? "bg-primary text-white border-primary" : "border-border"}`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="text-xs" onClick={() => createMutation.mutate()} disabled={!name.trim()}>
              Enregistrer
            </Button>
            <Button size="sm" variant="outline" className="text-xs" onClick={() => setAdding(false)}>
              Annuler
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Rules Tab ──────────────────────────────────────────────────────────────

function RulesTab({ api, settings, qc }: {
  api: ReturnType<typeof apiWithToken>;
  settings: AgendaSettings;
  qc: ReturnType<typeof useQueryClient>;
}) {
  const [buffer, setBuffer] = useState(settings.buffer ?? 0);
  const [minNotice, setMinNotice] = useState(settings.minNotice ?? 24);
  const [maxHorizon, setMaxHorizon] = useState(settings.maxHorizon ?? 90);
  const [autoConfirm, setAutoConfirm] = useState(settings.autoConfirm);
  const [smartCompact, setSmartCompact] = useState(settings.smartCompact ?? true);
  const [cancelDelay, setCancelDelay] = useState(settings.cancelDelay ?? 24);

  const mutation = useMutation({
    mutationFn: () => api.agendaSettings.update({
      agendaBuffer: buffer || null,
      agendaMinNotice: minNotice || null,
      agendaMaxHorizon: maxHorizon || null,
      agendaAutoConfirm: autoConfirm,
      agendaSmartCompact: smartCompact,
      agendaCancelDelay: cancelDelay || null,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agenda-settings"] });
      toast.success("Règles enregistrées");
    },
    onError: () => toast.error("Erreur"),
  });

  return (
    <div className="space-y-6">
      {/* Buffer */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Temps de battement entre consultations</h3>
        <p className="text-xs text-muted-foreground">Ce temps est automatiquement ajouté après chaque consultation.</p>
        <div className="flex gap-1.5">
          {[0, 5, 10, 15, 20].map((v) => (
            <button key={v} onClick={() => setBuffer(v)} className={`text-xs px-3 py-1.5 rounded-lg border ${buffer === v ? "bg-primary text-white border-primary" : "border-border"}`}>
              {v === 0 ? "Aucun" : `${v} min`}
            </button>
          ))}
        </div>
      </div>

      {/* Min notice */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Délai minimum avant rendez-vous</h3>
        <div className="flex gap-1.5">
          {[
            { v: 0, l: "Le jour même" },
            { v: 24, l: "24h" },
            { v: 48, l: "48h" },
            { v: 168, l: "1 semaine" },
          ].map(({ v, l }) => (
            <button key={v} onClick={() => setMinNotice(v)} className={`text-xs px-3 py-1.5 rounded-lg border ${minNotice === v ? "bg-primary text-white border-primary" : "border-border"}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Max horizon */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Horizon de réservation</h3>
        <div className="flex gap-1.5">
          {[
            { v: 30, l: "1 mois" },
            { v: 60, l: "2 mois" },
            { v: 90, l: "3 mois" },
            { v: 180, l: "6 mois" },
          ].map(({ v, l }) => (
            <button key={v} onClick={() => setMaxHorizon(v)} className={`text-xs px-3 py-1.5 rounded-lg border ${maxHorizon === v ? "bg-primary text-white border-primary" : "border-border"}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Auto confirm */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Confirmation automatique</h3>
        <div className="flex items-center gap-3">
          <button onClick={() => setAutoConfirm(!autoConfirm)} className={`w-10 h-5 rounded-full transition-colors ${autoConfirm ? "bg-primary" : "bg-muted"}`}>
            <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${autoConfirm ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
          <span className="text-xs text-muted-foreground">
            {autoConfirm ? "Les demandes via l'annuaire sont confirmées automatiquement" : "Chaque demande nécessite votre validation manuelle"}
          </span>
        </div>
      </div>

      {/* Cancel delay */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Délai d&apos;annulation patient</h3>
        <div className="flex gap-1.5">
          {[
            { v: 0, l: "Aucun" },
            { v: 24, l: "24h" },
            { v: 48, l: "48h" },
            { v: 72, l: "72h" },
          ].map(({ v, l }) => (
            <button key={v} onClick={() => setCancelDelay(v)} className={`text-xs px-3 py-1.5 rounded-lg border ${cancelDelay === v ? "bg-primary text-white border-primary" : "border-border"}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Smart compact */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Smart compactage</h3>
        <div className="flex items-center gap-3">
          <button onClick={() => setSmartCompact(!smartCompact)} className={`w-10 h-5 rounded-full transition-colors ${smartCompact ? "bg-primary" : "bg-muted"}`}>
            <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${smartCompact ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
          <div>
            <span className="text-xs text-foreground">
              {smartCompact ? "Activé" : "Désactivé"}
            </span>
            <p className="text-[10px] text-muted-foreground">Propose en priorité les créneaux adjacents aux RDV existants pour éviter les trous.</p>
          </div>
        </div>
      </div>

      {/* Save */}
      <Button size="sm" className="text-xs" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
        {mutation.isPending ? <Loader2 size={12} className="animate-spin mr-1" /> : null}
        Enregistrer les règles
      </Button>
    </div>
  );
}

// ─── Absences Tab ─────────────────────────────────────────────────────────

function AbsencesTab({ api, absences, locations, qc }: {
  api: ReturnType<typeof apiWithToken>;
  absences: Array<{ id: string; label: string; startDate: string; endDate: string; allLocations: boolean; locationIds: string[] }>;
  locations: ConsultationLocation[];
  qc: ReturnType<typeof useQueryClient>;
}) {
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [allLocs, setAllLocs] = useState(true);
  const [selectedLocIds, setSelectedLocIds] = useState<string[]>([]);

  const createMutation = useMutation({
    mutationFn: () =>
      api.absences.create({
        label,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        allLocations: allLocs,
        locationIds: allLocs ? [] : selectedLocIds,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agenda-settings"] });
      setAdding(false);
      setLabel("");
      setStartDate("");
      setEndDate("");
      toast.success("Absence ajoutée");
    },
    onError: () => toast.error("Erreur"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.absences.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agenda-settings"] });
      toast.success("Absence supprimée");
    },
  });

  const futureAbsences = absences.filter((a) => new Date(a.endDate) >= new Date());
  const pastAbsences = absences.filter((a) => new Date(a.endDate) < new Date());

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Absences et blocages</h2>
        <Button size="sm" variant="outline" className="text-xs gap-1.5" onClick={() => setAdding(true)}>
          <Plus size={12} /> Bloquer une plage
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Les créneaux bloqués ne seront pas proposés aux patients dans l&apos;annuaire.
      </p>

      {/* Future absences */}
      {futureAbsences.length > 0 && (
        <div className="space-y-2">
          {futureAbsences.map((a) => (
            <div key={a.id} className="rounded-lg border bg-card p-3 flex items-center gap-3">
              <CalendarOff size={14} className="text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{a.label}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(a.startDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                  {" → "}
                  {new Date(a.endDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                  {a.allLocations ? " · Tous les lieux" : ` · ${a.locationIds.length} lieu${a.locationIds.length !== 1 ? "x" : ""}`}
                </p>
              </div>
              <button onClick={() => deleteMutation.mutate(a.id)} className="p-1 rounded hover:bg-muted">
                <Trash2 size={12} className="text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add form */}
      {adding && (
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <h3 className="text-sm font-semibold">Nouvelle absence</h3>
          <div>
            <label className="text-[11px] font-medium text-muted-foreground">Motif</label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ex: Vacances d'été, Formation…" className="h-8 text-xs mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-muted-foreground">Début</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-8 text-xs mt-1" />
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground">Fin</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-8 text-xs mt-1" />
            </div>
          </div>

          {/* Location scope */}
          <div>
            <label className="text-[11px] font-medium text-muted-foreground">Lieux concernés</label>
            <div className="space-y-1.5 mt-1.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={allLocs} onChange={() => setAllLocs(!allLocs)} className="rounded border-border" />
                <span className="text-xs">Tous les lieux</span>
              </label>
              {!allLocs && locations.map((loc) => (
                <label key={loc.id} className="flex items-center gap-2 cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={selectedLocIds.includes(loc.id)}
                    onChange={() => {
                      setSelectedLocIds((prev) =>
                        prev.includes(loc.id) ? prev.filter((id) => id !== loc.id) : [...prev, loc.id]
                      );
                    }}
                    className="rounded border-border"
                  />
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: loc.color ?? "#6B7FA3" }} />
                  <span className="text-xs">{loc.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="sm" className="text-xs" onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !label.trim() || !startDate || !endDate}>
              {createMutation.isPending ? <Loader2 size={12} className="animate-spin mr-1" /> : null}
              Bloquer cette plage
            </Button>
            <Button size="sm" variant="outline" className="text-xs" onClick={() => setAdding(false)}>
              Annuler
            </Button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {absences.length === 0 && !adding && (
        <div className="text-center py-12 space-y-2">
          <CalendarOff size={32} className="mx-auto text-muted-foreground/30" />
          <p className="text-sm font-medium">Aucune absence planifiée</p>
          <p className="text-xs text-muted-foreground">Bloquez des plages pour les vacances, formations ou indisponibilités.</p>
        </div>
      )}

      {/* Info */}
      <p className="text-[10px] text-muted-foreground">
        Vous pouvez aussi bloquer un créneau directement depuis la vue semaine de l&apos;agenda.
      </p>
    </div>
  );
}
