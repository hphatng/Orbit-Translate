'use server';

import { createClient } from '@/lib/supabase/server';
import { PracticeSession, PracticeHistory, PracticeModeType, VocabularyItem, PracticeQuestion } from '@/lib/types';
import { scheduleReview, Rating } from '@/../../shared/fsrs';
import { SRSData } from '@/lib/types';

/**
 * Fetches practice items (due for review first, then new, up to a limit).
 */
export async function fetchPracticeItems(limit = 20): Promise<{ words: VocabularyItem[], error: string | null }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { words: [], error: 'Unauthorized' };
    }
    
    // Fetch items where next_review_at is in the past (Due for review)
    // and some new items if limit is not reached
    const { data: wordsData, error } = await supabase
      .from('words')
      .select('*')
      .eq('user_id', user.id)
      .order('next_review_at', { ascending: true }) // Oldest review dates first
      .limit(limit);

    if (error) {
      console.error('Error fetching practice items:', error);
      return { words: [], error: error.message };
    }

    // Map database shape to our VocabularyItem type (assuming basic mapping here)
    // The actual mapping might be more complex depending on exact DB schema
    const mappedWords: VocabularyItem[] = wordsData.map(w => ({
      id: w.id,
      userId: w.user_id,
      term: w.term,
      phonetic: w.phonetic,
      translation: w.translation,
      cefrLevel: w.cefr_level as any,
      partOfSpeech: w.part_of_speech || '',
      exampleSentence: w.example_sentence || '',
      exampleTranslation: w.example_translation || '',
      context: w.context_text || '',
      grammarBreakdown: w.grammar_breakdown || '',
      tags: w.tags || [],
      srs: w.fsrs_state ? {
        stability: w.fsrs_state.stability || 0.4,
        difficulty: w.fsrs_state.difficulty || 5.0,
        elapsedDays: 0,
        scheduledDays: 0,
        repetitions: w.fsrs_state.repetition || 0,
        lapses: w.fsrs_state.lapses || 0,
        state: w.fsrs_state.state === 0 ? 'new' : w.fsrs_state.state === 1 ? 'learning' : w.fsrs_state.state === 2 ? 'review' : 'relearning',
        nextReviewDate: w.fsrs_state.nextReviewDate || new Date().toISOString(),
        retrievability: 1.0,
      } : {
        stability: 0, difficulty: 0, elapsedDays: 0, scheduledDays: 0, 
        repetitions: 0, lapses: 0, state: 'new', nextReviewDate: new Date().toISOString(), retrievability: 1.0
      },
      createdAt: w.created_at,
      updatedAt: w.updated_at,
    }));

    return { words: mappedWords, error: null };
  } catch (err: any) {
    return { words: [], error: err.message || 'Unknown error' };
  }
}

/**
 * Creates a new practice session in the database.
 */
export async function createPracticeSession(mode: PracticeModeType, totalQuestions: number): Promise<{ sessionId: string | null, error: string | null }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { sessionId: null, error: 'Unauthorized' };
    }

    const { data, error } = await supabase
      .from('practice_sessions')
      .insert({
        user_id: user.id,
        mode,
        status: 'in_progress',
        total_questions: totalQuestions,
      })
      .select('id')
      .single();

    if (error) {
      if (error.code !== '42P01') {
        console.error('Error creating practice session:', error);
      }
      return { sessionId: null, error: error.message };
    }

    return { sessionId: data.id, error: null };
  } catch (err: any) {
    return { sessionId: null, error: err.message || 'Unknown error' };
  }
}

/**
 * Completes a practice session.
 */
export async function completePracticeSession(sessionId: string, score: number, accuracyRate: number): Promise<{ success: boolean, error: string | null }> {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('practice_sessions')
      .update({
        status: 'completed',
        score,
        accuracy_rate: accuracyRate,
        completed_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    if (error) {
      console.error('Error completing practice session:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unknown error' };
  }
}

/**
 * Submits a review result: updates FSRS state on the word and logs history.
 */
export async function submitReviewResult(
  sessionId: string | null,
  wordId: string,
  questionType: string,
  isCorrect: boolean | null,
  rating: Rating,
  currentSrsData: SRSData,
  timeTakenMs: number | null
): Promise<{ success: boolean, newSrsData?: SRSData, error: string | null }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // 1. Calculate new FSRS state
    const newSrsData = scheduleReview(currentSrsData, rating);

    // If wordId is not a valid UUID (e.g., 'ext_v6' from mock data), we don't try to save it to Supabase
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(wordId);
    if (!isUuid) {
      return { success: true, newSrsData, error: null };
    }

    // 2. Update word in DB
    const { error: updateError } = await supabase
      .from('words')
      .update({
        fsrs_state: newSrsData as any,
        next_review_at: newSrsData.nextReviewDate,
        updated_at: newSrsData.nextReviewDate // or now()
      })
      .eq('id', wordId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating word FSRS state:', updateError);
      return { success: false, error: updateError.message };
    }

    // 3. Insert History Log (only if sessionId is provided)
    if (sessionId) {
      const { error: historyError } = await supabase
        .from('practice_history')
        .insert({
          session_id: sessionId,
          word_id: wordId,
          user_id: user.id,
          question_type: questionType,
          is_correct: isCorrect,
          time_taken_ms: timeTakenMs
        });

      if (historyError) {
        console.error('Error inserting practice history:', historyError);
        // We don't fail the whole operation if history insert fails, but we log it.
      }
    }

    return { success: true, newSrsData, error: null };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unknown error' };
  }
}
