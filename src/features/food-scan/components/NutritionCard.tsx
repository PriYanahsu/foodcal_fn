import React from 'react';
import { Card } from '@/components/ui/Card';
import { NutritionData } from '../types';
import { formatCalories } from '@/utils/formatCalories';

interface NutritionCardProps {
  data: NutritionData;
}

export const NutritionCard: React.FC<NutritionCardProps> = ({ data }) => {
  return (
    <Card title={data.name || 'Nutrition Information'}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {formatCalories(data.calories)}
          </div>
          <div className="text-sm text-gray-600 mt-1">Calories</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {Math.round(data.protein)}g
          </div>
          <div className="text-sm text-gray-600 mt-1">Protein</div>
        </div>
        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">
            {Math.round(data.carbs)}g
          </div>
          <div className="text-sm text-gray-600 mt-1">Carbs</div>
        </div>
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">
            {Math.round(data.fats)}g
          </div>
          <div className="text-sm text-gray-600 mt-1">Fats</div>
        </div>
      </div>
    </Card>
  );
};
