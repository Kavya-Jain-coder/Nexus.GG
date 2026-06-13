import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function request(path, options = {}) {
  // Get active session token
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const errJson = await response.json();
      errorMsg = errJson.error || errJson.message || errorMsg;
    } catch (_) {}
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Matches
  async uploadMatches(formData, gameType) {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const headers = {
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    const response = await fetch(`${API_URL}/api/matches/upload?gameType=${gameType}`, {
      method: 'POST',
      headers,
      body: formData
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to upload match logs');
    }

    return response.json();
  },

  async syncMatch(gameType, playerName) {
    return request('/api/matches/sync', {
      method: 'POST',
      body: JSON.stringify({ gameType, playerName })
    });
  },

  async getMatches(gameType) {
    return request(`/api/matches?gameType=${gameType}`);
  },

  // Coaching reports
  async analyzeCoaching(gameType) {
    return request('/api/coaching/analyze', {
      method: 'POST',
      body: JSON.stringify({ gameType })
    });
  },

  async getCoachingReports(gameType) {
    return request(`/api/coaching/reports?gameType=${gameType}`);
  },

  // Checklist
  async getDailyChecklist() {
    return request('/api/coaching/checklist');
  },

  async updateChecklistTask(taskId, completedCount, isCompleted) {
    return request(`/api/coaching/checklist/task/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify({ completedCount, isCompleted })
    });
  },

  // Progress stats
  async getProgressScores(gameType) {
    return request(`/api/progress/scores?gameType=${gameType}`);
  },

  async getStreaks() {
    return request('/api/progress/streaks');
  },

  async getXpTransactions() {
    return request('/api/progress/xp');
  }
};
