import { useGameStore } from '../store/useGameStore';
import { useUIStore } from '../store/useUIStore';
import { api } from '../lib/api';

export function useProgress() {
  const { activeGame, progressScores, setProgressScores, setLoading, loading } = useGameStore();
  const { addNotification } = useUIStore();

  const fetchProgress = async (game = activeGame) => {
    setLoading('progress', true);
    try {
      const scores = await api.getProgressScores(game);
      setProgressScores(scores);
    } catch (err) {
      addNotification('Failed to fetch progress scores', 'error');
    } finally {
      setLoading('progress', false);
    }
  };

  return {
    progressScores,
    isLoading: loading.progress,
    fetchProgress
  };
}
