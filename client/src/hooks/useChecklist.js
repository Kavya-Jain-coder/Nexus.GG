import { useGameStore } from '../store/useGameStore';
import { useUIStore } from '../store/useUIStore';
import { api } from '../lib/api';

export function useChecklist() {
  const { 
    dailyChecklist, 
    checklistHeader, 
    setDailyChecklist, 
    setChecklistHeader, 
    updateChecklistTask,
    updateGameProfile,
    setStreaks,
    setLoading, 
    loading 
  } = useGameStore();
  const { addNotification } = useUIStore();

  const fetchChecklist = async () => {
    setLoading('checklist', true);
    try {
      const response = await api.getDailyChecklist();
      setDailyChecklist(response.tasks);
      setChecklistHeader(response.checklist);
    } catch (err) {
      addNotification(err.message || 'Failed to fetch daily checklist', 'error');
    } finally {
      setLoading('checklist', false);
    }
  };

  const toggleTask = async (taskId, currentCount, targetCount) => {
    const isCompletedNow = currentCount >= targetCount;
    const newCount = isCompletedNow ? 0 : targetCount; // Simple toggle behavior
    const finalCompletion = newCount >= targetCount;

    // Optimistic update
    updateChecklistTask(taskId, newCount, finalCompletion);

    try {
      const response = await api.updateChecklistTask(taskId, newCount, finalCompletion);
      
      // If we earned XP, update the active game profile
      if (response.xpEarned && response.task?.game_type) {
        updateGameProfile(response.task.game_type, {
          total_xp: response.newTotalXp
        });
        addNotification(`+${response.xpEarned} XP Earned!`, 'success');
      }

      // If a full checklist was completed, we update the header and streak
      if (response.checklistCompleted) {
        setChecklistHeader(response.checklist);
        addNotification('Daily training checklist complete! +50 XP bonus!', 'success');
      }

      if (response.streaks) {
        setStreaks(response.streaks);
      }
    } catch (err) {
      // Revert optimistic update on failure
      updateChecklistTask(taskId, currentCount, currentCount >= targetCount);
      addNotification(err.message || 'Failed to update task', 'error');
    }
  };

  return {
    checklist: dailyChecklist,
    header: checklistHeader,
    isLoading: loading.checklist,
    fetchChecklist,
    toggleTask
  };
}
