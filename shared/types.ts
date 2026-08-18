export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'Unknown';

export type DifficultyRating = 'easy' | 'medium' | 'hard';

export type SRSState = 'new' | 'learning' | 'review' | 'relearning';

export interface SRSData {
  stability: number;       // S parameter in FSRS
  difficulty: number;      // D parameter in FSRS
  elapsedDays: number;     // Days since last review
  scheduledDays: number;   // Days until next review
  repetitions: number;     // Total successful repetitions
  lapses: number;          // Total times forgotten
  state: SRSState;
  nextReviewDate: string;  // ISO timestamp
  retrievability: number;  // Estimated memory retrievability (0 - 1.0)
}

export interface PartOfSpeechItem {
  word: string;
  pos: 'noun' | 'verb' | 'adjective' | 'adverb' | 'preposition' | 'conjunction' | 'pronoun' | 'interjection' | 'phrase' | 'other';
  meaning: string;
}

export interface GrammarBreakdown {
  structure: string;       // E.g., "Subject + Modal Verb + Main Verb"
  partsOfSpeech: PartOfSpeechItem[];
  explanation: string;     // Explanation in Vietnamese
  keyRules?: string[];
}

export interface ContextSentence {
  original: string;
  translation: string;
  sourceUrl?: string;
  sourceTitle?: string;
  highlightedTerm: string;
}

export interface VocabularyItem {
  id: string;
  userId: string;
  term: string;
  phonetic?: string;
  audioUrl?: string;
  translation: string;
  definitionEn?: string;
  cefrLevel: CEFRLevel;
  difficultyRating: DifficultyRating;
  tags: string[];
  context: ContextSentence;
  grammarBreakdown?: GrammarBreakdown;
  synonyms: string[];
  antonyms: string[];
  collocations: string[];
  translationCount: number; // Frequency translated by user (for Memory Hint)
  srs: SRSData;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  targetLanguage: 'vi' | 'en' | 'ja' | 'zh' | 'ko';
  autoPlayAudio: boolean;
  showIPA: boolean;
  showGrammarBreakdown: boolean;
  showMemoryHint: boolean;
  showCEFRLevel: boolean;
  theme: 'dark' | 'light' | 'system';
  quizletAutoCopyFormat: boolean;
}

export interface InstantTranslateRequest {
  text: string;
  contextSentence?: string;
  sourceUrl?: string;
  sourceTitle?: string;
  targetLang?: string;
}

export interface InstantTranslateResponse {
  term: string;
  translation: string;
  phonetic: string;
  audioUrl?: string;
  cefrLevel: CEFRLevel;
  context?: ContextSentence;
  grammarBreakdown?: GrammarBreakdown;
  synonyms: string[];
  antonyms: string[];
  translationHistoryCount: number; // For Spaced Repetition Hint in popup
}

export interface QuizletExportRow {
  term: string;
  definition: string;
}

export type PracticeModeType = 'flashcard' | 'quiz' | 'typing' | 'matching' | 'grammar' | 'mixed';

export interface PracticeSession {
  id: string;
  userId: string;
  mode: PracticeModeType;
  status: 'in_progress' | 'completed' | 'abandoned';
  score: number;
  totalQuestions: number;
  accuracyRate: number | null;
  createdAt: string;
  completedAt: string | null;
}

export interface PracticeHistory {
  id: string;
  sessionId: string;
  wordId: string;
  userId: string;
  questionType: string;
  isCorrect: boolean | null;
  timeTakenMs: number | null;
  createdAt: string;
}

export interface PracticeQuestion {
  id: string; // Unique id for the question in the session
  word: VocabularyItem;
  type: 'flashcard' | 'multiple_choice' | 'writing';
  options?: string[]; // For multiple choice distractors (including correct answer)
}
