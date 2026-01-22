import React from 'react';
import { Card } from '@/components/ui/Card';
import { NutritionData } from '../types';
import { formatCalories } from '@/utils/formatCalories';

interface NutritionCardProps {
  data: NutritionData;
}

export const NutritionCard: React.FC<NutritionCardProps> = ({ data }) => {
  return (
    <Card title={data.food_name || 'Nutrition Information'} titleClassName="text-white" className=" bg-[var(--card-bg)] border border-[var(--card-border)]">
      {data.quantity && (
        <div className="mb-4 inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-white/90 border border-white/20">
          ⚖️ {data.quantity}
        </div>
      )}
      {data.health_info && (
        <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
          <h3 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
            <span className="text-lg">🥗</span> Health Insights
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {data.health_info}
          </p>
        </div>
      )}
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
