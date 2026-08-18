// Dictionary API Fallback

export interface DictionaryResult {
  word: string;
  definition: string;
  example: string | null;
  partOfSpeech: string;
}

export async function lookupDictionary(word: string): Promise<DictionaryResult | null> {
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    if (!res.ok) return null;
    
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    const entry = data[0];
    
    // Find the first meaningful definition with an example
    for (const meaning of entry.meanings || []) {
      const pos = meaning.partOfSpeech;
      for (const def of meaning.definitions || []) {
        if (def.example) {
          return {
            word: entry.word,
            definition: def.definition,
            example: def.example,
            partOfSpeech: pos
          };
        }
      }
    }

    // Fallback: Return definition without example
    if (entry.meanings?.[0]?.definitions?.[0]) {
      return {
        word: entry.word,
        definition: entry.meanings[0].definitions[0].definition,
        example: null,
        partOfSpeech: entry.meanings[0].partOfSpeech
      };
    }

    return null;
  } catch (error) {
    console.error(`Dictionary lookup failed for ${word}`, error);
    return null;
  }
}
