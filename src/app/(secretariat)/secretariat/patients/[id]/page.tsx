"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO, isFuture, isPast } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ArrowLeft,
  Mail,
  Phone,
  Cake,
  User,
  Calendar,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { secretaryApi, type SecretaryAppointment } from "@/lib/api";

// INIT-626 — Détail patient secrétariat (lecture seule).
// Scope RGPD : coordonnées + RDV (providers managés par la secrétaire).
// Volontairement masqué : appointment.notes (peut contenir contenu clinique),
// care team, ClinicalNote, observations, parcours.

// La réponse réelle de GET /secretary/patients/:id sérialise consultationType
// en string|null (cf. nami/src/routes/secretary.ts:516), pas en objet. Le type
// SecretaryAppointment d'api.ts est mutualisé avec l'agenda et a la forme
// objet — on narrow ici sans toucher au type partagé.
type PatientDetailAppointment = Omit<
  SecretaryAppointment,
  "consultationType" | "patient"
> & { consultationType: string | null; providerName?: string };

const STATUS_CONFIG: Record<
  SecretaryAppointment["status"],
  { label: string; pill: string }
> = {
  PENDING: { label: "En attente", pill: "bg-amber-50 text-amber-700 border-amber-200" },
  CONFIRMED: { label: "Confirmé", pill: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  RESCHEDULED: { label: "Reporté", pill: "bg-gray-50 text-gray-600 border-gray-200" },
  IN_PROGRESS: { label: "En cours", pill: "bg-blue-50 text-blue-700 border-blue-200" },
  PATIENT_ARRIVED: { label: "Arrivé", pill: "bg-blue-50 text-blue-700 border-blue-200" },
  COMPLETED: { label: "Terminé", pill: "bg-gray-50 text-gray-600 border-gray-200" },
  CANCELLED: { label: "Annulé", pill: "bg-red-50 text-red-600 border-red-200" },
  CANCELLED_BY_PATIENT: { label: "Annulé (patient)", pill: "bg-red-50 text-red-600 border-red-200" },
  CANCELLED_BY_PROVIDER: { label: "Annulé (soignant)", pill: "bg-red-50 text-red-600 border-red-200" },
  CANCELLED_BY_SECRETARY: { label: "Annulé (secrét.)", pill: "bg-red-50 text-red-600 border-red-200" },
  CANCELLED_BY_SYSTEM: { label: "Annulé (système)", pill: "bg-red-50 text-red-600 border-red-200" },
  NO_SHOW: { label: "Non présenté", pill: "bg-red-50 text-red-600 border-red-200" },
};

function ageFromBirth(date: string | null): number | null {
  if (!date) return null;
  try {
    const d = parseISO(date);
    const diff = Date.now() - d.getTime();
    const age = new Date(diff).getUTCFullYear() - 1970;
    return Number.isFinite(age) && age >= 0 && age < 130 ? age : null;
  } catch {
    return null;
  }
}

function safeFormat(date: string | null | undefined, fmt: string): string | null {
  if (!date) return null;
  try {
    return format(parseISO(date), fmt, { locale: fr });
  } catch {
    return null;
  }
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function SecretariatPatientDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { accessToken } = useAuthStore();
  const api = useMemo(() => secretaryApi(accessToken ?? ""), [accessToken]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["secretary-patient", id],
    queryFn: () => api.getPatient(id),
    enabled: !!accessToken && !!id,
  });

  const patient = data?.patient;
  const appointments = (data?.appointments ?? []) as unknown as PatientDetailAppointment[];

  const { upcoming, past } = useMemo(() => {
    const sorted = [...appointments].sort(
      (a, b) => +new Date(a.startAt) - +new Date(b.startAt),
    );
    return {
      upcoming: sorted.filter((a) => {
        try {
          return isFuture(parseISO(a.startAt));
        } catch {
          return false;
        }
      }),
      past: sorted
        .filter((a) => {
          try {
            return isPast(parseISO(a.startAt));
          } catch {
            return false;
          }
        })
        .reverse(),
    };
  }, [appointments]);

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <header className="flex items-center gap-3 px-6 py-4 bg-white border-b border-[#E8ECF4]">
        <Link
          href="/secretariat/patients"
          className="p-2 -ml-2 rounded-lg hover:bg-[#F5F3EF] text-[#6B7280]"
          aria-label="Retour à la liste"
        >
          <ArrowLeft size={16} />
        </Link>
        <div className="w-9 h-9 rounded-lg bg-[#EEEDFB] flex items-center justify-center">
          <User size={18} className="text-[#5B4EC4]" />
        </div>
        <div className="flex-1 min-w-0">
          {patient ? (
            <>
              <h1 className="text-[15px] font-bold text-[#1A1A2E] leading-tight truncate">
                {patient.firstName} {patient.lastName}
              </h1>
              <p className="text-[11px] text-[#6B7280]">Fiche patient — vue secrétariat</p>
            </>
          ) : (
            <>
              <h1 className="text-[15px] font-bold text-[#1A1A2E] leading-tight">
                Patient
              </h1>
              <p className="text-[11px] text-[#6B7280]">Vue secrétariat</p>
            </>
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {isLoading && (
          <div className="rounded-2xl bg-white border border-[#E8ECF4] px-6 py-10 text-center">
            <Loader2 size={20} className="text-[#5B4EC4] animate-spin mx-auto mb-2" />
            <p className="text-[12px] text-[#6B7280]">Chargement du dossier…</p>
          </div>
        )}

        {isError && (
          <div className="rounded-2xl bg-white border border-red-200 px-6 py-10 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mx-auto">
              <AlertCircle size={18} className="text-red-600" />
            </div>
            <p className="text-[13px] font-semibold text-[#1A1A2E]">
              Patient introuvable
            </p>
            <p className="text-[12px] text-[#6B7280]">
              {(error as Error)?.message ??
                "Ce patient n'existe pas ou n'est rattaché à aucun soignant que vous gérez."}
            </p>
            <Link
              href="/secretariat/patients"
              className="inline-block mt-2 text-[12px] font-medium text-[#5B4EC4] hover:underline"
            >
              ← Retour à la liste
            </Link>
          </div>
        )}

        {patient && (
          <>
            {/* Bloc coordonnées */}
            <section className="rounded-2xl bg-white border border-[#E8ECF4] p-5">
              <h2 className="text-[12px] font-semibold text-[#1A1A2E] mb-3 uppercase tracking-wide">
                Coordonnées
              </h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                <CoordItem
                  icon={<User size={13} />}
                  label="Sexe"
                  value={
                    patient.sex === "M"
                      ? "Homme"
                      : patient.sex === "F"
                        ? "Femme"
                        : null
                  }
                />
                <CoordItem
                  icon={<Cake size={13} />}
                  label="Date de naissance"
                  value={
                    safeFormat(patient.birthDate, "dd MMMM yyyy")
                      ? `${safeFormat(patient.birthDate, "dd MMMM yyyy")}${
                          ageFromBirth(patient.birthDate) !== null
                            ? ` (${ageFromBirth(patient.birthDate)} ans)`
                            : ""
                        }`
                      : null
                  }
                />
                <CoordItem
                  icon={<Mail size={13} />}
                  label="Email"
                  value={patient.email}
                  href={patient.email ? `mailto:${patient.email}` : undefined}
                />
                <CoordItem
                  icon={<Phone size={13} />}
                  label="Téléphone"
                  value={patient.phone}
                  href={patient.phone ? `tel:${patient.phone.replace(/\s/g, "")}` : undefined}
                />
              </dl>
            </section>

            {/* RDV à venir */}
            <AppointmentsSection
              title="Rendez-vous à venir"
              icon={<Calendar size={13} />}
              items={upcoming}
              emptyLabel="Aucun rendez-vous prévu."
            />

            {/* RDV passés */}
            <AppointmentsSection
              title="Rendez-vous passés"
              icon={<Clock size={13} />}
              items={past}
              emptyLabel="Aucun rendez-vous passé enregistré."
              collapsed
            />

            <p className="text-[10px] text-[#9CA3AF] text-center pt-2">
              Vue secrétariat — coordonnées et rendez-vous uniquement. Les notes
              cliniques et le dossier médical ne sont pas accessibles depuis cet
              espace.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function CoordItem({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
  href?: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-7 h-7 rounded-md bg-[#F5F3EF] flex items-center justify-center text-[#6B7280] shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="min-w-0">
        <dt className="text-[10px] font-medium text-[#9CA3AF] uppercase tracking-wide">
          {label}
        </dt>
        <dd className="text-[13px] text-[#1A1A2E] truncate">
          {value ? (
            href ? (
              <a
                href={href}
                className="hover:text-[#5B4EC4] hover:underline"
              >
                {value}
              </a>
            ) : (
              value
            )
          ) : (
            <span className="text-[#9CA3AF] italic">Non renseigné</span>
          )}
        </dd>
      </div>
    </div>
  );
}

function AppointmentsSection({
  title,
  icon,
  items,
  emptyLabel,
  collapsed = false,
}: {
  title: string;
  icon: React.ReactNode;
  items: PatientDetailAppointment[];
  emptyLabel: string;
  collapsed?: boolean;
}) {
  return (
    <section className="rounded-2xl bg-white border border-[#E8ECF4] p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[12px] font-semibold text-[#1A1A2E] uppercase tracking-wide flex items-center gap-1.5">
          <span className="text-[#5B4EC4]">{icon}</span>
          {title}
        </h2>
        <span className="text-[11px] text-[#9CA3AF]">{items.length}</span>
      </div>

      {items.length === 0 ? (
        <p className="text-[12px] text-[#9CA3AF] italic py-2">{emptyLabel}</p>
      ) : (
        <ul className={`space-y-2 ${collapsed ? "max-h-96 overflow-y-auto pr-1" : ""}`}>
          {items.map((appt) => (
            <AppointmentRow key={appt.id} appt={appt} />
          ))}
        </ul>
      )}
    </section>
  );
}

function AppointmentRow({ appt }: { appt: PatientDetailAppointment }) {
  const cfg = STATUS_CONFIG[appt.status];
  const dateLabel = safeFormat(appt.startAt, "EEE d MMM yyyy");
  const timeLabel = safeFormat(appt.startAt, "HH:mm");
  const endLabel = appt.endAt ? safeFormat(appt.endAt, "HH:mm") : null;

  return (
    <li
      className="flex items-center gap-3 p-3 rounded-xl border transition hover:shadow-sm"
      style={{
        background: "linear-gradient(135deg, #EEEDFB 0%, #FFFFFF 50%, #E6F4F2 100%)",
        borderColor: "rgba(26,26,46,0.06)",
      }}
    >
      <div className="w-12 text-center shrink-0">
        <p className="text-[10px] font-medium text-[#9CA3AF] uppercase">
          {safeFormat(appt.startAt, "MMM") ?? "—"}
        </p>
        <p className="text-[18px] font-bold text-[#1A1A2E] leading-none">
          {safeFormat(appt.startAt, "dd") ?? "—"}
        </p>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold text-[#1A1A2E] capitalize">
          {dateLabel ?? "Date inconnue"}
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5 text-[11px] text-[#6B7280]">
          {timeLabel && (
            <span className="flex items-center gap-1">
              <Clock size={10} />
              {timeLabel}
              {endLabel && ` – ${endLabel}`}
            </span>
          )}
          {appt.consultationType && <span>{appt.consultationType}</span>}
          {appt.providerName && (
            <span className="text-[#9CA3AF]">avec {appt.providerName}</span>
          )}
        </div>
      </div>
      <span
        className={`text-[10px] font-medium px-2 py-1 rounded-full border whitespace-nowrap ${cfg.pill}`}
      >
        {cfg.label}
      </span>
    </li>
  );
}
