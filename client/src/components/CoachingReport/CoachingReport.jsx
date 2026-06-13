import React from 'react';
import { BrainCircuit, Check, ShieldAlert, Award, Loader2 } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import NeonButton from '../ui/NeonButton';
import { GAME_CONFIGS } from '../../lib/gameConfigs';
import { useCoaching } from '../../hooks/useCoaching';
import { useMatches } from '../../hooks/useMatches';

export default function CoachingReport() {
  const { currentReport, isLoading, triggerAnalysis } = useCoaching();
  const { matchHistory } = useMatches();
  const activeGame = useCoaching().activeGame; // Will fallback automatically

  const config = GAME_CONFIGS[currentReport?.game_type || 'valorant'];

  const handleGenerateReport = async () => {
    await triggerAnalysis();
  };

  if (isLoading) {
    return (
      <GlassCard className="flex flex-col items-center justify-center py-20 text-center">
        <Loader2 className="w-12 h-12 text-[var(--game-accent)] animate-spin mb-4" />
        <p className="font-semibold text-slate-200">AI Coach is analyzing your match history...</p>
        <p className="text-xs text-slate-500 mt-2 max-w-xs">
          Scanning telemetry variables, mapping movement, economy decisions, and aiming metrics.
        </p>
      </GlassCard>
    );
  }

  if (!currentReport) {
    return (
      <GlassCard className="text-center py-16 flex flex-col items-center justify-center">
        <BrainCircuit className="w-14 h-14 text-slate-600 mb-4 animate-float" />
        <h3 className="font-display font-bold text-lg text-white mb-2">No active coaching report</h3>
        <p className="text-sm text-slate-400 max-w-sm mb-6">
          Upload at least 1 match log in the Game Arena to allow the AI to parse patterns and evaluate your gameplay metrics.
        </p>
        <NeonButton 
          disabled={matchHistory.length === 0} 
          onClick={handleGenerateReport}
        >
          {matchHistory.length === 0 ? 'UPLOAD MATCHES FIRST' : 'GENERATE AI COACHING ANALYSIS'}
        </NeonButton>
      </GlassCard>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-float-in">
      {/* Hero Overview */}
      <GlassCard className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{config.coachAvatar}</span>
            <div>
              <h3 className="font-display font-bold text-xl text-white">COACH SESSION ASSESSMENT</h3>
              <p className="text-xs text-[var(--game-accent)] uppercase tracking-wider font-semibold">
                Led by Coach {config.coachName}
              </p>
            </div>
          </div>
          <p className="text-sm italic text-slate-300 leading-relaxed pl-2 border-l-2 border-[var(--game-accent)]">
            "{currentReport.coach_feedback}"
          </p>
        </div>

        {/* AI Performance Score Ring */}
        <div className="flex flex-col items-center justify-center bg-white/5 border border-white/5 rounded-2xl p-6 text-center">
          <div className="relative flex items-center justify-center">
            {/* Background Circle */}
            <svg className="w-24 h-24 transform -rotate-90">
              <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
              <circle 
                cx="48" 
                cy="48" 
                r="40" 
                stroke="var(--game-accent)" 
                strokeWidth="8" 
                fill="transparent" 
                strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={2 * Math.PI * 40 * (1 - currentReport.overall_performance_score / 100)}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <span className="absolute font-mono font-bold text-2xl text-white">
              {Math.round(currentReport.overall_performance_score)}
            </span>
          </div>
          <span className="text-xs font-bold text-slate-400 tracking-wider mt-3">PERFORMANCE INDEX</span>
        </div>
      </GlassCard>

      {/* Strengths & Weaknesses Split Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths Card */}
        <GlassCard className="flex flex-col gap-4">
          <h3 className="font-display font-bold text-base text-emerald-400 flex items-center gap-2">
            <Award className="w-5 h-5" /> Key Strengths
          </h3>
          <div className="space-y-4">
            {currentReport.strengths.map((str, idx) => (
              <div key={idx} className="flex gap-3 items-start bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl">
                <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-white">{str.strength}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{str.description}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Weaknesses Card */}
        <GlassCard className="flex flex-col gap-4">
          <h3 className="font-display font-bold text-base text-rose-400 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5" /> Major Weaknesses
          </h3>
          <div className="space-y-4">
            {currentReport.weaknesses.map((weak, idx) => {
              const severityColors = {
                high: 'border-rose-500/25 bg-rose-500/5 text-rose-400',
                medium: 'border-amber-500/25 bg-amber-500/5 text-amber-400',
                low: 'border-sky-500/25 bg-sky-500/5 text-sky-400'
              };
              return (
                <div key={idx} className={`border p-3.5 rounded-xl space-y-2 ${severityColors[weak.severity || 'medium']}`}>
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-bold text-white">{weak.weakness}</p>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-white/10 tracking-widest">
                      {weak.severity} PRIORITY
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{weak.description}</p>
                  
                  {/* Action Recommendations */}
                  <div className="pt-2 border-t border-white/5 space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Training Protocol</p>
                    {weak.recommendations.map((rec, rIdx) => (
                      <p key={rIdx} className="text-xs text-slate-400 flex items-center gap-1.5 pl-1">
                        <span className="w-1 h-1 rounded-full bg-[var(--game-accent)]" />
                        {rec}
                      </p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>

      {/* Action Button to refresh */}
      <div className="flex justify-end">
        <NeonButton variant="outline" size="sm" onClick={handleGenerateReport}>
          RE-RUN DEEP AUDIT
        </NeonButton>
      </div>
    </div>
  );
}
