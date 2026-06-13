import React, { useEffect } from 'react';
import { Sword, Upload, Trophy, Trash2, Calendar } from 'lucide-react';
import MatchUploader from '../../components/MatchUploader/MatchUploader';
import GlassCard from '../../components/ui/GlassCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useMatches } from '../../hooks/useMatches';
import { useGameStore } from '../../store/useGameStore';
import { GAME_CONFIGS } from '../../lib/gameConfigs';

export default function GameArena() {
  const { matchHistory, isLoading, fetchMatches } = useMatches();
  const { activeGame } = useGameStore();

  useEffect(() => {
    fetchMatches();
  }, [activeGame]);

  const gameConfig = GAME_CONFIGS[activeGame || 'valorant'];

  return (
    <div className="space-y-8 pb-12 animate-float-in">
      {/* Title Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Sword className="w-6 h-6 text-[var(--game-accent)]" />
            <h1 className="font-display font-black text-2xl text-white">GAME ARENA</h1>
          </div>
          <p className="text-xs text-slate-450">
            Upload and view match telemetries. Active Game: <span className="font-semibold text-slate-350">{gameConfig?.name}</span>
          </p>
        </div>
      </div>

      {/* Grid: Uploader and Match logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Match Uploader Left Column */}
        <div className="lg:col-span-1">
          <MatchUploader />
        </div>

        {/* History List Right Column */}
        <div className="lg:col-span-2">
          <GlassCard className="flex flex-col gap-6 h-full">
            <div className="border-b border-white/5 pb-4">
              <h2 className="font-display font-bold text-lg text-white">Uploaded Match Telemetries</h2>
              <p className="text-xs text-slate-400 mt-1">Your recent gaming files parsed successfully into state</p>
            </div>

            {isLoading && matchHistory.length === 0 ? (
              <div className="py-20 flex justify-center items-center">
                <LoadingSpinner text="Retrieving telemetry history..." />
              </div>
            ) : matchHistory.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center justify-center">
                <Calendar className="w-12 h-12 text-slate-650 mb-3" />
                <p className="text-sm font-semibold text-slate-350">No match records found</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Drag and drop a JSON/CSV telemetry file on the left to start collecting statistics.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] font-bold text-slate-400 tracking-wider select-none">
                      <th className="pb-3 pl-2">STATUS</th>
                      <th className="pb-3">PERFORMANCE INDEX</th>
                      <th className="pb-3">K / D / A</th>
                      <th className="pb-3">PLAYED AT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {matchHistory.map((match) => (
                      <tr 
                        key={match.id}
                        className="hover:bg-white/2 transition-colors group"
                      >
                        <td className="py-4 pl-2 font-semibold">
                          <span 
                            className={`
                              inline-flex 
                              items-center 
                              px-2.5 
                              py-1 
                              rounded-lg 
                              text-xs 
                              font-bold
                              ${match.is_win 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.15)]' 
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}
                            `}
                          >
                            {match.is_win ? 'VICTORY' : 'DEFEAT'}
                          </span>
                        </td>
                        <td className="py-4 font-mono font-bold text-white">
                          {match.performance_score ? match.performance_score.toFixed(1) : '80.0'}
                        </td>
                        <td className="py-4 font-semibold text-slate-200">
                          {match.kills} / <span className="text-rose-500/80">{match.deaths}</span> / {match.assists}
                        </td>
                        <td className="py-4 text-xs text-slate-450">
                          {new Date(match.played_at).toLocaleDateString(undefined, { 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
