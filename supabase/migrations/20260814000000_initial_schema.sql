-- Orbit Translate Database Schema & RLS Policies
-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Linked with Supabase Auth Users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Words Table (Saved Words with FSRS Algorithm Data & Context)
CREATE TABLE IF NOT EXISTS public.words (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  word TEXT NOT NULL,
  ipa TEXT,
  cefr TEXT,
  translation TEXT NOT NULL,
  context_sentence TEXT,
  context_translation TEXT,
  source_url TEXT,
  status TEXT DEFAULT 'learning' CHECK (status IN ('learning', 'reviewing', 'mastered')),
  fsrs_state JSONB DEFAULT '{"stability": 0, "difficulty": 0, "repetition": 0, "lapses": 0}'::jsonb,
  next_review_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS words_user_id_idx ON public.words(user_id);
CREATE INDEX IF NOT EXISTS words_next_review_at_idx ON public.words(next_review_at);
CREATE INDEX IF NOT EXISTS words_status_idx ON public.words(status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.words ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- RLS Policies for Words
CREATE POLICY "Users can view their own saved words" 
  ON public.words FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved words" 
  ON public.words FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved words" 
  ON public.words FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved words" 
  ON public.words FOR DELETE 
  USING (auth.uid() = user_id);

-- Auto-create profile trigger on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
