-- ================================================
-- NEXUS.GG - COMPLETE Permission & Trigger Fix
-- Run this FIRST in Supabase SQL Editor
-- ================================================

-- 0. Grant schema-level permissions (fixes "permission denied for schema public")
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all privileges on all tables in schema public to postgres, anon, authenticated, service_role;
grant all privileges on all sequences in schema public to postgres, anon, authenticated, service_role;
grant all privileges on all functions in schema public to postgres, anon, authenticated, service_role;

-- Also set default privileges for future tables
alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to postgres, anon, authenticated, service_role;


-- 1. Fix the handle_new_user trigger function
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
    for each row execute procedure public.handle_new_user();


-- 2. Fix the update_game_profile_xp trigger function
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


-- 3. Add missing INSERT policy on users table
drop policy if exists "Service role can insert users" on public.users;
create policy "Service role can insert users" on public.users
    for insert with check (true);


-- 4. Fix handle_updated_at to also use SECURITY DEFINER
create or replace function public.handle_updated_at()
returns trigger
security definer
set search_path = public
as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;


-- Done! You should now be able to register and upload matches.
