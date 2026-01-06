-- The table likely already exists, so we need to explicit add the columns
-- Run these commands to fix the "Could not find column" error

alter table public.reviews 
add column if not exists user_rating integer,
add column if not exists text text, -- Ensure text column exists (is nullable now)
add column if not exists ai_response text,
add column if not exists ai_summary text,
add column if not exists ai_action text;

-- Make sure RLS is still enabled
alter table public.reviews enable row level security;

-- Refreshes the schema cache (sometimes needed)
NOTIFY pgrst, 'reload config';
