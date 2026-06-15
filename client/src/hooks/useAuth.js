import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { useGameStore } from '../store/useGameStore';

export function useAuth() {
  const { setAuth, setProfile, setLoading, logout } = useAuthStore();

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setAuth(session, session.user);
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setAuth(session, session.user);
        fetchProfile(session.user.id);
      } else {
        logout();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setAuth, setProfile, setLoading, logout]);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);

      // Fetch user's game profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('game_profiles')
        .select('*')
        .eq('user_id', userId);

      if (!profilesError && profiles) {
        if (profiles.length === 0) {
          // Auto-initialize game profiles for all games if missing
          const games = ['valorant', 'cs2', 'lol', 'fortnite', 'pubg'];
          const newProfiles = [];
          for (const game of games) {
            const { data: newProfile, error: createError } = await supabase
              .from('game_profiles')
              .insert({
                user_id: userId,
                game_type: game,
                current_rank: 'Bronze I',
                peak_rank: 'Bronze I',
                total_xp: 0
              })
              .select()
              .single();
            if (!createError && newProfile) {
              newProfiles.push(newProfile);
            }
          }
          const profilesMap = {};
          newProfiles.forEach(p => {
            profilesMap[p.game_type] = p;
          });
          useGameStore.getState().setGameProfiles(profilesMap);
        } else {
          const profilesMap = {};
          profiles.forEach(p => {
            profilesMap[p.game_type] = p;
          });
          useGameStore.getState().setGameProfiles(profilesMap);
        }
      }
    } catch (err) {
      console.error('Failed to load user profile:', err);
    } finally {
      setLoading(false);
    }
  };


  return null;
}
