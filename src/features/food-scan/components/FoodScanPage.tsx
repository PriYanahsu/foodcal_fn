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
      <h1 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]">Food Scanner</h1>

      <div className="space-y-6">
        <Card className="p-6 bg-[var(--card-bg)] border border-[var(--card-border)]">
          <div className="space-y-4">
            <CameraInput onImageSelect={handleImageSelect} isLoading={isLoading} />

            {preview && (
              <div className="mt-4">
                <img
                  src={preview}
                  alt="Food preview"
                  className="w-full max-w-md mx-auto rounded-xl shadow-lg border border-[var(--card-border)]"
                />
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {nutritionData && (
              <div className="mt-6">
                <NutritionCard data={nutritionData} />
                <div className="mt-6 flex justify-center">
                  <Button onClick={handleReset} variant="outline" className="border-[var(--card-border)] hover:bg-[var(--card-bg)] hover:text-white">
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
