import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Target, Zap, TrendingUp, Sparkles, LogIn } from 'lucide-react';
import ParticleBackground from '../../components/layout/ParticleBackground';
import GlassCard from '../../components/ui/GlassCard';
import NeonButton from '../../components/ui/NeonButton';
import logoImg from '../../assets/backgrounds/Removed-bg-NexusGG-Logo.png';
import dashboardBg from '../../assets/backgrounds/dashboard-bg.jpg';

export default function Landing() {
  const features = [
    {
      title: 'Match Telemetry Engine',
      desc: 'Ingest raw match telemetry to map your combat uptime, utility efficiency, and weapon mechanics without lag.',
      tag: 'METRIC_PARSER',
      icon: Target,
      color: '#ff4655'
    },
    {
      title: 'Hybrid AI Routing',
      desc: 'Multi-model coordination grid maps your telemetry against pro strategies to build your tactical playbook.',
      tag: 'COGNITIVE_GRID',
      icon: Zap,
      color: '#00f0ff'
    },
    {
      title: 'Weekly Progression Index',
      desc: 'Visualize your developmental trajectory, aim velocity, and win ratios on a real-time analytics visualizer.',
      tag: 'KPI_TELEMETRY',
      icon: TrendingUp,
      color: '#c8aa6e'
    }
  ];

  return (
    <div 
      className="relative min-h-screen flex flex-col justify-between overflow-x-hidden"
      style={{
        backgroundImage: `url(${dashboardBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Background tint overlay */}
      <div className="absolute inset-0 bg-[#080810]/90 z-0" />
      <ParticleBackground />

      {/* Top Header */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-8 h-24 flex items-center justify-between">
        <div className="flex items-center select-none -ml-4">
          <img 
            src={logoImg} 
            alt="NEXUS.GG Logo" 
            className="h-20 w-auto object-contain filter drop-shadow-[0_0_15px_rgba(155,93,229,0.45)] scale-125 transform-gpu" 
          />
        </div>
        
        <Link to="/auth">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500 text-sm font-semibold hover:text-white transition-all">
            <LogIn className="w-4 h-4 text-purple-400" />
            ENTER ARENA
          </button>
        </Link>
      </header>

      {/* Hero Body */}
      <main className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-8 flex-1 flex flex-col items-center justify-center text-center py-20">
        <div className="space-y-6 max-w-3xl">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-400 text-xs font-semibold tracking-wider uppercase animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Game Coaching Operating System</span>
          </div>

          {/* Heading */}
          <h1 className="font-display font-black text-4xl sm:text-6xl tracking-tight text-white leading-tight">
            Stop Guessing.<br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent filter drop-shadow-[0_0_15px_rgba(155,93,229,0.2)]">
              Perfect Your Execution.
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
            NEXUS.GG ingests your match telemetry database dumps, detects tactical deficiencies across 5 games, and compiles customized daily checklist drills to refine your mechanics.
          </p>

          {/* Actions */}
          <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <NeonButton size="lg" style={{ '--game-accent': '#9b5de5', '--game-glow': 'rgba(155,93,229,0.4)' }}>
                GET COACHED NOW
              </NeonButton>
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-24">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <GlassCard 
                key={idx} 
                hoverGlow={true}
                glowColor={`rgba(${idx === 0 ? '255,70,85' : idx === 1 ? '0,240,255' : '200,170,110'}, 0.35)`}
                className="flex flex-col items-center p-8 text-center gap-5 border border-white/5 relative overflow-hidden group/card"
              >
                {/* Tech scanline / grid effect */}
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none opacity-20" />
                
                {/* Cyber corner accents */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 opacity-30 group-hover/card:opacity-100 transition-opacity" style={{ borderColor: feat.color }} />
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 opacity-30 group-hover/card:opacity-100 transition-opacity" style={{ borderColor: feat.color }} />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 opacity-30 group-hover/card:opacity-100 transition-opacity" style={{ borderColor: feat.color }} />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 opacity-30 group-hover/card:opacity-100 transition-opacity" style={{ borderColor: feat.color }} />

                {/* Subtitle Tech Module Tag */}
                <div className="font-mono text-[9px] font-bold tracking-widest text-slate-500 uppercase flex items-center gap-1.5 select-none">
                  <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: feat.color }} />
                  MODULE // {feat.tag}
                </div>

                <div 
                  style={{ backgroundColor: `${feat.color}10`, color: feat.color, borderColor: `${feat.color}30` }}
                  className="p-4 rounded-2xl border shadow-[0_0_15px_rgba(var(--card-glow),0.1)] transition-transform duration-300 group-hover/card:scale-110"
                >
                  <Icon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-display font-black text-xl text-white mb-2 tracking-wide uppercase">{feat.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed font-sans">{feat.desc}</p>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 max-w-7xl mx-auto w-full px-6 sm:px-8 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
        <span>© 2026 NEXUS.GG Inc. All rights reserved.</span>
        <div className="flex gap-6">
          <a href="#" className="hover:text-slate-300">Privacy Policy</a>
          <a href="#" className="hover:text-slate-300">Terms of Use</a>
          <a href="#" className="hover:text-slate-300">System Status</a>
        </div>
      </footer>
    </div>
  );
}
