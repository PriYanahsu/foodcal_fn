'use client';

import React, { useState } from 'react';
import { useFoodScan } from '../hooks/useFoodScan';
import { CameraInput } from './CameraInput';
import { NutritionCard } from './NutritionCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export const FoodScanPage: React.FC = () => {
  const { scanImage, isLoading, nutritionData, error, reset } = useFoodScan();
  const [preview, setPreview] = useState<string | null>(null);

  const handleImageSelect = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    scanImage(file);
  };

  const handleReset = () => {
    setPreview(null);
    reset();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Food Scanner</h1>
      
      <div className="space-y-6">
        <Card>
          <div className="space-y-4">
            <CameraInput onImageSelect={handleImageSelect} isLoading={isLoading} />
            
            {preview && (
              <div className="mt-4">
                <img
                  src={preview}
                  alt="Food preview"
                  className="w-full max-w-md mx-auto rounded-lg shadow-md"
                />
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {nutritionData && (
              <div className="mt-6">
                <NutritionCard data={nutritionData} />
                <div className="mt-4 flex justify-center">
                  <Button onClick={handleReset} variant="outline">
                    Scan Another Food
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
