-- supabase/schema.sql
-- Complete PostgreSQL schema for NEXUS.GG AI Game Coaching OS

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- 1. USERS PROFILE TABLE
-- Extends the auth.users table
create table public.users (
    id uuid references auth.users on delete cascade primary key,
    username text unique not null,
    display_name text,
    avatar_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for users
alter table public.users enable row level security;

create policy "Users can view all profiles" on public.users
    for select using (true);

create policy "Users can update their own profile" on public.users
    for update using (auth.uid() = id);

create policy "Service role can insert users" on public.users
    for insert with check (true);

-- 2. GAME PROFILES TABLE
-- Tracks a user's stats, active role, current rank per game
create table public.game_profiles (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.users(id) on delete cascade not null,
    game_type text not null, -- 'valorant', 'cs2', 'lol', 'fortnite', 'pubg'
    current_rank text default 'Bronze I' not null,
    peak_rank text default 'Bronze I' not null,
    total_xp integer default 0 not null,
    matches_played integer default 0 not null,
    win_rate double precision default 0.0 not null,
    kd_ratio double precision default 0.0 not null,
    custom_settings jsonb default '{}'::jsonb not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, game_type)
);

-- Enable RLS for game_profiles
alter table public.game_profiles enable row level security;

create policy "Users can view game profiles" on public.game_profiles
    for select using (true);

create policy "Users can manage their own game profiles" on public.game_profiles
    for all using (auth.uid() = user_id);

-- 3. MATCH HISTORY TABLE
-- Stores raw match uploads and the structured parsing results
create table public.match_history (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.users(id) on delete cascade not null,
    game_type text not null,
    match_id text not null, -- external match identifier if any
    played_at timestamp with time zone not null,
    raw_data jsonb not null,
    parsed_stats jsonb not null,
    is_win boolean not null,
    kills integer not null,
    deaths integer not null,
    assists integer not null,
    performance_score double precision not null, -- normalized 0-100 rating
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, game_type, match_id)
);

-- Enable RLS for match_history
alter table public.match_history enable row level security;

create policy "Users can view their own match history" on public.match_history
    for select using (auth.uid() = user_id);

create policy "Users can insert their own match history" on public.match_history
    for insert with check (auth.uid() = user_id);

create policy "Users can delete their own match history" on public.match_history
    for delete using (auth.uid() = user_id);

-- 4. COACHING REPORTS TABLE
-- Deep analysis from Gemini 2.5 Pro
create table public.coaching_reports (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.users(id) on delete cascade not null,
    game_type text not null,
    analyzed_at timestamp with time zone default timezone('utc'::text, now()) not null,
    weaknesses jsonb not null, -- Array of objects: { weakness: string, description: string, severity: 'high'|'medium'|'low', recommendations: string[] }
    strengths jsonb not null, -- Array of objects: { strength: string, description: string }
    coach_feedback text not null, -- Direct dialogue from the game's coach persona
    overall_performance_score double precision not null, -- AI calculated score
    metrics_summary jsonb not null, -- Snapshot of data analyzed
    raw_response text not null -- Complete raw LLM output for auditing
);

-- Enable RLS for coaching_reports
alter table public.coaching_reports enable row level security;

create policy "Users can view their own coaching reports" on public.coaching_reports
    for select using (auth.uid() = user_id);

create policy "Users can insert their own coaching reports" on public.coaching_reports
    for insert with check (auth.uid() = user_id);

-- 5. DAILY CHECKLISTS TABLE
-- One checklist header per user per day
create table public.daily_checklists (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.users(id) on delete cascade not null,
    date date default current_date not null,
    is_completed boolean default false not null,
    xp_rewarded integer default 0 not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, date)
);

-- Enable RLS for daily_checklists
alter table public.daily_checklists enable row level security;

create policy "Users can view their own daily checklists" on public.daily_checklists
    for select using (auth.uid() = user_id);

create policy "Users can manage their own daily checklists" on public.daily_checklists
    for all using (auth.uid() = user_id);

-- 6. CHECKLIST COMPLETIONS TABLE
-- Individual checklist tasks generated from Gemini 1.5 Flash
create table public.checklist_completions (
    id uuid default uuid_generate_v4() primary key,
    checklist_id uuid references public.daily_checklists(id) on delete cascade not null,
    user_id uuid references public.users(id) on delete cascade not null,
    game_type text not null,
    task_description text not null,
    category text not null, -- 'aim', 'positioning', 'utility', 'economy', 'mindset', etc.
    target_count integer default 1 not null,
    completed_count integer default 0 not null,
    is_completed boolean default false not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for checklist_completions
alter table public.checklist_completions enable row level security;

create policy "Users can view checklist completions" on public.checklist_completions
    for select using (auth.uid() = user_id);

create policy "Users can update checklist completions" on public.checklist_completions
    for update using (auth.uid() = user_id);

create policy "Users can insert checklist completions" on public.checklist_completions
    for insert with check (auth.uid() = user_id);

-- 7. PROGRESS SCORES TABLE
-- Daily performance score snapshots calculated by AI to graph trends
create table public.progress_scores (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.users(id) on delete cascade not null,
    game_type text not null,
    date date default current_date not null,
    improvement_score double precision not null, -- AI score (0-100)
    category_scores jsonb not null, -- aim, positioning, etc.
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, game_type, date)
);

-- Enable RLS for progress_scores
alter table public.progress_scores enable row level security;

create policy "Users can view progress scores" on public.progress_scores
    for select using (auth.uid() = user_id);

create policy "Users can insert progress scores" on public.progress_scores
    for insert with check (auth.uid() = user_id);

-- 8. STREAKS TABLE
-- Tracks daily active streak
create table public.streaks (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.users(id) on delete cascade not null,
    current_streak integer default 0 not null,
    longest_streak integer default 0 not null,
    last_active_date date,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id)
);

-- Enable RLS for streaks
alter table public.streaks enable row level security;

create policy "Users can view streaks" on public.streaks
    for select using (true);

create policy "Users can update own streaks" on public.streaks
    for all using (auth.uid() = user_id);

-- 9. XP TRANSACTIONS TABLE
-- Gamification system logic
create table public.xp_transactions (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.users(id) on delete cascade not null,
    game_type text not null,
    amount integer not null,
    source text not null, -- 'checklist_task', 'checklist_full', 'match_upload', 'streak_bonus'
    reference_id uuid, -- Reference to the match or checklist row
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for xp_transactions
alter table public.xp_transactions enable row level security;

create policy "Users can view their own XP history" on public.xp_transactions
    for select using (auth.uid() = user_id);

create policy "Users can insert their own XP history" on public.xp_transactions
    for insert with check (auth.uid() = user_id);


-- TRIGGERS & FUNCTIONS

-- A. Auto-handle updated_at columns
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger users_updated_at before update on public.users
    for each row execute procedure public.handle_updated_at();

create trigger game_profiles_updated_at before update on public.game_profiles
    for each row execute procedure public.handle_updated_at();

create trigger streaks_updated_at before update on public.streaks
    for each row execute procedure public.handle_updated_at();


-- B. Auto-update Game Profile XP
-- Trigger function that aggregates XP transactions and updates game_profiles total_xp
create or replace function public.update_game_profile_xp()
returns trigger
security definer
set search_path = public
as $$
declare
    xp_sum integer;
begin
    select coalesce(sum(amount), 0) into xp_sum
    from public.xp_transactions
    where user_id = new.user_id and game_type = new.game_type;

    insert into public.game_profiles (user_id, game_type, total_xp)
    values (new.user_id, new.game_type, xp_sum)
    on conflict (user_id, game_type) do update
    set total_xp = xp_sum;

    return new;
end;
$$ language plpgsql;

create trigger xp_transaction_insert after insert on public.xp_transactions
    for each row execute procedure public.update_game_profile_xp();


-- C. Auto-create profile on Auth signup
create or replace function public.handle_new_user()
returns trigger
security definer
set search_path = public
as $$
declare
    default_username text;
    final_username text;
begin
    default_username := coalesce(new.raw_user_meta_data->>'username', 'nexus_player_' || substr(new.id::text, 1, 8));
    final_username := default_username;
    
    -- Handle potential username collisions by appending random suffix
    begin
        insert into public.users (id, username, display_name, avatar_url)
        values (
            new.id,
            final_username,
            coalesce(new.raw_user_meta_data->>'display_name', final_username),
            coalesce(new.raw_user_meta_data->>'avatar_url', '')
        );
    exception when unique_violation then
        final_username := default_username || '_' || substr(md5(random()::text), 1, 6);
        insert into public.users (id, username, display_name, avatar_url)
        values (
            new.id,
            final_username,
            coalesce(new.raw_user_meta_data->>'display_name', final_username),
            coalesce(new.raw_user_meta_data->>'avatar_url', '')
        );
    end;

    insert into public.streaks (user_id, current_streak, longest_streak)
    values (new.id, 0, 0)
    on conflict (user_id) do nothing;

    return new;
end;
$$ language plpgsql;

-- Drop existing trigger if it exists before recreating
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created after insert on auth.users
    for each row execute procedure public.handle_new_user();


-- 10. VECTOR DATABASE EXTENSION & EMBEDDINGS TABLE
-- Enable vector support
create extension if not exists vector;

create table public.match_embeddings (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.users(id) on delete cascade not null,
    match_id uuid references public.match_history(id) on delete cascade not null,
    game_type text not null,
    embedding vector(768) not null, -- 768 dimensions matches Gemini text-embedding-004 default size
    document text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.match_embeddings enable row level security;

create policy "Users can manage their own embeddings" on public.match_embeddings
    for all using (auth.uid() = user_id);

-- Cosine similarity match query function
create or replace function match_matches(
    query_embedding vector(768),
    match_threshold float,
    match_count int,
    filter_user_id uuid,
    filter_game_type text
)
returns table (
    id uuid,
    match_id uuid,
    document text,
    similarity float
)
language plpgsql as $$
begin
    return query
    select
        me.id,
        me.match_id,
        me.document,
        (1 - (me.embedding <=> query_embedding))::float as similarity
    from public.match_embeddings me
    where me.user_id = filter_user_id 
      and me.game_type = filter_game_type
      and (1 - (me.embedding <=> query_embedding)) > match_threshold
    order by me.embedding <=> query_embedding
    limit match_count;
end;
$$;

