-- ==============================================================================
-- Orbit Translate — Comprehensive Study Hub & Sync Infrastructure Migration
-- File: supabase/migrations/20260818100000_consolidated_study_hub_schema.sql
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. PROFILES TABLE (Multi-tenant user profiles)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  target_cefr TEXT DEFAULT 'B2',
  daily_goal INTEGER DEFAULT 20,
  streak_days INTEGER DEFAULT 1,
  total_words_learned INTEGER DEFAULT 0,
  api_keys JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view their own profile') THEN
    CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile') THEN
    CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profile') THEN
    CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- ==============================================================================
-- 2. FOLDERS TABLE (User Study Folders in Study Hub)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'folder',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS folders_user_id_idx ON public.folders(user_id);

ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'folders' AND policyname = 'Users can view their own folders') THEN
    CREATE POLICY "Users can view their own folders" ON public.folders FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'folders' AND policyname = 'Users can insert their own folders') THEN
    CREATE POLICY "Users can insert their own folders" ON public.folders FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'folders' AND policyname = 'Users can update their own folders') THEN
    CREATE POLICY "Users can update their own folders" ON public.folders FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'folders' AND policyname = 'Users can delete their own folders') THEN
    CREATE POLICY "Users can delete their own folders" ON public.folders FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ==============================================================================
-- 3. DECKS TABLE (User Decks in Study Hub)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.decks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'General',
  color TEXT DEFAULT 'indigo',
  icon_name TEXT DEFAULT 'book',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS decks_user_id_idx ON public.decks(user_id);
CREATE INDEX IF NOT EXISTS decks_folder_id_idx ON public.decks(folder_id);

ALTER TABLE public.decks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'decks' AND policyname = 'Users can view their own decks') THEN
    CREATE POLICY "Users can view their own decks" ON public.decks FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'decks' AND policyname = 'Users can insert their own decks') THEN
    CREATE POLICY "Users can insert their own decks" ON public.decks FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'decks' AND policyname = 'Users can update their own decks') THEN
    CREATE POLICY "Users can update their own decks" ON public.decks FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'decks' AND policyname = 'Users can delete their own decks') THEN
    CREATE POLICY "Users can delete their own decks" ON public.decks FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ==============================================================================
-- 4. WORDS TABLE (Columns, Foreign Keys & Canonical Check Constraints)
-- ==============================================================================
-- Ensure all columns exist
ALTER TABLE public.words ADD COLUMN IF NOT EXISTS deck_id UUID REFERENCES public.decks(id) ON DELETE CASCADE;
ALTER TABLE public.words ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL;
ALTER TABLE public.words ADD COLUMN IF NOT EXISTS term TEXT;
ALTER TABLE public.words ADD COLUMN IF NOT EXISTS phonetic TEXT;
ALTER TABLE public.words ADD COLUMN IF NOT EXISTS translation TEXT;
ALTER TABLE public.words ADD COLUMN IF NOT EXISTS cefr_level TEXT;
ALTER TABLE public.words ADD COLUMN IF NOT EXISTS part_of_speech TEXT;
ALTER TABLE public.words ADD COLUMN IF NOT EXISTS example_sentence TEXT;
ALTER TABLE public.words ADD COLUMN IF NOT EXISTS example_translation TEXT;
ALTER TABLE public.words ADD COLUMN IF NOT EXISTS context_text TEXT;
ALTER TABLE public.words ADD COLUMN IF NOT EXISTS grammar_breakdown TEXT;
ALTER TABLE public.words ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE public.words ADD COLUMN IF NOT EXISTS source_title TEXT;
ALTER TABLE public.words ADD COLUMN IF NOT EXISTS source_context TEXT;
ALTER TABLE public.words ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'MANUAL';
ALTER TABLE public.words ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'::text[];
ALTER TABLE public.words ADD COLUMN IF NOT EXISTS fsrs_state JSONB DEFAULT '{"stability": 0.5, "difficulty": 3.0, "repetition": 0, "lapses": 0, "state": 0}'::jsonb;
ALTER TABLE public.words ADD COLUMN IF NOT EXISTS next_review_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
ALTER TABLE public.words ADD COLUMN IF NOT EXISTS lookup_count INTEGER DEFAULT 1;
ALTER TABLE public.words ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
ALTER TABLE public.words ADD COLUMN IF NOT EXISTS client_event_id TEXT;
ALTER TABLE public.words ADD COLUMN IF NOT EXISTS normalized_text TEXT;
ALTER TABLE public.words ADD COLUMN IF NOT EXISTS entry_type TEXT DEFAULT 'WORD';

-- Normalization Helper
CREATE OR REPLACE FUNCTION normalize_vocab_text(input_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql IMMUTABLE
AS $$
BEGIN
  IF input_text IS NULL THEN RETURN NULL; END IF;
  RETURN regexp_replace(
    lower(trim(normalize(input_text, NFC))),
    '\s+', ' ', 'g'
  );
END;
$$;

-- Backfill normalized_text
UPDATE public.words
SET normalized_text = normalize_vocab_text(term)
WHERE normalized_text IS NULL AND term IS NOT NULL;

-- Trigger to keep normalized_text synced
CREATE OR REPLACE FUNCTION set_normalized_text()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.normalized_text := normalize_vocab_text(NEW.term);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_normalized_text ON public.words;
CREATE TRIGGER trg_set_normalized_text
  BEFORE INSERT OR UPDATE OF term ON public.words
  FOR EACH ROW
  EXECUTE FUNCTION set_normalized_text();

-- Unique Index for Deduplication
CREATE UNIQUE INDEX IF NOT EXISTS words_user_normalized_unique
  ON public.words (user_id, normalized_text)
  WHERE normalized_text IS NOT NULL;

CREATE INDEX IF NOT EXISTS words_deck_id_idx ON public.words(deck_id);
CREATE INDEX IF NOT EXISTS words_user_id_idx ON public.words(user_id);
CREATE INDEX IF NOT EXISTS words_next_review_at_idx ON public.words(next_review_at);

-- CANONICAL ENTRY_TYPE CHECK CONSTRAINT (Fixes "words_entry_type_check" error permanently)
ALTER TABLE public.words DROP CONSTRAINT IF EXISTS words_entry_type_check;
ALTER TABLE public.words ADD CONSTRAINT words_entry_type_check
  CHECK (entry_type IN ('WORD', 'PHRASE', 'COLLOCATION', 'IDIOM', 'SENTENCE_PATTERN', 'GRAMMAR', 'PROPER_NOUN'));

-- CANONICAL SOURCE_TYPE CHECK CONSTRAINT
ALTER TABLE public.words DROP CONSTRAINT IF EXISTS words_source_type_check;
ALTER TABLE public.words ADD CONSTRAINT words_source_type_check
  CHECK (source_type IN ('EXTENSION', 'SCAN_EXTRACT', 'DOCUMENT_TRANSLATE', 'MANUAL'));

-- ==============================================================================
-- 5. PRACTICE SESSIONS & LOGS TABLE (For Practice Modes)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.practice_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  deck_id UUID REFERENCES public.decks(id) ON DELETE SET NULL,
  mode TEXT NOT NULL,
  total_cards INTEGER DEFAULT 0,
  correct_cards INTEGER DEFAULT 0,
  score_percentage NUMERIC(5, 2) DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS practice_sessions_user_id_idx ON public.practice_sessions(user_id);

ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'practice_sessions' AND policyname = 'Users can view their own practice sessions') THEN
    CREATE POLICY "Users can view their own practice sessions" ON public.practice_sessions FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'practice_sessions' AND policyname = 'Users can insert their own practice sessions') THEN
    CREATE POLICY "Users can insert their own practice sessions" ON public.practice_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
