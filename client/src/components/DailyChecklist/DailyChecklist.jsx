import React, { useEffect } from 'react';
import { Sparkles, Calendar, Award, CheckCircle } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import NeonCheckbox from '../ui/NeonCheckbox';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useChecklist } from '../../hooks/useChecklist';
import { GAME_CONFIGS } from '../../lib/gameConfigs';

import { playSynthSound } from '../../lib/sound';

export default function DailyChecklist() {
  const { checklist, header, isLoading, fetchChecklist, toggleTask } = useChecklist();

  useEffect(() => {
    fetchChecklist();
  }, []);

  const handleToggle = (task) => {
    if (!task.is_completed) {
      playSynthSound('success');
    } else {
      playSynthSound('click');
    }
    toggleTask(task.id, task.completed_count, task.target_count);
  };

  if (isLoading && checklist.length === 0) {
    return (
      <GlassCard className="py-16 flex justify-center items-center">
        <LoadingSpinner text="Generating daily checklist tailored to your weaknesses..." />
      </GlassCard>
    );
  }

  // Calculate completed count
  const completedTasks = checklist.filter(t => t.is_completed).length;
  const totalTasks = checklist.length;
  const isAllDone = totalTasks > 0 && completedTasks === totalTasks;

  return (
    <GlassCard className="w-full flex flex-col gap-6 relative overflow-hidden">
      {/* Visual background element */}
      {isAllDone && (
        <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none border border-emerald-500/10 rounded-2xl transition-all duration-550" />
      )}

      {/* Header Info */}
      <div className="flex justify-between items-start border-b border-white/5 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="font-display font-bold text-lg text-white">Daily Training Checklist</h2>
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>Targeting your analyzed gaming deficiencies</span>
          </div>
        </div>

        {/* Status indicator badge */}
        {totalTasks > 0 && (
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-[var(--game-accent)] bg-[var(--game-accent)]/10 px-3 py-1 rounded-xl border border-[var(--game-accent)]/20 shadow-[0_0_10px_var(--game-glow)]">
              {completedTasks}/{totalTasks} DONE
            </span>
          </div>
        )}
      </div>

      {/* Checklist Grid */}
      {totalTasks === 0 ? (
        <div className="text-center py-10 flex flex-col items-center justify-center">
          <CheckCircle className="w-12 h-12 text-slate-600 mb-3" />
          <p className="text-sm font-medium text-slate-350">Daily agenda is empty</p>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">
            Generate an AI Coaching Report to seed weakness profiles, and your daily checklists will auto-generate here!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {checklist.map((task) => {
            const gameConfig = GAME_CONFIGS[task.game_type || 'valorant'];
            return (
              <div 
                key={task.id}
                style={{ '--game-accent': gameConfig?.accentColor, '--game-glow': gameConfig?.glowColor }}
                className={`
                  p-4 
                  rounded-xl 
                  border 
                  transition-all 
                  duration-300
                  ${task.is_completed 
                    ? 'bg-white/2 border-white/5 opacity-60' 
                    : 'bg-black/20 border-white/5 hover:border-[var(--game-accent)] hover:bg-white/5'}
                `}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <NeonCheckbox
                      checked={task.is_completed}
                      onChange={() => handleToggle(task)}
                      label={task.task_description}
                      description={`Category: ${task.category.toUpperCase()} | Game Arena: ${gameConfig?.name}`}
                    />
                  </div>
                  {/* Reward Badge */}
                  <div className="flex items-center gap-1 text-xs font-bold font-mono text-amber-500/80 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">
                    <Award className="w-3.5 h-3.5" />
                    <span>+10 XP</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Completed All Reward card */}
      {isAllDone && (
        <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-emerald-400 animate-float-in">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏆</span>
            <div>
              <p className="text-sm font-bold text-white">Daily Training Complete!</p>
              <p className="text-xs text-slate-400 mt-0.5">You've unlocked the daily completion bonus.</p>
            </div>
          </div>
          <span className="font-mono text-sm font-bold bg-emerald-500/20 px-3 py-1 rounded border border-emerald-500/30">
            +50 XP BONUS
          </span>
        </div>
      )}
    </GlassCard>
  );
}
