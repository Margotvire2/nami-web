'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

type ImportMode = 'single' | 'batch';

interface PatientOption {
  id: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  careCaseId: string;
}

// ── Page principale ───────────────────────────────────────────────────────────

export default function ImportPage() {
  const { accessToken } = useAuthStore();
  const [mode, setMode] = useState<ImportMode>('single');
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    fetch(`${API_URL}/imports/patients`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((r) => r.json())
      .then((d) => setPatients(d.patients ?? []))
      .catch(() => {})
      .finally(() => setLoadingPatients(false));
  }, [accessToken]);

  return (
    <div className="min-h-screen bg-[#FAFAF8] px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <Link href="/patients" className="text-sm text-[#8A8A96] hover:text-[#4A4A5A]">
            ← Retour
          </Link>
          <h1 className="mt-3 text-[32px] font-semibold tracking-tight text-[#1A1A2E]">
            Ajouter l'historique d'un patient
          </h1>
          <p className="mt-2 text-[15px] text-[#4A4A5A]">
            Importez vos consultations passées. Une note structurée est générée automatiquement en brouillon IA.
          </p>
        </div>

        <div className="mb-6 inline-flex rounded-[10px] bg-[#F5F3EF] p-1">
          {(['single', 'batch'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-[8px] px-4 py-2 text-sm font-medium transition-colors ${
                mode === m ? 'bg-white text-[#1A1A2E] shadow-sm' : 'text-[#4A4A5A] hover:text-[#1A1A2E]'
              }`}
            >
              {m === 'single' ? 'Une consultation' : 'Plusieurs consultations'}
            </button>
          ))}
        </div>

        {loadingPatients ? (
          <div className="rounded-[12px] border border-[rgba(26,26,46,0.06)] bg-white p-12 text-center text-sm text-[#8A8A96]">
            Chargement des patients…
          </div>
        ) : mode === 'single' ? (
          <ImportSingleForm patients={patients} accessToken={accessToken ?? ''} />
        ) : (
          <ImportBatchForm patients={patients} accessToken={accessToken ?? ''} />
        )}

        <div className="mt-8 rounded-[12px] border border-[rgba(26,26,46,0.06)] bg-white p-5">
          <p className="text-[13px] leading-relaxed text-[#4A4A5A]">
            <span className="font-medium text-[#1A1A2E]">Important — </span>
            La transcription brute reste privée, visible uniquement par vous. La note structurée générée est un brouillon IA, à vérifier avant d'être partagée avec l'équipe.
            Conforme RGPD · Art. L.1110-4 CSP.
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link href="/import/history" className="text-sm text-[#5B4EC4] hover:underline">
            Voir mes imports précédents →
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Formulaire import individuel ──────────────────────────────────────────────

function ImportSingleForm({ patients, accessToken }: { patients: PatientOption[]; accessToken: string }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedPatient, setSelectedPatient] = useState<PatientOption | null>(null);
  const [consultationDate, setConsultationDate] = useState(new Date().toISOString().slice(0, 10));
  const [transcript, setTranscript] = useState('');
  const [originalFilename, setOriginalFilename] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    setOriginalFilename(file.name);
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'txt' || ext === 'md') {
      setTranscript(await file.text());
    } else if (ext === 'docx') {
      const mammoth = (await import('mammoth')).default;
      const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
      setTranscript(result.value);
    } else {
      setError('Format non supporté. Utilisez .txt, .md ou .docx.');
    }
  };

  const handleSubmit = async () => {
    setError(null);
    if (!selectedPatient) return setError('Sélectionnez un patient');
    if (!consultationDate) return setError('Renseignez la date');
    if (transcript.length < 50) return setError('Transcription trop courte (min 50 caractères)');

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/imports/consultations/single`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          patientPersonId: selectedPatient.id,
          careCaseId: selectedPatient.careCaseId,
          consultationDate: new Date(consultationDate).toISOString(),
          transcript,
          originalFilename,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message ?? 'Import échoué');
      }

      const data = await res.json();
      router.push(`/patients/${selectedPatient.id}?noteId=${data.item.clinicalNoteId}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? 'Erreur inconnue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-[12px] border border-[rgba(26,26,46,0.06)] bg-white p-8 shadow-sm">
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-[#1A1A2E]">Patient</label>
        <select
          value={selectedPatient?.id ?? ''}
          onChange={(e) => setSelectedPatient(patients.find((p) => p.id === e.target.value) ?? null)}
          className="w-full rounded-[10px] border border-[rgba(26,26,46,0.1)] bg-white px-4 py-2.5 text-[15px] text-[#1A1A2E] focus:border-[#5B4EC4] focus:outline-none focus:ring-2 focus:ring-[#5B4EC4]/20"
        >
          <option value="">Sélectionnez un patient…</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.lastName.toUpperCase()} {p.firstName}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-[#1A1A2E]">Date de la consultation</label>
        <input
          type="date"
          value={consultationDate}
          max={new Date().toISOString().slice(0, 10)}
          onChange={(e) => setConsultationDate(e.target.value)}
          className="w-full rounded-[10px] border border-[rgba(26,26,46,0.1)] px-4 py-2.5 text-[15px] focus:border-[#5B4EC4] focus:outline-none focus:ring-2 focus:ring-[#5B4EC4]/20"
        />
      </div>

      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <label className="block text-sm font-medium text-[#1A1A2E]">Transcription</label>
          <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs text-[#5B4EC4] hover:underline">
            Importer un fichier (.txt, .md, .docx)
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.docx"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }}
          />
        </div>
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Collez la transcription ici, ou importez un fichier…"
          rows={12}
          className="w-full rounded-[10px] border border-[rgba(26,26,46,0.1)] px-4 py-3 text-[15px] focus:border-[#5B4EC4] focus:outline-none focus:ring-2 focus:ring-[#5B4EC4]/20"
          style={{ fontFamily: 'Inter, sans-serif' }}
        />
        <div className="mt-1.5 flex justify-between text-xs text-[#8A8A96]">
          <span>{transcript.length.toLocaleString('fr-FR')} caractères</span>
          {originalFilename && <span>{originalFilename}</span>}
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-[#8A8A96]">Note structurée générée en brouillon IA.</p>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="rounded-[10px] bg-[#5B4EC4] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#4c44b0] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Import en cours…' : 'Importer'}
        </button>
      </div>
    </div>
  );
}

// ── Formulaire import par lot ─────────────────────────────────────────────────

interface BatchItem {
  id: string;
  filename: string;
  transcript: string;
  patientId: string;
  careCaseId: string;
  consultationDate: string;
}

function ImportBatchForm({ patients, accessToken }: { patients: PatientOption[]; accessToken: string }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesDrop = async (files: FileList) => {
    const newItems: BatchItem[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!['txt', 'md', 'docx'].includes(ext ?? '')) continue;
      let text = '';
      try {
        if (ext === 'docx') {
          const mammoth = (await import('mammoth')).default;
          text = (await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })).value;
        } else {
          text = await file.text();
        }
      } catch { continue; }
      newItems.push({
        id: crypto.randomUUID(),
        filename: file.name,
        transcript: text,
        patientId: '',
        careCaseId: '',
        consultationDate: new Date().toISOString().slice(0, 10),
      });
    }
    setItems((prev) => [...prev, ...newItems]);
  };

  const updateItem = (id: string, patch: Partial<BatchItem>) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));

  const handleSubmit = async () => {
    setError(null);
    const invalid = items.find((it) => !it.patientId || !it.consultationDate || it.transcript.length < 50);
    if (invalid) return setError(`"${invalid.filename}" : patient manquant ou transcription trop courte`);

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/imports/consultations/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          items: items.map((it) => ({
            patientPersonId: it.patientId,
            careCaseId: it.careCaseId,
            consultationDate: new Date(it.consultationDate).toISOString(),
            transcript: it.transcript,
            originalFilename: it.filename,
          })),
          notes: `Import par lot — ${items.length} consultations`,
        }),
      });

      if (!res.ok) throw new Error((await res.json()).message ?? 'Import échoué');
      const data = await res.json();
      router.push(`/import/history?batch=${data.batchId}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? 'Erreur inconnue');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-[12px] border border-[rgba(26,26,46,0.06)] bg-white p-8 shadow-sm">
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files) handleFilesDrop(e.dataTransfer.files); }}
        className="mb-6 cursor-pointer rounded-[10px] border-2 border-dashed border-[rgba(26,26,46,0.15)] bg-[#FAFAF8] py-10 text-center transition-colors hover:border-[#5B4EC4] hover:bg-[#F5F3EF]"
      >
        <input ref={fileInputRef} type="file" accept=".txt,.md,.docx" multiple className="hidden"
          onChange={(e) => { if (e.target.files) handleFilesDrop(e.target.files); }} />
        <p className="text-[15px] font-medium text-[#1A1A2E]">Glissez vos fichiers ici</p>
        <p className="mt-1 text-sm text-[#8A8A96]">ou cliquez · .txt, .md, .docx</p>
      </div>

      {items.length > 0 && (
        <div className="mb-6 space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-[#8A8A96]">
            {items.length} fichier{items.length > 1 ? 's' : ''} à importer
          </p>
          {items.map((item) => (
            <div key={item.id} className="rounded-[10px] border border-[rgba(26,26,46,0.06)] bg-[#FAFAF8] p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#1A1A2E]">{item.filename}</p>
                  <p className="text-xs text-[#8A8A96]">{item.transcript.length.toLocaleString('fr-FR')} caractères</p>
                </div>
                <button onClick={() => setItems((prev) => prev.filter((it) => it.id !== item.id))}
                  className="text-xs text-[#8A8A96] hover:text-red-600">Retirer</button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={item.patientId}
                  onChange={(e) => {
                    const p = patients.find((p) => p.id === e.target.value);
                    updateItem(item.id, { patientId: e.target.value, careCaseId: p?.careCaseId ?? '' });
                  }}
                  className="rounded-[8px] border border-[rgba(26,26,46,0.1)] bg-white px-3 py-2 text-sm"
                >
                  <option value="">Patient…</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.lastName.toUpperCase()} {p.firstName}</option>
                  ))}
                </select>
                <input type="date" value={item.consultationDate}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => updateItem(item.id, { consultationDate: e.target.value })}
                  className="rounded-[8px] border border-[rgba(26,26,46,0.1)] px-3 py-2 text-sm" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-[#8A8A96]">Chaque fichier génère une note structurée en brouillon IA.</p>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || items.length === 0}
          className="rounded-[10px] bg-[#5B4EC4] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#4c44b0] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Envoi…' : `Importer ${items.length || ''} consultation${items.length > 1 ? 's' : ''}`}
        </button>
      </div>
    </div>
  );
}
