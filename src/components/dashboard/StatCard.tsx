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
      className="bg-[var(--card-bg)]/80 backdrop-blur-md border border-[var(--card-border)] rounded-2xl shadow-xl p-6 relative overflow-hidden group hover:border-[var(--primary)]/30 transition-colors"
    >
      {/* Background Glow */}
      <div
        className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 blur-xl transition-opacity duration-300 group-hover:opacity-20"
        style={{ backgroundColor: color }}
      />

      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-widest mb-1">
            {label}
          </p>
          <div className="flex items-baseline gap-1 mt-1">
            <h3 className="text-3xl font-black text-white tracking-tight">{value}</h3>
            <span className="text-xs font-medium text-[var(--text-muted)]">{unit}</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-white/5 border border-white/5 shadow-inner">
          {icon}
        </div>
      </div>

      {/* Progress Bar */}
      {progress !== undefined && (
        <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
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
