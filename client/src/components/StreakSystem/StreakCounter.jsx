import React from 'react';
import { Flame, Star, Award, TrendingUp } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import { useGameStore } from '../../store/useGameStore';

export default function StreakCounter() {
  const { streaks } = useGameStore();

  const current = streaks?.current_streak || 0;
  const longest = streaks?.longest_streak || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full animate-float-in">
      {/* Current Active Streak */}
      <GlassCard className="flex items-center justify-between p-6">
        <div className="space-y-2">
          <p className="text-xs text-slate-400 font-bold tracking-widest uppercase">CURRENT STREAK</p>
          <div className="flex items-baseline gap-2">
            <span className="font-display font-black text-4xl text-orange-400">{current}</span>
            <span className="text-slate-350 text-sm font-semibold">Days Active</span>
          </div>
          <p className="text-xs text-slate-500">Complete checklists daily to stack streak multipliers!</p>
        </div>
        <div className="relative p-5 rounded-2xl bg-orange-500/10 border border-orange-500/25">
          <Flame className="w-10 h-10 text-orange-500 animate-bounce" />
          <div className="absolute inset-0 rounded-2xl bg-orange-500/20 blur-xl filter opacity-40 animate-pulse pointer-events-none" />
        </div>
      </GlassCard>

      {/* Longest/Peak Streak */}
      <GlassCard className="flex items-center justify-between p-6">
        <div className="space-y-2">
          <p className="text-xs text-slate-400 font-bold tracking-widest uppercase">RECORD STREAK</p>
          <div className="flex items-baseline gap-2">
            <span className="font-display font-black text-4xl text-cyan-400">{longest}</span>
            <span className="text-slate-350 text-sm font-semibold">Days Peak</span>
          </div>
          <p className="text-xs text-slate-500">Your personal all-time highest checklist streak index.</p>
        </div>
        <div className="p-5 rounded-2xl bg-cyan-500/10 border border-cyan-500/25">
          <Star className="w-10 h-10 text-cyan-400 animate-pulse" />
        </div>
      </GlassCard>
    </div>
  );
}
