-- Supabase migration file for Dahamkke Classroom (다함께교실)

-- 1. Extensions
create extension if not exists vector;

-- 2. Profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role text not null check (role in ('student','teacher','parent')),
  native_language text not null, -- 'ru','zh','vi','uz','kk','ko'
  created_at timestamptz default now()
);

-- 3. Textbooks
create table if not exists public.textbooks (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  grade int,
  unit_title text not null,
  owner_id uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- 4. RAG Index Chunks
create table if not exists public.text_chunks (
  id uuid primary key default gen_random_uuid(),
  textbook_id uuid references public.textbooks(id) on delete cascade,
  content text not null,
  embedding vector(1536),
  chunk_order int
);

-- Index for vector cosine similarity search
create index if not exists text_chunks_embedding_idx on public.text_chunks using ivfflat (embedding vector_cosine_ops);

-- 5. Personas
create table if not exists public.personas (
  id uuid primary key default gen_random_uuid(),
  textbook_id uuid references public.textbooks(id) on delete cascade,
  character_name text not null,
  system_prompt text not null
);

-- 6. Translations
create table if not exists public.translations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  type text check (type in ('ocr','notice')),
  source_text text,
  target_lang text,
  result_text text,
  created_at timestamptz default now()
);

-- 7. Dialogs
create table if not exists public.dialogs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  mode text check (mode in ('debate','interview')),
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz default now()
);

-- 8. Match Chunks function for RAG
create or replace function public.match_chunks(
  query_embedding vector(1536),
  book_id uuid,
  match_count int default 4
)
returns table (
  content text,
  similarity float
)
language sql stable as $$
  select
    content,
    1 - (embedding <=> query_embedding) as similarity
  from public.text_chunks
  where textbook_id = book_id
  order by embedding <=> query_embedding
  limit match_count;
$$;

-- 9. Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.textbooks enable row level security;
alter table public.translations enable row level security;
alter table public.dialogs enable row level security;

-- RLS Policies
create policy "Users can view and edit their own profile" on public.profiles
  for all using (auth.uid() = id);

create policy "Anyone can read textbooks" on public.textbooks
  for select using (true);

create policy "Teachers can insert textbooks" on public.textbooks
  for insert with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher')
  );

create policy "Own translations only" on public.translations
  for all using (auth.uid() = user_id);

create policy "Own dialogs only" on public.dialogs
  for all using (auth.uid() = user_id);
