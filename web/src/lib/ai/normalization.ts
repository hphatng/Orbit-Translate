/**
 * Normalization + deduplication for AI extraction output.
 *
 * Responsibilities:
 *  - Normalize a term for dedup (lowercase + Unicode NFC + collapsed whitespace).
 *  - Drop items whose normalized term is empty or trivially short.
 *  - Deduplicate by (normalized_term, entryType). Within a group, keep
 *    the item with the highest `confidence`, breaking ties by richer fields.
 *  - Optionally drop A1 vocabulary (default: false — all items preserved).
 *
 * Does NOT:
 *  - Call the database.
 *  - Validate Zod (caller must validate first via parseExtractionResult).
 */

import { normalizeTerm as _normalizeTerm, type ExtractedLearningItem } from '../../../../shared/schemas';

/** Re-export so existing consumers (e.g. tests) don't break. */
export const normalizeTerm = _normalizeTerm;

export interface NormalizationOptions {
  /** Drop items with cefrLevel === 'A1'. Default false (preserve all levels). */
  dropA1: boolean;
  /** Minimum term length (after normalization) to keep. Default 2. */
  minTermLength: number;
  /** Drop exact duplicate terms (any entryType). Default true. */
  dedupExact: boolean;
}

const DEFAULT_OPTIONS: NormalizationOptions = {
  dropA1: false,
  minTermLength: 2,
  dedupExact: true,
};

/**
 * Count how many "rich" optional fields a learning item has.
 * Used as the tie-breaker when two items have the same confidence.
 */
function richnessScore(item: ExtractedLearningItem): number {
  let score = 0;
  if (item.phonetic) score += 1;
  if (item.synonyms.length > 0) score += 1;
  if (item.antonyms.length > 0) score += 1;
  if (item.collocations.length > 0) score += 1;
  if (item.grammarBreakdown) score += 3;
  if (item.partOfSpeech) score += 1;
  if (item.context.translation.length > 0) score += 1;
  return score;
}

/**
 * Decide which of two items is "better". Used for dedup ties.
 */
function isBetter(a: ExtractedLearningItem, b: ExtractedLearningItem): boolean {
  if (a.confidence !== b.confidence) return a.confidence > b.confidence;
  return richnessScore(a) > richnessScore(b);
}

export interface NormalizationReport {
  items: ExtractedLearningItem[];
  droppedCount: number;
  dedupedCount: number;
}

export function normalizeExtraction(
  items: ExtractedLearningItem[],
  options: Partial<NormalizationOptions> = {},
): NormalizationReport {
  const opts: NormalizationOptions = { ...DEFAULT_OPTIONS, ...options };

  const seen = new Map<string, ExtractedLearningItem>();
  let dropped = 0;
  let deduped = 0;

  for (const item of items) {
    const norm = normalizeTerm(item.term);

    if (norm.length < opts.minTermLength) {
      dropped++;
      continue;
    }

    if (opts.dropA1 && item.entryType === 'WORD' && item.cefrLevel === 'A1') {
      dropped++;
      continue;
    }

    // Dedup key: (normalized term, entryType). PROPER_NOUN is its own bucket.
    const key = `${norm}::${item.entryType}`;

    const existing = seen.get(key);
    if (existing) {
      deduped++;
      if (isBetter(item, existing)) {
        // The new item is better — keep its term casing, but preserve
        // any optional fields from the old item that the new item lacks.
        seen.set(key, {
          ...existing,
          ...item,
          // Explicitly preserve term from whichever item won the isBetter check
          // (i.e., the new `item`).
          term: item.term,
        });
      }
      continue;
    }

    seen.set(key, item);
  }

  return {
    items: Array.from(seen.values()),
    droppedCount: dropped,
    dedupedCount: deduped,
  };
}

/**
 * Cheap CEFR estimator as a defensive fallback if the AI ever returns
 * an unrecognizable CEFR (currently impossible — schema enforces it, but
 * this guards against future schema drift).
 *
 * Uses word-length heuristic. NOT used in the normal pipeline.
 */
export function estimateCEFRFallback(term: string): 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' {
  const clean = normalizeTerm(term);
  if (clean.length <= 4) return 'A1';
  if (clean.length <= 6) return 'A2';
  if (clean.length <= 8) return 'B1';
  if (clean.length <= 10) return 'B2';
  if (clean.length <= 12) return 'C1';
  return 'C2';
}
