'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

type BatchStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'ROLLED_BACK';

interface BatchSummary {
  id: string;
  status: BatchStatus;
  kind: string;
  itemCount: number;
  successCount: number;
  failureCount: number;
  createdAt: string;
  completedAt: string | null;
  notes: string | null;
}

interface BatchDetail extends BatchSummary {
  importedItems: Array<{
    id: string;
    status: string;
    inputPatientName: string;
    inputConsultationDate: string;
    appointmentId: string | null;
    clinicalNoteId: string | null;
    documentId: string | null;
    errorCode: string | null;
    errorMessage: string | null;
  }>;
}

export default function ImportHistoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const focusedBatchId = searchParams.get('batch');
  const { accessToken } = useAuthStore();

  const [batches, setBatches] = useState<BatchSummary[]>([]);
  const [focusedBatch, setFocusedBatch] = useState<BatchDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const headers: Record<string, string> = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};

  const loadBatches = async () => {
    const res = await fetch(`${API_URL}/imports/batches`, { headers });
    if (res.ok) setBatches((await res.json()).batches ?? []);
    setIsLoading(false);
  };

  const loadBatchDetail = async (batchId: string) => {
    const res = await fetch(`${API_URL}/imports/batches/${batchId}`, { headers });
    if (res.ok) setFocusedBatch((await res.json()).batch);
  };

  useEffect(() => { if (accessToken) loadBatches(); }, [accessToken]);

  useEffect(() => {
    if (focusedBatchId && accessToken) loadBatchDetail(focusedBatchId);
  }, [focusedBatchId, accessToken]);

  useEffect(() => {
    if (!focusedBatch) return;
    if (focusedBatch.status !== 'PROCESSING' && focusedBatch.status !== 'PENDING') return;
    const interval = setInterval(() => {
      loadBatchDetail(focusedBatch.id);
      loadBatches();
    }, 3000);
    return () => clearInterval(interval);
  }, [focusedBatch?.status, focusedBatch?.id]);

  const handleRollback = async (batchId: string) => {
    if (!confirm('Annuler cet import ? Les consultations créées seront supprimées.')) return;
    const res = await fetch(`${API_URL}/imports/batches/${batchId}/rollback`, { method: 'POST', headers });
    if (res.ok) {
      await loadBatches();
      if (focusedBatch?.id === batchId) await loadBatchDetail(batchId);
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <Link href="/import" className="text-sm text-[#8A8A96] hover:text-[#4A4A5A]">
              ← Retour à l'import
            </Link>
            <h1 className="mt-3 text-[32px] font-semibold tracking-tight text-[#1A1A2E]">Mes imports</h1>
          </div>
          <Link
            href="/import"
            className="rounded-[10px] bg-[#5B4EC4] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#4c44b0]"
          >
            Nouvel import
          </Link>
        </div>

        {focusedBatch && (
          <div className="mb-8">
            <FocusedBatchCard batch={focusedBatch} onRollback={() => handleRollback(focusedBatch.id)} />
          </div>
        )}

        {isLoading ? (
          <p className="text-sm text-[#8A8A96]">Chargement…</p>
        ) : batches.length === 0 ? (
          <div className="rounded-[12px] border border-[rgba(26,26,46,0.06)] bg-white p-12 text-center">
            <p className="text-[15px] text-[#4A4A5A]">Aucun import pour l'instant.</p>
            <Link href="/import" className="mt-4 inline-block text-sm text-[#5B4EC4] hover:underline">
              Importer votre première consultation →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {batches.map((batch) => (
              <BatchRow
                key={batch.id}
                batch={batch}
                isFocused={focusedBatch?.id === batch.id}
                onClick={() => router.push(`/import/history?batch=${batch.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FocusedBatchCard({ batch, onRollback }: { batch: BatchDetail; onRollback: () => void }) {
  const progress = batch.itemCount > 0
    ? Math.round(((batch.successCount + batch.failureCount) / batch.itemCount) * 100)
    : 0;
  const isActive = batch.status === 'PROCESSING' || batch.status === 'PENDING';
  const isDone = batch.status === 'COMPLETED';

  return (
    <div className="rounded-[12px] border border-[rgba(26,26,46,0.06)] bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <StatusBadge status={batch.status} />
          <p className="mt-2 text-xs text-[#8A8A96]">
            Lancé le {new Date(batch.createdAt).toLocaleString('fr-FR')}
          </p>
        </div>
        {isDone && (
          <button onClick={onRollback} className="text-xs text-[#8A8A96] hover:text-red-600">
            Annuler cet import
          </button>
        )}
      </div>

      {isActive && (
        <div className="mb-4">
          <div className="mb-1.5 flex justify-between text-xs text-[#4A4A5A]">
            <span>{batch.successCount + batch.failureCount} / {batch.itemCount}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[#F5F3EF]">
            <div className="h-full rounded-full bg-[#5B4EC4] transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: batch.itemCount, color: 'text-[#1A1A2E]' },
          { label: 'Importées', value: batch.successCount, color: 'text-[#2BA89C]' },
          { label: 'Erreurs', value: batch.failureCount, color: batch.failureCount > 0 ? 'text-red-600' : 'text-[#8A8A96]' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-[10px] bg-[#FAFAF8] p-4">
            <p className="text-xs text-[#8A8A96]">{label}</p>
            <p className={`mt-1 text-2xl font-semibold ${color}`} style={{ fontFamily: 'Inter, sans-serif' }}>{value}</p>
          </div>
        ))}
      </div>

      {batch.importedItems?.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[#8A8A96]">Consultations</p>
          <div className="space-y-2">
            {batch.importedItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-[8px] border border-[rgba(26,26,46,0.06)] bg-white px-4 py-3 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-[#1A1A2E]">{item.inputPatientName}</p>
                  <p className="text-xs text-[#8A8A96]">
                    {new Date(item.inputConsultationDate).toLocaleDateString('fr-FR')}
                    {item.errorMessage && ` · ${item.errorMessage}`}
                  </p>
                </div>
                <ItemStatusBadge status={item.status} />
                {item.clinicalNoteId && item.status === 'SUCCEEDED' && (
                  <Link
                    href={`/patients/${item.appointmentId}?noteId=${item.clinicalNoteId}`}
                    className="ml-3 text-xs text-[#5B4EC4] hover:underline"
                  >
                    Voir →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BatchRow({ batch, isFocused, onClick }: { batch: BatchSummary; isFocused: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-[12px] border bg-white px-5 py-4 text-left transition-all hover:shadow-sm ${
        isFocused ? 'border-[#5B4EC4]/30 shadow-sm' : 'border-[rgba(26,26,46,0.06)]'
      }`}
    >
      <div className="flex items-center gap-4">
        <StatusBadge status={batch.status} compact />
        <div>
          <p className="text-sm font-medium text-[#1A1A2E]">
            {batch.itemCount} consultation{batch.itemCount > 1 ? 's' : ''}
            {batch.successCount > 0 && batch.successCount < batch.itemCount && (
              <span className="text-[#8A8A96]"> · {batch.successCount} importée{batch.successCount > 1 ? 's' : ''}</span>
            )}
          </p>
          <p className="text-xs text-[#8A8A96]">{new Date(batch.createdAt).toLocaleString('fr-FR')}</p>
        </div>
      </div>
      <span className="text-xs text-[#8A8A96]">Détails →</span>
    </button>
  );
}

function StatusBadge({ status, compact = false }: { status: BatchStatus; compact?: boolean }) {
  const config: Record<BatchStatus, { label: string; bg: string; text: string }> = {
    PENDING:     { label: 'En attente', bg: 'bg-[#F5F3EF]',        text: 'text-[#4A4A5A]' },
    PROCESSING:  { label: 'En cours',   bg: 'bg-[#5B4EC4]/10',     text: 'text-[#5B4EC4]' },
    COMPLETED:   { label: 'Terminé',    bg: 'bg-[#2BA89C]/10',     text: 'text-[#2BA89C]' },
    FAILED:      { label: 'Échec',      bg: 'bg-red-50',           text: 'text-red-700'   },
    ROLLED_BACK: { label: 'Annulé',     bg: 'bg-[#F5F3EF]',        text: 'text-[#8A8A96]' },
  };
  const c = config[status];
  return (
    <span className={`inline-flex items-center rounded-full ${c.bg} ${c.text} ${compact ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'} font-medium`}>
      {c.label}
    </span>
  );
}

function ItemStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; color: string }> = {
    PENDING:           { label: '…', color: 'text-[#8A8A96]' },
    PROCESSING:        { label: '…', color: 'text-[#5B4EC4]' },
    SUCCEEDED:         { label: '✓', color: 'text-[#2BA89C]' },
    FAILED:            { label: '✗', color: 'text-red-600'   },
    SKIPPED_DUPLICATE: { label: '=', color: 'text-[#8A8A96]' },
  };
  const c = config[status] ?? config.PENDING;
  return <span className={`font-mono text-sm ${c.color}`}>{c.label}</span>;
}
