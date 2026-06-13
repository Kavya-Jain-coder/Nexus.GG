import React from 'react';
import GlassCard from '../ui/GlassCard';

export default function SessionHeatmap() {
  // Generate dummy data representing past 12 weeks of training consistency
  const generateHeatmapDays = () => {
    const days = [];
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - 84); // 12 weeks

    for (let i = 0; i <= 84; i++) {
      const currentDate = new Date(baseDate);
      currentDate.setDate(baseDate.getDate() + i);
      
      // Random activity level 0-4
      let level = 0;
      const rand = Math.random();
      if (rand > 0.85) level = 4;
      else if (rand > 0.7) level = 3;
      else if (rand > 0.5) level = 2;
      else if (rand > 0.3) level = 1;

      days.push({
        date: currentDate.toISOString().split('T')[0],
        level
      });
    }
    return days;
  };

  const daysData = generateHeatmapDays();

  // Levels colors mapped to the active game theme
  const getLevelClass = (level) => {
    switch (level) {
      case 0: return 'bg-white/5 hover:bg-white/10';
      case 1: return 'bg-[var(--game-accent)]/20 shadow-[inset_0_0_2px_var(--game-accent)]';
      case 2: return 'bg-[var(--game-accent)]/40';
      case 3: return 'bg-[var(--game-accent)]/70';
      case 4: return 'bg-[var(--game-accent)] shadow-[0_0_6px_var(--game-glow)]';
      default: return 'bg-white/5';
    }
  };

  return (
    <GlassCard className="flex flex-col gap-4">
      <div>
        <h3 className="font-display font-bold text-base text-white">Training Consistency</h3>
        <p className="text-xs text-slate-400 mt-0.5">Heatmap representing daily session check-ins & completed training logs</p>
      </div>

      <div className="flex flex-col items-center justify-center pt-2">
        {/* Heatmap Grid */}
        <div className="grid grid-flow-col grid-rows-7 gap-1.5 p-2 overflow-x-auto max-w-full">
          {daysData.map((day, idx) => (
            <div
              key={idx}
              className={`w-3.5 h-3.5 rounded-[3px] transition-all duration-200 cursor-pointer ${getLevelClass(day.level)}`}
              title={`${day.date}: Level ${day.level} intensity`}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="flex justify-end w-full gap-2 items-center text-xs text-slate-500 mt-4 pr-4 select-none">
          <span>Less</span>
          <div className="w-3 h-3 rounded-[2px] bg-white/5" />
          <div className="w-3 h-3 rounded-[2px] bg-[var(--game-accent)]/20" />
          <div className="w-3 h-3 rounded-[2px] bg-[var(--game-accent)]/50" />
          <div className="w-3 h-3 rounded-[2px] bg-[var(--game-accent)]" />
          <span>More</span>
        </div>
      </div>
    </GlassCard>
  );
}
