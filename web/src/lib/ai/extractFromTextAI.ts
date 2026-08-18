/**
 * Document-level AI extraction service.
 *
 * Replaces the previous `extractFromTextCore → enrichWithAI` chain.
 * The model sees the FULL document text and is responsible for:
 *  - segmenting meaningful learning items (vocab, phrases, idioms, grammar)
 *  - assigning CEFR
 *  - producing IPA, translations, examples, grammar breakdowns
 *
 * Pipeline:
 *  1. Build system + user prompts.
 *  2. Call AIClient.generateStructured with ExtractionResultSchema.
 *  3. If validation fails, retry ONCE with a corrective message.
 *  4. Normalize + dedup.
 *  5. Return a typed ExtractionResult with telemetry.
 */

import type { ExtractionResult, ExtractedLearningItem, CEFRLevel } from '../../../../shared/schemas';
import { ExtractionResultSchema, parseExtractionResult } from '../../../../shared/schemas';
import { AIClient, type ApiKeyItem, type GenerateResult } from './AIClient';
import { normalizeExtraction, type NormalizationReport } from './normalization';

export interface ExtractionRequest {
  text: string;
  targetCEFR: CEFRLevel;
  /** Source title for provenance. Stored on every persisted item. */
  sourceTitle: string;
  /** Optional learner preferences that bias extraction. */
  preferences?: {
    includeA1?: boolean;
    preferFlashModel?: boolean;
  };
}

export interface ExtractionSuccess {
  success: true;
  result: ExtractionResult;
  report: NormalizationReport;
  meta: {
    keyId: string;
    model: string;
    latencyMs: number;
    attempts: number;
  };
}

export interface ExtractionFailure {
  success: false;
  error: string;
  cause: 'no-keys' | 'all-failed' | 'invalid-text' | 'empty-after-normalization';
  meta: { attempts: number };
}

export type ExtractionOutcome = ExtractionSuccess | ExtractionFailure;

export interface ExtractFromTextAIConfig {
  /** Max characters of source text to send to the model. Default 60_000. */
  maxInputChars: number;
}

const DEFAULT_CONFIG: ExtractFromTextAIConfig = {
  maxInputChars: 60_000,
};

// ============================================================
// PROMPT BUILDER
// ============================================================

function buildSystemPrompt(targetCEFR: CEFRLevel, includeA1: boolean): string {
  return [
    'You are an expert English-Vietnamese linguist specializing in second-language acquisition.',
    '',
    'TASK: Extract all meaningful learning items (vocabulary, phrases, collocations, idioms, grammar, and proper nouns) from the ENGLISH TEXT below.',
    `USER PREFERRED TARGET CEFR: ${targetCEFR}`,
    '',
    'COMPREHENSIVE EXTRACTION ACROSS ALL CEFR LEVELS:',
    '  - Extract a rich and diverse set of learning items across ALL proficiency levels (A1, A2, B1, B2, C1, C2).',
    '  - Do NOT filter out foundation words (A1, A2) or intermediate words (B1, B2); learners need the option to review both common and advanced terms.',
    '  - Accurately assign each item its true CEFR level from the closed set: A1, A2, B1, B2, C1, C2. NEVER return Unknown.',
    '',
    'ENTRY TYPES (use the right one for each item):',
    '  WORD             single lexical item (noun, verb, adjective, adverb, etc.)',
    '  PHRASE           short multi-word lexical chunk (e.g. in charge of)',
    '  COLLOCATION      habitual word partnership (e.g. make a decision)',
    '  IDIOM            figurative expression (e.g. kick the bucket)',
    '  SENTENCE_PATTERN reusable sentence frame (e.g. It is ... that ...)',
    '  GRAMMAR          grammatical structure with evidence in the text',
    '                   (e.g. past perfect, leave + obj + V-ing, reduced relative clause, relative clause)',
    '  PROPER_NOUN      named entity (person, organization, place, event)',
    '',
    'MANDATORY REQUIREMENT FOR GRAMMAR & SENTENCE PATTERNS:',
    '  - You MUST identify and extract 1-3 prominent GRAMMAR structures and SENTENCE PATTERNS found in the text (e.g. tenses such as Past Perfect / Present Perfect, relative clauses, participle clauses, causative/resultative patterns like "leave + obj + V-ing", passive voice, conditional structures, inversion, or complex noun clauses).',
    '  - Set entryType to "GRAMMAR" or "SENTENCE_PATTERN".',
    '  - You MUST include a complete "grammarBreakdown" object with structure, explanation (in Vietnamese), partsOfSpeech, and cefrLevel.',
    '',
    'DO NOT include:',
    '  - Pure grammatical noise words in isolation (the, a, of, to, in, on, at, is, are, was, were, has, have, had) unless part of a phrase or grammar structure.',
    '  - Duplicates of the same (term, entryType) -- keep the best one.',
    '',
    'FOR EACH ITEM, RETURN:',
    '  term              EXACT substring from the source text (preserve casing, hyphens, apostrophes)',
    '  phonetic          IPA in /.../ -- REQUIRED for WORD and PROPER_NOUN, optional for multi-word items',
    '  translation       short, context-aware Vietnamese translation',
    '  cefrLevel         A1 | A2 | B1 | B2 | C1 | C2',
    '  partOfSpeech      one of: noun | verb | adjective | adverb | preposition | conjunction | pronoun | determiner | interjection | phrase | idiom | proper noun | other',
    '  entryType         one of: WORD | PHRASE | COLLOCATION | IDIOM | SENTENCE_PATTERN | GRAMMAR | PROPER_NOUN',
    '  context {',
    '    original        exact sentence from the text containing the term',
    '    translation     full Vietnamese translation of that sentence',
    '    highlightedTerm exact substring within original matching term',
    '  }',
    '  synonyms          0-3 close English synonyms (omit if none)',
    '  antonyms          0-3 English antonyms (omit if none)',
    '  collocations      0-3 common English collocations with this term',
    '  grammarBreakdown  REQUIRED when entryType is GRAMMAR or SENTENCE_PATTERN, omit otherwise:',
    '                      {',
    '                        structure:   formula',
    '                        partsOfSpeech: [{ word, pos, meaning (Vietnamese) }]',
    '                        explanation: 1-2 sentence Vietnamese explanation',
    '                        keyRules:    optional 0-3 rules',
    '                        cefrLevel:   CEFR for the pattern (independent of the term)',
    '                      }',
    '  confidence        0.00-1.00, your self-rated confidence in this extraction',
    '',
    'INCLUDE PROPER_NOUN items that recur or carry meaning (names of people, organizations, places).',
    '',
    'OUTPUT STRICT JSON matching this exact shape:',
    '{',
    '  "items": [',
    '    {',
    '      "term": "stunned",',
    '      "phonetic": "/stʌnd/",',
    '      "translation": "làm choáng váng, kinh ngạc",',
    '      "cefrLevel": "B2",',
    '      "partOfSpeech": "verb",',
    '      "entryType": "WORD",',
    '      "context": { "original": "Mark Walter stunned the sports world in 2012...", "translation": "Mark Walter đã làm choáng váng giới thể thao năm 2012...", "highlightedTerm": "stunned" },',
    '      "synonyms": ["astounded"],',
    '      "antonyms": [],',
    '      "collocations": ["stunned the world"],',
    '      "confidence": 0.95',
    '    },',
    '    {',
    '      "term": "leave + object + V-ing",',
    '      "translation": "khiến ai/cái gì rơi vào trạng thái nào đó",',
    '      "cefrLevel": "B2",',
    '      "partOfSpeech": "phrase",',
    '      "entryType": "GRAMMAR",',
    '      "context": { "original": "a deal that left his wealthy rivals wondering", "translation": "một thỏa thuận khiến các đối thủ giàu có của ông tự hỏi", "highlightedTerm": "left his wealthy rivals wondering" },',
    '      "synonyms": [],',
    '      "antonyms": [],',
    '      "collocations": [],',
    '      "grammarBreakdown": {',
    '        "structure": "Subject + leave + Object + V-ing",',
    '        "partsOfSpeech": [',
    '          { "word": "left", "pos": "verb", "meaning": "khiến cho" },',
    '          { "word": "rivals", "pos": "noun", "meaning": "đối thủ" },',
    '          { "word": "wondering", "pos": "verb", "meaning": "tự hỏi" }',
    '        ],',
    '        "explanation": "Cấu trúc leave + O + V-ing diễn tả hành động làm cho ai đó ở trong một trạng thái kéo dài.",',
    '        "cefrLevel": "B2"',
    '      },',
    '      "confidence": 0.92',
    '    }',
    '  ]',
    '}',
    '',
    'No markdown fences. No commentary. No preamble.',
  ].join('\n');
}

function buildUserPrompt(text: string, sourceTitle: string): string {
  // Hard truncation. The route handler also enforces this, but defensive.
  const safeTitle = sourceTitle.replace(/"/g, "'");
  return [
    `--- BEGIN DOCUMENT (title: "${safeTitle}") ---`,
    '',
    text,
    '',
    '--- END DOCUMENT ---',
  ].join('\n');
}

// ============================================================
// SERVICE
// ============================================================

export async function extractFromTextAI(
  req: ExtractionRequest,
  keys: ApiKeyItem[],
  config: Partial<ExtractFromTextAIConfig> = {},
): Promise<ExtractionOutcome> {
  const cfg: ExtractFromTextAIConfig = { ...DEFAULT_CONFIG, ...config };

  const trimmed = req.text.trim();
  if (!trimmed) {
    return {
      success: false,
      error: 'Empty input text',
      cause: 'invalid-text',
      meta: { attempts: 0 },
    };
  }

  if (trimmed.length > cfg.maxInputChars) {
    return {
      success: false,
      error: `Input too large (${trimmed.length} > ${cfg.maxInputChars} chars)`,
      cause: 'invalid-text',
      meta: { attempts: 0 },
    };
  }

  if (!keys || keys.length === 0) {
    return {
      success: false,
      error: 'No API keys configured',
      cause: 'no-keys',
      meta: { attempts: 0 },
    };
  }

  const client = new AIClient(keys);
  const includeA1 = req.preferences?.includeA1 ?? false;

  const systemPrompt = buildSystemPrompt(req.targetCEFR, includeA1);
  const userPrompt = buildUserPrompt(trimmed, req.sourceTitle);

  // Attempt 1.
  const first: GenerateResult<ExtractionResult> = await client.generateStructured({
    tier: 'document-extraction',
    systemPrompt,
    userPrompt,
    responseSchema: ExtractionResultSchema,
  });

  if (first.success) {
    return finalize(first.data, first.meta, { dropA1: !includeA1 });
  }

  // Attempt 2 — corrective retry only when the failure was validation, NOT quota.
  if (first.meta.lastErrorKind === 'validation' && first.meta.attempts < 8) {
    const corrective = `${systemPrompt}\n\nIMPORTANT: Your previous response failed JSON schema validation. Reply with ONLY the corrected JSON object. No commentary. No markdown.`;
    const retry: GenerateResult<ExtractionResult> = await client.generateStructured({
      tier: 'document-extraction',
      systemPrompt: corrective,
      userPrompt,
      responseSchema: ExtractionResultSchema,
    });
    if (retry.success) {
      return finalize(retry.data, retry.meta, { dropA1: !includeA1 });
    }
    return {
      success: false,
      error: retry.error,
      cause: 'all-failed',
      meta: { attempts: first.meta.attempts + retry.meta.attempts },
    };
  }

  return {
    success: false,
    error: first.error,
    cause: 'all-failed',
    meta: first.meta,
  };
}

function finalize(
  raw: unknown,
  meta: ExtractionSuccess['meta'],
  normOpts: { dropA1: boolean },
): ExtractionOutcome {
  // Final re-validation for safety even though the client validated.
  const parsed: ExtractionResult = parseExtractionResult(raw);

  const report = normalizeExtraction(parsed.items, normOpts);

  if (report.items.length === 0) {
    return {
      success: false,
      error: 'No items survived normalization (all dropped or deduped)',
      cause: 'empty-after-normalization',
      meta: { attempts: meta.attempts },
    };
  }

  return {
    success: true,
    result: { items: report.items },
    report,
    meta,
  };
}
