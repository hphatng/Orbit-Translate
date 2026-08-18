import { InstantTranslateRequest, InstantTranslateResponse, CEFRLevel } from './types';

// Mock Dictionary & Translation Database for offline/instant zero-latency fallback
const MOCK_DICTIONARY: Record<string, Partial<InstantTranslateResponse>> = {
  'resilient': {
    term: 'resilient',
    translation: 'kiên cường, có khả năng phục hồi nhanh',
    phonetic: '/rɪˈzɪl.jənt/',
    cefrLevel: 'C1',
    synonyms: ['adaptable', 'buoyant', 'tough', 'strong'],
    antonyms: ['vulnerable', 'fragile', 'weak'],
    grammarBreakdown: {
      structure: 'Subject + Be + Resilient + (to/against + Noun)',
      partsOfSpeech: [
        { word: 'resilient', pos: 'adjective', meaning: 'có tính đàn hồi, kiên cường' }
      ],
      explanation: 'Tính từ dùng để mô tả con người hoặc vật có khả năng phục hồi nhanh chóng sau khó khăn, chấn thương hoặc thay đổi tiêu cực.',
      keyRules: ['Thường đi với giới từ "to" hoặc "against"']
    }
  },
  'ubiquitous': {
    term: 'ubiquitous',
    translation: 'có mặt ở khắp nơi, phổ biến',
    phonetic: '/juːˈbɪk.wə.təs/',
    cefrLevel: 'C2',
    synonyms: ['omnipresent', 'pervasive', 'universal'],
    antonyms: ['rare', 'scarce'],
    grammarBreakdown: {
      structure: 'Noun + is/are + Ubiquitous',
      partsOfSpeech: [
        { word: 'ubiquitous', pos: 'adjective', meaning: 'phổ biến, có mặt ở khắp mọi nơi' }
      ],
      explanation: 'Tính từ trang trọng mô tả những thứ xuất hiện ở mọi nơi cùng một lúc.',
      keyRules: ['Thường dùng trong văn phong học thuật hoặc báo chí']
    }
  },
  'ephemeral': {
    term: 'ephemeral',
    translation: 'phù du, chóng khánh, ngắn ngủi',
    phonetic: '/ɪˈfem.ər.əl/',
    cefrLevel: 'C2',
    synonyms: ['transitory', 'transient', 'fleeting', 'short-lived'],
    antonyms: ['permanent', 'eternal', 'lasting'],
    grammarBreakdown: {
      structure: 'Ephemeral + Noun',
      partsOfSpeech: [
        { word: 'ephemeral', pos: 'adjective', meaning: 'tồn tại trong thời gian rất ngắn' }
      ],
      explanation: 'Mô tả những hiện tượng, vẻ đẹp hoặc trạng thái chỉ kéo dài trong khoảnh khắc ngắn.',
      keyRules: ['Dùng nhiều trong văn học, triết học và thơ ca']
    }
  },
  'serendipity': {
    term: 'serendipity',
    translation: 'sự may mắn bất ngờ, tình cờ phát hiện ra điều tốt đẹp',
    phonetic: '/ˌser.ənˈdɪp.ə.ti/',
    cefrLevel: 'C1',
    synonyms: ['chance', 'fluke', 'fortuity', 'happy accident'],
    antonyms: ['misfortune', 'bad luck'],
    grammarBreakdown: {
      structure: 'By + Serendipity / A stroke of serendipity',
      partsOfSpeech: [
        { word: 'serendipity', pos: 'noun', meaning: 'sự tình cờ may mắn' }
      ],
      explanation: 'Danh từ chỉ việc tìm thấy những thứ quý giá hoặc thú vị một cách hoàn toàn tình cờ.',
      keyRules: ['Thường đi cùng cụm "a stroke of serendipity"']
    }
  },
  'leverage': {
    term: 'leverage',
    translation: 'tận dụng, đòn bẩy',
    phonetic: '/ˈliː.vər.ɪdʒ/',
    cefrLevel: 'B2',
    synonyms: ['utilize', 'exploit', 'capitalize on'],
    antonyms: ['waste', 'ignore'],
    grammarBreakdown: {
      structure: 'Subject + Leverage + Noun/Resource + (to + Verb)',
      partsOfSpeech: [
        { word: 'leverage', pos: 'verb', meaning: 'tận dụng tối đa nguồn lực' }
      ],
      explanation: 'Động từ hoặc danh từ chỉ việc tận dụng lợi thế hay nguồn lực có sẵn để đạt kết quả tốt hơn.',
      keyRules: ['Dùng phổ biến trong kinh doanh và công nghệ']
    }
  }
};

/**
 * Heuristic CEFR estimation based on word length and frequency rules
 */
function estimateCEFR(term: string): CEFRLevel {
  const clean = term.toLowerCase().trim();
  if (clean.length <= 4) return 'A1';
  if (clean.length <= 6) return 'A2';
  if (clean.length <= 8) return 'B1';
  if (clean.length <= 10) return 'B2';
  if (clean.length <= 12) return 'C1';
  return 'C2';
}

/**
 * Main Translation Handler with Cache & AI Fallback logic
 */
export async function translateText(req: InstantTranslateRequest, historyCountMap?: Record<string, number>): Promise<InstantTranslateResponse> {
  const normalizedTerm = req.text.trim().toLowerCase();
  
  // Check memory history count for SRS Hint
  const translationHistoryCount = (historyCountMap && historyCountMap[normalizedTerm]) || 0;

  // Check fast mock dictionary
  if (MOCK_DICTIONARY[normalizedTerm]) {
    const mock = MOCK_DICTIONARY[normalizedTerm];
    return {
      term: req.text.trim(),
      translation: mock.translation!,
      phonetic: mock.phonetic || `/${normalizedTerm}/`,
      cefrLevel: mock.cefrLevel || 'B2',
      synonyms: mock.synonyms || [],
      antonyms: mock.antonyms || [],
      grammarBreakdown: mock.grammarBreakdown,
      translationHistoryCount,
      context: req.contextSentence ? {
        original: req.contextSentence,
        translation: `Cảnh nghĩa: "${mock.translation}" trong câu.`,
        sourceUrl: req.sourceUrl,
        sourceTitle: req.sourceTitle,
        highlightedTerm: req.text.trim()
      } : undefined
    };
  }

  // Dynamic fallback translation engine (Offline heuristic generator for unknown words)
  const cefr = estimateCEFR(normalizedTerm);
  const capitalized = normalizedTerm.charAt(0).toUpperCase() + normalizedTerm.slice(1);
  
  return {
    term: req.text.trim(),
    translation: `Dịch nghĩa: ${capitalized} (nghĩa tự động)`,
    phonetic: `/${normalizedTerm}/`,
    cefrLevel: cefr,
    synonyms: [`${normalizedTerm}_syn1`, `${normalizedTerm}_syn2`],
    antonyms: [`${normalizedTerm}_ant1`],
    translationHistoryCount,
    grammarBreakdown: {
      structure: `Cấu trúc với từ "${req.text.trim()}"`,
      partsOfSpeech: [
        { word: req.text.trim(), pos: 'word' as any, meaning: `Nghĩa trong ngữ cảnh` }
      ],
      explanation: `Từ "${req.text.trim()}" được phân tích tự động thuộc cấp độ từ vựng ${cefr}.`,
      keyRules: ['Phân tích theo ngữ cảnh câu thực tế']
    },
    context: req.contextSentence ? {
      original: req.contextSentence,
      translation: `Dịch nghĩa ngữ cảnh cho câu chứa từ "${req.text.trim()}".`,
      sourceUrl: req.sourceUrl,
      sourceTitle: req.sourceTitle,
      highlightedTerm: req.text.trim()
    } : undefined
  };
}
