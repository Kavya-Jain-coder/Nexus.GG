import React from 'react';
import GlassCard from '../ui/GlassCard';
import ProgressBar from '../ui/ProgressBar';
import { getRankDetails } from '../../lib/constants';
import { useGameStore } from '../../store/useGameStore';

export default function RankBadge() {
  const { activeGame, gameProfiles } = useGameStore();
  const profile = gameProfiles[activeGame] || { total_xp: 0 };

  const rank = getRankDetails(profile.total_xp);
  const currentLevel = Math.floor(profile.total_xp / 1000) + 1;
  const currentLevelBaseXp = (currentLevel - 1) * 1000;
  const nextLevelBaseXp = currentLevel * 1000;
  const relativeXp = profile.total_xp - currentLevelBaseXp;

  return (
    <GlassCard className="w-full flex flex-col gap-6 relative overflow-hidden">
      {/* Glow aura background */}
      <div className="absolute right-0 top-0 w-40 h-40 bg-[var(--game-accent)]/10 rounded-full blur-3xl filter -z-10 pointer-events-none" />

      {/* Header Profile Title */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h3 className="font-display font-bold text-base text-white">NEXUS RANK CARD</h3>
          <p className="text-xs text-slate-400 mt-0.5">Your current level status & gaming tier across this arena</p>
        </div>
        <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">
          SYNCED ACTIVE
        </span>
      </div>

      {/* Grid: Badge details and progress bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
        {/* Large Badge Container */}
        <div className="flex flex-col items-center justify-center p-4 bg-white/5 border border-white/5 rounded-2xl md:col-span-1 text-center">
          <span className="text-5xl filter drop-shadow-[0_0_12px_var(--game-glow)] animate-float">
            {rank.badge}
          </span>
          <h4 className="font-display font-bold text-lg text-white mt-4">{rank.currentRank}</h4>
          <p className="text-[10px] font-bold text-[var(--game-accent)] uppercase tracking-wider mt-1">Tier Level {currentLevel}</p>
        </div>

        {/* Level XP Progress details */}
        <div className="md:col-span-3 space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-slate-400">Total Experience Points</p>
              <p className="font-display font-black text-2xl text-white mt-1">
                {profile.total_xp} <span className="text-sm font-semibold text-slate-550">XP</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Next Rank Tier</p>
              <p className="text-sm font-bold text-slate-200 mt-1">
                {rank.nextRank} {rank.nextBadge}
              </p>
            </div>
          </div>

          {/* Level Progress Slider */}
          <ProgressBar
            value={relativeXp}
            max={1000}
            label={`Progress to Level ${currentLevel + 1}`}
            showPercent={true}
          />

          <p className="text-xs text-slate-500">
            Earn +10 XP for each daily checklist task, and +50 XP for full completions.
          </p>
        </div>
      </div>
    </GlassCard>
  );
}
