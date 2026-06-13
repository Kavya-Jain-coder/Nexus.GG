// server/routes/coaching.js
import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { supabase } from '../lib/supabase.js';
import { generateCoachingReport, generateDailyChecklist } from '../ai/router.js';

const router = express.Router();

// Trigger AI Coaching Analysis on recent matches
router.post('/analyze', requireAuth, async (req, res, next) => {
  try {
    const { gameType } = req.body;
    if (!gameType) {
      return res.status(400).json({ error: 'gameType parameter required' });
    }

    // 1. Fetch recent match histories (limit 20 matches)
    const { data: matches, error: fetchErr } = await supabase
      .from('match_history')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('game_type', gameType)
      .order('played_at', { ascending: false })
      .limit(20);

    if (fetchErr) throw fetchErr;

    if (!matches || matches.length === 0) {
      return res.status(400).json({ error: 'Insufficient data. Please upload at least 1 match log to evaluate.' });
    }

    // 2. Trigger AI Coaching Model Router
    const analysis = await generateCoachingReport(matches, gameType);

    // 3. Save Coaching Report to database
    const { data: report, error: saveErr } = await supabase
      .from('coaching_reports')
      .insert({
        user_id: req.user.id,
        game_type: gameType,
        weaknesses: analysis.weaknesses,
        strengths: analysis.strengths,
        coach_feedback: analysis.coachFeedback,
        overall_performance_score: analysis.overallPerformanceScore,
        metrics_summary: analysis.metricsSummary,
        raw_response: JSON.stringify(analysis)
      })
      .select()
      .single();

    if (saveErr) throw saveErr;

    // 4. Save progress snapshot score to progress_scores table
    await supabase
      .from('progress_scores')
      .upsert({
        user_id: req.user.id,
        game_type: gameType,
        improvement_score: analysis.overallPerformanceScore,
        category_scores: {
          aim: analysis.weaknesses.find(w => w.weakness.toLowerCase().includes('aim')) ? 60 : 75,
          positioning: analysis.weaknesses.find(w => w.weakness.toLowerCase().includes('position')) ? 55 : 80,
          utility: analysis.weaknesses.find(w => w.weakness.toLowerCase().includes('utility')) ? 65 : 78
        },
        notes: `AI Weakness Audit: ${analysis.weaknesses.map(w => w.weakness).join(', ')}`
      }, { onConflict: 'user_id,game_type,date', ignoreDuplicates: true });

    res.json({ success: true, report });
  } catch (err) {
    next(err);
  }
});

// Fetch historical coaching reports
router.get('/reports', requireAuth, async (req, res, next) => {
  try {
    const { gameType } = req.query;
    if (!gameType) {
      return res.status(400).json({ error: 'gameType query parameter required' });
    }

    const { data, error } = await supabase
      .from('coaching_reports')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('game_type', gameType)
      .order('analyzed_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// Fetch or generate today's Daily Checklist
router.get('/checklist', requireAuth, async (req, res, next) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Check if today's checklist header already exists
    let { data: checklist, error: fetchErr } = await supabase
      .from('daily_checklists')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('date', todayStr)
      .maybeSingle();

    if (fetchErr) throw fetchErr;

    // 2. If it exists, return checklist and individual tasks
    if (checklist) {
      const { data: tasks, error: tasksErr } = await supabase
        .from('checklist_completions')
        .select('*')
        .eq('checklist_id', checklist.id);

      if (tasksErr) throw tasksErr;
      return res.json({ success: true, checklist, tasks });
    }

    // 3. If it doesn't exist, we must generate a new checklist.
    // Fetch user's latest coaching reports to get weakness profiles
    const { data: reports, error: reportsErr } = await supabase
      .from('coaching_reports')
      .select('weaknesses, game_type')
      .eq('user_id', req.user.id)
      .order('analyzed_at', { ascending: false })
      .limit(3);

    if (reportsErr) throw reportsErr;

    const weaknesses = reports && reports.length > 0
      ? reports.flatMap(r => r.weaknesses.map(w => `${r.game_type}: ${w.weakness}`))
      : ['valorant: lazy crosshair placement', 'lol: poor vision coverage near dragons'];

    // 4. Generate list of tasks using AI (Gemini 1.5 Flash)
    const generatedTasks = await generateDailyChecklist(weaknesses);

    // 5. Create today's checklist header in DB
    const { data: newChecklist, error: createErr } = await supabase
      .from('daily_checklists')
      .insert({
        user_id: req.user.id,
        date: todayStr,
        is_completed: false
      })
      .select()
      .single();

    if (createErr) throw createErr;

    // 6. Insert individual checklist completions
    const tasksToInsert = generatedTasks.map(task => ({
      checklist_id: newChecklist.id,
      user_id: req.user.id,
      game_type: task.gameType || 'valorant',
      task_description: task.taskDescription,
      category: task.category || 'aim',
      target_count: task.targetCount || 1,
      completed_count: 0,
      is_completed: false
    }));

    const { data: insertedTasks, error: insertTasksErr } = await supabase
      .from('checklist_completions')
      .insert(tasksToInsert)
      .select();

    if (insertTasksErr) throw insertTasksErr;

    res.json({ success: true, checklist: newChecklist, tasks: insertedTasks });
  } catch (err) {
    next(err);
  }
});

// Complete or update checklist task
router.patch('/checklist/task/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { completedCount, isCompleted } = req.body;

    // 1. Load task details to verify ownership
    const { data: task, error: loadErr } = await supabase
      .from('checklist_completions')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (loadErr || !task) {
      return res.status(404).json({ error: 'Checklist task not found' });
    }

    const wasCompleted = task.is_completed;

    // 2. Update task state
    const { data: updatedTask, error: updateErr } = await supabase
      .from('checklist_completions')
      .update({
        completed_count: completedCount,
        is_completed: isCompleted
      })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    let xpEarned = 0;
    let newTotalXp = 0;

    // 3. Reward XP if newly completed
    if (isCompleted && !wasCompleted) {
      xpEarned += 10;
      
      const { data: xpTx, error: xpErr } = await supabase
        .from('xp_transactions')
        .insert({
          user_id: req.user.id,
          game_type: task.game_type,
          amount: 10,
          source: 'checklist_task',
          reference_id: task.id
        })
        .select()
        .single();

      if (xpErr) throw xpErr;

      // Load active game profile to get updated total_xp
      const { data: profile } = await supabase
        .from('game_profiles')
        .select('total_xp')
        .eq('user_id', req.user.id)
        .eq('game_type', task.game_type)
        .single();
      
      newTotalXp = profile?.total_xp || 10;
    }

    // 4. Check if entire checklist is complete to reward bonus XP
    const { data: allTasks, error: listErr } = await supabase
      .from('checklist_completions')
      .select('is_completed')
      .eq('checklist_id', task.checklist_id);

    if (listErr) throw listErr;

    const allCompleted = allTasks.every(t => t.is_completed);
    let checklistCompleted = false;
    let updatedChecklist = null;
    let streaks = null;

    if (allCompleted) {
      const { data: checklistHeader, error: headErr } = await supabase
        .from('daily_checklists')
        .select('is_completed')
        .eq('id', task.checklist_id)
        .single();

      if (headErr) throw headErr;

      if (!checklistHeader.is_completed) {
        // Complete header
        const { data: finishedChecklist } = await supabase
          .from('daily_checklists')
          .update({ is_completed: true, xp_rewarded: 50 })
          .eq('id', task.checklist_id)
          .select()
          .single();

        updatedChecklist = finishedChecklist;
        checklistCompleted = true;
        xpEarned += 50;

        // Reward bonus XP transaction
        await supabase
          .from('xp_transactions')
          .insert({
            user_id: req.user.id,
            game_type: task.game_type,
            amount: 50,
            source: 'checklist_full',
            reference_id: task.checklist_id
          });

        // Load active game profile again to get final cumulative total_xp
        const { data: profile } = await supabase
          .from('game_profiles')
          .select('total_xp')
          .eq('user_id', req.user.id)
          .eq('game_type', task.game_type)
          .single();
        
        newTotalXp = profile?.total_xp || newTotalXp;

        // 5. Update user streak
        const todayDate = new Date().toISOString().split('T')[0];
        
        const { data: streakObj, error: streakFetchErr } = await supabase
          .from('streaks')
          .select('*')
          .eq('user_id', req.user.id)
          .single();

        if (!streakFetchErr && streakObj) {
          let currentStreak = streakObj.current_streak;
          let longestStreak = streakObj.longest_streak;
          const lastActive = streakObj.last_active_date;

          const yesterdayDate = new Date();
          yesterdayDate.setDate(yesterdayDate.getDate() - 1);
          const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

          if (lastActive === yesterdayStr) {
            // Consecutive day
            currentStreak += 1;
          } else if (lastActive !== todayDate) {
            // Missed a day
            currentStreak = 1;
          }

          if (currentStreak > longestStreak) {
            longestStreak = currentStreak;
          }

          const { data: updatedStreak } = await supabase
            .from('streaks')
            .update({
              current_streak: currentStreak,
              longest_streak: longestStreak,
              last_active_date: todayDate
            })
            .eq('user_id', req.user.id)
            .select()
            .single();

          streaks = updatedStreak;
        }
      }
    }

    res.json({
      success: true,
      task: updatedTask,
      xpEarned,
      newTotalXp,
      checklistCompleted,
      checklist: updatedChecklist,
      streaks
    });
  } catch (err) {
    next(err);
  }
});

export default router;
