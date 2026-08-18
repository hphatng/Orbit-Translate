import nlp from 'compromise';
import { TokenizedWord } from './tokenizer';

export interface GrammarItem {
  term: string;
  translation: string;
  cefrLevel: string;
  partOfSpeech: null;
  entryType: 'GRAMMAR';
  context: {
    original: string;
    translation: string;
    highlightedTerm: string;
  };
  enrichment_status: 'pending' | 'done';
}

export function detectBasicGrammar(text: string, sentences: string[]): GrammarItem[] {
  const extracted: GrammarItem[] = [];
  const seenTerms = new Set<string>();
  const doc = nlp(text);

  const addMatch = (match: any, term: string, translation: string, cefrLevel: string) => {
    match.forEach((m: any) => {
      const highlighted = m.text();
      if (!highlighted) return;
      const dedupeKey = term + highlighted.toLowerCase();
      if (!seenTerms.has(dedupeKey)) {
        seenTerms.add(dedupeKey);
        // Find which sentence this belongs to
        const originalSentence = sentences.find(s => s.includes(highlighted)) || m.text();
        extracted.push({
          term,
          translation,
          cefrLevel,
          partOfSpeech: null,
          entryType: 'GRAMMAR',
          context: {
            original: originalSentence,
            translation: "Đang phân tích ngữ cảnh (AI)...",
            highlightedTerm: highlighted
          },
          enrichment_status: 'pending'
        });
      }
    });
  };

  // Passive Voice
  addMatch(
    doc.match('(is|are|was|were|be|been|being) #Adverb? #PastTense'),
    "Passive Voice",
    "Thể bị động",
    "B1"
  );

  // Present Perfect
  addMatch(
    doc.match('(has|have) #Adverb? #PastTense'),
    "Present Perfect",
    "Thì hiện tại hoàn thành",
    "B1"
  );

  // Conditionals (if)
  addMatch(
    doc.match('if [*] (will|would|could) [*]'), // Very basic matching
    "Conditional Clause",
    "Câu điều kiện",
    "B1"
  );

  // Relative Clauses
  addMatch(
    doc.match('(who|which|that|whose) #Verb'),
    "Relative Clause",
    "Mệnh đề quan hệ",
    "B2"
  );
  
  // Comparatives & Superlatives
  addMatch(
    doc.match('#Comparative'),
    "Comparative Adjective",
    "Tính từ so sánh hơn",
    "A2"
  );
  
  addMatch(
    doc.match('#Superlative'),
    "Superlative Adjective",
    "Tính từ so sánh nhất",
    "A2"
  );

  return extracted;
}
