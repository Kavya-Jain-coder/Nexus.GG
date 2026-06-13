import { useGameStore } from '../store/useGameStore';
import { useUIStore } from '../store/useUIStore';
import { api } from '../lib/api';

export function useStreak() {
  const { streaks, setStreaks, setLoading, loading } = useGameStore();
  const { addNotification } = useUIStore();

  const fetchStreaks = async () => {
    setLoading('streaks', true);
    try {
      const data = await api.getStreaks();
      setStreaks(data);
    } catch (err) {
      console.error('Failed to fetch streaks:', err);
    } finally {
      setLoading('streaks', false);
    }
  };

  return {
    streaks,
    isLoading: loading.streaks,
    fetchStreaks
  };
}
