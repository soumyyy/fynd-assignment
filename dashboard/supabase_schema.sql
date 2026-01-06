-- Create reviews table
create table public.reviews (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  rating integer not null,
  text text not null,
  sentiment text,
  explanation text,
  dimensions jsonb
);

-- Enable Row Level Security (RLS)
alter table public.reviews enable row level security;

-- Create policy to allow anonymous reads (for the public dashboard)
create policy "Allow public read access"
on public.reviews for select
to anon
using (true);

-- Create policy to allow anonymous inserts (for the analyzer submission)
create policy "Allow public insert access"
on public.reviews for insert
to anon
with check (true);
