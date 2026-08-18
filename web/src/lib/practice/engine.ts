import { VocabularyItem, PracticeQuestion, PracticeModeType } from '@/lib/types';

/**
 * Checks if a vocabulary item is eligible for Flashcard practice.
 */
export function isEligibleForFlashcard(word: VocabularyItem): boolean {
  return !!word.term && !!word.translation;
}

/**
 * Checks if a vocabulary item is eligible for Multiple Choice (Quiz) practice.
 */
export function isEligibleForMultipleChoice(word: VocabularyItem): boolean {
  return !!word.term && !!word.translation;
}

/**
 * Checks if a vocabulary item is eligible for Writing (Typing) practice.
 */
export function isEligibleForWriting(word: VocabularyItem): boolean {
  return !!word.term && !!word.translation;
}

/**
 * Normalizes text for writing evaluation (lowercases, removes punctuation, trims spaces).
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '') // Remove punctuation
    .replace(/\s{2,}/g, ' ') // Replace multiple spaces with a single space
    .trim();
}

/**
 * Evaluates the user's answer against the correct answer for writing mode.
 */
export function evaluateWritingAnswer(userAnswer: string, correctAnswer: string): 'correct' | 'incorrect' | 'almost' {
  const normalizedUser = normalizeText(userAnswer);
  const normalizedCorrect = normalizeText(correctAnswer);

  if (normalizedUser === normalizedCorrect) {
    return 'correct';
  }

  // Simple 'almost' detection (Levenshtein distance could be used here for better accuracy,
  // but for MVP we check if it's a substring or off by a little length)
  if (normalizedUser.length > 3 && normalizedCorrect.length > 3) {
      if (normalizedCorrect.includes(normalizedUser) || normalizedUser.includes(normalizedCorrect)) {
          return 'almost';
      }
      
      // Check if off by just one char in length and has high overlap
      if (Math.abs(normalizedUser.length - normalizedCorrect.length) <= 2) {
         // simple heuristic for typo
         let matchCount = 0;
         for (let i = 0; i < Math.min(normalizedUser.length, normalizedCorrect.length); i++) {
             if (normalizedUser[i] === normalizedCorrect[i]) matchCount++;
         }
         if (matchCount >= Math.max(normalizedUser.length, normalizedCorrect.length) - 2) {
             return 'almost';
         }
      }
  }

  return 'incorrect';
}

/**
 * Generates deterministic distractors for a multiple choice question.
 * Selects 3 random incorrect options from the provided pool of words.
 */
export function generateDistractors(correctWord: VocabularyItem, pool: VocabularyItem[]): string[] {
  // Filter out the correct word
  let candidates = pool.filter(w => w.id !== correctWord.id);

  // Try to find distractors with the same part of speech or CEFR level first
  let strongCandidates = candidates.filter(w => 
    (w.cefrLevel === correctWord.cefrLevel) ||
    (w.partOfSpeech === correctWord.partOfSpeech)
  );

  // If not enough strong candidates, fallback to all candidates
  if (strongCandidates.length < 3) {
    strongCandidates = candidates;
  }

  // Shuffle candidates
  const shuffled = strongCandidates.sort(() => 0.5 - Math.random());

  // Pick top 3
  const distractors = shuffled.slice(0, 3).map(w => w.translation);

  // If we still don't have 3, use generic fallback distractors instead of "Lựa chọn sai"
  const fallbackDistractors = [
    'tài liệu', 'phân tích', 'nghiên cứu', 'khám phá', 'phát triển', 'ứng dụng', 'cấu trúc', 'kết quả',
    'phương pháp', 'thiết kế', 'giải pháp', 'tiến trình', 'thực nghiệm', 'lý thuyết', 'khoa học', 'hệ thống',
    'báo cáo', 'đánh giá', 'mô hình', 'chiến lược'
  ];
  
  let fallbackIndex = Math.floor(Math.random() * fallbackDistractors.length);
  while (distractors.length < 3) {
      const fallback = fallbackDistractors[fallbackIndex % fallbackDistractors.length];
      if (!distractors.includes(fallback) && fallback !== correctWord.translation) {
        distractors.push(fallback);
      }
      fallbackIndex++;
  }

  // Add the correct answer
  const options = [...distractors, correctWord.translation];

  // Shuffle final options
  return options.sort(() => 0.5 - Math.random());
}

/**
 * Converts vocabulary items with example sentences into Grammar Exercises on the fly
 */
export function generateGrammarExercises(pool: VocabularyItem[]): any[] {
  const exercises: any[] = [];
  
  // Filter words that have example sentences
  const validWords = pool.filter(w => w.exampleSentence && w.exampleSentence.length > 5);
  
  validWords.forEach(word => {
    if (!word.exampleSentence) return;
    
    // Generate distractors for the TERM instead of translation
    let candidates = pool.filter(w => w.id !== word.id);
    let distractors = candidates
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(w => w.term);
      
    // Fallback if not enough words
    const fallbackTerms = ['however', 'moreover', 'therefore', 'consequently', 'subsequently', 'furthermore', 'nevertheless', 'otherwise', 'instead'];
    let fallbackIndex = Math.floor(Math.random() * fallbackTerms.length);
    while (distractors.length < 3) {
        const fallback = fallbackTerms[fallbackIndex % fallbackTerms.length];
        if (!distractors.includes(fallback) && fallback !== word.term) {
          distractors.push(fallback);
        }
        fallbackIndex++;
    }
    
    const options = [...distractors, word.term].sort(() => 0.5 - Math.random());
    
    // Create blank by replacing the word (case insensitive)
    const regex = new RegExp(`\\b${word.term}\\b`, 'gi');
    let sentenceWithBlank = word.exampleSentence.replace(regex, '______');
    
    // If the regex didn't match (e.g. word is conjugated), just fall back to replacing any occurrence
    if (sentenceWithBlank === word.exampleSentence) {
      const fallbackRegex = new RegExp(word.term, 'gi');
      sentenceWithBlank = word.exampleSentence.replace(fallbackRegex, '______');
    }
    
    // If STILL no match, just put the blank at the end (edge case)
    if (sentenceWithBlank === word.exampleSentence) {
      sentenceWithBlank = word.exampleSentence + ' (______)';
    }
    
    let explanation = `Correct meaning: ${word.translation}`;
    if (word.grammarBreakdown) {
      try {
        const parsed = JSON.parse(word.grammarBreakdown);
        explanation = parsed.explanation || explanation;
      } catch (e) {
        explanation = word.grammarBreakdown;
      }
    }

    exercises.push({
      id: `grammar_${word.id}`,
      grammarPoint: `Contextual Usage: ${word.cefrLevel || 'B2'}`,
      sentence: sentenceWithBlank,
      options: options,
      correctAnswer: word.term,
      translation: word.exampleTranslation || '',
      explanation: explanation,
    });
  });
  
  return exercises.sort(() => 0.5 - Math.random()).slice(0, 10);
}

/**
 * Generates a sequence of practice questions for a given session mode.
 */
export function generatePracticeSequence(
  words: VocabularyItem[], 
  mode: PracticeModeType
): PracticeQuestion[] {
  const sequence: PracticeQuestion[] = [];
  
  // Shuffle words for this session
  const shuffledWords = [...words].sort(() => 0.5 - Math.random());

  shuffledWords.forEach(word => {
    let questionType: PracticeQuestion['type'] = 'flashcard';

    if (mode === 'quiz' && isEligibleForMultipleChoice(word)) {
      questionType = 'multiple_choice';
    } else if (mode === 'typing' && isEligibleForWriting(word)) {
      questionType = 'writing';
    } else if (mode === 'mixed') {
       // Randomly pick a mode it is eligible for
       const eligibleTypes: PracticeQuestion['type'][] = [];
       if (isEligibleForFlashcard(word)) eligibleTypes.push('flashcard');
       if (isEligibleForMultipleChoice(word)) eligibleTypes.push('multiple_choice');
       if (isEligibleForWriting(word)) eligibleTypes.push('writing');
       
       if (eligibleTypes.length > 0) {
           questionType = eligibleTypes[Math.floor(Math.random() * eligibleTypes.length)];
       }
    }

    const question: PracticeQuestion = {
      id: crypto.randomUUID(),
      word,
      type: questionType,
    };

    if (questionType === 'multiple_choice') {
       question.options = generateDistractors(word, words);
    }

    sequence.push(question);
  });

  return sequence;
}
