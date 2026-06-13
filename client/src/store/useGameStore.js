import { create } from 'zustand';
import { DEFAULT_GAME } from '../lib/gameConfigs';

export const useGameStore = create((set) => ({
  activeGame: DEFAULT_GAME,
  gameProfiles: {},
  matchHistory: [],
  coachingReports: [],
  dailyChecklist: [],
  checklistHeader: null,
  progressScores: [],
  streaks: null,
  loading: {
    profiles: false,
    matches: false,
    coaching: false,
    checklist: false,
    progress: false,
    streaks: false
  },

  setActiveGame: (game) => set({ activeGame: game }),
  
  setGameProfiles: (profiles) => set({ gameProfiles: profiles }),
  
  updateGameProfile: (gameType, data) => set((state) => ({
    gameProfiles: {
      ...state.gameProfiles,
      [gameType]: { ...state.gameProfiles[gameType], ...data }
    }
  })),

  setMatchHistory: (matches) => set({ matchHistory: matches }),
  
  addMatch: (match) => set((state) => ({
    matchHistory: [match, ...state.matchHistory]
  })),

  setCoachingReports: (reports) => set({ coachingReports: reports }),
  
  addCoachingReport: (report) => set((state) => ({
    coachingReports: [report, ...state.coachingReports]
  })),

  setDailyChecklist: (checklist) => set({ dailyChecklist: checklist }),
  
  setChecklistHeader: (header) => set({ checklistHeader: header }),

  updateChecklistTask: (taskId, completedCount, isCompleted) => set((state) => ({
    dailyChecklist: state.dailyChecklist.map((task) =>
      task.id === taskId ? { ...task, completed_count: completedCount, is_completed: isCompleted } : task
    )
  })),

  setProgressScores: (scores) => set({ progressScores: scores }),
  
  setStreaks: (streaks) => set({ streaks }),

  setLoading: (key, isLoading) => set((state) => ({
    loading: { ...state.loading, [key]: isLoading }
  }))
}));
