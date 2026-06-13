import { useGameStore } from '../store/useGameStore';
import { useUIStore } from '../store/useUIStore';
import { api } from '../lib/api';

export function useMatches() {
  const { activeGame, matchHistory, setMatchHistory, addMatch, setLoading, loading } = useGameStore();
  const { addNotification } = useUIStore();

  const fetchMatches = async (game = activeGame) => {
    setLoading('matches', true);
    try {
      const matches = await api.getMatches(game);
      setMatchHistory(matches);
    } catch (err) {
      addNotification(err.message || 'Failed to fetch match history', 'error');
    } finally {
      setLoading('matches', false);
    }
  };

  const uploadMatchFile = async (file) => {
    setLoading('matches', true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const result = await api.uploadMatches(formData, activeGame);
      if (result.matches) {
        // Multi-upload or list returned
        fetchMatches();
      } else if (result.match) {
        addMatch(result.match);
      }
      
      addNotification('Match logs uploaded & parsed successfully!', 'success');
      return result;
    } catch (err) {
      addNotification(err.message || 'Upload failed', 'error');
      throw err;
    } finally {
      setLoading('matches', false);
    }
  };

  const syncProfileMatches = async (playerName) => {
    setLoading('matches', true);
    try {
      const result = await api.syncMatch(activeGame, playerName);
      if (result.match) {
        addMatch(result.match);
      } else {
        fetchMatches();
      }
      addNotification('Game profile synchronized successfully!', 'success');
      return result;
    } catch (err) {
      addNotification(err.message || 'Sync failed', 'error');
      throw err;
    } finally {
      setLoading('matches', false);
    }
  };

  return {
    matchHistory,
    isLoading: loading.matches,
    fetchMatches,
    uploadMatchFile,
    syncProfileMatches
  };
}
