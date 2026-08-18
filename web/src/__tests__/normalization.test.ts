import { describe, it, expect } from 'vitest';
import { normalizeExtraction, normalizeTerm, estimateCEFRFallback } from '@/lib/ai/normalization';
import type { ExtractedLearningItem } from 'shared/schemas';

function makeItem(overrides: Partial<ExtractedLearningItem>): ExtractedLearningItem {
  return {
    term: 'world',
    translation: 'thế giới',
    cefrLevel: 'A1',
    entryType: 'WORD',
    context: {
      original: 'Mark Walter stunned the sports world.',
      translation: 'Mark Walter gây chấn động giới thể thao.',
      highlightedTerm: 'world',
    },
    synonyms: [],
    antonyms: [],
    collocations: [],
    confidence: 0.8,
    ...overrides,
  };
}

describe('normalizeTerm', () => {
  it('lowercases, NFC-normalizes, trims, collapses spaces', () => {
    expect(normalizeTerm('  Mark   WALTER ')).toBe('mark walter');
  });

  it('NFC-normalizes accented Vietnamese', () => {
    expect(normalizeTerm('Huỳnh')).toBe('huỳnh');
  });
});

describe('normalizeExtraction', () => {
  it('keeps A1 WORD items by default (dropA1 defaults to false)', () => {
    const items = [
      makeItem({ term: 'world', cefrLevel: 'A1' }),
      makeItem({ term: 'rival', cefrLevel: 'B2' }),
    ];
    const out = normalizeExtraction(items);
    expect(out.items.map((i) => i.term)).toEqual(['world', 'rival']);
    expect(out.droppedCount).toBe(0);
  });

  it('drops A1 WORD items when dropA1: true', () => {
    const items = [
      makeItem({ term: 'world', cefrLevel: 'A1' }),
      makeItem({ term: 'rival', cefrLevel: 'B2' }),
    ];
    const out = normalizeExtraction(items, { dropA1: true });
    expect(out.items.map((i) => i.term)).toEqual(['rival']);
    expect(out.droppedCount).toBe(1);
  });

  it('keeps A1 PHRASE/COLLOCATION (only WORDs are filtered)', () => {
    const items = [
      makeItem({ term: 'sports world', entryType: 'PHRASE', cefrLevel: 'A1' }),
      makeItem({ term: 'chief executive', entryType: 'PHRASE', cefrLevel: 'A2' }),
    ];
    const out = normalizeExtraction(items);
    expect(out.items.length).toBe(2);
  });

  it('dedupes identical (term, entryType) pairs and keeps highest confidence', () => {
    const items = [
      makeItem({ term: 'world', cefrLevel: 'B2', confidence: 0.5 }),
      makeItem({ term: 'world', cefrLevel: 'B2', confidence: 0.9, translation: 'thế giới (tốt)' }),
    ];
    const out = normalizeExtraction(items);
    expect(out.items.length).toBe(1);
    expect(out.items[0].translation).toBe('thế giới (tốt)');
    expect(out.dedupedCount).toBe(1);
  });

  it('does NOT dedupe across different entryTypes', () => {
    const items = [
      makeItem({ term: 'world', entryType: 'WORD', cefrLevel: 'B1' }),
      makeItem({ term: 'world', entryType: 'PROPER_NOUN', cefrLevel: 'B1', translation: 'tên riêng' }),
    ];
    const out = normalizeExtraction(items);
    expect(out.items.length).toBe(2);
  });

  it('does NOT dedupe a word vs its phrase form', () => {
    const items = [
      makeItem({ term: 'fund', entryType: 'WORD', cefrLevel: 'B1' }),
      makeItem({ term: 'fund the purchase', entryType: 'PHRASE', cefrLevel: 'B2' }),
    ];
    const out = normalizeExtraction(items);
    expect(out.items.length).toBe(2);
  });

  it('drops items shorter than minTermLength', () => {
    const items = [
      makeItem({ term: 'a', entryType: 'WORD', cefrLevel: 'B2' }),
      makeItem({ term: 'ab', entryType: 'WORD', cefrLevel: 'B2' }),
    ];
    const out = normalizeExtraction(items);
    expect(out.items.map((i) => i.term)).toEqual(['ab']);
  });

  it('Unicode-normalizes and dedupes equivalents', () => {
    const items = [
      makeItem({ term: 'café', cefrLevel: 'B2', confidence: 0.6 }),
      makeItem({ term: 'café', cefrLevel: 'B2', confidence: 0.9 }), // composed NFC
    ];
    const out = normalizeExtraction(items);
    expect(out.items.length).toBe(1);
    expect(out.items[0].confidence).toBe(0.9);
  });

  it('honors dropA1: false (keep A1 by default)', () => {
    const items = [makeItem({ term: 'world', cefrLevel: 'A1' })];
    const out = normalizeExtraction(items, { dropA1: false });
    expect(out.items.length).toBe(1);
  });

  it('winner term casing is preserved in dedup (isBetter wins)', () => {
    // The new item "RIVAL" (all-caps) wins due to higher confidence.
    // Its term casing MUST be preserved, not replaced with existing.lower.
    const items = [
      makeItem({ term: 'rival', cefrLevel: 'B2', confidence: 0.5, translation: 'thấp' }),
      makeItem({ term: 'RIVAL', cefrLevel: 'B2', confidence: 0.9, translation: 'cao' }),
    ];
    const out = normalizeExtraction(items);
    expect(out.items.length).toBe(1);
    expect(out.items[0].term).toBe('RIVAL'); // winner's casing preserved
    expect(out.items[0].translation).toBe('cao'); // winner's data used
    expect(out.dedupedCount).toBe(1);
  });
});

describe('estimateCEFRFallback (defensive, not used in normal pipeline)', () => {
  it('returns reasonable buckets', () => {
    expect(estimateCEFRFallback('run')).toBe('A1');
    expect(estimateCEFRFallback('purchase')).toBe('B1');
    expect(estimateCEFRFallback('revolutionary')).toBe('C2');
  });
});