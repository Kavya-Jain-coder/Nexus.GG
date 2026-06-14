import React, { useEffect, useState } from 'react';
import { Sword, Trophy, Trash2, Calendar, X, BarChart3, ShieldAlert } from 'lucide-react';
import MatchUploader from '../../components/MatchUploader/MatchUploader';
import ThreeMatchCluster from '../../components/dashboard/ThreeMatchCluster';
import GlassCard from '../../components/ui/GlassCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import NeonButton from '../../components/ui/NeonButton';
import { useMatches } from '../../hooks/useMatches';
import { useGameStore } from '../../store/useGameStore';
import { GAME_CONFIGS } from '../../lib/gameConfigs';
import { playSynthSound } from '../../lib/sound';

export default function GameArena() {
  const { matchHistory, isLoading, fetchMatches } = useMatches();
  const { activeGame } = useGameStore();
  const [selectedMatch, setSelectedMatch] = useState(null);

  useEffect(() => {
    fetchMatches();
    setSelectedMatch(null);
  }, [activeGame]);

  const gameConfig = GAME_CONFIGS[activeGame || 'valorant'];

  const handleCloseInspector = () => {
    playSynthSound('click');
    setSelectedMatch(null);
  };

  return (
    <div className="space-y-8 pb-12 animate-float-in relative">
      {/* Title Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Sword className="w-6 h-6 text-[var(--game-accent)] animate-neon-pulse" />
            <h1 className="font-display font-black text-2xl text-white tracking-wide uppercase">GAME ARENA</h1>
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

        {/* History List & 3D Cluster Right Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* 3D Match Constellation WebGL Visualizer */}
          <div className="h-80 w-full relative">
            <ThreeMatchCluster 
              matchHistory={matchHistory} 
              activeGame={activeGame} 
              onSelectMatch={(match) => {
                setSelectedMatch(match);
              }} 
            />
          </div>

          {/* List Table */}
          <GlassCard className="flex flex-col gap-6">
            <div className="border-b border-white/5 pb-4 flex justify-between items-center">
              <div>
                <h2 className="font-display font-bold text-lg text-white">Uploaded Match Telemetries</h2>
                <p className="text-xs text-slate-400 mt-1">Your recent gaming files parsed successfully into state</p>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-500 bg-white/5 px-2.5 py-1 rounded">
                TELEMETRY_INDEX
              </span>
            </div>

            {isLoading && matchHistory.length === 0 ? (
              <div className="py-20 flex justify-center items-center">
                <LoadingSpinner text="Retrieving telemetry history..." />
              </div>
            ) : matchHistory.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center justify-center">
                <Calendar className="w-12 h-12 text-slate-600 mb-3" />
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
                        onMouseEnter={() => playSynthSound('hover')}
                        onClick={() => {
                          playSynthSound('success');
                          setSelectedMatch(match);
                        }}
                        className="hover:bg-white/2 cursor-pointer transition-colors group"
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

      {/* Floating 3D Holographic Match Telemetry Inspector Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg hud-panel hud-panel-active p-8 relative overflow-hidden animate-float-in">
            <div className="scanlines-overlay" />
            <div className="scan-line" />
            <div className="hud-accent-bar" />
            
            {/* Tech Corners */}
            <div className="tech-corner-tl" />
            <div className="tech-corner-tr" />
            <div className="tech-corner-bl" />
            <div className="tech-corner-br" />

            {/* Header info */}
            <div className="flex justify-between items-start border-b border-white/10 pb-4 mb-6 relative z-10">
              <div className="space-y-1">
                <span className="font-mono text-[9px] text-[var(--game-accent)] tracking-widest block uppercase">
                  NODE // TELEMETRY_INSPECTION_CORE
                </span>
                <h3 className="font-display font-black text-xl text-white">
                  {selectedMatch.is_win ? 'VICTORY DETAILS' : 'DEFEAT LOG'}
                </h3>
              </div>
              <button 
                onClick={handleCloseInspector}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Details */}
            <div className="space-y-6 relative z-10 font-mono text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">PERFORMANCE SCORE</p>
                  <p className="font-display font-black text-3xl text-white mt-1">
                    {selectedMatch.performance_score ? selectedMatch.performance_score.toFixed(1) : '80.0'}
                  </p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">K / D / A INDEX</p>
                  <p className="font-display font-black text-xl text-slate-200 mt-2">
                    {selectedMatch.kills} / <span className="text-rose-500">{selectedMatch.deaths}</span> / {selectedMatch.assists}
                  </p>
                </div>
              </div>

              {/* Advanced telemetry logs */}
              <div className="bg-black/60 p-4 rounded-xl border border-white/5 space-y-2.5 text-xs text-slate-350">
                <div className="flex justify-between">
                  <span>Match Sync Timestamp:</span>
                  <span className="text-white">
                    {new Date(selectedMatch.played_at).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Arena Category:</span>
                  <span className="text-[var(--game-accent)] uppercase font-bold">
                    {activeGame?.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Weakness Multiplier:</span>
                  <span className="text-emerald-400 font-bold">
                    x1.25 XP_BOOST
                  </span>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <NeonButton size="md" onClick={handleCloseInspector}>
                  CLOSE TERMINAL
                </NeonButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
