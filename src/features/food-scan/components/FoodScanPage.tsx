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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');

  const handleImageSelect = (file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    // Auto-scan removed to allow optional prompt
  };

  const handleReset = () => {
    setPreview(null);
    setSelectedFile(null);
    setPrompt('');
    reset();
  };

  const handleScan = () => {
    if (selectedFile) {
      scanImage(selectedFile, prompt);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]">Food Scanner</h1>

      <div className="space-y-6">
        <Card className="p-6 bg-[var(--card-bg)] border border-[var(--card-border)]">
          <div className="space-y-6">
            {!preview ? (
              <CameraInput onImageSelect={handleImageSelect} isLoading={isLoading} />
            ) : (
              <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                <div className="relative rounded-xl overflow-hidden shadow-lg border border-[var(--card-border)] max-w-md mx-auto aspect-square">
                  <img
                    src={preview}
                    alt="Food preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setPreview(null);
                        setSelectedFile(null);
                      }}
                      className="bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm"
                    >
                      Change Image
                    </Button>
                  </div>
                </div>

                {!nutritionData && (
                  <div className="max-w-md mx-auto space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="prompt" className="text-sm font-medium text-muted-foreground ml-1">
                        Add details (optional)
                      </label>
                      <textarea
                        id="prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="E.g. 'Chicken with two chapatis and salad'."
                        className="w-full p-4 bg-[var(--background)] border border-[var(--card-border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none resize-none min-h-[100px] transition-all"
                      />
                    </div>

                    <Button
                      onClick={handleScan}
                      disabled={isLoading}
                      className="w-full py-6 text-lg font-semibold shadow-lg shadow-[var(--primary)]/20 hover:shadow-[var(--primary)]/40 transition-all"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <span className="animate-spin">⏳</span> Analyzing...
                        </div>
                      ) : (
                        "Analyze Food"
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl animate-in slide-in-from-top-2">
                <p className="text-red-400 text-center font-medium">{error}</p>
              </div>
            )}

            {nutritionData && (
              <div className="mt-8 animate-in slide-in-from-bottom-4 duration-500">
                <NutritionCard data={nutritionData} />
                <div className="mt-8 flex justify-center">
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="px-8 py-6 text-lg border-2 border-[var(--card-border)] hover:bg-[var(--card-bg)] hover:text-[var(--primary)] transition-colors"
                  >
                    Scan Another Meal
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
