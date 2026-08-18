import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ExtractedLearningItem } from '../../../../../../shared/schemas';

/**
 * POST /api/documents/save
 *
 * Persist selected items from a completed extraction job into the `words` table.
 * Called by the UI when the user clicks "Save selected to Study Hub".
 *
 * Flow:
 *   1. Authenticate user.
 *   2. Verify job ownership (RLS check).
 *   3. Persist selected items via UPSERT (dedup by user_id + normalized_text).
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { jobId, selectedItems, sourceTitle } = body as {
      jobId?: string;
      selectedItems: ExtractedLearningItem[];
      sourceTitle?: string;
    };

    if (!Array.isArray(selectedItems)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    let fileName = sourceTitle ?? 'Scanned Document';

    // Verify job ownership if a persistent UUID jobId is supplied
    if (jobId && !jobId.startsWith('in_memory_') && !jobId.startsWith('direct_') && jobId !== 'null') {
      const { data: job } = await supabase
        .from('document_jobs')
        .select('id, user_id, file_name')
        .eq('id', jobId)
        .single();

      if (job) {
        if (job.user_id !== user.id) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        if (job.file_name) fileName = job.file_name;
      }
    }

    // Ensure Scan AI deck exists (creates if absent).
    const deckId = await ensureScanAIDeck(supabase, user.id);

    // Lazy-import to avoid circular deps.
    // Pass the AUTHENTICATED supabase client (from cookie/session) so that
    // the upsert respects RLS policies (user_id must match auth.uid()).
    const { persistScanExtraction } = await import('@/lib/services/supabaseService');
    const result = await persistScanExtraction(
      user.id,
      selectedItems,
      fileName,
      deckId,
      supabase, // <-- authenticated client for RLS
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error: any) {
    console.error('[API /api/documents/save] Unhandled error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function ensureScanAIDeck(supabase: any, userId: string): Promise<string | null> {
  try {
    const { data: existing } = await supabase
      .from('decks')
      .select('id')
      .eq('user_id', userId)
      .eq('title', 'Tài Liệu Scan AI')
      .limit(1);
    if (existing && existing.length > 0) return existing[0].id;

    const { data: created, error } = await supabase
      .from('decks')
      .insert({
        user_id: userId,
        title: 'Tài Liệu Scan AI',
        description: 'Từ vựng trích xuất từ tài liệu PDF/Docx/Image',
        category: 'Scan AI',
        color: 'indigo',
        icon_name: 'file-search',
      })
      .select('id')
      .single();
    if (error) {
      console.warn('ensureScanAIDeck insert failed:', error);
      return null;
    }
    return created?.id ?? null;
  } catch {
    return null;
  }
}
