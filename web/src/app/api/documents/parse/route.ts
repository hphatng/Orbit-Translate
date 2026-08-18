import { NextRequest, NextResponse, after } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TextParser, PdfParser, DocxParser, DocumentParser } from '@/lib/parsers';
import { extractFromTextAI } from '@/lib/ai/extractFromTextAI';
import type { ApiKeyItem } from '@/lib/ai/AIClient';
import type { ExtractedLearningItem } from 'shared/schemas';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * POST /api/documents/parse
 *
 * Phase-1 redesign (canonical extraction):
 *   document upload (file or pasted text)
 *     → parser (PDF / DOCX / TXT)
 *     → extractFromTextAI (Gemini, document-level, full schema)
 *     → persistScanExtraction (UPSERT into public.words)
 *     → document_jobs.status = COMPLETED with result_summary.items
 *
 * Legacy deterministic+enrichment chain (extractFromTextCore + enrichWithAI)
 * is preserved under the LEGACY_EXTRACTION env flag for rollback.
 *
 * NOTE: The Extension has its own runtime. This route is web-only.
 */

interface RequestBody {
  file?: File;
  text?: string;
  apiKeys?: ApiKeyItem[];
  targetCEFR?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
}

async function readFormData(req: NextRequest): Promise<RequestBody> {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const textContent = (formData.get('text') as string | null) ?? undefined;
  const apiKeysStr = formData.get('apiKeys') as string | null;
  const targetCefrStr = (formData.get('targetCEFR') as string | null) ?? undefined;

  let apiKeys: ApiKeyItem[] | undefined;
  if (apiKeysStr) {
    try {
      const parsed = JSON.parse(apiKeysStr);
      if (Array.isArray(parsed)) apiKeys = parsed as ApiKeyItem[];
    } catch {
      /* ignore */
    }
  }

  const targetCEFR = isValidCEFR(targetCefrStr) ? targetCefrStr : undefined;

  return { file: file ?? undefined, text: textContent, apiKeys, targetCEFR };
}

function isValidCEFR(value: string | undefined): value is 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' {
  return value === 'A1' || value === 'A2' || value === 'B1' || value === 'B2' || value === 'C1' || value === 'C2';
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await readFormData(req);
    const file = body.file;
    const textContent = body.text;
    // targetCEFR is resolved from user profile below; the request body value
    // serves as an optional override.

    if (!file && !textContent) {
      return NextResponse.json({ error: 'No file or text provided' }, { status: 400 });
    }

    const sourceName = file?.name ?? 'Pasted Text';
    const sourceSize = file?.size ?? new Blob([textContent ?? '']).size;
    const sourceMime = file?.type ?? 'text/plain';

    // Enforce file size limit server-side (25 MB).
    const MAX_SIZE_BYTES = 25 * 1024 * 1024;
    if (sourceSize > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File exceeds maximum size of 25MB (received ${Math.round(sourceSize / 1024 / 1024)}MB)` },
        { status: 413 },
      );
    }

    const { data: job, error: jobError } = await supabase
      .from('document_jobs')
      .insert({
        user_id: user.id,
        file_name: sourceName,
        file_size_bytes: sourceSize,
        mime_type: sourceMime,
        status: 'PENDING',
        progress_percent: 0,
      })
      .select()
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Failed to create job', details: jobError },
        { status: 500 },
      );
    }

    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;
    const legacyEnabled = process.env.LEGACY_EXTRACTION === 'true';

    // Read file buffer BEFORE responding, since the request body stream
    // will be consumed once the response is sent.
    let fileBuffer: ArrayBuffer | undefined;
    if (file) {
      fileBuffer = await file.arrayBuffer();
    }

    // Use after() to run processing AFTER the response is sent.
    // IMPORTANT: after() MUST be called in the direct synchronous scope
    // of the route handler — NOT inside a detached async IIFE.
    after(async () => {
      const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
      const options: any = {};
      if (accessToken) {
        options.global = { headers: { Authorization: `Bearer ${accessToken}` } };
      }
      const bgSupabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        options,
      );

      try {
        await bgSupabase
          .from('document_jobs')
          .update({ status: 'PARSING', progress_percent: 20 })
          .eq('id', job.id);

        // ----- Parse file -----
        let parsedData;
        if (file && fileBuffer) {
          const detachedFile = new File([fileBuffer], file.name, { type: file.type });
          const parsers: DocumentParser[] = [new PdfParser(), new DocxParser(), new TextParser()];
          const parser = parsers.find((p) => p.canHandle(detachedFile));
          if (!parser) throw new Error('Unsupported file format');
          parsedData = await parser.parse(detachedFile);
        } else {
          const textFile = new File([textContent ?? ''], 'pasted.txt', { type: 'text/plain' });
          const parser = new TextParser();
          parsedData = await parser.parse(textFile);
        }

        const normalizedText = parsedData?.text ?? '';

        await bgSupabase
          .from('document_jobs')
          .update({
            status: 'EXTRACTING',
            progress_percent: 50,
            result_summary: {
              warnings: parsedData?.warnings,
              pageCount: parsedData?.pageCount,
              textLength: normalizedText.length,
              sourceTitle: sourceName,
            },
          })
          .eq('id', job.id);

        // Resolve API keys and user CEFR target from profile.
        const profileInfo = await readProfileInfo(bgSupabase, user.id);
        const suppliedKeys = Array.isArray(body.apiKeys) ? body.apiKeys : [];
        const mergedKeys = mergeKeys(suppliedKeys, profileInfo.apiKeys);
        // Use user profile's target CEFR unless explicitly overridden in request.
        const effectiveCEFR = body.targetCEFR ?? profileInfo.targetCEFR;

        if (legacyEnabled) {
          // ---- LEGACY CHAIN (kept for rollback) ----
          const { extractFromTextCore } = await import('@/lib/nlp/pipeline');
          const { enrichWithAI } = await import('@/lib/nlp/enrichment');

          let extractedItems: any[] = [];
          const extractionErrors: string[] = [];
          if (normalizedText.trim().length > 0) {
            try {
              extractedItems = await extractFromTextCore(normalizedText, bgSupabase);
            } catch (nlpErr: any) {
              extractionErrors.push(`NLP Pipeline Error: ${nlpErr?.message ?? String(nlpErr)}`);
            }
          }
          await bgSupabase
            .from('document_jobs')
            .update({
              status: 'COMPLETED',
              progress_percent: 100,
              result_summary: {
                warnings: parsedData?.warnings,
                pageCount: parsedData?.pageCount,
                textLength: normalizedText.length,
                extracted_items: extractedItems,
                debug_errors: extractionErrors,
                legacy: true,
              },
              completed_at: new Date().toISOString(),
            })
            .eq('id', job.id);

          // Enrich inline (already running inside after(), no need to nest)
          await enrichWithAI(job.id, bgSupabase, mergedKeys);
          return;
        }

        // ---- NEW CANONICAL PIPELINE ----
        if (!normalizedText.trim()) {
          await bgSupabase
            .from('document_jobs')
            .update({
              status: 'FAILED',
              progress_percent: 100,
              error_message: 'Document parsing produced empty text',
              completed_at: new Date().toISOString(),
            })
            .eq('id', job.id);
          return;
        }

        if (mergedKeys.length === 0) {
          await bgSupabase
            .from('document_jobs')
            .update({
              status: 'FAILED',
              progress_percent: 100,
              error_message:
                'No Gemini API keys configured. Add keys in Settings, or set NEXT_PUBLIC_SUPABASE_URL so the profile lookup can succeed.',
              completed_at: new Date().toISOString(),
            })
            .eq('id', job.id);
          return;
        }

        const outcome = await extractFromTextAI(
          {
            text: normalizedText,
            targetCEFR: effectiveCEFR,
            sourceTitle: sourceName,
          },
          mergedKeys,
        );

        if (!outcome.success) {
          await bgSupabase
            .from('document_jobs')
            .update({
              status: 'FAILED',
              progress_percent: 100,
              error_message: outcome.error,
              completed_at: new Date().toISOString(),
            })
            .eq('id', job.id);
          return;
        }

        // Store extraction in document_jobs.result_summary for user review.
        // Items are NOT persisted to `words` yet — user must confirm first.
        await bgSupabase
          .from('document_jobs')
          .update({
            status: 'COMPLETED',
            progress_percent: 100,
            result_summary: {
              warnings: parsedData?.warnings,
              pageCount: parsedData?.pageCount,
              textLength: normalizedText.length,
              sourceTitle: sourceName,
              source_text: normalizedText,
              extracted_items: outcome.result.items,
              stats: {
                itemCount: outcome.result.items.length,
                droppedCount: outcome.report.droppedCount,
                dedupedCount: outcome.report.dedupedCount,
              },
              meta: outcome.meta,
            },
            completed_at: new Date().toISOString(),
          })
          .eq('id', job.id);
      } catch (processingError: any) {
        console.error(`[Job ${job.id}] failed:`, processingError);
        await bgSupabase
          .from('document_jobs')
          .update({
            status: 'FAILED',
            error_message: processingError?.message ?? 'Unknown error',
          })
          .eq('id', job.id);
      }
    });

    return NextResponse.json({ success: true, jobId: job.id });
  } catch (error: any) {
    console.error('[API /api/documents/parse] Unhandled error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

// ============================================================
// Helpers
// ============================================================

interface UserProfileInfo {
  apiKeys: ApiKeyItem[];
  targetCEFR: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
}

async function readProfileInfo(
  supabase: any,
  userId: string,
): Promise<UserProfileInfo> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('api_keys, target_cefr')
      .eq('id', userId)
      .single();
    if (error || !data) return { apiKeys: [], targetCEFR: 'B2' };
    return {
      apiKeys: Array.isArray(data.api_keys) ? (data.api_keys as ApiKeyItem[]) : [],
      targetCEFR: isValidCEFR(data.target_cefr) ? data.target_cefr : 'B2',
    };
  } catch {
    return { apiKeys: [], targetCEFR: 'B2' };
  }
}

function mergeKeys(supplied: ApiKeyItem[], fromProfile: ApiKeyItem[]): ApiKeyItem[] {
  // Supplied (FormData) keys take precedence — they reflect the user's
  // current browser-side GeminiApiRouter state.
  const map = new Map<string, ApiKeyItem>();
  for (const k of fromProfile) {
    if (k?.key) map.set(k.key, k);
  }
  for (const k of supplied) {
    if (k?.key) map.set(k.key, k);
  }
  return Array.from(map.values());
}
