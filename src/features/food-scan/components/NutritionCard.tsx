import React from 'react';
import { NutritionData } from '../types';
import { formatCalories } from '@/utils/formatCalories';

interface NutritionCardProps {
  data: NutritionData;
}

export const NutritionCard: React.FC<NutritionCardProps> = ({ data }) => {
  return (
    <div className="w-full space-y-6 animate-fade-in-up">
      {/* Name and Confidence */}
      <div className="flex flex-col items-center text-center space-y-1">
        <h2 className="text-2xl font-black tracking-tighter uppercase">{data.name || 'Analysis Result'}</h2>
        <div className="flex items-center gap-2 text-[var(--primary)] text-[10px] font-black uppercase tracking-[0.2em]">
          <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse" />
          High Confidence Analysis
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card p-5 flex flex-col items-center justify-center space-y-1 border-white/5">
          <span className="text-3xl font-black tracking-tighter text-white">
            {formatCalories(data.calories)}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Calories</span>
        </div>

        <div className="glass-card p-5 flex flex-col items-center justify-center space-y-1 border-green-500/20">
          <span className="text-3xl font-black tracking-tighter text-green-400">
            {Math.round(data.protein)}g
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Protein</span>
        </div>

        <div className="glass-card p-5 flex flex-col items-center justify-center space-y-1 border-blue-500/20">
          <span className="text-3xl font-black tracking-tighter text-blue-400">
            {Math.round(data.carbs)}g
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Carbs</span>
        </div>

        <div className="glass-card p-5 flex flex-col items-center justify-center space-y-1 border-red-500/20">
          <span className="text-3xl font-black tracking-tighter text-red-400">
            {Math.round(data.fats)}g
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Fats</span>
        </div>
      </div>
    </div>
  );
};
