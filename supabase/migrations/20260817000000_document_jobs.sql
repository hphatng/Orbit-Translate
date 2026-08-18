-- Migration: Add Document Processing Jobs Infrastructure

-- Document Jobs Table
CREATE TABLE IF NOT EXISTS public.document_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_size_bytes BIGINT,
  mime_type TEXT,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'UPLOADING', 'PARSING', 'EXTRACTING', 'PROCESSING', 'COMPLETED', 'PARTIAL', 'FAILED', 'CANCELLED')),
  progress_percent INTEGER DEFAULT 0,
  result_summary JSONB DEFAULT '{}'::jsonb, -- e.g. {"words_found": 10, "pages": 5}
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Index for querying jobs
CREATE INDEX IF NOT EXISTS document_jobs_user_id_idx ON public.document_jobs(user_id);
CREATE INDEX IF NOT EXISTS document_jobs_status_idx ON public.document_jobs(status);

-- Enable RLS
ALTER TABLE public.document_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Idempotent)
DROP POLICY IF EXISTS "Users can view their own document jobs" ON public.document_jobs;
CREATE POLICY "Users can view their own document jobs" 
  ON public.document_jobs FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own document jobs" ON public.document_jobs;
CREATE POLICY "Users can insert their own document jobs" 
  ON public.document_jobs FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own document jobs" ON public.document_jobs;
CREATE POLICY "Users can update their own document jobs" 
  ON public.document_jobs FOR UPDATE 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own document jobs" ON public.document_jobs;
CREATE POLICY "Users can delete their own document jobs" 
  ON public.document_jobs FOR DELETE 
  USING (auth.uid() = user_id);

-- Auto-update updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_document_jobs_modtime
BEFORE UPDATE ON public.document_jobs
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
