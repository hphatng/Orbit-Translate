import { describe, it, expect } from 'vitest';
import {
  ExtractionResultSchema,
  ExtractedLearningItemSchema,
  CEFRLevelEnum,
  EntryTypeEnum,
  parseExtractionResult,
  toWordsRow,
  type ExtractedLearningItem,
} from 'shared/schemas';

describe('ExtractionResultSchema', () => {
  it('accepts a well-formed extraction', () => {
    const ok = {
      items: [
        {
          term: 'world',
          phonetic: '/wɜːrld/',
          translation: 'thế giới',
          cefrLevel: 'A1',
          partOfSpeech: 'noun',
          entryType: 'WORD',
          context: {
            original: 'Mark Walter stunned the sports world in 2012.',
            translation: 'Mark Walter gây chấn động giới thể thao năm 2012.',
            highlightedTerm: 'world',
          },
          synonyms: [],
          antonyms: [],
          collocations: ['sports world'],
          confidence: 0.9,
        },
      ],
    };
    expect(() => ExtractionResultSchema.parse(ok)).not.toThrow();
  });

  it('rejects Unknown CEFR (closed enum)', () => {
    const bad = {
      items: [
        {
          term: 'foo',
          translation: 'x',
          cefrLevel: 'Unknown',
          entryType: 'WORD',
          context: {
            original: 'x',
            translation: 'x',
            highlightedTerm: 'x',
          },
        },
      ],
    };
    const res = ExtractionResultSchema.safeParse(bad);
    expect(res.success).toBe(false);
  });

  it('rejects missing required context fields', () => {
    const bad = {
      items: [
        {
          term: 'foo',
          translation: 'x',
          cefrLevel: 'A2',
          entryType: 'WORD',
          context: { original: 'x' }, // missing translation + highlightedTerm
        },
      ],
    };
    const res = ExtractionResultSchema.safeParse(bad);
    expect(res.success).toBe(false);
  });

  it('rejects unknown entry types (PROPER_NOUN must be in enum)', () => {
    const bad = {
      items: [
        {
          term: 'Mark',
          translation: 'x',
          cefrLevel: 'A1',
          entryType: 'PERSON_NAME',
          context: { original: 'x', translation: 'x', highlightedTerm: 'x' },
        },
      ],
    };
    const res = ExtractionResultSchema.safeParse(bad);
    expect(res.success).toBe(false);
  });

  it('accepts PROPER_NOUN', () => {
    const ok = {
      items: [
        {
          term: 'Mark Walter',
          translation: 'Mark Walter (tên riêng)',
          cefrLevel: 'B1',
          entryType: 'PROPER_NOUN',
          partOfSpeech: 'proper noun',
          context: {
            original: 'Mark Walter stunned the sports world.',
            translation: 'Mark Walter gây chấn động giới thể thao.',
            highlightedTerm: 'Mark Walter',
          },
        },
      ],
    };
    const res = ExtractionResultSchema.parse(ok);
    expect(res.items[0].entryType).toBe('PROPER_NOUN');
  });

  it('accepts GRAMMAR items with grammarBreakdown', () => {
    const ok = {
      items: [
        {
          term: 'leave + object + V-ing',
          translation: 'để ai đó ở trạng thái...',
          cefrLevel: 'B2',
          entryType: 'SENTENCE_PATTERN',
          context: {
            original: 'a deal that left his wealthy rivals wondering',
            translation: 'một thỏa thuận khiến các đối thủ giàu có ngỡ ngàng',
            highlightedTerm: 'left his wealthy rivals wondering',
          },
          grammarBreakdown: {
            structure: 'Subject + leave + Object + V-ing',
            partsOfSpeech: [
              { word: 'leave', pos: 'verb', meaning: 'khiến' },
              { word: 'V-ing', pos: 'other', meaning: 'dạng V-ing' },
            ],
            explanation: 'Cấu trúc "leave sb doing" nghĩa là khiến ai đó ở trạng thái nào đó.',
            cefrLevel: 'B2',
          },
        },
      ],
    };
    const res = ExtractionResultSchema.parse(ok);
    expect(res.items[0].grammarBreakdown?.structure).toBe(
      'Subject + leave + Object + V-ing',
    );
  });

  it('CEFRLevelEnum has no Unknown value', () => {
    expect(CEFRLevelEnum.options).not.toContain('Unknown');
    expect(CEFRLevelEnum.options).toEqual(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
  });

  it('EntryTypeEnum includes all required types', () => {
    expect(new Set(EntryTypeEnum.options)).toEqual(
      new Set(['WORD', 'PHRASE', 'COLLOCATION', 'IDIOM', 'SENTENCE_PATTERN', 'GRAMMAR', 'PROPER_NOUN']),
    );
  });

  it('parseExtractionResult throws on bad input', () => {
    expect(() => parseExtractionResult({ items: 'not an array' })).toThrow();
  });
});

describe('toWordsRow', () => {
  const baseItem: ExtractedLearningItem = {
    term: 'rival',
    phonetic: '/ˈraɪ.vəl/',
    translation: 'đối thủ',
    cefrLevel: 'B2',
    partOfSpeech: 'noun',
    entryType: 'WORD',
    context: {
      original: 'his wealthy rivals wondering',
      translation: 'các đối thủ giàu của anh ta đang thắc mắc',
      highlightedTerm: 'rivals',
    },
    synonyms: ['opponent', 'competitor'],
    antonyms: ['ally'],
    collocations: ['wealthy rival'],
    grammarBreakdown: undefined,
    confidence: 0.85,
  };

  it('maps rich item to a fully-populated WordsRowPayload', () => {
    const row = toWordsRow({
      userId: '00000000-0000-0000-0000-000000000001',
      deckId: '00000000-0000-0000-0000-000000000002',
      sourceTitle: 'mark-walter.txt',
      item: baseItem,
    });

    expect(row.term).toBe('rival');
    expect(row.phonetic).toBe('/ˈraɪ.vəl/');
    expect(row.translation).toBe('đối thủ');
    expect(row.cefr_level).toBe('B2');
    expect(row.part_of_speech).toBe('noun');
    expect(row.entry_type).toBe('WORD');
    expect(row.example_sentence).toBe('his wealthy rivals wondering');
    expect(row.example_translation).toBe('các đối thủ giàu của anh ta đang thắc mắc');
    expect(row.source_type).toBe('SCAN_EXTRACT');
    expect(row.source_title).toBe('mark-walter.txt');
    expect(row.source_context).toBe('his wealthy rivals wondering');
    expect(row.grammar_breakdown).toBeNull();
  });

  it('JSON-serializes grammarBreakdown into grammar_breakdown TEXT', () => {
    const grammarItem: ExtractedLearningItem = {
      ...baseItem,
      term: 'leave + object + V-ing',
      entryType: 'SENTENCE_PATTERN',
      grammarBreakdown: {
        structure: 'Subject + leave + Object + V-ing',
        partsOfSpeech: [{ word: 'leave', pos: 'verb', meaning: 'khiến' }],
        explanation: 'Cấu trúc câu.',
        cefrLevel: 'B2',
      },
    };

    const row = toWordsRow({
      userId: 'u',
      deckId: null,
      sourceTitle: 'doc.txt',
      item: grammarItem,
    });

    expect(row.grammar_breakdown).not.toBeNull();
    expect(() => JSON.parse(row.grammar_breakdown!)).not.toThrow();
    const parsed = JSON.parse(row.grammar_breakdown!);
    expect(parsed.structure).toBe('Subject + leave + Object + V-ing');
  });

  it('handles PROPER_NOUN item correctly', () => {
    const item: ExtractedLearningItem = {
      ...baseItem,
      term: 'Los Angeles Dodgers',
      entryType: 'PROPER_NOUN',
      partOfSpeech: 'proper noun',
      translation: 'Los Angeles Dodgers',
    };
    const row = toWordsRow({
      userId: 'u',
      deckId: null,
      sourceTitle: 'doc.txt',
      item,
    });
    expect(row.entry_type).toBe('PROPER_NOUN');
    expect(row.source_type).toBe('SCAN_EXTRACT');
  });

  it('populates normalized_text for UPSERT deduplication', () => {
    const item: ExtractedLearningItem = {
      ...baseItem,
      term: '  Mark   WALTER  ',
    };
    const row = toWordsRow({
      userId: 'u',
      deckId: null,
      sourceTitle: 'doc.txt',
      item,
    });
    expect(row.normalized_text).toBe('mark walter');
    expect(typeof row.normalized_text).toBe('string');
  });
});