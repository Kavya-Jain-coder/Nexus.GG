import React from 'react';

export default function ProgressBar({
  value = 0,
  max = 100,
  label = '',
  showPercent = true,
  className = '',
  barColor = 'bg-[var(--game-accent)]',
  glow = true,
  ...props
}) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  return (
    <div className={`w-full ${className}`} {...props}>
      {/* Label and numbers */}
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1.5 text-xs sm:text-sm font-semibold tracking-wider text-slate-350 select-none">
          {label && <span>{label}</span>}
          {showPercent && (
            <span className="text-[var(--game-accent)] font-mono">
              {value}/{max} ({percentage}%)
            </span>
          )}
        </div>
      )}

      {/* Progress track */}
      <div className="w-full h-3 rounded-full bg-white/5 border border-white/5 overflow-hidden p-[2px]">
        {/* Fill */}
        <div
          style={{ width: `${percentage}%` }}
          className={`
            h-full 
            rounded-full 
            transition-all 
            duration-550 
            ease-out 
            ${barColor}
            ${glow ? 'shadow-[0_0_10px_var(--game-glow)]' : ''}
          `}
        />
      </div>
    </div>
  );
}
