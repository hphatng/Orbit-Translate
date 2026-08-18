'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ScanDocumentSection from '@/app/components/dashboard/ScanDocumentSection';

/**
 * Scan & Extract page.
 *
 * Extraction result is stored temporarily in document_jobs.result_summary
 * after the background job completes. The user reviews and selects items,
 * then confirms by clicking "Save selected to Study Hub" which calls
 * /api/documents/save with the selected items only.
 */
export default function ScanExtractView() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleAddExtractedToDeck = async (selectedItems: any[], jobId: string | null) => {
    if (!jobId) {
      setSaveError('Không tìm thấy job. Vui lòng scan lại.');
      return;
    }

    if (selectedItems.length === 0) {
      router.push('/study-hub');
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      const res = await fetch('/api/documents/save', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, selectedItems }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }

      router.push('/study-hub');
    } catch (e: any) {
      console.error('[ScanExtract] save failed:', e);
      setSaveError(e?.message ?? 'Lưu thất bại');
      setSaving(false);
    }
  };

  return (
    <div className="pb-24">
      {saveError && (
        <div className="mx-6 mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          Lỗi lưu: {saveError}
        </div>
      )}
      <ScanDocumentSection onAddExtractedToDeck={handleAddExtractedToDeck} />
    </div>
  );
}
