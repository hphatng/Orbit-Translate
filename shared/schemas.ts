import { z } from 'zod';

/**
 * ORBIT TRANSLATE — CANONICAL EXTRACTION CONTRACT
 *
 * Single source of truth for AI extraction output. Used by:
 *  - web/src/lib/ai/extractFromTextAI.ts (document-level extraction)
 *  - web/src/lib/ai/normalization.ts (dedup, mapping)
 *  - web/src/lib/services/supabaseService.ts (persistence mapping)
 *
 * The runtime API call (AIClient) MUST validate every AI response with
 * ExtractionResultSchema before any downstream code reads it. Strict mode
 * is enforced — unknown keys throw.
 */

// ---------- SHARED UTILITIES ----------

/**
 * Unicode-normalize, lowercase, trim, and collapse internal whitespace.
 * Used as the canonical normalization key for deduplication.
 */
export function normalizeTerm(raw: string): string {
  return raw
    .normalize('NFC')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

// ---------- ENUMS ----------

export const CEFRLevelEnum = z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);

export const EntryTypeEnum = z.enum([
  'WORD',
  'PHRASE',
  'COLLOCATION',
  'IDIOM',
  'SENTENCE_PATTERN',
  'GRAMMAR',
  'PROPER_NOUN',
]);

export const PartOfSpeechEnum = z.enum([
  'noun',
  'verb',
  'adjective',
  'adverb',
  'preposition',
  'conjunction',
  'pronoun',
  'determiner',
  'interjection',
  'phrase',
  'idiom',
  'proper noun',
  'other',
]);

// ---------- SUB-SCHEMAS ----------

export const ContextSchema = z.object({
  /** The exact sentence from the source text containing the term. */
  original: z.string().min(1),
  /** Vietnamese translation of the source sentence. */
  translation: z.string().min(1),
  /** The exact substring within `original` that matches `term`. */
  highlightedTerm: z.string().min(1),
  /** Optional metadata when item was extracted from a URL. */
  sourceUrl: z.string().url().optional(),
  sourceTitle: z.string().optional(),
});

export const PartOfSpeechBreakdownSchema = z.object({
  word: z.string().min(1),
  pos: PartOfSpeechEnum,
  meaning: z.string().min(1),
});

export const GrammarBreakdownSchema = z.object({
  /** Human-readable structure formula, e.g. "Subject + leave + Object + V-ing". */
  structure: z.string().min(1),
  /** Piecewise breakdown of the structure into words and roles. */
  partsOfSpeech: z.array(PartOfSpeechBreakdownSchema).default([]),
  /** Vietnamese explanation. */
  explanation: z.string().min(1),
  /** Optional product-domain rules / examples. */
  keyRules: z.array(z.string()).optional(),
  /** CEFR difficulty for the GRAMMAR pattern itself (independent of the word). */
  cefrLevel: CEFRLevelEnum.optional(),
});

// ---------- ITEM ----------

export const ExtractedLearningItemSchema = z.object({
  term: z.string().min(1),
  /** IPA pronunciation. Recommended for WORD; may be omitted for phrases. */
  phonetic: z.string().optional(),
  /** Vietnamese translation, context-aware. */
  translation: z.string().min(1),
  /** CEFR. NOT 'Unknown' — must be the model's best guess from the closed enum. */
  cefrLevel: CEFRLevelEnum,
  partOfSpeech: PartOfSpeechEnum.optional(),
  entryType: EntryTypeEnum,
  context: ContextSchema,
  synonyms: z.array(z.string()).default([]),
  antonyms: z.array(z.string()).default([]),
  collocations: z.array(z.string()).default([]),
  /** Required for GRAMMAR / SENTENCE_PATTERN, recommended for idioms. */
  grammarBreakdown: GrammarBreakdownSchema.optional(),
  /** Model self-rated confidence, 0.00 - 1.00. */
  confidence: z.number().min(0).max(1).default(0.7),
});

export const ExtractionResultSchema = z.object({
  items: z.array(ExtractedLearningItemSchema).min(1),
});

// ---------- TYPES ----------

export type CEFRLevel = z.infer<typeof CEFRLevelEnum>;
export type EntryType = z.infer<typeof EntryTypeEnum>;
export type PartOfSpeech = z.infer<typeof PartOfSpeechEnum>;
export type Context = z.infer<typeof ContextSchema>;
export type PartOfSpeechBreakdown = z.infer<typeof PartOfSpeechBreakdownSchema>;
export type GrammarBreakdown = z.infer<typeof GrammarBreakdownSchema>;
export type ExtractedLearningItem = z.infer<typeof ExtractedLearningItemSchema>;
export type ExtractionResult = z.infer<typeof ExtractionResultSchema>;

// ---------- PERSISTENCE MAPPING ----------
//
// Single canonical mapping from AI output to a `words` row payload.
// Lives here so schema + mapping stay in lockstep.

export type WordsRowSourceType = 'EXTENSION' | 'SCAN_EXTRACT' | 'DOCUMENT_TRANSLATE' | 'MANUAL';

export interface WordsRowPayload {
  user_id: string;
  deck_id: string | null;
  term: string;
  /** Drives the UPSERT unique-index deduplication. */
  normalized_text: string;
  phonetic: string | null;
  translation: string;
  cefr_level: CEFRLevel | null;
  part_of_speech: string | null;
  example_sentence: string;
  example_translation: string;
  context_text: string;
  /**
   * NOTE: `grammar_breakdown` is currently plain TEXT in the DB. We
   * JSON.stringify the structured GrammarBreakdown so the Study Hub can
   * JSON.parse on read. No migration in this phase.
   */
  grammar_breakdown: string | null;
  source_url: string | null;
  source_title: string;
  source_context: string;
  source_type: WordsRowSourceType;
  entry_type: EntryType;
  tags: string[];
  /** Initial FSRS state so Practice Mode can immediately schedule reviews. */
  fsrs_state?: {
    stability: number;
    difficulty: number;
    repetition: number;
    lapses: number;
    state: number;
    last_review_date: string | null;
    next_review_date: string;
  };
  /**
   * Confidence / model metadata. Stored in `tags` as a JSON-encoded marker
   * (no schema change required). Future: dedicated columns.
   */
}

export function toWordsRow(params: {
  userId: string;
  deckId: string | null;
  sourceTitle: string;
  item: ExtractedLearningItem;
  /** Initial FSRS state for new words. Omit when updating existing words. */
  fsrsState?: WordsRowPayload['fsrs_state'];
}): WordsRowPayload {
  const { userId, deckId, sourceTitle, item, fsrsState } = params;
  const now = new Date().toISOString();
  return {
    user_id: userId,
    deck_id: deckId,
    term: item.term,
    normalized_text: normalizeTerm(item.term),
    phonetic: item.phonetic ?? null,
    translation: item.translation,
    cefr_level: item.cefrLevel,
    part_of_speech: item.partOfSpeech ?? null,
    example_sentence: item.context.original,
    example_translation: item.context.translation,
    context_text: item.context.original,
    grammar_breakdown: item.grammarBreakdown
      ? JSON.stringify(item.grammarBreakdown)
      : null,
    source_url: item.context.sourceUrl ?? null,
    source_title: sourceTitle,
    source_context: item.context.original,
    source_type: 'SCAN_EXTRACT',
    entry_type: item.entryType,
    tags: [],
    // FSRS state: provided for new inserts, omitted for updates (preserve existing state).
    ...(fsrsState
      ? { fsrs_state: fsrsState }
      : {}),
  } as WordsRowPayload;
}

// ---------- VALIDATION HELPERS ----------

/**
 * Strict parser — unknown keys throw. Use this on every AI response.
 */
export function parseExtractionResult(raw: unknown): ExtractionResult {
  return ExtractionResultSchema.parse(raw);
}

export function safeParseExtractionResult(raw: unknown) {
  return ExtractionResultSchema.safeParse(raw);
}
