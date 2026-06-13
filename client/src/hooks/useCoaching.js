import { useGameStore } from '../store/useGameStore';
import { useUIStore } from '../store/useUIStore';
import { api } from '../lib/api';

export function useCoaching() {
  const { activeGame, coachingReports, setCoachingReports, addCoachingReport, setLoading, loading } = useGameStore();
  const { addNotification } = useUIStore();

  const fetchCoachingReports = async (game = activeGame) => {
    setLoading('coaching', true);
    try {
      const reports = await api.getCoachingReports(game);
      setCoachingReports(reports);
    } catch (err) {
      addNotification('Failed to fetch coaching reports', 'error');
    } finally {
      setLoading('coaching', false);
    }
  };

  const triggerAnalysis = async () => {
    setLoading('coaching', true);
    try {
      const result = await api.analyzeCoaching(activeGame);
      addCoachingReport(result.report);
      addNotification('AI Coaching Analysis Completed!', 'success');
      return result.report;
    } catch (err) {
      addNotification(err.message || 'AI coaching analysis failed', 'error');
      throw err;
    } finally {
      setLoading('coaching', false);
    }
  };

  return {
    activeGame,
    reports: coachingReports,
    currentReport: coachingReports[0] || null,
    isLoading: loading.coaching,
    fetchCoachingReports,
    triggerAnalysis
  };
}
