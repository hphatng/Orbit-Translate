/**
 * Simple chunking utility for long documents.
 * Splitting by paragraphs or sentences while keeping the chunk size under a certain limit.
 */
export function chunkText(text: string, maxChunkLength: number = 4000): string[] {
  const chunks: string[] = [];
  
  // Basic split by double newline (paragraphs)
  const paragraphs = text.split(/\n\s*\n/);
  
  let currentChunk = '';
  
  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length > maxChunkLength) {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }
      
      // If a single paragraph is longer than the max chunk length, split by sentence
      if (paragraph.length > maxChunkLength) {
        const sentences = paragraph.split(/(?<=[.?!])\s+/);
        for (const sentence of sentences) {
          if (currentChunk.length + sentence.length > maxChunkLength) {
            if (currentChunk.length > 0) {
              chunks.push(currentChunk.trim());
            }
            currentChunk = sentence;
          } else {
            currentChunk += (currentChunk ? ' ' : '') + sentence;
          }
        }
      } else {
        currentChunk = paragraph;
      }
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }
  
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

/**
 * Smarter chunking strictly by sentence boundaries for NLP tasks.
 * Avoids breaking mid-sentence, aiming for approx targetLength characters per chunk.
 */
export function chunkBySentences(text: string, targetLength: number = 1500): string[] {
  // Normalize whitespace
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) return [];

  // Match sentences ending with ., !, or ? followed by a space or end of string.
  // This is a naive regex but works fairly well for standard English/Vietnamese text.
  // Note: Doesn't handle abbreviations perfectly (e.g. "Mr. Smith"), but acceptable for this use case.
  const sentences = normalized.match(/[^.!?]+[.!?]+(?:\s+|$)/g) || [normalized];
  
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > targetLength && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += sentence;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}
