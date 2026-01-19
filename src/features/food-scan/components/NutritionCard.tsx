import React from 'react';
import { Card } from '@/components/ui/Card';
import { NutritionData } from '../types';
import { formatCalories } from '@/utils/formatCalories';

interface NutritionCardProps {
  data: NutritionData;
}

export const NutritionCard: React.FC<NutritionCardProps> = ({ data }) => {
  return (
    <Card title={data.name || 'Nutrition Information'} className="bg-[var(--card-bg)] border border-[var(--card-border)]">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <div className="text-2xl font-bold text-blue-400">
            {formatCalories(data.calories)}
          </div>
          <div className="text-sm text-[var(--text-muted)] mt-1">Calories</div>
        </div>
        <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
          <div className="text-2xl font-bold text-green-400">
            {Math.round(data.protein)}g
          </div>
          <div className="text-sm text-[var(--text-muted)] mt-1">Protein</div>
        </div>
        <div className="text-center p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
          <div className="text-2xl font-bold text-yellow-400">
            {Math.round(data.carbs)}g
          </div>
          <div className="text-sm text-[var(--text-muted)] mt-1">Carbs</div>
        </div>
        <div className="text-center p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <div className="text-2xl font-bold text-red-400">
            {Math.round(data.fats)}g
          </div>
          <div className="text-sm text-[var(--text-muted)] mt-1">Fats</div>
        </div>
      </div>
    </Card>
  );
};
