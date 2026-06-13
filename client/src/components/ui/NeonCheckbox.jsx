import React from 'react';
import { motion } from 'framer-motion';

export default function NeonCheckbox({
  checked = false,
  onChange,
  label = '',
  description = '',
  className = '',
  ...props
}) {
  return (
    <label className={`flex items-start gap-4 cursor-pointer select-none group ${className}`}>
      <div className="relative mt-1">
        {/* Checkbox box container */}
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only"
          {...props}
        />
        
        {/* Outer neon shell */}
        <div
          className={`
            w-6 
            h-6 
            rounded-lg 
            border-2 
            transition-all 
            duration-300 
            flex 
            items-center 
            justify-center 
            ${checked 
              ? 'border-[var(--game-accent)] bg-[var(--game-accent)]/10 shadow-[0_0_12px_var(--game-glow)]' 
              : 'border-slate-600 bg-black/40 group-hover:border-slate-400 group-hover:shadow-[0_0_8px_rgba(255,255,255,0.15)]'}
          `}
        >
          {checked && (
            <motion.svg
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="w-4 h-4 text-[var(--game-accent)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="3.5"
            >
              <polyline points="20 6 9 17 4 12" />
            </motion.svg>
          )}
        </div>
      </div>

      <div className="flex-1">
        <span 
          className={`
            block 
            font-medium 
            text-base 
            transition-all 
            duration-300 
            ${checked ? 'text-slate-500 line-through decoration-[var(--game-accent)]/50' : 'text-slate-100 group-hover:text-white'}
          `}
        >
          {label}
        </span>
        {description && (
          <span 
            className={`
              block 
              text-xs 
              mt-0.5 
              transition-colors 
              duration-300 
              ${checked ? 'text-slate-600' : 'text-slate-400 group-hover:text-slate-350'}
            `}
          >
            {description}
          </span>
        )}
      </div>
    </label>
  );
}
