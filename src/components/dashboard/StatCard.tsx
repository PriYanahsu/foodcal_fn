import React from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  label: string;
  value: string | number;
  unit: string;
  icon?: string;
  color?: string; // hex or css var
  progress?: number; // 0-100
  delay?: number;
}

export function StatCard({
  label,
  value,
  unit,
  icon,
  color = '#2f81f7',
  progress,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className="bg-[var(--card-bg)]/80 backdrop-blur-md border border-[var(--card-border)] rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-4 relative overflow-hidden group hover:border-[var(--primary)]/30 transition-colors"
    >
      {/* Background Glow */}
      <div
        className="absolute -right-4 -top-4 w-16 h-16 sm:w-20 sm:h-20 rounded-full opacity-10 blur-xl transition-opacity duration-300 group-hover:opacity-20"
        style={{ backgroundColor: color }}
      />

      <div className="flex justify-between items-start mb-2">
        <div className="min-w-0">
          <p className="text-[var(--text-muted)] text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mb-0.5">
            {label}
          </p>
          <div className="flex items-baseline gap-0.5 sm:gap-1">
            <h3 className="text-base sm:text-xl lg:text-2xl font-black text-[var(--foreground)] tracking-tight leading-none">
              {value}
            </h3>
            <span className="text-[9px] sm:text-[10px] font-medium text-[var(--text-muted)] truncate">
              {unit}
            </span>
          </div>
        </div>
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-sm sm:text-base bg-[var(--surface)] border border-[var(--card-border)] shadow-inner shrink-0">
          {icon}
        </div>
      </div>

      {/* Progress Bar */}
      {progress !== undefined && (
        <div className="w-full h-1 sm:h-1.5 bg-black/40 rounded-full overflow-hidden border border-[var(--card-border)]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            transition={{ duration: 1.5, delay: delay + 0.2, ease: 'circOut' }}
            className="h-full rounded-full"
            style={{
              backgroundColor: color,
              boxShadow: `0 0 10px ${color}60`,
            }}
          />
        </div>
      )}
    </motion.div>
  );
}
