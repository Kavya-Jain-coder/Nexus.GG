-- Create trigger function to automatically calculate game profile stats from match history
create or replace function public.update_game_profile_stats()
returns trigger
security definer
set search_path = public
as $$
declare
    total_matches integer;
    win_matches integer;
    calculated_win_rate double precision;
    total_kills integer;
    total_deaths integer;
    calculated_kd_ratio double precision;
    target_user_id uuid;
    target_game_type text;
begin
    -- Determine user_id and game_type to update
    if (TG_OP = 'DELETE') then
        target_user_id := old.user_id;
        target_game_type := old.game_type;
    else
        target_user_id := new.user_id;
        target_game_type := new.game_type;
    end if;

    -- Aggregate match history
    select count(*), 
           coalesce(sum(case when is_win = true then 1 else 0 end), 0),
           coalesce(sum(kills), 0),
           coalesce(sum(deaths), 0)
    into total_matches, win_matches, total_kills, total_deaths
    from public.match_history
    where user_id = target_user_id and game_type = target_game_type;

    -- Calculate metrics
    if total_matches > 0 then
        calculated_win_rate := win_matches::double precision / total_matches::double precision;
    else
        calculated_win_rate := 0.0;
    end if;

    if total_deaths > 0 then
        calculated_kd_ratio := total_kills::double precision / total_deaths::double precision;
    else
        calculated_kd_ratio := total_kills::double precision;
    end if;

    -- Update or insert game profile
    insert into public.game_profiles (user_id, game_type, matches_played, win_rate, kd_ratio)
    values (target_user_id, target_game_type, total_matches, calculated_win_rate, calculated_kd_ratio)
    on conflict (user_id, game_type) do update
    set matches_played = total_matches,
        win_rate = calculated_win_rate,
        kd_ratio = calculated_kd_ratio;

    return null;
end;
$$ language plpgsql;

-- Drop trigger if exists and create it
drop trigger if exists match_history_stats_update on public.match_history;
create trigger match_history_stats_update
after insert or update or delete on public.match_history
for each row execute procedure public.update_game_profile_stats();

-- Backfill stats for all existing game profiles based on match history
do $$
declare
    r record;
    total_matches integer;
    win_matches integer;
    calculated_win_rate double precision;
    total_kills integer;
    total_deaths integer;
    calculated_kd_ratio double precision;
begin
    for r in select distinct user_id, game_type from public.match_history loop
        -- Aggregate matches
        select count(*), 
               coalesce(sum(case when is_win = true then 1 else 0 end), 0),
               coalesce(sum(kills), 0),
               coalesce(sum(deaths), 0)
        into total_matches, win_matches, total_kills, total_deaths
        from public.match_history
        where user_id = r.user_id and game_type = r.game_type;

        -- Calculate metrics
        if total_matches > 0 then
            calculated_win_rate := win_matches::double precision / total_matches::double precision;
        else
            calculated_win_rate := 0.0;
        end if;

        if total_deaths > 0 then
            calculated_kd_ratio := total_kills::double precision / total_deaths::double precision;
        else
            calculated_kd_ratio := total_kills::double precision;
        end if;

        -- Update or insert game profile
        insert into public.game_profiles (user_id, game_type, matches_played, win_rate, kd_ratio)
        values (r.user_id, r.game_type, total_matches, calculated_win_rate, calculated_kd_ratio)
        on conflict (user_id, game_type) do update
        set matches_played = total_matches,
            win_rate = calculated_win_rate,
            kd_ratio = calculated_kd_ratio;
    end loop;
end;
$$;
