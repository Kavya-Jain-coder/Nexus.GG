import React, { useEffect, useState } from 'react';
import { BrainCircuit, BookOpen, BarChart3, UserCheck } from 'lucide-react';
import CoachingReport from '../../components/CoachingReport/CoachingReport';
import DailyChecklist from '../../components/DailyChecklist/DailyChecklist';
import ProgressTracker from '../../components/ProgressTracker/ProgressTracker';
import GlassCard from '../../components/ui/GlassCard';
import ThreeNeuralCore from '../../components/dashboard/ThreeNeuralCore';
import { useCoaching } from '../../hooks/useCoaching';
import { GAME_CONFIGS } from '../../lib/gameConfigs';
import { playSynthSound } from '../../lib/sound';

export default function CoachingOS() {
  const { currentReport, fetchCoachingReports, activeGame } = useCoaching();
  const [activeTab, setActiveTab] = useState('report'); // 'report' | 'checklist' | 'progress'

  useEffect(() => {
    fetchCoachingReports();
  }, [activeGame]);

  const coachConfig = GAME_CONFIGS[activeGame || 'valorant'];

  const tabs = [
    { id: 'report', name: 'Nexus AI Session', icon: BookOpen },
    { id: 'checklist', name: 'Drill Program', icon: UserCheck },
    { id: 'progress', name: 'Metrics Progress', icon: BarChart3 },
  ];

  return (
    <div className="space-y-8 pb-12 animate-float-in">
      {/* Title Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <BrainCircuit className="w-6 h-6 text-[var(--game-accent)] animate-neon-pulse" />
            <h1 className="font-display font-black text-2xl text-white tracking-wide uppercase">NEXUS AI SYSTEM</h1>
          </div>
          <p className="text-xs text-slate-450">
            AI-driven behavioral analysis, daily checklist routines, and progress indexing.
          </p>
        </div>
      </div>

      {/* Main split-screen coaching view */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side: Navigation Tabs and Coach Status Card */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Quick tab switchers */}
          <GlassCard className="p-3 flex flex-col gap-1.5 border border-white/5">
            <p className="text-[10px] font-bold text-slate-500 tracking-wider px-3 py-2 uppercase">SECTIONS</p>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    playSynthSound('click');
                    setActiveTab(tab.id);
                  }}
                  onMouseEnter={() => playSynthSound('hover')}
                  className={`
                    w-full 
                    flex 
                    items-center 
                    gap-3.5 
                    px-4 
                    py-3 
                    rounded-xl 
                    font-semibold 
                    text-sm
                    transition-all
                    duration-200
                    ${isActive 
                      ? 'bg-[var(--game-accent)]/10 text-[var(--game-accent)] border border-[var(--game-accent)]/20 shadow-[0_0_10px_var(--game-glow)]' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'}
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </GlassCard>

          {/* Coach Persona bio details with 3D Neural Core */}
          <GlassCard className="flex flex-col gap-4 relative overflow-hidden">
            {/* Tech 3D Neural Core visual */}
            <div className="h-48 w-full relative bg-black/40 rounded-xl overflow-hidden border border-white/5">
              <ThreeNeuralCore activeGame={activeGame} />
            </div>

            <div className="flex items-center gap-3 border-b border-white/5 pb-3">
              <span className="text-3xl animate-float">{coachConfig?.coachAvatar}</span>
              <div>
                <h4 className="font-display font-bold text-sm text-white">Coach {coachConfig?.coachName}</h4>
                <span className="text-[10px] font-bold text-[var(--game-accent)] uppercase tracking-wider">ACTIVE AGENT</span>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">COACH PERSONALITY</p>
              <p className="text-xs text-slate-300 leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5">
                {coachConfig?.coachPersonality}
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Session Status</span>
                <span className="text-emerald-400 font-bold">READY</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Analysis Version</span>
                <span className="text-slate-400 font-mono">2.5 PRO</span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Side: Tab Panel Content display area */}
        <div className="lg:col-span-3">
          {activeTab === 'report' && <CoachingReport />}
          {activeTab === 'checklist' && <DailyChecklist />}
          {activeTab === 'progress' && <ProgressTracker />}
        </div>
      </div>
    </div>
  );
}
