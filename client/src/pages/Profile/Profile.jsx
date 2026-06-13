import React from 'react';
import { User, Keyboard, ShieldAlert, Award, Calendar } from 'lucide-react';
import StreakCounter from '../../components/StreakSystem/StreakCounter';
import RankBadge from '../../components/StreakSystem/RankBadge';
import GlassCard from '../../components/ui/GlassCard';
import { useAuthStore } from '../../store/useAuthStore';
import { useGameStore } from '../../store/useGameStore';
import { getRankDetails } from '../../lib/constants';

export default function Profile() {
  const { profile } = useAuthStore();
  const { gameProfiles } = useGameStore();

  const mockGamesList = [
    { id: 'valorant', name: 'Valorant', badge: '🟫' },
    { id: 'cs2', name: 'CS2', badge: '⬜' },
    { id: 'lol', name: 'League of Legends', badge: '🟨' },
    { id: 'fortnite', name: 'Fortnite', badge: '🟦' },
    { id: 'pubg', name: 'PUBG', badge: '💎' },
  ];

  return (
    <div className="space-y-8 pb-12 animate-float-in">
      {/* Title Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-[var(--game-accent)]" />
            <h1 className="font-display font-black text-2xl text-white">PLAYER PROFILE</h1>
          </div>
          <p className="text-xs text-slate-450">
            View your global gaming status, rankings, and hardware setups.
          </p>
        </div>
      </div>

      {/* Rank and Streaks Summary Cards */}
      <RankBadge />
      <StreakCounter />

      {/* Grid: Global stats summaries and setup cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Game Stats overview */}
        <GlassCard className="md:col-span-2 flex flex-col gap-6">
          <div className="border-b border-white/5 pb-4">
            <h3 className="font-display font-bold text-base text-white">Universal Statistics</h3>
            <p className="text-xs text-slate-400 mt-1">Metrics aggregated across all game profiles</p>
          </div>

          <div className="space-y-4">
            {mockGamesList.map((game) => {
              const gameProf = gameProfiles[game.id] || { total_xp: 0, matches_played: 0 };
              const rank = getRankDetails(gameProf.total_xp);
              return (
                <div key={game.id} className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{rank.badge}</span>
                    <div>
                      <p className="text-sm font-semibold text-white">{game.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{rank.currentRank}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-200">{gameProf.total_xp} XP</p>
                    <p className="text-xs text-slate-500 mt-0.5">{gameProf.matches_played} Matches parsed</p>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Keyboard Hardware Setup Card */}
        <GlassCard 
          className="md:col-span-1 flex flex-col justify-end min-h-80 overflow-hidden relative border border-white/5 p-6"
          style={{
            backgroundImage: "linear-gradient(to top, rgba(8, 8, 16, 0.95), rgba(8, 8, 16, 0.2)), url('/src/assets/backgrounds/setup-bg.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
              <Keyboard className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base text-white">HARDWARE SETUPS</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Verify polling rates, mouse DPI bindings, and keyboard refresh timings inside your game configurations.
            </p>
            <div className="pt-2 border-t border-white/5 flex justify-between text-[10px] font-mono text-slate-500">
              <span>MOUSE: 800 DPI | 1000HZ</span>
              <span>KEYS: RAPID TRIGGER</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
