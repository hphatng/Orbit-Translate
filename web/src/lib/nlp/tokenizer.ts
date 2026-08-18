import nlp from 'compromise';

export interface TokenizedWord {
  word: string;
  normalized: string;
  pos: string;
  sentenceIndex: number;
}

export function tokenizeAndTag(text: string): { sentences: string[]; words: TokenizedWord[] } {
  const doc = nlp(text);
  const sentences = doc.sentences().out('array');
  const words: TokenizedWord[] = [];

  let sIdx = 0;
  doc.sentences().forEach((s: any) => {
    // compromise uses terms() to get individual words with their tags
    s.terms().json().forEach((termObj: any) => {
      const termText = termObj.text;
      const termNormal = termObj.terms && termObj.terms.length > 0 
        ? termObj.terms.map((t: any) => t.normal).join(' ') 
        : termText.toLowerCase();
      const tags = termObj.terms[0]?.tags || [];

      let pos = 'unknown';
      if (tags.includes('Noun')) pos = 'noun';
      else if (tags.includes('Verb')) pos = 'verb';
      else if (tags.includes('Adjective')) pos = 'adjective';
      else if (tags.includes('Adverb')) pos = 'adverb';
      else if (tags.includes('Preposition')) pos = 'preposition';
      else if (tags.includes('Conjunction')) pos = 'conjunction';
      else if (tags.includes('Pronoun')) pos = 'pronoun';
      else if (tags.includes('Determiner')) pos = 'determiner';

      words.push({
        word: termText.trim(),
        normalized: termNormal,
        pos,
        sentenceIndex: sIdx,
      });
    });
    sIdx++;
  });

  return { sentences, words };
}
