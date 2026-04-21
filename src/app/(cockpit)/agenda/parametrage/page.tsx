"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, appointmentsApi, type ConsultationLocation } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import { Loader2 } from "lucide-react";

/* ─── NAMI PALETTE ─── */
const NAMI = {
  bg: "#F6F5FB",
  card: "#FFFFFF",
  primary: "#5B4EC4",
  primaryLight: "#EDE9FC",
  primaryMid: "#8B7FD9",
  text: "#2D2B3D",
  textSoft: "#8A879C",
  border: "#ECEAF5",
  borderFocus: "#5B4EC4",
  danger: "#C4574E",
  dangerBg: "#FDF0EF",
  success: "#4E9A7C",
  successBg: "#EDF7F2",
};

const CONSULT_COLORS = [
  { name: "Ardoise", hex: "#6B7B8D" },
  { name: "Sauge", hex: "#7D9E85" },
  { name: "Terracotta", hex: "#C4836A" },
  { name: "Sable", hex: "#C2AB7F" },
  { name: "Lavande", hex: "#9A8DC4" },
  { name: "Bleu gris", hex: "#7E95A9" },
  { name: "Rose ancien", hex: "#B8868E" },
  { name: "Olive", hex: "#8A9A6B" },
  { name: "Prune", hex: "#8E6B8A" },
  { name: "Océan", hex: "#6B8E9A" },
];

const WEEK_DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const LOCATION_TYPES = [
  { id: "PHYSICAL", label: "Cabinet", icon: "🏥" },
  { id: "HOSPITAL", label: "Hôpital", icon: "🏨" },
  { id: "VIDEO", label: "Visio", icon: "💻" },
  { id: "HOME_VISIT", label: "Domicile", icon: "🏠" },
];

/* ─── TYPES ─── */
interface LocationDraft {
  id?: string;
  name: string;
  type: string;
  active: boolean;
  address: string;
  accessInfo: string;
  onlineBooking: boolean;
  acceptReferrals: boolean;
  allowedConsultIds: string[];
  schedule: Record<string, Array<{ start: string; end: string }>>;
  color: string;
}

interface ConsultDraft {
  id?: string;
  name: string;
  duration: number;
  price: number;
  color: string;
  format: string;
  locationIds: string[];
  minAdvance: number;
  cancelDelay: number;
}

/* ─── PRIMITIVES ─── */

function Toggle({ value, onChange, label, sub }: { value: boolean; onChange: (v: boolean) => void; label: string; sub?: string }) {
  return (
    <label style={S.toggleRow}>
      <div style={{ flex: 1 }}>
        <div style={S.toggleLabel}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: NAMI.textSoft, marginTop: 1 }}>{sub}</div>}
      </div>
      <div onClick={() => onChange(!value)} style={{ ...S.toggleTrack, background: value ? NAMI.primary : "#D5D3E0" }}>
        <div style={{ ...S.toggleThumb, transform: value ? "translateX(18px)" : "translateX(0)" }} />
      </div>
    </label>
  );
}

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {CONSULT_COLORS.map((c) => (
        <div key={c.hex} onClick={() => onChange(c.hex)} title={c.name}
          style={{ width: 28, height: 28, borderRadius: "50%", background: c.hex, cursor: "pointer", border: value === c.hex ? `3px solid ${NAMI.text}` : "3px solid transparent", transition: "border 0.15s" }} />
      ))}
    </div>
  );
}

function SectionHeader({ icon, title, sub }: { icon: string; title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{ fontSize: 15, fontWeight: 600, color: NAMI.text }}>{title}</span>
      </div>
      {sub && <div style={{ fontSize: 12, color: NAMI.textSoft, marginTop: 2, paddingLeft: 28 }}>{sub}</div>}
    </div>
  );
}

function TimeSlotRow({ slot, onUpdate, onRemove }: { slot: { start: string; end: string }; onUpdate: (s: { start: string; end: string }) => void; onRemove: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
      <input type="time" value={slot.start} onChange={(e) => onUpdate({ ...slot, start: e.target.value })} style={S.timeInput} />
      <span style={{ color: NAMI.textSoft, fontSize: 12 }}>→</span>
      <input type="time" value={slot.end} onChange={(e) => onUpdate({ ...slot, end: e.target.value })} style={S.timeInput} />
      <button onClick={onRemove} style={S.removeBtn}>✕</button>
    </div>
  );
}

/* ─── LOCATION CARD ─── */

function LocationCard({ loc, consults, onUpdate, onRemove, isOpen, onToggle, saving }: {
  loc: LocationDraft; consults: ConsultDraft[]; onUpdate: (l: LocationDraft) => void; onRemove: () => void; isOpen: boolean; onToggle: () => void; saving: boolean;
}) {
  const typeInfo = LOCATION_TYPES.find((t) => t.id === loc.type) || LOCATION_TYPES[0];
  return (
    <div style={S.card}>
      <div style={S.cardHead} onClick={onToggle}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: NAMI.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>{typeInfo.icon}</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: NAMI.text }}>{loc.name || "Nouveau lieu"}</div>
            <div style={{ fontSize: 12, color: NAMI.textSoft }}>{typeInfo.label}{loc.address ? ` · ${loc.address.split(",")[0]}` : ""}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {loc.active !== false && <span style={{ fontSize: 11, fontWeight: 600, color: NAMI.success, background: NAMI.successBg, padding: "3px 8px", borderRadius: 6 }}>Actif</span>}
          <svg width="16" height="16" viewBox="0 0 16 16" style={{ opacity: 0.3, transform: isOpen ? "rotate(180deg)" : "", transition: "transform 0.2s" }}>
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div style={S.cardBody}>
          <div style={S.field}>
            <label style={S.label}>Nom du lieu</label>
            <input style={S.input} value={loc.name} onChange={(e) => onUpdate({ ...loc, name: e.target.value })} placeholder="Ex: Via Sana Paris 10" />
          </div>
          <div style={S.field}>
            <label style={S.label}>Type</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {LOCATION_TYPES.map((t) => (
                <button key={t.id} onClick={() => onUpdate({ ...loc, type: t.id })}
                  style={{ ...S.chip, background: loc.type === t.id ? NAMI.primary : "#F3F2FA", color: loc.type === t.id ? "#fff" : NAMI.text }}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>

          {loc.type !== "VIDEO" && (
            <>
              <div style={S.field}>
                <label style={S.label}>Adresse</label>
                <input style={S.input} value={loc.address || ""} onChange={(v) => onUpdate({ ...loc, address: (v.target as HTMLInputElement).value })} placeholder="12 Rue de Rivoli, 75001 Paris" />
              </div>
              <div style={S.field}>
                <label style={S.label}>Infos d&apos;accès</label>
                <textarea style={{ ...S.input, minHeight: 56, resize: "vertical" as const, fontFamily: "inherit" }} value={loc.accessInfo || ""}
                  onChange={(e) => onUpdate({ ...loc, accessInfo: e.target.value })} placeholder="Code porte, étage, interphone, parking…" />
              </div>
            </>
          )}

          <div style={S.field}>
            <label style={S.label}>Plages d&apos;ouverture</label>
            <div style={{ background: "#FAFAFD", borderRadius: 10, border: `1px solid ${NAMI.border}`, overflow: "hidden" }}>
              {WEEK_DAYS.map((day, di) => {
                const daySlots = (loc.schedule || {})[day] || [];
                return (
                  <div key={day} style={{ padding: "10px 14px", borderBottom: di < WEEK_DAYS.length - 1 ? `1px solid ${NAMI.border}` : "none" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: daySlots.length > 0 ? NAMI.text : NAMI.textSoft }}>{day}</span>
                      <button style={{ ...S.linkBtn, fontSize: 11 }} onClick={() => {
                        const ns = { ...(loc.schedule || {}) };
                        ns[day] = [...(ns[day] || []), { start: "09:00", end: "13:00" }];
                        onUpdate({ ...loc, schedule: ns });
                      }}>+ Créneau</button>
                    </div>
                    {daySlots.length === 0 && <div style={{ fontSize: 12, color: NAMI.textSoft, opacity: 0.6, marginTop: 2 }}>Fermé</div>}
                    {daySlots.map((slot, i) => (
                      <TimeSlotRow key={i} slot={slot}
                        onUpdate={(u) => { const ns = { ...loc.schedule }; ns[day] = [...ns[day]]; ns[day][i] = u; onUpdate({ ...loc, schedule: ns }); }}
                        onRemove={() => { const ns = { ...loc.schedule }; ns[day] = ns[day].filter((_: unknown, j: number) => j !== i); onUpdate({ ...loc, schedule: ns }); }} />
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={S.field}>
            <label style={S.label}>Consultations autorisées ici</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {consults.map((c) => {
                const selected = (loc.allowedConsultIds || []).includes(c.id ?? "");
                return (
                  <button key={c.id} onClick={() => {
                    const ids = loc.allowedConsultIds || [];
                    onUpdate({ ...loc, allowedConsultIds: selected ? ids.filter((x) => x !== c.id) : [...ids, c.id ?? ""] });
                  }} style={{ ...S.chip, background: selected ? c.color : "#F3F2FA", color: selected ? "#fff" : NAMI.text, fontSize: 12 }}>
                    {c.name || "Sans nom"}
                  </button>
                );
              })}
              {consults.length === 0 && <span style={{ fontSize: 12, color: NAMI.textSoft }}>Ajoutez d&apos;abord des consultations</span>}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" as const, gap: 8, paddingTop: 4 }}>
            <Toggle label="Prise de RDV en ligne" sub="Les patients peuvent réserver via l'annuaire" value={!!loc.onlineBooking} onChange={(v) => onUpdate({ ...loc, onlineBooking: v })} />
            <Toggle label="Adressage de patients" sub="Accepter les patients adressés par des confrères" value={!!loc.acceptReferrals} onChange={(v) => onUpdate({ ...loc, acceptReferrals: v })} />
            <Toggle label="Lieu actif" value={loc.active !== false} onChange={(v) => onUpdate({ ...loc, active: v })} />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 8, gap: 8 }}>
            <button onClick={onRemove} style={S.dangerBtn}>Supprimer ce lieu</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── CONSULTATION CARD ─── */

function ConsultationCard({ consult, locations, onUpdate, onRemove, isOpen, onToggle }: {
  consult: ConsultDraft; locations: LocationDraft[]; onUpdate: (c: ConsultDraft) => void; onRemove: () => void; isOpen: boolean; onToggle: () => void;
}) {
  return (
    <div style={S.card}>
      <div style={S.cardHead} onClick={onToggle}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 14, height: 14, borderRadius: "50%", background: consult.color || "#6B7B8D", flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: NAMI.text }}>{consult.name || "Nouvelle consultation"}</div>
            <div style={{ fontSize: 12, color: NAMI.textSoft }}>{consult.duration || 30} min · {consult.price || 0}€</div>
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 16 16" style={{ opacity: 0.3, transform: isOpen ? "rotate(180deg)" : "", transition: "transform 0.2s" }}>
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      </div>

      {isOpen && (
        <div style={S.cardBody}>
          <div style={S.field}>
            <label style={S.label}>Nom</label>
            <input style={S.input} value={consult.name} onChange={(e) => onUpdate({ ...consult, name: e.target.value })} placeholder="Ex: Première consultation" />
          </div>

          <div style={S.field}>
            <label style={S.label}>Format</label>
            <div style={{ display: "flex", gap: 6 }}>
              {["Cabinet", "Visio", "Les deux"].map((f) => (
                <button key={f} onClick={() => onUpdate({ ...consult, format: f })}
                  style={{ ...S.chip, background: consult.format === f ? NAMI.primary : "#F3F2FA", color: consult.format === f ? "#fff" : NAMI.text }}>
                  {f === "Cabinet" ? "🏥" : f === "Visio" ? "💻" : "🔄"} {f}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ ...S.field, flex: 1 }}>
              <label style={S.label}>Durée (min)</label>
              <input type="number" style={S.input} value={consult.duration || ""} onChange={(e) => onUpdate({ ...consult, duration: parseInt(e.target.value) || 0 })} />
            </div>
            <div style={{ ...S.field, flex: 1 }}>
              <label style={S.label}>Tarif (€)</label>
              <input type="number" style={S.input} value={consult.price || ""} onChange={(e) => onUpdate({ ...consult, price: parseInt(e.target.value) || 0 })} />
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ ...S.field, flex: 1 }}>
              <label style={S.label}>Réservation min. (jours)</label>
              <input type="number" style={S.input} value={consult.minAdvance ?? ""} onChange={(e) => onUpdate({ ...consult, minAdvance: parseInt(e.target.value) || 0 })} placeholder="1" />
            </div>
            <div style={{ ...S.field, flex: 1 }}>
              <label style={S.label}>Délai annulation (h)</label>
              <input type="number" style={S.input} value={consult.cancelDelay ?? ""} onChange={(e) => onUpdate({ ...consult, cancelDelay: parseInt(e.target.value) || 0 })} placeholder="24" />
            </div>
          </div>

          <div style={S.field}>
            <label style={S.label}>Couleur dans l&apos;agenda</label>
            <ColorPicker value={consult.color || "#6B7B8D"} onChange={(c) => onUpdate({ ...consult, color: c })} />
          </div>

          <div style={S.field}>
            <label style={S.label}>Lieux associés</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {locations.map((loc) => {
                const sel = (consult.locationIds || []).includes(loc.id ?? "");
                const typeInfo = LOCATION_TYPES.find((t) => t.id === loc.type);
                return (
                  <button key={loc.id} onClick={() => {
                    const ids = consult.locationIds || [];
                    onUpdate({ ...consult, locationIds: sel ? ids.filter((x) => x !== loc.id) : [...ids, loc.id ?? ""] });
                  }} style={{ ...S.chip, background: sel ? NAMI.primary : "#F3F2FA", color: sel ? "#fff" : NAMI.text, fontSize: 12 }}>
                    {typeInfo?.icon} {loc.name || "Sans nom"}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 8 }}>
            <button onClick={onRemove} style={S.dangerBtn}>Supprimer</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── DISPONIBILITÉS ─── */

function DisponibilitesTab() {
  const [activeDays, setActiveDays] = useState([true, true, true, true, true, false, false]);
  const [defaultDuration, setDefaultDuration] = useState(30);
  const cardStyle: React.CSSProperties = { background: "#FFFFFF", borderRadius: 14, border: `1px solid ${NAMI.border}`, marginBottom: 12, overflow: "hidden" };
  const sectionLabelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: NAMI.textSoft, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 };

  return (
    <div>
      <SectionHeader icon="📅" title="Disponibilités" sub="Horaires habituels et jours de consultation" />
      <div style={{ marginTop: 12 }}>
        {/* Horaires généraux */}
        <div style={cardStyle}>
          <div style={{ padding: "16px 18px" }}>
            <div style={sectionLabelStyle}>Horaires généraux</div>
            <p style={{ fontSize: 13, color: NAMI.textSoft, marginBottom: 14, lineHeight: 1.5 }}>
              Définissez vos plages de disponibilité par défaut. Les patients ne pourront réserver que dans ces créneaux.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: NAMI.textSoft, textTransform: "uppercase" as const, letterSpacing: "0.04em", marginBottom: 4 }}>Début de journée</div>
                <div style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${NAMI.border}`, fontSize: 14, fontWeight: 600, color: NAMI.text, background: "#FAFAFD" }}>08:00</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: NAMI.textSoft, textTransform: "uppercase" as const, letterSpacing: "0.04em", marginBottom: 4 }}>Fin de journée</div>
                <div style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${NAMI.border}`, fontSize: 14, fontWeight: 600, color: NAMI.text, background: "#FAFAFD" }}>18:00</div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: NAMI.textSoft, textTransform: "uppercase" as const, letterSpacing: "0.04em", marginBottom: 8 }}>Durée de consultation par défaut</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
                {[15, 20, 30, 45, 60, 90].map((d) => (
                  <button key={d} onClick={() => setDefaultDuration(d)}
                    style={{ ...S.chip, background: defaultDuration === d ? NAMI.primary : "#F3F2FA", color: defaultDuration === d ? "#fff" : NAMI.text, fontSize: 13 }}>
                    {d} min
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Jours de consultation */}
        <div style={cardStyle}>
          <div style={{ padding: "16px 18px" }}>
            <div style={sectionLabelStyle}>Jours de consultation</div>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 6 }}>
              {WEEK_DAYS.map((day, i) => (
                <div key={day} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10,
                  background: activeDays[i] ? "#FFFFFF" : "#FAFAFD", border: `1px solid ${activeDays[i] ? NAMI.border : "transparent"}`,
                  opacity: activeDays[i] ? 1 : 0.5,
                }}>
                  <div onClick={() => { const n = [...activeDays]; n[i] = !n[i]; setActiveDays(n); }} style={{
                    width: 20, height: 20, borderRadius: 4, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    background: activeDays[i] ? NAMI.primary : "transparent",
                    border: activeDays[i] ? "none" : `2px solid ${NAMI.border}`,
                    flexShrink: 0,
                  }}>
                    {activeDays[i] && <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>✓</span>}
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 500, color: NAMI.text, minWidth: 76 }}>{day}</span>
                  {activeDays[i] ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, flexWrap: "wrap" as const }}>
                      <span style={{ fontSize: 12, padding: "4px 10px", borderRadius: 6, border: `1px solid ${NAMI.border}`, color: NAMI.text }}>08:00</span>
                      <span style={{ fontSize: 12, color: NAMI.textSoft }}>→</span>
                      <span style={{ fontSize: 12, padding: "4px 10px", borderRadius: 6, border: `1px solid ${NAMI.border}`, color: NAMI.text }}>12:00</span>
                      <span style={{ fontSize: 12, color: NAMI.textSoft, margin: "0 2px" }}>·</span>
                      <span style={{ fontSize: 12, padding: "4px 10px", borderRadius: 6, border: `1px solid ${NAMI.border}`, color: NAMI.text }}>14:00</span>
                      <span style={{ fontSize: 12, color: NAMI.textSoft }}>→</span>
                      <span style={{ fontSize: 12, padding: "4px 10px", borderRadius: 6, border: `1px solid ${NAMI.border}`, color: NAMI.text }}>18:00</span>
                    </div>
                  ) : (
                    <span style={{ fontSize: 12, color: NAMI.textSoft }}>Non disponible</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Exceptions */}
        <div style={cardStyle}>
          <div style={{ padding: "16px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={sectionLabelStyle}>Exceptions</div>
              <button style={{ fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 8, border: `1px solid ${NAMI.border}`, background: "#FFFFFF", color: NAMI.primary, cursor: "pointer" }}>
                + Ajouter une exception
              </button>
            </div>
            <div style={{ padding: "16px", borderRadius: 10, background: "#FAFAFD", textAlign: "center" as const }}>
              <div style={{ fontSize: 13, color: NAMI.textSoft }}>Aucune exception configurée</div>
              <div style={{ fontSize: 12, color: NAMI.textSoft, marginTop: 4, opacity: 0.7, lineHeight: 1.5 }}>
                Ajoutez des jours exceptionnels (formation, congé, remplacement) pour bloquer ou ouvrir des créneaux ponctuels.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── NOTIFICATIONS ─── */

function NotificationsTab() {
  const [r7d, setR7d] = useState(false);
  const [r24h, setR24h] = useState(true);
  const [r2h, setR2h] = useState(true);
  const [soignant, setSoignant] = useState(true);
  const cardStyle: React.CSSProperties = { background: "#FFFFFF", borderRadius: 14, border: `1px solid ${NAMI.border}`, marginBottom: 12, overflow: "hidden" };
  const sectionLabelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: NAMI.textSoft, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 };

  return (
    <div>
      <SectionHeader icon="🔔" title="Notifications" sub="Rappels patients et alertes soignant" />
      <div style={{ marginTop: 12 }}>
        {/* Rappels patients */}
        <div style={cardStyle}>
          <div style={{ padding: "16px 18px" }}>
            <div style={sectionLabelStyle}>Rappels patients</div>
            <p style={{ fontSize: 13, color: NAMI.textSoft, marginBottom: 14, lineHeight: 1.5 }}>
              Les rappels sont envoyés automatiquement aux patients par email et notification push.
            </p>
            <div style={{ borderRadius: 10, border: `1px solid ${NAMI.border}`, overflow: "hidden" }}>
              <div style={{ padding: "4px 16px", borderBottom: `1px solid ${NAMI.border}` }}>
                <Toggle label="Rappel J-7 (une semaine avant)" value={r7d} onChange={setR7d} />
              </div>
              <div style={{ padding: "4px 16px", borderBottom: `1px solid ${NAMI.border}` }}>
                <Toggle label="Rappel J-1 (veille du RDV)" value={r24h} onChange={setR24h} />
              </div>
              <div style={{ padding: "4px 16px" }}>
                <Toggle label="Rappel H-2 (2 heures avant — push uniquement)" value={r2h} onChange={setR2h} />
              </div>
            </div>
          </div>
        </div>

        {/* Rappels soignant */}
        <div style={cardStyle}>
          <div style={{ padding: "16px 18px" }}>
            <div style={sectionLabelStyle}>Rappels soignant</div>
            <div style={{ borderRadius: 10, border: `1px solid ${NAMI.border}`, overflow: "hidden" }}>
              <div style={{ padding: "4px 16px" }}>
                <Toggle label="Notification quand un patient est marqué arrivé" value={soignant} onChange={setSoignant} />
              </div>
            </div>
          </div>
        </div>

        {/* Contenu notifications — RGPD */}
        <div style={cardStyle}>
          <div style={{ padding: "16px 18px" }}>
            <div style={sectionLabelStyle}>Contenu des notifications</div>
            <div style={{ padding: "14px 16px", borderRadius: 10, background: "rgba(230,153,62,0.06)", border: "1px solid rgba(230,153,62,0.2)", fontSize: 13, lineHeight: 1.6, color: "#C67B00" }}>
              ⚠ Pour des raisons de confidentialité (RGPD), les notifications push n&apos;affichent que &ldquo;Nouveau rendez-vous&rdquo; ou &ldquo;Rappel de rendez-vous&rdquo; — jamais le nom du patient ni le motif.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── HELPERS: API ↔ Draft conversion ─── */

function apiLocationToDraft(loc: ConsultationLocation): LocationDraft {
  const l = loc as any;
  return {
    id: loc.id,
    name: loc.name,
    type: loc.locationType ?? "PHYSICAL",
    active: loc.isActive !== false,
    address: loc.address ?? "",
    accessInfo: l.instructions ?? l.accessCode ?? "",
    onlineBooking: l.allowsVideo ?? false,
    acceptReferrals: false,
    allowedConsultIds: l.allowedConsultTypes ?? [],
    schedule: l.schedule ?? {},
    color: loc.color ?? "#6B7B8D",
  };
}

function apiConsultToDraft(c: any): ConsultDraft {
  return {
    id: c.id,
    name: c.name,
    duration: c.durationMinutes ?? 30,
    price: c.price ?? 0,
    color: c.color ?? "#6B7B8D",
    format: c.consultationMode === "VIDEO" ? "Visio" : "Cabinet",
    locationIds: [],
    minAdvance: 1,
    cancelDelay: 24,
  };
}

/* ─── MAIN ─── */

export default function ParametresAgenda() {
  const { accessToken } = useAuthStore();
  const api = apiWithToken(accessToken!);
  const qc = useQueryClient();

  const [section, setSection] = useState("lieux");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [buffer, setBuffer] = useState(10);
  const [smartCompact, setSmartCompact] = useState(true);

  // Fetch from API
  const { data: settings, isLoading } = useQuery({
    queryKey: ["agenda-settings"],
    queryFn: () => api.agendaSettings.get(),
  });

  // Local state from API data
  const [locations, setLocations] = useState<LocationDraft[]>([]);
  const [consults, setConsults] = useState<ConsultDraft[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (settings && !initialized) {
      setLocations((settings.locations ?? []).map(apiLocationToDraft));
      setConsults((settings.consultationTypes ?? []).map(apiConsultToDraft));
      setBuffer(settings.buffer ?? 10);
      setSmartCompact(settings.smartCompact ?? true);
      setInitialized(true);
    }
  }, [settings, initialized]);

  // Save location mutation
  const saveLocationMutation = useMutation({
    mutationFn: async (loc: LocationDraft) => {
      const payload = {
        name: loc.name,
        locationType: loc.type as "PHYSICAL" | "VIDEO" | "PHONE" | "HOME_VISIT",
        color: loc.color,
        address: loc.address || undefined,
        instructions: loc.accessInfo || undefined,
        isActive: loc.active,
        allowedConsultTypes: loc.allowedConsultIds,
        schedule: loc.schedule,
      };
      if (loc.id && !loc.id.startsWith("new_")) {
        return api.locations.update(loc.id, payload);
      } else {
        return api.locations.create(payload as any);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agenda-settings"] });
      qc.invalidateQueries({ queryKey: ["locations"] });
      toast.success("Lieu sauvegardé");
    },
    onError: () => toast.error("Erreur lors de la sauvegarde"),
  });

  const deleteLocationMutation = useMutation({
    mutationFn: (id: string) => api.locations.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agenda-settings"] });
      qc.invalidateQueries({ queryKey: ["locations"] });
      toast.success("Lieu supprimé");
    },
  });

  // Save consult type mutation
  const saveConsultMutation = useMutation({
    mutationFn: async (c: ConsultDraft) => {
      const payload = {
        name: c.name,
        durationMinutes: c.duration,
        price: c.price,
        consultationMode: c.format === "Visio" ? "VIDEO" as const : "IN_PERSON" as const,
        availablePublicly: true,
      };
      if (c.id && !c.id.startsWith("new_")) {
        return api.appointments.patchConsultationType(c.id, payload);
      } else {
        return api.appointments.createConsultationType(payload);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agenda-settings"] });
      toast.success("Consultation sauvegardée");
    },
    onError: () => toast.error("Erreur lors de la sauvegarde"),
  });

  const saveRulesMutation = useMutation({
    mutationFn: () => api.agendaSettings.update({
      agendaBuffer: buffer,
      agendaSmartCompact: smartCompact,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agenda-settings"] });
      toast.success("Préférences sauvegardées");
    },
  });

  // Sync slots from location schedules → AvailabilitySlot
  const syncSlotsMutation = useMutation({
    mutationFn: async () => {
      if (!accessToken) return;
      const WEEKDAY_MAP: Record<string, number> = {
        Lundi: 1, Mardi: 2, Mercredi: 3, Jeudi: 4,
        Vendredi: 5, Samedi: 6, Dimanche: 0,
      };
      // Delete existing slots
      const existing = await appointmentsApi.slots(accessToken);
      for (const slot of existing) {
        await appointmentsApi.deleteSlot(accessToken, slot.id);
      }
      // Recreate from all location schedules
      for (const location of locations) {
        for (const [day, slots] of Object.entries(location.schedule || {})) {
          const weekday = WEEKDAY_MAP[day];
          if (weekday === undefined) continue;
          for (const slot of slots as Array<{ start: string; end: string }>) {
            await appointmentsApi.createSlot(accessToken, {
              weekday,
              startTime: slot.start,
              endTime: slot.end,
              isActive: true,
            });
          }
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["availability-slots"] });
      qc.invalidateQueries({ queryKey: ["agenda-settings"] });
      toast.success("Plages horaires sauvegardées");
    },
    onError: () => toast.error("Erreur sauvegarde des plages"),
  });

  function addLocation() {
    const id = "new_" + Date.now();
    setLocations([...locations, { id, name: "", type: "PHYSICAL", active: true, address: "", accessInfo: "", onlineBooking: true, acceptReferrals: false, allowedConsultIds: [], schedule: {}, color: "#6B7B8D" }]);
    setExpandedId(id);
  }

  function addConsult() {
    const id = "new_" + Date.now();
    setConsults([...consults, { id, name: "", duration: 30, price: 50, color: CONSULT_COLORS[(consults.length) % CONSULT_COLORS.length].hex, format: "Cabinet", locationIds: [], minAdvance: 1, cancelDelay: 24 }]);
    setExpandedId(id);
  }

  if (isLoading) {
    return (
      <div style={{ ...S.page, alignItems: "center", justifyContent: "center", display: "flex" }}>
        <Loader2 size={24} className="animate-spin" style={{ color: NAMI.primary }} />
      </div>
    );
  }

  return (
    <div style={S.page}>
      <div style={S.container}>
        {/* HEADER */}
        <div style={{ marginBottom: 24 }}>
          <Link href="/agenda" style={{ fontSize: 12, color: NAMI.textSoft, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 12 }}>
            ← Retour à l&apos;agenda
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${NAMI.primary}, ${NAMI.primaryMid})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: NAMI.text, letterSpacing: "-0.5px" }}>Paramètres de l&apos;agenda</h1>
          </div>
          <p style={{ fontSize: 13, color: NAMI.textSoft, paddingLeft: 42 }}>Disponibilités, lieux, consultations, agenda intelligent et notifications</p>
        </div>

        {/* TABS */}
        <div style={{ display: "flex", gap: 0, borderBottom: `2px solid ${NAMI.border}`, marginBottom: 20 }}>
          {[
            { id: "disponibilites", label: "Disponibilités", icon: "📅" },
            { id: "lieux", label: "Lieux", icon: "📍" },
            { id: "consultations", label: "Consultations", icon: "🩺" },
            { id: "preferences", label: "Agenda intelligent", icon: "⚡" },
            { id: "notifications", label: "Notifications", icon: "🔔" },
          ].map((tab) => (
            <button key={tab.id} onClick={() => { setSection(tab.id); setExpandedId(null); }}
              style={{
                padding: "10px 14px", border: "none", background: "transparent", cursor: "pointer",
                fontFamily: "inherit", fontSize: 13, fontWeight: section === tab.id ? 600 : 400,
                color: section === tab.id ? NAMI.primary : NAMI.textSoft,
                borderBottom: section === tab.id ? `2px solid ${NAMI.primary}` : "2px solid transparent",
                marginBottom: -2, transition: "all 0.15s", display: "flex", alignItems: "center", gap: 5,
                whiteSpace: "nowrap" as const,
              }}>
              <span style={{ fontSize: 12 }}>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* ── DISPONIBILITÉS ── */}
        {section === "disponibilites" && <DisponibilitesTab />}

        {/* ── NOTIFICATIONS ── */}
        {section === "notifications" && <NotificationsTab />}

        {/* ── LIEUX ── */}
        {section === "lieux" && (
          <div>
            <SectionHeader icon="📍" title="Lieux de consultation" sub="Adresse, horaires, types autorisés et préférences par lieu" />
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
              {locations.map((loc) => (
                <LocationCard key={loc.id} loc={loc} consults={consults}
                  isOpen={expandedId === loc.id} onToggle={() => setExpandedId(expandedId === loc.id ? null : loc.id ?? null)}
                  onUpdate={(u) => {
                    const prev = locations.find((l) => l.id === u.id);
                    setLocations(locations.map((l) => (l.id === u.id ? u : l)));
                    saveLocationMutation.mutate(u);
                    // Sync availability slots if schedule changed
                    if (prev && JSON.stringify(u.schedule) !== JSON.stringify(prev.schedule)) {
                      syncSlotsMutation.mutate();
                    }
                  }}
                  onRemove={() => {
                    if (loc.id && !loc.id.startsWith("new_")) deleteLocationMutation.mutate(loc.id);
                    setLocations(locations.filter((l) => l.id !== loc.id));
                  }}
                  saving={saveLocationMutation.isPending} />
              ))}
              <button onClick={addLocation} style={S.addBtn}>+ Ajouter un lieu</button>
            </div>
          </div>
        )}

        {/* ── CONSULTATIONS ── */}
        {section === "consultations" && (
          <div>
            <SectionHeader icon="🩺" title="Types de consultation" sub="Nom, format, durée, tarif, couleur et lieux associés" />
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
              {consults.map((c) => (
                <ConsultationCard key={c.id} consult={c} locations={locations}
                  isOpen={expandedId === c.id} onToggle={() => setExpandedId(expandedId === c.id ? null : c.id ?? null)}
                  onUpdate={(u) => {
                    setConsults(consults.map((x) => (x.id === u.id ? u : x)));
                    saveConsultMutation.mutate(u);
                  }}
                  onRemove={() => setConsults(consults.filter((x) => x.id !== c.id))} />
              ))}
              <button onClick={addConsult} style={S.addBtn}>+ Ajouter un type de consultation</button>
            </div>
          </div>
        )}

        {/* ── PREFERENCES ── */}
        {section === "preferences" && (
          <div>
            <SectionHeader icon="⚡" title="Agenda intelligent" sub="Compactage intelligent, buffer entre RDV, délai de préavis" />

            <div style={{ ...S.card, marginTop: 12 }}>
              <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 20 }}>

                <div>
                  <Toggle label="Compactage intelligent" sub="Propose en priorité les créneaux adjacents aux RDV existants" value={smartCompact} onChange={setSmartCompact} />
                  {smartCompact && (
                    <div style={{ background: NAMI.primaryLight, borderRadius: 10, padding: "10px 14px", marginTop: 10, fontSize: 12, color: NAMI.primary, lineHeight: 1.5 }}>
                      Les patients verront d&apos;abord les créneaux juste avant ou après vos consultations existantes, puis les créneaux libres restants. Plus de trous dans la journée.
                    </div>
                  )}
                </div>

                <div>
                  <label style={S.label}>Buffer entre les RDV (minutes)</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                    {[0, 5, 10, 15, 20].map((v) => (
                      <button key={v} onClick={() => setBuffer(v)}
                        style={{ ...S.chip, minWidth: 44, justifyContent: "center", background: buffer === v ? NAMI.primary : "#F3F2FA", color: buffer === v ? "#fff" : NAMI.text }}>
                        {v === 0 ? "0" : `${v}`}
                      </button>
                    ))}
                  </div>
                  <div style={{ fontSize: 12, color: NAMI.textSoft, marginTop: 6 }}>Temps entre deux consultations pour notes, déplacement…</div>
                </div>

                {/* Aperçu buffer */}
                {smartCompact && (
                  <div style={{ background: "#FAFAFD", borderRadius: 10, padding: "12px 14px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.05em", color: NAMI.textSoft, marginBottom: 10 }}>Aperçu</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <div style={{ padding: "7px 12px", borderRadius: 6, background: NAMI.primaryLight, border: `1px solid rgba(91,78,196,0.15)`, fontSize: 12, fontWeight: 600, color: NAMI.primary }}>10:00 — 10:30</div>
                      <div style={{ width: Math.max(4, buffer * 3), height: 2, background: NAMI.border, borderRadius: 1, position: "relative" as const }}>
                        {buffer > 0 && <span style={{ position: "absolute" as const, top: -14, left: "50%", transform: "translateX(-50%)", fontSize: 10, color: NAMI.textSoft, whiteSpace: "nowrap" as const }}>{buffer} min</span>}
                      </div>
                      <div style={{ padding: "7px 12px", borderRadius: 6, background: "rgba(43,168,156,0.08)", border: "1px solid rgba(43,168,156,0.15)", fontSize: 12, fontWeight: 600, color: "#2BA89C" }}>
                        {`10:${(30 + buffer).toString().padStart(2, "0")} — 11:${buffer.toString().padStart(2, "0")}`}
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: NAMI.textSoft, marginTop: 8, lineHeight: 1.5 }}>Le créneau adjacent est proposé en priorité aux patients car il optimise votre planning.</div>
                  </div>
                )}

                <button onClick={() => saveRulesMutation.mutate()}
                  style={{ ...S.chip, background: NAMI.primary, color: "#fff", alignSelf: "flex-start", padding: "10px 20px", fontSize: 14, fontWeight: 600 }}>
                  {saveRulesMutation.isPending ? "Enregistrement…" : "Enregistrer les préférences"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── STYLES ─── */

const S: Record<string, React.CSSProperties> = {
  page: { height: "100%", overflow: "auto", background: NAMI.bg, fontFamily: "'Plus Jakarta Sans', 'DM Sans', -apple-system, sans-serif", display: "flex", justifyContent: "center", padding: "28px 16px" },
  container: { width: "100%", maxWidth: 520, paddingBottom: 80 },
  tabs: { display: "flex", gap: 4, background: "#ECEAF5", borderRadius: 12, padding: 4, marginBottom: 20 },
  tab: { flex: 1, padding: "9px 0", border: "none", borderRadius: 10, fontSize: 13, cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 },
  card: { background: NAMI.card, borderRadius: 14, overflow: "hidden", border: `1px solid ${NAMI.border}` },
  cardHead: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", cursor: "pointer" },
  cardBody: { padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 16, borderTop: `1px solid ${NAMI.border}`, paddingTop: 16 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 11, fontWeight: 600, color: NAMI.textSoft, textTransform: "uppercase", letterSpacing: "0.6px" },
  input: { width: "100%", padding: "9px 12px", border: `1.5px solid ${NAMI.border}`, borderRadius: 10, fontSize: 14, fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif", color: NAMI.text, background: "#FAFAFD", transition: "border 0.15s, box-shadow 0.15s" },
  chip: { padding: "7px 14px", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 4 },
  timeInput: { padding: "6px 8px", border: `1.5px solid ${NAMI.border}`, borderRadius: 8, fontSize: 13, fontFamily: "inherit", background: "#FAFAFD", width: 110 },
  removeBtn: { width: 24, height: 24, border: "none", background: NAMI.dangerBg, color: NAMI.danger, borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 700 },
  toggleRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", gap: 12 },
  toggleLabel: { fontSize: 14, color: NAMI.text },
  toggleTrack: { width: 42, height: 24, borderRadius: 12, padding: 3, cursor: "pointer", transition: "background 0.2s", flexShrink: 0 },
  toggleThumb: { width: 18, height: 18, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.15)", transition: "transform 0.2s" },
  linkBtn: { background: "none", border: "none", color: NAMI.primary, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  addBtn: { width: "100%", padding: "13px", border: `2px dashed ${NAMI.border}`, borderRadius: 14, background: "transparent", color: NAMI.primary, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" },
  dangerBtn: { padding: "8px 16px", border: "none", background: NAMI.dangerBg, color: NAMI.danger, borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" },
};
