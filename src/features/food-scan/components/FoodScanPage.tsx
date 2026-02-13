'use client';

import React, { useState } from 'react';
import { useFoodScan } from '../hooks/useFoodScan';
import { CameraInput } from './CameraInput';
import { NutritionCard } from './NutritionCard';
import { XMarkIcon, SparklesIcon, CameraIcon, PhotoIcon } from '@heroicons/react/24/outline';

export const FoodScanPage: React.FC = () => {
  const { scanImage, saveFoodLog, isLoading, isSaving, nutritionData, error, reset } =
    useFoodScan();
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
    <div className="page-container flex flex-col items-center animate-fade-in">
      {/* Header Section */}
      {!preview && (
        <div className="text-center space-y-3 mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-[10px] font-black uppercase tracking-widest border border-[var(--primary)]/20">
            <SparklesIcon className="w-3 h-3" /> Digital Nutritionist
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter">
            What are you <span className="text-[var(--primary)]">eating?</span>
          </h1>
          <p className="text-[var(--text-muted)] text-sm md:text-lg font-medium opacity-70">
            Capture any meal to unlock its nutritional secrets.
          </p>
        </div>
      )}

      <div className="w-full max-w-lg mx-auto">
        {!preview ? (
          <CameraInput onImageSelect={handleImageSelect} isLoading={isLoading}>
            {(openCamera, openUpload) => (
              <div className="space-y-10 flex flex-col items-center">
                {/* Minimalist Viewfinder Entry - Clickable */}
                <button
                  onClick={openCamera}
                  disabled={isLoading}
                  className="w-full aspect-[4/3] rounded-[2.5rem] border border-white/5 bg-neutral-900/50 flex flex-col items-center justify-center p-4 text-center relative overflow-hidden group transition-all active:scale-[0.98] outline-none"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-[var(--primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Corner Decor */}
                  <div className="absolute top-6 left-6 w-8 h-8 border-t border-l border-white/20 rounded-tl-2xl group-hover:border-[var(--primary)] group-hover:w-10 group-hover:h-10 transition-all duration-500" />
                  <div className="absolute top-6 right-6 w-8 h-8 border-t border-r border-white/20 rounded-tr-2xl group-hover:border-[var(--primary)] group-hover:w-10 group-hover:h-10 transition-all duration-500" />
                  <div className="absolute bottom-6 left-6 w-8 h-8 border-b border-l border-white/20 rounded-bl-2xl group-hover:border-[var(--primary)] group-hover:w-10 group-hover:h-10 transition-all duration-500" />
                  <div className="absolute bottom-6 right-6 w-8 h-8 border-b border-r border-white/20 rounded-br-2xl group-hover:border-[var(--primary)] group-hover:w-10 group-hover:h-10 transition-all duration-500" />

                  <div className="space-y-4 z-10">
                    <div className="p-5 rounded-3xl bg-[var(--primary)]/10 text-[var(--primary)] w-fit mx-auto transition-all group-hover:scale-110 group-hover:bg-[var(--primary)] group-hover:text-black">
                      <CameraIcon className="w-10 h-10" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-xl tracking-tight">Tap to capture</p>
                      <p className="text-[var(--text-muted)] text-xs font-medium opacity-60">
                        Ready to analyze your meal?
                      </p>
                    </div>
                  </div>
                </button>

                {/* Secondary Actions */}
                <div className="flex items-center gap-4 w-full">
                  <button
                    onClick={openUpload}
                    disabled={isLoading}
                    className="flex-1 py-4 px-6 rounded-2xl bg-white/5 border border-white/5 text-sm font-bold tracking-tight hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                  >
                    <PhotoIcon className="w-4 h-4 opacity-60" />
                    Upload Image
                  </button>
                  <button
                    onClick={openCamera}
                    disabled={isLoading}
                    className="flex-1 py-4 px-6 rounded-2xl bg-[var(--primary)] text-black text-sm font-black tracking-tight hover:shadow-[0_0_20px_var(--primary)]/30 transition-all flex items-center justify-center gap-2"
                  >
                    <CameraIcon className="w-4 h-4" />
                    Open Camera
                  </button>
                </div>
              </div>
            )}
          </CameraInput>
        ) : (
          <div className="space-y-8 animate-fade-in-up">
            <div className="flex flex-col items-center text-center space-y-2">
              <h2 className="text-2xl font-black tracking-tight uppercase">Confirm Meal</h2>
              <p className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-widest opacity-60">
                Analyzing your capture
              </p>
            </div>

            <div className="relative aspect-square rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl group ring-1 ring-white/5">
              <img
                src={preview}
                alt="Meal preview"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {isLoading && <div className="scan-beam" />}
              <button
                onClick={() => {
                  setPreview(null);
                  setSelectedFile(null);
                }}
                className="absolute top-4 right-4 p-2.5 rounded-2xl bg-black/60 text-white backdrop-blur-xl hover:bg-black/80 transition-colors border border-white/10"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {!nutritionData && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <label
                      htmlFor="prompt"
                      className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]"
                    >
                      Details (optional)
                    </label>
                    <span className="text-[10px] font-bold text-[var(--primary)] opacity-60">
                      AI Assissted
                    </span>
                  </div>
                  <textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="E.g. Full size pizza, 2 slices eaten..."
                    className="w-full p-5 bg-white/5 border border-white/5 rounded-3xl focus:border-[var(--primary)]/50 focus:bg-white/[0.08] outline-none resize-none h-32 text-sm font-medium transition-all"
                  />
                </div>

                <button
                  onClick={handleScan}
                  disabled={isLoading}
                  className="w-full py-5 btn-primary text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50 h-16"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-[3px] border-black/20 border-t-black rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-5 h-5" />
                      <span>Start Analysis</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-3xl text-center">
                <p className="text-red-400 text-xs font-bold uppercase tracking-tight">{error}</p>
              </div>
            )}

            {nutritionData && (
              <div className="space-y-8">
                <NutritionCard data={nutritionData} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={async () => {
                      if (selectedFile && nutritionData) {
                        const success = await saveFoodLog(selectedFile, nutritionData);
                        if (success) {
                          handleReset();
                          // Could add a toast here for better UX
                        }
                      }
                    }}
                    disabled={isSaving}
                    className="w-full py-5 btn-primary text-xs font-black uppercase tracking-widest rounded-3xl flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Add to Daily Diet</span>
                    )}
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={isSaving}
                    className="w-full py-5 btn-secondary text-xs font-black uppercase tracking-widest rounded-3xl"
                  >
                    Discard & Scan next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
