/**
 * High-performance, zero-cost Google Translate client for document translation.
 * Translates multi-sentence documents, paragraphs, and chunks accurately into Vietnamese.
 */
export async function translateWithGoogle(text: string, targetLang = 'vi', sourceLang = 'auto'): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return '';

  const MAX_CHUNK_LENGTH = 1500;
  if (trimmed.length <= MAX_CHUNK_LENGTH) {
    return translateSingleChunk(trimmed, targetLang, sourceLang);
  }

  const paragraphs = trimmed.split(/\n+/);
  const translatedParagraphs: string[] = [];

  for (const para of paragraphs) {
    const trimmedPara = para.trim();
    if (!trimmedPara) {
      translatedParagraphs.push('');
      continue;
    }

    if (trimmedPara.length <= MAX_CHUNK_LENGTH) {
      const trans = await translateSingleChunk(trimmedPara, targetLang, sourceLang);
      translatedParagraphs.push(trans);
    } else {
      // Split long paragraph into sentence chunks
      const sentences = trimmedPara.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [trimmedPara];
      let currentChunk = '';
      const chunkTranslations: string[] = [];

      for (const sent of sentences) {
        if ((currentChunk + ' ' + sent).length <= MAX_CHUNK_LENGTH) {
          currentChunk = currentChunk ? `${currentChunk} ${sent}` : sent;
        } else {
          if (currentChunk) {
            chunkTranslations.push(await translateSingleChunk(currentChunk, targetLang, sourceLang));
          }
          currentChunk = sent;
        }
      }
      if (currentChunk) {
        chunkTranslations.push(await translateSingleChunk(currentChunk, targetLang, sourceLang));
      }
      translatedParagraphs.push(chunkTranslations.join(' '));
    }
  }

  return translatedParagraphs.join('\n\n');
}

async function translateSingleChunk(chunk: string, targetLang: string, sourceLang: string): Promise<string> {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(sourceLang)}&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(chunk)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
    });

    if (!res.ok) {
      console.warn(`[GoogleTranslate] HTTP ${res.status}`);
      return chunk;
    }

    const data = await res.json();
    if (Array.isArray(data) && Array.isArray(data[0])) {
      const translated = data[0]
        .map((segment: any) => (Array.isArray(segment) && segment[0] ? segment[0] : ''))
        .join('');
      return translated || chunk;
    }
    return chunk;
  } catch (err) {
    console.error('[GoogleTranslate] Error translating chunk:', err);
    return chunk;
  }
}
