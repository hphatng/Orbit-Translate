-- Migration: Create CEFR Wordlist Table

CREATE TABLE IF NOT EXISTS public.cefr_wordlist (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    word TEXT NOT NULL UNIQUE,
    pos TEXT,
    cefr_level TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_cefr_wordlist_word ON public.cefr_wordlist (lower(word));

-- Enable RLS (Read-only for public if needed, or service-role only)
ALTER TABLE public.cefr_wordlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to cefr_wordlist"
    ON public.cefr_wordlist FOR SELECT
    USING (true);
