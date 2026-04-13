"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, type PatientMe } from "@/lib/api";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { User, Phone, Mail, Calendar, Shield, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

const C = {
  primary: "#0F766E", primaryLight: "#CCFBF1",
  text: "#1C2B2A", textSoft: "#6B7280", border: "#E5E7EB",
  card: "#FFFFFF", bg: "#F8FAFB", danger: "#DC2626", dangerBg: "#FEF2F2",
};

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 16 }}>
      <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 }}>
        <Icon size={16} strokeWidth={2} color={C.primary} />
        <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{title}</span>
      </div>
      <div style={{ padding: "16px 20px" }}>
        {children}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
      <span style={{ fontSize: 13, color: C.textSoft }}>{label}</span>
      <span style={{ fontSize: 14, color: C.text, fontWeight: 500 }}>{value || "—"}</span>
    </div>
  );
}

const inputSt: React.CSSProperties = {
  width: "100%", padding: "9px 12px", border: `1.5px solid ${C.border}`, borderRadius: 10,
  fontSize: 14, fontFamily: "inherit", color: C.text, background: C.bg, outline: "none",
};
const labelSt: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, color: C.textSoft, textTransform: "uppercase",
  letterSpacing: "0.6px", display: "block", marginBottom: 5,
};

const SEX_LABELS: Record<string, string> = { M: "Homme", F: "Femme", O: "Autre / Non précisé" };

export default function MonComptePage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const api = apiWithToken(accessToken!);
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);

  const { data: me, isLoading } = useQuery<PatientMe>({
    queryKey: ["patient-me"],
    queryFn: () => api.patient.me(),
    enabled: !!accessToken,
  });

  const person = me?.person;

  const [form, setForm] = useState({ phone: "", birthDate: "", sex: "" });

  function startEdit() {
    setForm({
      phone: person?.phone ?? "",
      birthDate: person?.birthDate ? format(parseISO(person.birthDate), "yyyy-MM-dd") : "",
      sex: person?.sex ?? "",
    });
    setEditing(true);
  }

  const patchMutation = useMutation({
    mutationFn: () => api.patient.patchMe({
      phone: form.phone || undefined,
      birthDate: form.birthDate || undefined,
      sex: form.sex || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["patient-me"] });
      setEditing(false);
      toast.success("Informations mises à jour");
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });

  if (isLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <Loader2 size={24} className="animate-spin" style={{ color: C.primary }} />
      </div>
    );
  }

  return (
    <div style={{ padding: "28px 24px 80px", maxWidth: 540, margin: "0 auto", background: C.bg, minHeight: "100vh" }}>
      {/* Avatar + nom */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
        <div style={{
          width: 60, height: 60, borderRadius: "50%", background: C.primaryLight,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: C.primary }}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </span>
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.text }}>{user?.firstName} {user?.lastName}</div>
          <div style={{ fontSize: 13, color: C.textSoft }}>{user?.email}</div>
        </div>
      </div>

      {/* Mes informations */}
      <Section title="Mes informations" icon={User}>
        {!editing ? (
          <>
            <Field label="Prénom" value={person?.firstName ?? ""} />
            <Field label="Nom" value={person?.lastName ?? ""} />
            <Field label="Email" value={person?.email ?? ""} />
            <Field label="Téléphone" value={person?.phone ?? ""} />
            <Field label="Date de naissance" value={person?.birthDate ? format(parseISO(person.birthDate), "d MMMM yyyy", { locale: fr }) : ""} />
            <Field label="Sexe" value={SEX_LABELS[person?.sex ?? ""] ?? ""} />
            <button onClick={startEdit} style={{
              marginTop: 14, padding: "9px 18px", borderRadius: 10, border: `1.5px solid ${C.primary}`,
              background: C.primaryLight, color: C.primary, fontSize: 13, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
            }}>
              Modifier mes informations
            </button>
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={labelSt}>Téléphone</label>
              <input style={inputSt} type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="06 12 34 56 78" />
            </div>
            <div>
              <label style={labelSt}>Date de naissance</label>
              <input style={inputSt} type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} />
            </div>
            <div>
              <label style={labelSt}>Sexe</label>
              <select style={inputSt} value={form.sex} onChange={(e) => setForm({ ...form, sex: e.target.value })}>
                <option value="">Non précisé</option>
                <option value="M">Homme</option>
                <option value="F">Femme</option>
                <option value="O">Autre</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button onClick={() => patchMutation.mutate()} disabled={patchMutation.isPending} style={{
                flex: 1, padding: "10px 0", borderRadius: 10, border: "none",
                background: C.primary, color: "#fff", fontSize: 14, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}>
                {patchMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                Enregistrer
              </button>
              <button onClick={() => setEditing(false)} style={{
                padding: "10px 18px", borderRadius: 10, border: `1.5px solid ${C.border}`,
                background: C.card, color: C.textSoft, fontSize: 14, fontWeight: 500,
                cursor: "pointer", fontFamily: "inherit",
              }}>
                Annuler
              </button>
            </div>
          </div>
        )}
      </Section>

      {/* Contact */}
      <Section title="Contact" icon={Phone}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {person?.phone && (
            <a href={`tel:${person.phone}`} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: C.primary, textDecoration: "none", fontWeight: 500 }}>
              <Phone size={15} strokeWidth={2} />
              {person.phone}
            </a>
          )}
          <a href={`mailto:${person?.email}`} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: C.primary, textDecoration: "none", fontWeight: 500 }}>
            <Mail size={15} strokeWidth={2} />
            {person?.email}
          </a>
        </div>
      </Section>

      {/* Suivi en cours */}
      {me?.careCases && me.careCases.length > 0 && (
        <Section title="Mon suivi" icon={Calendar}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {me.careCases.map((cc) => (
              <div key={cc.id} style={{ padding: "10px 14px", background: C.bg, borderRadius: 10, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{cc.caseTitle}</div>
                <div style={{ fontSize: 12, color: C.textSoft, marginTop: 3 }}>
                  Depuis le {format(parseISO(cc.startDate), "MMMM yyyy", { locale: fr })}
                  {" · "}{cc.members.length} soignant{cc.members.length > 1 ? "s" : ""}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Sécurité */}
      <Section title="Sécurité" icon={Shield}>
        <div style={{ fontSize: 14, color: C.textSoft, marginBottom: 12 }}>
          Pour changer votre mot de passe, contactez votre équipe soignante ou utilisez la page de connexion.
        </div>
      </Section>

      {/* Déconnexion */}
      <button onClick={() => { logout(); window.location.href = "/login"; }} style={{
        width: "100%", padding: "12px 0", borderRadius: 12, border: `1.5px solid ${C.border}`,
        background: C.card, color: C.textSoft, fontSize: 14, fontWeight: 500,
        cursor: "pointer", fontFamily: "inherit", marginBottom: 12,
      }}>
        Se déconnecter
      </button>
    </div>
  );
}
