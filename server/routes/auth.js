// server/routes/auth.js
import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

// Fetch active profile details
router.get('/profile', requireAuth, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;
    res.json({ success: true, profile: data });
  } catch (err) {
    next(err);
  }
});

// Update profile details
router.patch('/profile', requireAuth, async (req, res, next) => {
  try {
    const { display_name, avatar_url } = req.body;

    const { data, error } = await supabase
      .from('users')
      .update({ display_name, avatar_url })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, profile: data });
  } catch (err) {
    next(err);
  }
});

export default router;
