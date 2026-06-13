// server/routes/progress.js
import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

// Fetch progress scores for graphs
router.get('/scores', requireAuth, async (req, res, next) => {
  try {
    const { gameType } = req.query;
    if (!gameType) {
      return res.status(400).json({ error: 'gameType query parameter required' });
    }

    const { data, error } = await supabase
      .from('progress_scores')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('game_type', gameType)
      .order('date', { ascending: false })
      .limit(30);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// Fetch active user streak
router.get('/streaks', requireAuth, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (error) throw error;
    res.json(data || { current_streak: 0, longest_streak: 0 });
  } catch (err) {
    next(err);
  }
});

// Fetch user XP transactions
router.get('/xp', requireAuth, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('xp_transactions')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
