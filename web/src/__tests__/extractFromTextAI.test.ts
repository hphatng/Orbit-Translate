import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { extractFromTextAI } from '../lib/ai/extractFromTextAI';
import { MARK_WALTER_FIXTURE, scoreFixture } from '../lib/ai/__fixtures__/markWalter';
import type { ApiKeyItem } from '../lib/ai/AIClient';

const KEY: ApiKeyItem = { id: 'test', name: 'test', key: 'AIza-TEST-TEST-TEST-test' };

/**
 * Mocked AI fixture response for the Mark Walter sentence.
 * Designed to satisfy ExtractionResultSchema and exercise vocabulary,
 * phrases, collocations, idioms, sentence patterns, grammar, and proper nouns.
 */
const MARK_WALTER_AI_FIXTURE = {
  items: [
    {
      term: 'world',
      phonetic: '/wɜːrld/',
      translation: 'thế giới',
      cefrLevel: 'A1',
      partOfSpeech: 'noun',
      entryType: 'WORD',
      context: {
        original: 'Mark Walter stunned the sports world in 2012 with a deal.',
        translation: 'Mark Walter gây chấn động giới thể thao năm 2012 bằng một thỏa thuận.',
        highlightedTerm: 'world',
      },
      synonyms: [],
      antonyms: [],
      collocations: ['sports world'],
      confidence: 0.95,
    },
    {
      term: 'deal',
      phonetic: '/diːl/',
      translation: 'thỏa thuận, giao dịch',
      cefrLevel: 'A2',
      partOfSpeech: 'noun',
      entryType: 'WORD',
      context: {
        original: 'a deal that left his wealthy rivals wondering',
        translation: 'một thỏa thuận khiến các đối thủ giàu thắc mắc',
        highlightedTerm: 'deal',
      },
      synonyms: ['agreement'],
      antonyms: [],
      collocations: ['make a deal'],
      confidence: 0.92,
    },
    {
      term: 'wealthy',
      phonetic: '/ˈwel.θi/',
      translation: 'giàu có',
      cefrLevel: 'B1',
      partOfSpeech: 'adjective',
      entryType: 'WORD',
      context: {
        original: 'his wealthy rivals wondering',
        translation: 'các đối thủ giàu của anh ta đang thắc mắc',
        highlightedTerm: 'wealthy',
      },
      synonyms: ['rich', 'affluent'],
      antonyms: ['poor'],
      collocations: ['wealthy individual'],
      confidence: 0.93,
    },
    {
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
      collocations: ['main rival'],
      confidence: 0.9,
    },
    {
      term: 'chief',
      phonetic: '/tʃiːf/',
      translation: 'trưởng, chính',
      cefrLevel: 'A2',
      partOfSpeech: 'adjective',
      entryType: 'WORD',
      context: {
        original: 'the chief executive of Guggenheim Partners',
        translation: 'giám đốc điều hành của Guggenheim Partners',
        highlightedTerm: 'chief',
      },
      confidence: 0.85,
    },
    {
      term: 'executive',
      phonetic: '/ɪɡˈzek.jə.tɪv/',
      translation: 'giám đốc điều hành',
      cefrLevel: 'B2',
      partOfSpeech: 'noun',
      entryType: 'WORD',
      context: {
        original: 'the chief executive of Guggenheim Partners',
        translation: 'giám đốc điều hành của Guggenheim Partners',
        highlightedTerm: 'executive',
      },
      synonyms: ['manager'],
      collocations: ['chief executive'],
      confidence: 0.9,
    },
    {
      term: 'purchase',
      phonetic: '/ˈpɜːr.tʃəs/',
      translation: 'mua, sự mua',
      cefrLevel: 'B1',
      partOfSpeech: 'noun',
      entryType: 'WORD',
      context: {
        original: 'had funded the purchase of the Los Angeles Dodgers',
        translation: 'đã tài trợ cho việc mua lại Los Angeles Dodgers',
        highlightedTerm: 'purchase',
      },
      synonyms: ['buy', 'acquisition'],
      collocations: ['the purchase of'],
      confidence: 0.92,
    },
    {
      term: 'fund',
      phonetic: '/fʌnd/',
      translation: 'tài trợ, quỹ',
      cefrLevel: 'B1',
      partOfSpeech: 'verb',
      entryType: 'WORD',
      context: {
        original: 'had funded the purchase of the Los Angeles Dodgers',
        translation: 'đã tài trợ cho việc mua lại Los Angeles Dodgers',
        highlightedTerm: 'funded',
      },
      confidence: 0.88,
    },
    {
      term: 'stun',
      phonetic: '/stʌn/',
      translation: 'gây chấn động, làm sững sờ',
      cefrLevel: 'B2',
      partOfSpeech: 'verb',
      entryType: 'WORD',
      context: {
        original: 'Mark Walter stunned the sports world in 2012',
        translation: 'Mark Walter gây chấn động giới thể thao năm 2012',
        highlightedTerm: 'stunned',
      },
      synonyms: ['astound', 'shock'],
      confidence: 0.93,
    },
    {
      term: 'premier',
      phonetic: '/prɪˈmɪr/',
      translation: 'hàng đầu, ưu tú',
      cefrLevel: 'B2',
      partOfSpeech: 'adjective',
      entryType: 'WORD',
      context: {
        original: 'one of the premier teams in Major League Baseball',
        translation: 'một trong những đội hàng đầu của Major League Baseball',
        highlightedTerm: 'premier',
      },
      synonyms: ['leading', 'top'],
      confidence: 0.9,
    },
    {
      term: 'little-known',
      phonetic: '/ˌlɪt.əl ˈnoʊn/',
      translation: 'ít được biết đến',
      cefrLevel: 'B2',
      partOfSpeech: 'adjective',
      entryType: 'WORD',
      context: {
        original: 'little-known outside Wall Street',
        translation: 'ít được biết đến ngoài Wall Street',
        highlightedTerm: 'little-known',
      },
      confidence: 0.88,
    },
    {
      term: 'sports world',
      translation: 'giới thể thao',
      cefrLevel: 'B1',
      entryType: 'PHRASE',
      context: {
        original: 'the sports world in 2012',
        translation: 'giới thể thao năm 2012',
        highlightedTerm: 'sports world',
      },
      confidence: 0.95,
    },
    {
      term: 'chief executive',
      translation: 'giám đốc điều hành (CEO)',
      cefrLevel: 'B1',
      entryType: 'PHRASE',
      context: {
        original: 'the chief executive of Guggenheim Partners',
        translation: 'giám đốc điều hành của Guggenheim Partners',
        highlightedTerm: 'chief executive',
      },
      confidence: 0.96,
    },
    {
      term: 'fund the purchase',
      translation: 'tài trợ cho việc mua',
      cefrLevel: 'B2',
      entryType: 'PHRASE',
      context: {
        original: 'had funded the purchase of the Los Angeles Dodgers',
        translation: 'đã tài trợ cho việc mua lại Los Angeles Dodgers',
        highlightedTerm: 'funded the purchase',
      },
      confidence: 0.85,
    },
    {
      term: 'leave + object + V-ing',
      translation: 'khiến ai/cái gì ở trạng thái nào đó (đang làm gì)',
      cefrLevel: 'B2',
      entryType: 'SENTENCE_PATTERN',
      context: {
        original: 'a deal that left his wealthy rivals wondering',
        translation: 'một thỏa thuận khiến các đối thủ giàu của anh ta thắc mắc',
        highlightedTerm: 'left his wealthy rivals wondering',
      },
      grammarBreakdown: {
        structure: 'Subject + leave + Object + V-ing',
        partsOfSpeech: [
          { word: 'leave', pos: 'verb', meaning: 'khiến' },
          { word: 'Object', pos: 'noun', meaning: 'tân ngữ (người/vật)' },
          { word: 'V-ing', pos: 'other', meaning: 'dạng V-ing (hành động liên tục)' },
        ],
        explanation:
          'Cấu trúc "leave + sb/sth + V-ing" nghĩa là "khiến ai/cái gì rơi vào trạng thái nào đó (đang làm gì)".',
        cefrLevel: 'B2',
      },
      confidence: 0.92,
    },
    {
      term: 'Mark Walter',
      translation: 'Mark Walter (tên người)',
      cefrLevel: 'B1',
      entryType: 'PROPER_NOUN',
      partOfSpeech: 'proper noun',
      context: {
        original: 'Mark Walter stunned the sports world in 2012',
        translation: 'Mark Walter gây chấn động giới thể thao năm 2012',
        highlightedTerm: 'Mark Walter',
      },
      confidence: 0.98,
    },
    {
      term: 'Guggenheim Partners',
      translation: 'Guggenheim Partners (tên công ty)',
      cefrLevel: 'B1',
      entryType: 'PROPER_NOUN',
      partOfSpeech: 'proper noun',
      context: {
        original: 'the chief executive of Guggenheim Partners',
        translation: 'giám đốc điều hành của Guggenheim Partners',
        highlightedTerm: 'Guggenheim Partners',
      },
      confidence: 0.97,
    },
    {
      term: 'Wall Street',
      translation: 'Wall Street (tên đường / phố Wall - trung tâm tài chính Mỹ)',
      cefrLevel: 'A2',
      entryType: 'PROPER_NOUN',
      partOfSpeech: 'proper noun',
      context: {
        original: 'little-known outside Wall Street',
        translation: 'ít được biết đến ngoài Wall Street',
        highlightedTerm: 'Wall Street',
      },
      confidence: 0.97,
    },
    {
      term: 'Los Angeles Dodgers',
      translation: 'Los Angeles Dodgers (đội bóng chày)',
      cefrLevel: 'B1',
      entryType: 'PROPER_NOUN',
      partOfSpeech: 'proper noun',
      context: {
        original: 'the purchase of the Los Angeles Dodgers',
        translation: 'việc mua lại Los Angeles Dodgers',
        highlightedTerm: 'Los Angeles Dodgers',
      },
      confidence: 0.97,
    },
    {
      term: 'Major League Baseball',
      translation: 'Major League Baseball (giải bóng chày nhà nghề Mỹ)',
      cefrLevel: 'B1',
      entryType: 'PROPER_NOUN',
      partOfSpeech: 'proper noun',
      context: {
        original: 'one of the premier teams in Major League Baseball',
        translation: 'một trong những đội hàng đầu của Major League Baseball',
        highlightedTerm: 'Major League Baseball',
      },
      confidence: 0.97,
    },
    {
      term: 'Past Simple',
      translation: 'thì quá khứ đơn',
      cefrLevel: 'A2',
      entryType: 'SENTENCE_PATTERN',
      context: {
        original: 'Mark Walter stunned the sports world in 2012',
        translation: 'Mark Walter gây chấn động giới thể thao năm 2012',
        highlightedTerm: 'stunned',
      },
      grammarBreakdown: {
        structure: 'Subject + V-ed (past simple)',
        partsOfSpeech: [{ word: 'stunned', pos: 'verb', meaning: 'quá khứ của "stun"' }],
        explanation: 'Thì quá khứ đơn diễn tả hành động đã xảy ra và kết thúc trong quá khứ.',
        cefrLevel: 'A2',
      },
      confidence: 0.9,
    },
    {
      term: 'Past Perfect',
      translation: 'thì quá khứ hoàn thành',
      cefrLevel: 'B2',
      entryType: 'SENTENCE_PATTERN',
      context: {
        original: 'how ... had funded the purchase',
        translation: 'làm sao ... đã tài trợ cho việc mua',
        highlightedTerm: 'had funded',
      },
      grammarBreakdown: {
        structure: 'Subject + had + V-pp',
        partsOfSpeech: [{ word: 'had funded', pos: 'verb', meaning: 'đã tài trợ' }],
        explanation:
          'Quá khứ hoàn thành chỉ hành động xảy ra TRƯỚC một thời điểm trong quá khứ (thường đi kèm "wondered" — quá khứ đơn).',
        cefrLevel: 'B2',
      },
      confidence: 0.92,
    },
    {
      term: 'Defining Relative Clause',
      translation: 'mệnh đề quan hệ xác định',
      cefrLevel: 'B2',
      entryType: 'SENTENCE_PATTERN',
      context: {
        original: 'a deal that left his wealthy rivals wondering',
        translation: 'một thỏa thuận khiến các đối thủ giàu của anh ta thắc mắc',
        highlightedTerm: 'that left his wealthy rivals wondering',
      },
      grammarBreakdown: {
        structure: 'Noun + relative pronoun (that/which/who) + clause',
        partsOfSpeech: [{ word: 'that', pos: 'pronoun', meaning: 'đại từ quan hệ' }],
        explanation:
          'Mệnh đề quan hệ xác định bổ sung thông tin cần thiết cho danh từ đứng trước, không dùng dấu phẩy.',
        cefrLevel: 'B2',
      },
      confidence: 0.85,
    },
    {
      term: 'embedded noun clause',
      translation: 'mệnh đề danh từ lồng nhau (câu hỏi gián tiếp)',
      cefrLevel: 'C1',
      entryType: 'SENTENCE_PATTERN',
      context: {
        original: 'wondering how the chief executive ... had funded the purchase',
        translation: 'thắc mắc làm sao mà giám đốc điều hành ... đã tài trợ cho việc mua',
        highlightedTerm: 'how the chief executive ... had funded the purchase',
      },
      grammarBreakdown: {
        structure: 'verb + wh-word + subject + verb',
        partsOfSpeech: [{ word: 'how', pos: 'adverb', meaning: 'như thế nào' }],
        explanation:
          'Mệnh đề danh từ dạng câu hỏi gián tiếp đóng vai trò tân ngữ của "wonder".',
        cefrLevel: 'C1',
      },
      confidence: 0.83,
    },
    {
      term: 'reduced relative clause',
      translation: 'mệnh đề quan hệ rút gọn (participial adjective phrase)',
      cefrLevel: 'C1',
      entryType: 'SENTENCE_PATTERN',
      context: {
        original: 'the chief executive of Guggenheim Partners, little-known outside Wall Street',
        translation: 'giám đốc điều hành của Guggenheim Partners, ít được biết đến ngoài Wall Street',
        highlightedTerm: 'little-known outside Wall Street',
      },
      grammarBreakdown: {
        structure: 'Noun + past participle phrase',
        partsOfSpeech: [{ word: 'little-known', pos: 'adjective', meaning: 'ít được biết đến' }],
        explanation:
          'Cụm participial bổ sung thông tin cho "chief executive"; tương đương mệnh đề quan hệ "who is little-known outside Wall Street".',
        cefrLevel: 'C1',
      },
      confidence: 0.8,
    },
    {
      term: 'appositive noun phrase',
      translation: 'cụm danh từ đồng vị (appositive)',
      cefrLevel: 'C1',
      entryType: 'SENTENCE_PATTERN',
      context: {
        original: 'the Los Angeles Dodgers, one of the premier teams in Major League Baseball',
        translation: 'Los Angeles Dodgers, một trong những đội hàng đầu của Major League Baseball',
        highlightedTerm: 'one of the premier teams in Major League Baseball',
      },
      grammarBreakdown: {
        structure: 'Noun, + appositive',
        partsOfSpeech: [{ word: 'one of', pos: 'determiner', meaning: 'một trong' }],
        explanation:
          'Cụm appositive đứng sau danh từ, cách nhau bởi dấu phẩy, bổ sung thông tin để xác định lại danh từ đó.',
        cefrLevel: 'C1',
      },
      confidence: 0.78,
    },
  ],
};

describe('extractFromTextAI — full pipeline with Mark Walter fixture (mocked AI)', () => {
  let originalFetch: typeof fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('produces rich extraction that scores well on the golden fixture', async () => {
    globalThis.fetch = vi.fn(async (_url: Parameters<typeof fetch>[0]) => {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [
            {
              content: { parts: [{ text: JSON.stringify(MARK_WALTER_AI_FIXTURE) }] },
              finishReason: 'STOP',
            },
          ],
        }),
      } as Response;
    });

    const out = await extractFromTextAI(
      {
        text: MARK_WALTER_FIXTURE.text,
        targetCEFR: 'B2',
        sourceTitle: MARK_WALTER_FIXTURE.title,
      },
      [KEY],
    );

    expect(out.success).toBe(true);
    if (!out.success) return;

    expect(out.result.items.length).toBeGreaterThanOrEqual(15);
    expect(out.result.items.some((i) => i.entryType === 'PROPER_NOUN')).toBe(true);
    expect(out.result.items.some((i) => i.entryType === 'PHRASE')).toBe(true);
    expect(out.result.items.some((i) => i.entryType === 'SENTENCE_PATTERN')).toBe(true);

    // None should have 'Unknown' CEFR.
    expect(out.result.items.every((i) => i.cefrLevel !== ('Unknown' as any))).toBe(true);

    // No raw items named just "Mark" or "Walter" without rich fields.
    const mark = out.result.items.find((i) => i.term === 'Mark');
    expect(mark).toBeUndefined();
    const markWalter = out.result.items.find((i) => i.term === 'Mark Walter');
    expect(markWalter).toBeDefined();
    expect(markWalter!.translation).toBeTruthy();
    expect(markWalter!.cefrLevel).toBeTruthy();
    expect(markWalter!.context.original).toContain('Mark Walter');

    const score = scoreFixture(out.result.items, MARK_WALTER_FIXTURE);
    expect(score.overallRecall).toBeGreaterThanOrEqual(0.5);
    expect(score.vocabularyRecall).toBeGreaterThanOrEqual(0.6);
    expect(score.properNounRecall).toBeGreaterThanOrEqual(0.8);
    expect(score.grammarRecall).toBeGreaterThanOrEqual(0.5);
  });

  it('retries with corrective prompt on validation failure', async () => {
    let calls = 0;
    globalThis.fetch = vi.fn(async (_url: Parameters<typeof fetch>[0]) => {
      calls++;
      if (calls === 1) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            candidates: [
              {
                content: {
                  parts: [{ text: JSON.stringify({ items: [{ wrong: 'shape' }] }) }],
                },
              },
            ],
          }),
        } as Response;
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [
            {
              content: { parts: [{ text: JSON.stringify(MARK_WALTER_AI_FIXTURE) }] },
              finishReason: 'STOP',
            },
          ],
        }),
      } as Response;
    });

    const out = await extractFromTextAI(
      {
        text: MARK_WALTER_FIXTURE.text,
        targetCEFR: 'B2',
        sourceTitle: MARK_WALTER_FIXTURE.title,
      },
      [KEY],
    );
    expect(out.success).toBe(true);
    expect(calls).toBeGreaterThanOrEqual(2);
  });

  it('returns failure when input is empty', async () => {
    const out = await extractFromTextAI(
      { text: '   ', targetCEFR: 'B2', sourceTitle: 'empty' },
      [KEY],
    );
    expect(out.success).toBe(false);
    if (!out.success) {
      expect(out.cause).toBe('invalid-text');
    }
  });

  it('returns failure when input is too large', async () => {
    const out = await extractFromTextAI(
      {
        text: 'a'.repeat(70_000),
        targetCEFR: 'B2',
        sourceTitle: 'huge',
      },
      [KEY],
    );
    expect(out.success).toBe(false);
    if (!out.success) {
      expect(out.cause).toBe('invalid-text');
    }
  });

  it('returns failure when no keys are provided', async () => {
    const out = await extractFromTextAI(
      { text: 'Hello world.', targetCEFR: 'B2', sourceTitle: 'x' },
      [],
    );
    expect(out.success).toBe(false);
    if (!out.success) {
      expect(out.cause).toBe('no-keys');
    }
  });
});