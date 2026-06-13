import React, { useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { TrendingUp, Award, Calendar, Activity } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import { useProgress } from '../../hooks/useProgress';
import SessionHeatmap from './SessionHeatmap';

export default function ProgressTracker() {
  const { progressScores, isLoading, fetchProgress } = useProgress();
  const activeGame = useProgress().activeGame; // Will fallback automatically

  useEffect(() => {
    fetchProgress();
  }, [activeGame]);

  // Handle empty chart data gracefully
  const chartData = progressScores.length > 0 
    ? [...progressScores].reverse().map(score => ({
        date: new Date(score.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        Score: score.improvement_score,
        Aim: score.category_scores?.aim || 50,
        Positioning: score.category_scores?.positioning || 50,
        Utility: score.category_scores?.utility || 50,
      }))
    : [
        { date: 'Day 1', Score: 60, Aim: 58, Positioning: 62, Utility: 59 },
        { date: 'Day 2', Score: 64, Aim: 61, Positioning: 66, Utility: 63 },
        { date: 'Day 3', Score: 62, Aim: 60, Positioning: 63, Utility: 62 },
        { date: 'Day 4', Score: 68, Aim: 66, Positioning: 70, Utility: 67 },
        { date: 'Day 5', Score: 71, Aim: 69, Positioning: 72, Utility: 70 },
        { date: 'Day 6', Score: 75, Aim: 73, Positioning: 76, Utility: 74 },
        { date: 'Day 7', Score: 78, Aim: 77, Positioning: 80, Utility: 76 },
      ];

  const currentScore = progressScores[0]?.improvement_score || 72;
  const previousScore = progressScores[1]?.improvement_score || 65;
  const delta = currentScore - previousScore;

  return (
    <div className="flex flex-col gap-6">
      {/* Overview stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-[var(--game-accent)]/10 text-[var(--game-accent)]">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Current AI Rating</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="font-display font-bold text-2xl text-white">{currentScore}</span>
              <span className={`text-xs font-semibold font-mono ${delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {delta >= 0 ? '+' : ''}{delta.toFixed(1)} vs last session
              </span>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Weaknesses Staged</p>
            <p className="font-display font-bold text-2xl text-white mt-0.5">
              {progressScores[0]?.notes ? '3 active' : 'None'}
            </p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-amber-500/10 text-amber-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Rank Progress</p>
            <p className="font-display font-bold text-2xl text-white mt-0.5">Next Tier In Sight</p>
          </div>
        </GlassCard>
      </div>

      {/* Main Graph Card */}
      <GlassCard className="flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-white/5 pb-4">
          <div>
            <h3 className="font-display font-bold text-base text-white">Performance Progression</h3>
            <p className="text-xs text-slate-400 mt-0.5">Track AI Performance Rating changes day over day</p>
          </div>
        </div>

        {/* Chart View */}
        <div className="w-full h-80 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="glowGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--game-accent)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--game-accent)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="rgba(255,255,255,0.3)" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="rgba(255,255,255,0.3)" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
                domain={[30, 100]} 
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(16, 16, 28, 0.95)', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '12px',
                  color: '#ffffff'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="Score" 
                stroke="var(--game-accent)" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#glowGrad)" 
              />
              <Line type="monotone" dataKey="Aim" stroke="#00f0ff" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
              <Line type="monotone" dataKey="Positioning" stroke="#de9b35" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Heatmap Activity Section */}
      <SessionHeatmap />
    </div>
  );
}
