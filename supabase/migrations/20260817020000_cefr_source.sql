-- Migration: Add source to cefr_wordlist

ALTER TABLE public.cefr_wordlist ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'oxford5000';
