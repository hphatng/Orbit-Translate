export type SRSState = 'new' | 'learning' | 'review' | 'relearning';

export interface SRSData {
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  repetitions: number;
  lapses: number;
  state: SRSState;
  nextReviewDate: string;
  retrievability: number;
}

export interface VocabularyItem {
  id: string;
  term: string;
  phonetic?: string;
  translation: string;
  cefrLevel?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  partOfSpeech?: string;
  exampleSentence?: string;
  exampleTranslation?: string;
  context?: string;
  grammarBreakdown?: string;
  tags?: string[];
  deckId?: string;
  srs?: SRSData;
  // Source tracking
  sourceType?: 'EXTENSION' | 'SCAN_EXTRACT' | 'DOCUMENT_TRANSLATE' | 'MANUAL';
  sourceUrl?: string;
  sourceTitle?: string;
  sourceContext?: string;
  lookupCount?: number;
  entryType?: 'WORD' | 'PHRASE' | 'COLLOCATION' | 'IDIOM' | 'SENTENCE_PATTERN' | 'GRAMMAR';
  normalizedText?: string;
  createdAt?: string;
  updatedAt?: string;
  /** @deprecated Use `srs` instead */
  fsrs?: {
    stability: number;
    difficulty: number;
    repetition: number;
    lapses: number;
    nextReviewDate: string;
  };
}

export interface Deck {
  id: string;
  title: string;
  description: string;
  folderId?: string;
  category: 'IELTS' | 'Tech & AI' | 'Business' | 'Scan AI' | 'Extension';
  totalWords: number;
  masteredWords: number;
  lastStudied?: string;
  color: string;
  iconName: string;
}

export interface Folder {
  id: string;
  name: string;
  icon?: string;
  deckIds?: string[];
  deckCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface GrammarExercise {
  id: string;
  sentence: string;
  translation: string;
  grammarPoint: string;
  explanation: string;
  options: string[];
  correctAnswer: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string;
  targetCefr: string;
  dailyGoal: number;
  streakDays: number;
  totalWordsLearned: number;
  masteryRate: number;
  bio?: string;
  occupation?: string;
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
  id: string;
  word: VocabularyItem;
  type: 'flashcard' | 'multiple_choice' | 'writing';
  options?: string[]; 
}
