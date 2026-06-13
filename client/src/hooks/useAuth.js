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
        const profilesMap = {};
        profiles.forEach(p => {
          profilesMap[p.game_type] = p;
        });
        useGameStore.getState().setGameProfiles(profilesMap);
      }
    } catch (err) {
      console.error('Failed to load user profile:', err);
    } finally {
      setLoading(false);
    }
  };


  return null;
}
