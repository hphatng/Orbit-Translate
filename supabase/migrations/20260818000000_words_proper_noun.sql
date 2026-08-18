-- Migration: Widen words.entry_type CHECK constraint to include PROPER_NOUN.
-- This is required by the new canonical extraction schema in shared/schemas.ts,
-- where PROPER_NOUN is a first-class entry type.
--
-- BACKWARD COMPATIBLE:
--  - All existing rows still satisfy the new constraint (PROPER_NOUN is additive).
--  - Old code paths that did not pass entry_type fall back to DEFAULT 'WORD'.
--  - New code paths (extractFromTextAI.ts) can emit PROPER_NOUN.

ALTER TABLE public.words
  DROP CONSTRAINT IF EXISTS words_entry_type_check;

ALTER TABLE public.words
  ADD CONSTRAINT words_entry_type_check
  CHECK (entry_type IN ('WORD', 'PHRASE', 'COLLOCATION', 'IDIOM', 'SENTENCE_PATTERN', 'GRAMMAR', 'PROPER_NOUN'));

-- Rollback: restore original constraint.
-- ALTER TABLE public.words DROP CONSTRAINT words_entry_type_check;
-- ALTER TABLE public.words ADD CONSTRAINT words_entry_type_check
--   CHECK (entry_type IN ('WORD', 'PHRASE', 'COLLOCATION', 'IDIOM', 'SENTENCE_PATTERN', 'GRAMMAR'));
