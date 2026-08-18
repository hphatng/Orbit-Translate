import { tokenizeAndTag } from './tokenizer';
import { detectBasicGrammar } from './grammar-patterns';

export async function extractFromTextCore(text: string, supabase: any) {
  const { sentences, words } = tokenizeAndTag(text);
  const extractedItems: any[] = [];
  const seenTerms = new Set<string>();

  // 1. Grammar Detection (Rule-based)
  const grammarItems = detectBasicGrammar(text, sentences);
  extractedItems.push(...grammarItems);
  grammarItems.forEach(g => seenTerms.add(g.term + g.context.highlightedTerm.toLowerCase()));

  // 2. Phrase / Collocation match (To be expanded)
  // E.g., we could use compromise to find #Adjective #Noun, etc.
  
  // 3. Vocabulary Extraction
  const wordList = words.filter(w => ['noun', 'verb', 'adjective', 'adverb'].includes(w.pos) && w.normalized && w.normalized.length > 2);
  const uniqueNormalized = Array.from(new Set(wordList.map(w => w.normalized)));

  // Lookup CEFR in batch
  const { data: cefrData } = await supabase
    .from('cefr_wordlist')
    .select('word, cefr_level')
    .in('word', uniqueNormalized);
  
  const cefrMap = new Map();
  if (cefrData) {
    cefrData.forEach((row: any) => cefrMap.set(row.word.toLowerCase(), row.cefr_level));
  }

  for (const w of wordList) {
    if (seenTerms.has(w.normalized)) continue;
    seenTerms.add(w.normalized);

    const level = cefrMap.get(w.normalized) || "Unknown";
    // For MVP, filter out low level A1 explicitly. Unknown words are kept for AI enrichment.
    if (level === 'A1') continue;

    const originalSentence = sentences[w.sentenceIndex];
    
    extractedItems.push({
      term: w.word,
      translation: "Đang phân tích ngữ cảnh (AI)...",
      cefrLevel: level,
      partOfSpeech: w.pos,
      entryType: "WORD",
      context: {
        original: originalSentence,
        translation: "Đang phân tích ngữ cảnh (AI)...",
        highlightedTerm: w.word
      },
      enrichment_status: 'pending'
    });
  }

  // Deduplicate and return
  return extractedItems;
}
