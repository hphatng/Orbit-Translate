-- Migration: Sync Infrastructure for Extension ↔ WebApp
-- Adds deduplication, normalization, source tracking, and pairing codes

-- ============================================================
-- 0. Rename columns to match the correct business logic schema
-- ============================================================

DO $$ 
BEGIN
  IF EXISTS(SELECT * FROM information_schema.columns WHERE table_schema='public' AND table_name='words' AND column_name='word') THEN
    ALTER TABLE public.words RENAME COLUMN word TO term;
  END IF;
  
  IF EXISTS(SELECT * FROM information_schema.columns WHERE table_schema='public' AND table_name='words' AND column_name='ipa') THEN
    ALTER TABLE public.words RENAME COLUMN ipa TO phonetic;
  END IF;
  
  IF EXISTS(SELECT * FROM information_schema.columns WHERE table_schema='public' AND table_name='words' AND column_name='cefr') THEN
    ALTER TABLE public.words RENAME COLUMN cefr TO cefr_level;
  END IF;
  
  IF EXISTS(SELECT * FROM information_schema.columns WHERE table_schema='public' AND table_name='words' AND column_name='context_sentence') THEN
    ALTER TABLE public.words RENAME COLUMN context_sentence TO example_sentence;
  END IF;
  
  IF EXISTS(SELECT * FROM information_schema.columns WHERE table_schema='public' AND table_name='words' AND column_name='context_translation') THEN
    ALTER TABLE public.words RENAME COLUMN context_translation TO example_translation;
  END IF;
END $$;

-- ============================================================
-- 1. Add columns to public.words for sync infrastructure
-- ============================================================

-- Normalized text for deduplication (lowercase, trimmed, Unicode-normalized)
ALTER TABLE public.words ADD COLUMN IF NOT EXISTS normalized_text TEXT;

-- Source tracking
ALTER TABLE public.words ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'MANUAL'
  CHECK (source_type IN ('EXTENSION', 'SCAN_EXTRACT', 'DOCUMENT_TRANSLATE', 'MANUAL'));
ALTER TABLE public.words ADD COLUMN IF NOT EXISTS source_title TEXT;
ALTER TABLE public.words ADD COLUMN IF NOT EXISTS source_context TEXT;

-- Lookup tracking
ALTER TABLE public.words ADD COLUMN IF NOT EXISTS lookup_count INTEGER DEFAULT 1;
ALTER TABLE public.words ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Idempotency key from extension client
ALTER TABLE public.words ADD COLUMN IF NOT EXISTS client_event_id TEXT;

-- Entry type classification
ALTER TABLE public.words ADD COLUMN IF NOT EXISTS entry_type TEXT DEFAULT 'WORD'
  CHECK (entry_type IN ('WORD', 'PHRASE', 'COLLOCATION', 'IDIOM', 'SENTENCE_PATTERN', 'GRAMMAR'));

-- ============================================================
-- 2. Normalization function
-- ============================================================

CREATE OR REPLACE FUNCTION normalize_vocab_text(input_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql IMMUTABLE
AS $$
BEGIN
  -- Trim, lowercase, normalize Unicode (NFC), collapse whitespace
  RETURN regexp_replace(
    lower(trim(normalize(input_text, NFC))),
    '\s+', ' ', 'g'
  );
END;
$$;

-- ============================================================
-- 3. Backfill normalized_text for existing rows
-- ============================================================

UPDATE public.words
SET normalized_text = normalize_vocab_text(term)
WHERE normalized_text IS NULL;

-- ============================================================
-- 4. Create trigger to auto-populate normalized_text on INSERT/UPDATE
-- ============================================================

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

-- ============================================================
-- 5. Unique constraint for deduplication
-- ============================================================

-- One canonical entry per user per normalized term
-- Using a unique index instead of constraint for better control
CREATE UNIQUE INDEX IF NOT EXISTS words_user_normalized_unique
  ON public.words (user_id, normalized_text)
  WHERE normalized_text IS NOT NULL;

-- Index for client_event_id lookups (idempotency checks)
CREATE INDEX IF NOT EXISTS words_client_event_id_idx
  ON public.words (client_event_id)
  WHERE client_event_id IS NOT NULL;

-- Index for source_type filtering
CREATE INDEX IF NOT EXISTS words_source_type_idx
  ON public.words (source_type);

-- ============================================================
-- 6. Extension Pairing Codes table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.extension_pairing_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for code lookup
CREATE INDEX IF NOT EXISTS pairing_codes_code_idx ON public.extension_pairing_codes (code);

-- RLS
ALTER TABLE public.extension_pairing_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pairing codes"
  ON public.extension_pairing_codes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pairing codes"
  ON public.extension_pairing_codes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pairing codes"
  ON public.extension_pairing_codes
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pairing codes"
  ON public.extension_pairing_codes
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- 7. Auto-cleanup expired pairing codes (optional, via cron or app-level)
-- ============================================================

-- Function to clean up expired/used codes
CREATE OR REPLACE FUNCTION cleanup_expired_pairing_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.extension_pairing_codes
  WHERE expires_at < now() OR used_at IS NOT NULL;
END;
$$;
