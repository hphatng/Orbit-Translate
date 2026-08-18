-- Orbit Translate Production Multi-Tenant Schema & RLS Policies
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Linked with Supabase Auth Users)
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

-- 2. Folders Table (User Custom Storage Folders)
CREATE TABLE IF NOT EXISTS public.folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'folder',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Decks Table (User Study Decks)
CREATE TABLE IF NOT EXISTS public.decks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'General',
  color TEXT DEFAULT 'indigo',
  icon_name TEXT DEFAULT 'book',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Words Table (Saved Words with FSRS Algorithm Data & Context)
CREATE TABLE IF NOT EXISTS public.words (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  deck_id UUID REFERENCES public.decks(id) ON DELETE CASCADE,
  term TEXT NOT NULL,
  phonetic TEXT,
  translation TEXT NOT NULL,
  cefr_level TEXT,
  part_of_speech TEXT,
  example_sentence TEXT,
  example_translation TEXT,
  context_text TEXT,
  grammar_breakdown TEXT,
  source_url TEXT,
  tags TEXT[] DEFAULT '{}'::text[],
  fsrs_state JSONB DEFAULT '{"stability": 0.4, "difficulty": 5.0, "repetition": 0, "lapses": 0, "state": 0}'::jsonb,
  next_review_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for maximum query performance
CREATE INDEX IF NOT EXISTS folders_user_id_idx ON public.folders(user_id);
CREATE INDEX IF NOT EXISTS decks_user_id_idx ON public.decks(user_id);
CREATE INDEX IF NOT EXISTS words_user_id_idx ON public.words(user_id);
CREATE INDEX IF NOT EXISTS words_deck_id_idx ON public.words(deck_id);
CREATE INDEX IF NOT EXISTS words_next_review_at_idx ON public.words(next_review_at);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.words ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Profiles
CREATE POLICY "Profiles self select" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Profiles self update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for Folders
CREATE POLICY "Folders self select" ON public.folders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Folders self insert" ON public.folders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Folders self update" ON public.folders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Folders self delete" ON public.folders FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Decks
CREATE POLICY "Decks self select" ON public.decks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Decks self insert" ON public.decks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Decks self update" ON public.decks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Decks self delete" ON public.decks FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Words
CREATE POLICY "Words self select" ON public.words FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Words self insert" ON public.words FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Words self update" ON public.words FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Words self delete" ON public.words FOR DELETE USING (auth.uid() = user_id);

-- Trigger: Auto-create Profile and Default Decks on New User Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  ext_deck_id UUID;
BEGIN
  -- 1. Create Profile
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO NOTHING;

  -- 2. Create Default "🔥 Chrome Extension Today" Deck
  INSERT INTO public.decks (user_id, title, description, category, color, icon_name)
  VALUES (
    new.id,
    '🔥 Chrome Extension Today',
    'Từ vựng vừa bôi đen tra từ bằng Chrome Extension hôm nay',
    'Extension',
    'amber',
    'flame'
  )
  RETURNING id INTO ext_deck_id;

  -- 3. Create Default "Tài Liệu Scan AI" Deck
  INSERT INTO public.decks (user_id, title, description, category, color, icon_name)
  VALUES (
    new.id,
    'Tài Liệu Scan AI',
    'Từ vựng trích xuất từ tài liệu PDF/Docx/Image',
    'Scan AI',
    'indigo',
    'file-search'
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create Trigger safely
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
