/**
 * Mark Walter golden fixture.
 *
 * The exact sentence the user reported as broken:
 *   "Mark Walter stunned the sports world in 2012 with a deal that left
 *    his wealthy rivals wondering how the chief executive of Guggenheim
 *    Partners, little-known outside Wall Street, had funded the purchase
 *    of the Los Angeles Dodgers, one of the premier teams in Major League
 *    Baseball."
 *
 * The fixture defines the MINIMUM items a high-quality extraction should
 * produce. The evaluator checks recall (does the AI's response contain
 * these terms with the right fields?) — it does NOT require exact equality.
 */

export const MARK_WALTER_TEXT = `Mark Walter stunned the sports world in 2012 with a deal that left his wealthy rivals wondering how the chief executive of Guggenheim Partners, little-known outside Wall Street, had funded the purchase of the Los Angeles Dodgers, one of the premier teams in Major League Baseball.`;

export interface ExpectedVocabulary {
  /** Lowercased normalized term. */
  term: string;
  entryType: 'WORD' | 'PHRASE' | 'COLLOCATION' | 'IDIOM' | 'SENTENCE_PATTERN' | 'PROPER_NOUN' | 'GRAMMAR';
  /** Optional CEFR assertion. */
  cefr?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
}

export interface GoldenFixture {
  id: string;
  title: string;
  text: string;
  /**
   * Items the extractor is EXPECTED to produce. Recall = (matched / total).
   * Each `expected[]` is matched by term+entryType against the AI output.
   */
  expected: ExpectedVocabulary[];
  /**
   * Required fields for every matched item. Recall = (items with all
   * required fields present / total matched items).
   */
  requiredFields: ('translation' | 'cefrLevel' | 'context' | 'phonetic' | 'partOfSpeech')[];
}

export const MARK_WALTER_FIXTURE: GoldenFixture = {
  id: 'mark-walter-001',
  title: 'Mark Walter Dodgers Acquisition',
  text: MARK_WALTER_TEXT,
  expected: [
    // Vocabulary
    { term: 'world', entryType: 'WORD', cefr: 'A1' },
    { term: 'deal', entryType: 'WORD', cefr: 'A2' },
    { term: 'wealthy', entryType: 'WORD', cefr: 'B1' },
    { term: 'rival', entryType: 'WORD', cefr: 'B2' },
    { term: 'chief', entryType: 'WORD', cefr: 'A2' },
    { term: 'executive', entryType: 'WORD', cefr: 'B2' },
    { term: 'purchase', entryType: 'WORD', cefr: 'B1' },
    { term: 'fund', entryType: 'WORD', cefr: 'B1' },
    { term: 'stun', entryType: 'WORD', cefr: 'B2' },
    { term: 'stunned', entryType: 'WORD', cefr: 'B2' },
    { term: 'little-known', entryType: 'WORD', cefr: 'B2' },
    { term: 'premier', entryType: 'WORD', cefr: 'B2' },
    // Phrases / collocations
    { term: 'sports world', entryType: 'PHRASE' },
    { term: 'chief executive', entryType: 'PHRASE' },
    { term: 'fund the purchase', entryType: 'PHRASE' },
    { term: 'one of the premier teams', entryType: 'PHRASE' },
    { term: 'left ... wondering', entryType: 'COLLOCATION' },
    // Idioms / patterns
    { term: 'leave + object + V-ing', entryType: 'SENTENCE_PATTERN' },
    // Proper nouns
    { term: 'Mark Walter', entryType: 'PROPER_NOUN' },
    { term: 'Guggenheim Partners', entryType: 'PROPER_NOUN' },
    { term: 'Wall Street', entryType: 'PROPER_NOUN' },
    { term: 'Los Angeles Dodgers', entryType: 'PROPER_NOUN' },
    { term: 'Major League Baseball', entryType: 'PROPER_NOUN' },
    // Grammar
    { term: 'Past Simple', entryType: 'GRAMMAR' },
    { term: 'Past Perfect', entryType: 'GRAMMAR' },
    { term: 'Defining Relative Clause', entryType: 'GRAMMAR' },
    { term: 'reduced relative clause', entryType: 'GRAMMAR' },
    { term: 'embedded noun clause', entryType: 'GRAMMAR' },
    { term: 'appositive noun phrase', entryType: 'GRAMMAR' },
    { term: 'prepositional phrase', entryType: 'GRAMMAR' },
  ],
  requiredFields: ['translation', 'cefrLevel', 'context'],
};

/**
 * Score an AI extraction result against a golden fixture.
 *
 * @param items AI extraction output
 * @param fixture the golden fixture
 * @returns metrics + list of missed terms
 */
import type { ExtractedLearningItem } from 'shared/schemas';

export interface FixtureScore {
  total: number;
  matched: number;
  vocabularyRecall: number;
  phraseRecall: number;
  grammarRecall: number;
  properNounRecall: number;
  overallRecall: number;
  completenessRatio: number;
  missedTerms: ExpectedVocabulary[];
  invalidCEFR: number;
}

function normalizeForMatch(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, ' ');
}

function fuzzyContains(haystack: string, needle: string): boolean {
  const h = normalizeForMatch(haystack);
  const n = normalizeForMatch(needle);
  if (n.length === 0) return false;
  // Word-boundary substring match.
  const escaped = n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escaped}\\b`).test(h);
}

export function scoreFixture(
  items: ExtractedLearningItem[],
  fixture: GoldenFixture,
): FixtureScore {
  const matched: ExpectedVocabulary[] = [];
  const missed: ExpectedVocabulary[] = [];

  const byEntryType: Record<string, { matched: number; total: number }> = {
    WORD: { matched: 0, total: 0 },
    PHRASE: { matched: 0, total: 0 },
    COLLOCATION: { matched: 0, total: 0 },
    IDIOM: { matched: 0, total: 0 },
    SENTENCE_PATTERN: { matched: 0, total: 0 },
    GRAMMAR: { matched: 0, total: 0 },
    PROPER_NOUN: { matched: 0, total: 0 },
  };

  let completeFields = 0;
  let totalFields = 0;
  let invalidCEFR = 0;

  for (const exp of fixture.expected) {
    byEntryType[exp.entryType].total += 1;
    const hit = items.find((it) => {
      if (it.entryType !== exp.entryType) {
        const isGrammarOrPattern = (t: string) => t === 'GRAMMAR' || t === 'SENTENCE_PATTERN';
        if (!isGrammarOrPattern(it.entryType) || !isGrammarOrPattern(exp.entryType)) {
          return false;
        }
      }
      // For grammar/sentence patterns, the AI might use slightly different
      // naming — match by substring.
      if (exp.entryType === 'SENTENCE_PATTERN' || exp.entryType === 'GRAMMAR') {
        return (
          fuzzyContains(it.term, exp.term) ||
          fuzzyContains(it.grammarBreakdown?.structure ?? '', exp.term)
        );
      }
      return fuzzyContains(it.term, exp.term);
    });

    if (!hit) {
      missed.push(exp);
      continue;
    }

    matched.push(exp);
    byEntryType[exp.entryType].matched += 1;

    for (const f of fixture.requiredFields) {
      totalFields++;
      let present = false;
      switch (f) {
        case 'translation':
          present = !!hit.translation && hit.translation.length > 0;
          break;
        case 'cefrLevel':
          present = !!hit.cefrLevel && hit.cefrLevel !== ('Unknown' as any);
          break;
        case 'context':
          present = !!hit.context?.original && !!hit.context?.translation;
          break;
        case 'phonetic':
          present = !!hit.phonetic && hit.phonetic.length > 0;
          break;
        case 'partOfSpeech':
          present = !!hit.partOfSpeech;
          break;
      }
      if (present) completeFields++;
    }

    if (
      exp.cefr &&
      hit.cefrLevel &&
      hit.cefrLevel !== exp.cefr &&
      exp.entryType !== 'SENTENCE_PATTERN' &&
      exp.entryType !== 'GRAMMAR'
    ) {
      // Allow +/- 1 CEFR level as acceptable variance.
      const order = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
      const expIdx = order.indexOf(exp.cefr);
      const gotIdx = order.indexOf(hit.cefrLevel as any);
      if (Math.abs(expIdx - gotIdx) > 1) invalidCEFR++;
    }
  }

  const recall = (e: string) =>
    byEntryType[e].total === 0 ? 1 : byEntryType[e].matched / byEntryType[e].total;

  return {
    total: fixture.expected.length,
    matched: matched.length,
    vocabularyRecall: recall('WORD'),
    phraseRecall: (byEntryType.PHRASE.matched + byEntryType.COLLOCATION.matched) /
      Math.max(1, byEntryType.PHRASE.total + byEntryType.COLLOCATION.total),
    grammarRecall: (byEntryType.GRAMMAR.matched + byEntryType.SENTENCE_PATTERN.matched) /
      Math.max(1, byEntryType.GRAMMAR.total + byEntryType.SENTENCE_PATTERN.total),
    properNounRecall: recall('PROPER_NOUN'),
    overallRecall: matched.length / fixture.expected.length,
    completenessRatio: totalFields === 0 ? 1 : completeFields / totalFields,
    missedTerms: missed,
    invalidCEFR,
  };
}
