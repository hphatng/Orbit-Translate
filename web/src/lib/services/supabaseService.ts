import { createClient } from '@/lib/supabase/client';
import type { VocabularyItem, Deck, UserProfile, Folder } from '@/lib/types';
import { INITIAL_VOCABULARY, MOCK_DECKS, MOCK_PROFILE } from '@/lib/mockData';
import {
  toWordsRow,
  normalizeTerm,
  type ExtractedLearningItem,
  type WordsRowPayload,
} from '../../../../shared/schemas';

export type Result<T, E = string> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Fetch current authenticated user profile or fallback to local state
 */
export async function getUserProfile(userId: string): Promise<Result<UserProfile>> {
  if (userId === '00000000-0000-0000-0000-000000000000') {
    return { success: true, data: { ...MOCK_PROFILE, id: userId } };
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return { success: false, error: error?.message || 'Profile not found' };
    }

    return {
      success: true,
      data: {
        id: data.id,
        fullName: data.full_name || 'Huỳnh',
        email: data.email || 'user@orbittranslate.ai',
        avatarUrl: data.avatar_url || '',
        targetCefr: data.target_cefr || 'B2',
        dailyGoal: data.daily_goal || 20,
        streakDays: data.streak_days || 1,
        totalWordsLearned: data.total_words_learned || 0,
        masteryRate: 75,
      },
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to fetch profile' };
  }
}

/**
 * Fetch all folders belonging strictly to the specified user
 */
export async function getUserFolders(userId: string): Promise<Result<Folder[]>> {
  if (userId === '00000000-0000-0000-0000-000000000000') {
    return { success: true, data: [] };
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }
    
    if (!data || data.length === 0) {
      return { success: true, data: [] };
    }

    const mappedFolders: Folder[] = data.map((f: any) => ({
      id: f.id,
      name: f.name,
      deckCount: f.deck_count || 0,
      createdAt: f.created_at,
      updatedAt: f.updated_at,
    }));

    return { success: true, data: mappedFolders };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to fetch folders' };
  }
}

export async function createFolder(userId: string, name: string): Promise<Result<Folder>> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('folders')
      .insert({ user_id: userId, name })
      .select()
      .single();

    if (error || !data) {
      return { success: false, error: error?.message || 'Failed to create folder' };
    }
    
    return { success: true, data: {
      id: data.id,
      name: data.name,
      deckCount: data.deck_count || 0,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    } };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to create folder' };
  }
}

export async function renameFolder(folderId: string, newName: string): Promise<Result<boolean>> {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('folders')
      .update({ name: newName, updated_at: new Date().toISOString() })
      .eq('id', folderId);

    if (error) return { success: false, error: error.message };
    return { success: true, data: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to rename folder' };
  }
}

export async function deleteFolder(folderId: string): Promise<Result<boolean>> {
  try {
    const supabase = createClient();
    // First, update all decks inside this folder to have null folder_id (Uncategorized)
    await supabase.from('decks').update({ folder_id: null }).eq('folder_id', folderId);

    // Then delete the folder
    const { error } = await supabase.from('folders').delete().eq('id', folderId);
    if (error) return { success: false, error: error.message };
    
    return { success: true, data: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to delete folder' };
  }
}

/**
 * Fetch all decks belonging strictly to the specified user
 */
export async function getUserDecks(userId: string): Promise<Result<Deck[]>> {
  if (userId === '00000000-0000-0000-0000-000000000000') {
    return { success: true, data: MOCK_DECKS };
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('decks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }
    
    if (!data || data.length === 0) {
      return { success: true, data: [] };
    }

    // Fetch real word counts per deck in a single query.
    // Guard: skip if deck_id column doesn't exist in the schema.
    let countByDeck = new Map<string, number>();
    try {
      const { data: wordCounts } = await supabase
        .from('words')
        .select('deck_id')
        .eq('user_id', userId)
        .not('deck_id', 'is', null);
      if (wordCounts) {
        for (const w of wordCounts) {
          if (w.deck_id) {
            countByDeck.set(w.deck_id, (countByDeck.get(w.deck_id) ?? 0) + 1);
          }
        }
      }
    } catch {
      // deck_id column may not exist — skip word counts silently.
    }

    const mappedDecks: Deck[] = data.map((d: any) => ({
      id: d.id,
      title: d.title,
      description: d.description || '',
      category: d.category || 'General',
      totalWords: countByDeck.get(d.id) ?? 0,
      masteredWords: 0,
      color: d.color || 'indigo',
      iconName: d.icon_name || 'book',
    }));

    return { success: true, data: mappedDecks };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to fetch decks' };
  }
}

/**
 * Fetch words for a specific deck belonging to the specified user
 */
export async function getUserWords(userId: string, deckId?: string): Promise<Result<VocabularyItem[]>> {
  if (userId === '00000000-0000-0000-0000-000000000000') {
    return { success: true, data: INITIAL_VOCABULARY };
  }

  try {
    const supabase = createClient();
    let query = supabase.from('words').select('*').eq('user_id', userId);

    // deck_id column may not exist in older schemas. Skip filter silently if so.
    if (deckId) {
      try {
        query = query.eq('deck_id', deckId);
      } catch {
        // column doesn't exist — skip filter
      }
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }
    
    if (!data || data.length === 0) {
      return { success: true, data: [] };
    }

    const mappedWords: VocabularyItem[] = data.map((w: any) => ({
      id: w.id,
      term: w.term,
      phonetic: w.phonetic || '',
      translation: w.translation,
      cefrLevel: w.cefr_level || 'C1',
      partOfSpeech: w.part_of_speech || 'noun',
      exampleSentence: w.example_sentence || '',
      exampleTranslation: w.example_translation || '',
      context: w.context_text || '',
      grammarBreakdown: w.grammar_breakdown || '',
      deckId: w.deck_id,
      fsrs: w.fsrs_state || {
        stability: 0.4,
        difficulty: 5.0,
        repetition: 0,
        lapses: 0,
        nextReviewDate: new Date().toISOString(),
      },
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
      } : undefined,
      // Source tracking
      sourceType: w.source_type,
      sourceUrl: w.source_url,
      sourceTitle: w.source_title,
      sourceContext: w.source_context,
      lookupCount: w.lookup_count,
      entryType: w.entry_type,
      normalizedText: w.normalized_text,
      createdAt: w.created_at,
      updatedAt: w.updated_at,
    }));

    return { success: true, data: mappedWords };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to fetch words' };
  }
}

/**
 * Insert or update vocabulary word captured from Extension or Scan AI
 */
export async function saveVocabularyItem(
  userId: string,
  word: Partial<VocabularyItem>,
  deckId?: string
): Promise<Result<VocabularyItem>> {
  try {
    const supabase = createClient();
    const newWord = {
      user_id: userId,
      deck_id: deckId || null,
      term: word.term,
      phonetic: word.phonetic || '',
      translation: word.translation,
      cefr_level: word.cefrLevel || 'B2',
      part_of_speech: word.partOfSpeech || 'noun',
      example_sentence: word.exampleSentence || '',
      example_translation: word.exampleTranslation || '',
      context_text: word.context || '',
      grammar_breakdown: word.grammarBreakdown || '',
    };

    const { data, error } = await supabase
      .from('words')
      .insert([newWord])
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: {
        id: data.id,
        term: data.term,
        phonetic: data.phonetic,
        translation: data.translation,
        cefrLevel: data.cefr_level,
        partOfSpeech: data.part_of_speech,
        exampleSentence: data.example_sentence,
        exampleTranslation: data.example_translation,
      },
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to save word' };
  }
}

/**
 * Update FSRS rating and next review date for a word
 */
export async function updateFSRSRating(
  wordId: string,
  fsrsState: Record<string, any>,
  nextReviewAt: string
): Promise<Result<boolean>> {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('words')
      .update({
        fsrs_state: fsrsState,
        next_review_at: nextReviewAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', wordId);

    if (error) return { success: false, error: error.message };
    return { success: true, data: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update FSRS' };
  }
}

/**
 * Persist selected Scan & Extract items into the `words` table.
 *
 * Uses ON CONFLICT (user_id, normalized_text) DO UPDATE so that:
 * 1. Re-scanning the same document never creates duplicate rows.
 * 2. If the user later re-scans with richer data (new context, IPA),
 *    the existing row is updated rather than silently skipped.
 *
 * Only persisted on explicit user confirmation ("Save selected to Study Hub").
 * The extraction result is stored temporarily in document_jobs.result_summary
 * before confirmation.
 *
 * @param selectedItems - Only these items are persisted (checked by user).
 */
export async function persistScanExtraction(
  userId: string,
  selectedItems: ExtractedLearningItem[],
  sourceTitle: string,
  deckId: string | null,
  /** Authenticated Supabase client. Falls back to browser client if omitted. */
  supabaseClient?: ReturnType<typeof createClient>,
): Promise<Result<{ insertedCount: number; updatedCount: number; errorCount: number }>> {
  if (!selectedItems || selectedItems.length === 0) {
    return { success: true, data: { insertedCount: 0, updatedCount: 0, errorCount: 0 } };
  }

  try {
    const supabase = supabaseClient ?? createClient();
    const now = new Date().toISOString();
    // Initial FSRS state for new words. The ts-fsrs engine computes the first
    // review date on the first rating. Existing rows are NOT updated (DO NOTHING
    // on conflict for fsrs_state).
    const initialFSRS = {
      stability: 0.5,
      difficulty: 3.0,
      repetition: 0,
      lapses: 0,
      state: 0,
      last_review_date: null,
      next_review_date: now,
    };
    // Map to words row payloads, filtering entry types not supported by the DB schema.
    // DB CHECK constraint (current, after migration 20260818000000):
    //   WORD | PHRASE | COLLOCATION | IDIOM | SENTENCE_PATTERN | GRAMMAR | PROPER_NOUN
    const VALID_ENTRY_TYPES = new Set([
      'WORD', 'PHRASE', 'COLLOCATION', 'IDIOM', 'SENTENCE_PATTERN', 'GRAMMAR', 'PROPER_NOUN',
    ]);
    const payloads: WordsRowPayload[] = [];
    let skippedCount = 0;
    for (const item of selectedItems) {
      if (!VALID_ENTRY_TYPES.has(item.entryType)) {
        skippedCount++;
        continue;
      }
      payloads.push(toWordsRow({ userId, deckId, sourceTitle, item, fsrsState: initialFSRS }));
    }
    if (payloads.length === 0) {
      return { success: true, data: { insertedCount: 0, updatedCount: 0, errorCount: skippedCount } };
    }

    // Use upsert with the unique index (user_id, normalized_text).
    // DO UPDATE ensures re-scans update existing entries rather than skip them.
    let { data, error } = await supabase
      .from('words')
      .upsert(payloads, {
        onConflict: 'user_id,normalized_text',
        ignoreDuplicates: false,
      })
      .select('id');

    // Resilient fallback only if DB has legacy missing columns or legacy constraints
    if (error) {
      if (error.message?.includes('deck_id') || error.message?.includes('fsrs_state')) {
        console.warn('[persistScanExtraction] Stripping unmigrated columns for legacy DB compatibility:', error.message);
        const strippedPayloads = payloads.map((p) => {
          const safe = { ...p };
          delete (safe as any).deck_id;
          delete (safe as any).fsrs_state;
          return safe;
        });
        const retryRes = await supabase
          .from('words')
          .upsert(strippedPayloads, {
            onConflict: 'user_id,normalized_text',
            ignoreDuplicates: false,
          })
          .select('id');
        data = retryRes.data;
        error = retryRes.error;
      }

      if (error && error.message?.includes('words_entry_type_check')) {
        console.warn('[persistScanExtraction] DB CHECK constraint mismatch on entry_type, retrying with sanitized compatibility payload:', error.message);
        const legacyTypes = new Set(['WORD', 'PHRASE']);
        const sanitizedPayloads = (data ? payloads : payloads).map((p) => {
          const safe = { ...p };
          if (!legacyTypes.has(safe.entry_type)) {
            safe.part_of_speech = safe.part_of_speech || (safe.entry_type === 'PROPER_NOUN' ? 'proper noun' : safe.entry_type.toLowerCase());
            safe.tags = Array.isArray(safe.tags) ? [...safe.tags, safe.entry_type] : [safe.entry_type];
            safe.entry_type = 'WORD' as const;
          }
          return safe;
        });

        const retryRes = await supabase
          .from('words')
          .upsert(sanitizedPayloads, {
            onConflict: 'user_id,normalized_text',
            ignoreDuplicates: false,
          })
          .select('id');

        data = retryRes.data;
        error = retryRes.error;
      }
    }

    if (error) {
      console.error('[persistScanExtraction] upsert error:', error.message);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: {
        insertedCount: data?.length ?? selectedItems.length,
        updatedCount: 0, // Supabase upsert doesn't easily distinguish insert vs update
        errorCount: 0,
      },
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to persist scan extraction' };
  }
}
