-- 1. Practice Sessions Table
CREATE TABLE IF NOT EXISTS public.practice_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mode TEXT NOT NULL, -- e.g., 'flashcard', 'quiz', 'typing', 'matching', 'grammar', 'mixed'
  status TEXT DEFAULT 'in_progress', -- 'in_progress', 'completed', 'abandoned'
  score INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  accuracy_rate NUMERIC(5, 2), -- 0 to 100.00
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 2. Practice History Table (Log of individual answers)
CREATE TABLE IF NOT EXISTS public.practice_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.practice_sessions(id) ON DELETE CASCADE NOT NULL,
  word_id UUID REFERENCES public.words(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  question_type TEXT NOT NULL, -- e.g., 'flashcard', 'multiple_choice', 'writing'
  is_correct BOOLEAN, -- Null if just viewed (like revealing a flashcard without grading)
  time_taken_ms INTEGER, -- Reaction time / time taken to answer in milliseconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS practice_sessions_user_id_idx ON public.practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS practice_history_session_id_idx ON public.practice_history(session_id);
CREATE INDEX IF NOT EXISTS practice_history_word_id_idx ON public.practice_history(word_id);
CREATE INDEX IF NOT EXISTS practice_history_user_id_idx ON public.practice_history(user_id);

-- Enable RLS
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Practice Sessions
CREATE POLICY "PracticeSessions self select" ON public.practice_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "PracticeSessions self insert" ON public.practice_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "PracticeSessions self update" ON public.practice_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "PracticeSessions self delete" ON public.practice_sessions FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Practice History
CREATE POLICY "PracticeHistory self select" ON public.practice_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "PracticeHistory self insert" ON public.practice_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "PracticeHistory self update" ON public.practice_history FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "PracticeHistory self delete" ON public.practice_history FOR DELETE USING (auth.uid() = user_id);
