/**
 * Benchmark the canonical extraction pipeline against the Mark Walter
 * golden fixture using a MOCKED AI response.
 *
 * Run via: npx vitest run src/__tests__/benchmarkFixture.test.ts
 *
 * This is a documentation/executable test that demonstrates the pipeline
 * produces the expected rich output rather than Mark -> Unknown.
 */
import { describe, it, expect } from 'vitest';
import { extractFromTextAI } from '@/lib/ai/extractFromTextAI';
import { MARK_WALTER_FIXTURE, scoreFixture } from '@/lib/ai/__fixtures__/markWalter';
import type { ApiKeyItem } from '@/lib/ai/AIClient';

const KEY: ApiKeyItem = { id: 'fixture-test', name: 'fixture-test', key: 'AIza-FIXT-FIXT-FIXT-fix' };

const MOCKED_AI_RESPONSE = {
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
        translation: 'Mark Walter gây chấn động giới thể thao năm 2012 với một thỏa thuận.',
        highlightedTerm: 'world',
      },
      synonyms: [], antonyms: [], collocations: ['sports world'], confidence: 0.95,
    },
    {
      term: 'deal',
      phonetic: '/diːl/',
      translation: 'thỏa thuận',
      cefrLevel: 'A2',
      partOfSpeech: 'noun',
      entryType: 'WORD',
      context: {
        original: 'a deal that left his wealthy rivals wondering',
        translation: 'một thỏa thuận khiến các đối thủ giàu của anh ta thắc mắc',
        highlightedTerm: 'deal',
      },
      synonyms: ['agreement'], antonyms: [], collocations: ['make a deal'], confidence: 0.92,
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
      synonyms: ['rich'], antonyms: ['poor'], collocations: [], confidence: 0.93,
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
      synonyms: ['opponent'], antonyms: ['ally'], collocations: [], confidence: 0.9,
    },
    {
      term: 'chief',
      phonetic: '/tʃiːf/',
      translation: 'trưởng',
      cefrLevel: 'A2',
      partOfSpeech: 'adjective',
      entryType: 'WORD',
      context: {
        original: 'the chief executive of Guggenheim Partners',
        translation: 'giám đốc điều hành của Guggenheim Partners',
        highlightedTerm: 'chief',
      },
      synonyms: [], antonyms: [], collocations: ['chief executive'], confidence: 0.85,
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
      synonyms: ['manager'], antonyms: [], collocations: ['chief executive'], confidence: 0.9,
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
      synonyms: ['buy'], antonyms: [], collocations: [], confidence: 0.92,
    },
    {
      term: 'fund',
      phonetic: '/fʌnd/',
      translation: 'tài trợ',
      cefrLevel: 'B1',
      partOfSpeech: 'verb',
      entryType: 'WORD',
      context: {
        original: 'had funded the purchase',
        translation: 'đã tài trợ cho việc mua',
        highlightedTerm: 'funded',
      },
      synonyms: [], antonyms: [], collocations: [], confidence: 0.88,
    },
    {
      term: 'stun',
      phonetic: '/stʌn/',
      translation: 'gây chấn động',
      cefrLevel: 'B2',
      partOfSpeech: 'verb',
      entryType: 'WORD',
      context: {
        original: 'Mark Walter stunned the sports world',
        translation: 'Mark Walter gây chấn động giới thể thao',
        highlightedTerm: 'stunned',
      },
      synonyms: ['astound'], antonyms: [], collocations: [], confidence: 0.93,
    },
    {
      term: 'premier',
      phonetic: '/prɪˈmɪr/',
      translation: 'hàng đầu',
      cefrLevel: 'B2',
      partOfSpeech: 'adjective',
      entryType: 'WORD',
      context: {
        original: 'one of the premier teams in Major League Baseball',
        translation: 'một trong những đội hàng đầu của Major League Baseball',
        highlightedTerm: 'premier',
      },
      synonyms: ['leading'], antonyms: [], collocations: [], confidence: 0.9,
    },
    { term: 'little-known', phonetic: '/ˌlɪt.əl ˈnoʊn/', translation: 'ít được biết đến', cefrLevel: 'B2', partOfSpeech: 'adjective', entryType: 'WORD', context: { original: 'little-known outside Wall Street', translation: 'ít được biết đến ngoài Wall Street', highlightedTerm: 'little-known' }, confidence: 0.88 },
    { term: 'sports world', translation: 'giới thể thao', cefrLevel: 'B1', entryType: 'PHRASE', context: { original: 'the sports world in 2012', translation: 'giới thể thao năm 2012', highlightedTerm: 'sports world' }, confidence: 0.95 },
    { term: 'chief executive', translation: 'giám đốc điều hành', cefrLevel: 'B1', entryType: 'PHRASE', context: { original: 'the chief executive of Guggenheim Partners', translation: 'giám đốc điều hành của Guggenheim Partners', highlightedTerm: 'chief executive' }, confidence: 0.96 },
    { term: 'fund the purchase', translation: 'tài trợ cho việc mua', cefrLevel: 'B2', entryType: 'PHRASE', context: { original: 'had funded the purchase', translation: 'đã tài trợ cho việc mua', highlightedTerm: 'funded the purchase' }, confidence: 0.85 },
    { term: 'leave + object + V-ing', translation: 'khiến ai/cái gì ở trạng thái nào đó', cefrLevel: 'B2', entryType: 'SENTENCE_PATTERN', context: { original: 'a deal that left his wealthy rivals wondering', translation: 'một thỏa thuận khiến các đối thủ giàu của anh ta thắc mắc', highlightedTerm: 'left his wealthy rivals wondering' }, grammarBreakdown: { structure: 'Subject + leave + Object + V-ing', partsOfSpeech: [{ word: 'leave', pos: 'verb', meaning: 'khiến' }], explanation: 'Cấu trúc leave + sb + V-ing', cefrLevel: 'B2' }, confidence: 0.92 },
    { term: 'Mark Walter', translation: 'Mark Walter (tên người)', cefrLevel: 'B1', entryType: 'PROPER_NOUN', partOfSpeech: 'proper noun', context: { original: 'Mark Walter stunned the sports world', translation: 'Mark Walter gây chấn động giới thể thao', highlightedTerm: 'Mark Walter' }, confidence: 0.98 },
    { term: 'Guggenheim Partners', translation: 'Guggenheim Partners (công ty)', cefrLevel: 'B1', entryType: 'PROPER_NOUN', partOfSpeech: 'proper noun', context: { original: 'the chief executive of Guggenheim Partners', translation: 'giám đốc điều hành của Guggenheim Partners', highlightedTerm: 'Guggenheim Partners' }, confidence: 0.97 },
    { term: 'Wall Street', translation: 'Wall Street', cefrLevel: 'A2', entryType: 'PROPER_NOUN', partOfSpeech: 'proper noun', context: { original: 'little-known outside Wall Street', translation: 'ít được biết đến ngoài Wall Street', highlightedTerm: 'Wall Street' }, confidence: 0.97 },
    { term: 'Los Angeles Dodgers', translation: 'Los Angeles Dodgers (đội bóng chày)', cefrLevel: 'B1', entryType: 'PROPER_NOUN', partOfSpeech: 'proper noun', context: { original: 'the purchase of the Los Angeles Dodgers', translation: 'việc mua lại Los Angeles Dodgers', highlightedTerm: 'Los Angeles Dodgers' }, confidence: 0.97 },
    { term: 'Major League Baseball', translation: 'Major League Baseball (giải bóng chày)', cefrLevel: 'B1', entryType: 'PROPER_NOUN', partOfSpeech: 'proper noun', context: { original: 'one of the premier teams in Major League Baseball', translation: 'một trong những đội hàng đầu của Major League Baseball', highlightedTerm: 'Major League Baseball' }, confidence: 0.97 },
    { term: 'Past Simple', translation: 'thì quá khứ đơn', cefrLevel: 'A2', entryType: 'GRAMMAR', context: { original: 'Mark Walter stunned the sports world', translation: 'Mark Walter gây chấn động giới thể thao', highlightedTerm: 'stunned' }, grammarBreakdown: { structure: 'Subject + V-ed', partsOfSpeech: [{ word: 'stunned', pos: 'verb', meaning: 'quá khứ của stun' }], explanation: 'Thì quá khứ đơn', cefrLevel: 'A2' }, confidence: 0.9 },
    { term: 'Past Perfect', translation: 'thì quá khứ hoàn thành', cefrLevel: 'B2', entryType: 'GRAMMAR', context: { original: 'how ... had funded the purchase', translation: 'làm sao ... đã tài trợ', highlightedTerm: 'had funded' }, grammarBreakdown: { structure: 'Subject + had + V-pp', partsOfSpeech: [], explanation: 'Quá khứ hoàn thành', cefrLevel: 'B2' }, confidence: 0.92 },
    { term: 'Defining Relative Clause', translation: 'mệnh đề quan hệ xác định', cefrLevel: 'B2', entryType: 'GRAMMAR', context: { original: 'a deal that left his wealthy rivals wondering', translation: 'một thỏa thuận khiến các đối thủ giàu của anh ta thắc mắc', highlightedTerm: 'that left his wealthy rivals wondering' }, grammarBreakdown: { structure: 'Noun + that + clause', partsOfSpeech: [], explanation: 'Mệnh đề quan hệ xác định', cefrLevel: 'B2' }, confidence: 0.85 },
    { term: 'embedded noun clause', translation: 'mệnh đề danh từ lồng nhau', cefrLevel: 'C1', entryType: 'GRAMMAR', context: { original: 'wondering how the chief executive ... had funded', translation: 'thắc mắc làm sao mà giám đốc điều hành ... đã tài trợ', highlightedTerm: 'how the chief executive ... had funded' }, grammarBreakdown: { structure: 'verb + wh-word + clause', partsOfSpeech: [], explanation: 'Mệnh đề danh từ dạng câu hỏi gián tiếp', cefrLevel: 'C1' }, confidence: 0.83 },
    { term: 'reduced relative clause', translation: 'mệnh đề quan hệ rút gọn', cefrLevel: 'C1', entryType: 'GRAMMAR', context: { original: 'the chief executive ..., little-known outside Wall Street', translation: 'giám đốc điều hành ..., ít được biết đến ngoài Wall Street', highlightedTerm: 'little-known outside Wall Street' }, grammarBreakdown: { structure: 'Noun + past participle', partsOfSpeech: [], explanation: 'Cụm participial bổ sung thông tin', cefrLevel: 'C1' }, confidence: 0.8 },
    { term: 'appositive noun phrase', translation: 'cụm danh từ đồng vị', cefrLevel: 'C1', entryType: 'GRAMMAR', context: { original: 'the Los Angeles Dodgers, one of the premier teams', translation: 'Los Angeles Dodgers, một trong những đội hàng đầu', highlightedTerm: 'one of the premier teams in Major League Baseball' }, grammarBreakdown: { structure: 'Noun, + appositive', partsOfSpeech: [], explanation: 'Cụm appositive', cefrLevel: 'C1' }, confidence: 0.78 },
  ],
};

describe('Mark Walter Benchmark', () => {
  it('produces rich extraction (no Mark -> Unknown output)', async () => {
    const vi = (await import('vitest')).vi;
    globalThis.fetch = vi.fn(async (_url: Parameters<typeof fetch>[0]) => ({
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [
          { content: { parts: [{ text: JSON.stringify(MOCKED_AI_RESPONSE) }] }, finishReason: 'STOP' },
        ],
      }),
    })) as unknown as typeof fetch;

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

    // No "Unknown" CEFR values.
    const anyUnknown = out.result.items.some((i) => i.cefrLevel === ('Unknown' as any));
    expect(anyUnknown).toBe(false);

    // No bare "Mark" or "Walter" items (they should be merged into "Mark Walter").
    const bareMark = out.result.items.find((i) => i.term === 'Mark');
    const bareWalter = out.result.items.find((i) => i.term === 'Walter');
    expect(bareMark).toBeUndefined();
    expect(bareWalter).toBeUndefined();

    // Score against the golden fixture.
    const score = scoreFixture(out.result.items, MARK_WALTER_FIXTURE);

    console.log('\n[BENCHMARK RESULTS]');
    console.log('  Total items extracted:', out.result.items.length);
    console.log('  Expected items:', MARK_WALTER_FIXTURE.expected.length);
    console.log('  Matched items:', score.matched);
    console.log('  Overall recall:', (score.overallRecall * 100).toFixed(1) + '%');
    console.log('  Vocabulary recall:', (score.vocabularyRecall * 100).toFixed(1) + '%');
    console.log('  Phrase recall:', (score.phraseRecall * 100).toFixed(1) + '%');
    console.log('  Grammar recall:', (score.grammarRecall * 100).toFixed(1) + '%');
    console.log('  Proper-noun recall:', (score.properNounRecall * 100).toFixed(1) + '%');
    console.log('  Field completeness:', (score.completenessRatio * 100).toFixed(1) + '%');
    console.log('  Invalid CEFR:', score.invalidCEFR);
    if (score.missedTerms.length > 0) {
      console.log('  Missed:', score.missedTerms.map((m) => `${m.entryType} "${m.term}"`).join(', '));
    }

    // Hard assertions on the broken legacy behavior.
    expect(score.overallRecall).toBeGreaterThanOrEqual(0.7);
    expect(score.properNounRecall).toBeGreaterThanOrEqual(0.8);
    expect(score.vocabularyRecall).toBeGreaterThanOrEqual(0.6);
    expect(score.completenessRatio).toBeGreaterThanOrEqual(0.9);
  });
});
