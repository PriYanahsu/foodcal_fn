'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useFoodScan } from '../hooks/useFoodScan';
import { CameraInput } from './CameraInput';
import { NutritionCard } from './NutritionCard';
import { AiScanOverlay } from './AiScanOverlay';
import {
  XMarkIcon,
  SparklesIcon,
  CameraIcon,
  PhotoIcon,
  CpuChipIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

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

  const stage = !preview ? 'idle' : isLoading ? 'analyzing' : nutritionData ? 'result' : 'confirm';

  return (
    <div className="page-container relative flex flex-col items-center animate-fade-in pb-28 md:pb-10">
      {/* Ambient AI glow */}
      <div className="pointer-events-none absolute inset-x-0 -top-10 h-64 bg-[radial-gradient(ellipse_at_center,rgba(0,255,136,0.12),transparent_70%)]" />

      {!preview && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center space-y-4 mb-8 w-full max-w-lg"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-[10px] font-black uppercase tracking-[0.22em] border border-[var(--primary)]/25 shadow-[0_0_24px_rgba(0,255,136,0.12)]">
            <CpuChipIcon className="w-3.5 h-3.5" />
            AI Food Vision
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter leading-none">
            Scan. Predict.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-emerald-200">
              Know your macros.
            </span>
          </h1>
          <p className="text-[var(--text-muted)] text-sm md:text-base font-medium max-w-md mx-auto leading-relaxed">
            Point at any meal — AI identifies ingredients, portions, and calories in seconds.
          </p>
        </motion.div>
      )}

      <div
        className={`relative z-10 w-full mx-auto ${preview ? 'max-w-lg md:max-w-4xl lg:max-w-5xl' : 'max-w-lg'}`}
      >
        {!preview ? (
          <CameraInput onImageSelect={handleImageSelect} isLoading={isLoading}>
            {(openCamera, openUpload) => (
              <div className="space-y-6 flex flex-col items-center">
                <button
                  onClick={openCamera}
                  disabled={isLoading}
                  className="w-full aspect-[4/3] rounded-[2rem] border border-[var(--primary)]/20 bg-[#0a0f14] flex flex-col items-center justify-center p-4 text-center relative overflow-hidden group transition-all active:scale-[0.985] outline-none shadow-[0_0_0_1px_rgba(0,255,136,0.06),0_25px_80px_-20px_rgba(0,0,0,0.8)]"
                >
                  {/* Idle scan atmosphere */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(0,255,136,0.08),transparent_55%)]" />
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      backgroundImage:
                        'linear-gradient(to right, rgba(0,255,136,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,255,136,0.06) 1px, transparent 1px)',
                      backgroundSize: '32px 32px',
                    }}
                  />
                  <div className="scan-beam opacity-60" />

                  {/* Reticle corners */}
                  <div className="absolute top-5 left-5 w-9 h-9 border-t-2 border-l-2 border-[var(--primary)]/70 rounded-tl-xl" />
                  <div className="absolute top-5 right-5 w-9 h-9 border-t-2 border-r-2 border-[var(--primary)]/70 rounded-tr-xl" />
                  <div className="absolute bottom-5 left-5 w-9 h-9 border-b-2 border-l-2 border-[var(--primary)]/70 rounded-bl-xl" />
                  <div className="absolute bottom-5 right-5 w-9 h-9 border-b-2 border-r-2 border-[var(--primary)]/70 rounded-br-xl" />

                  <div className="absolute top-5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 border border-white/10 backdrop-blur-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white/70">
                      Ready
                    </span>
                  </div>

                  <div className="space-y-4 z-10">
                    <div className="relative mx-auto w-fit">
                      <div className="absolute inset-0 rounded-3xl bg-[var(--primary)]/25 blur-xl group-hover:bg-[var(--primary)]/40 transition-all" />
                      <div className="relative p-5 rounded-3xl bg-[var(--primary)]/10 border border-[var(--primary)]/30 text-[var(--primary)] transition-all group-hover:scale-110 group-hover:bg-[var(--primary)] group-hover:text-black group-hover:border-[var(--primary)]">
                        <CameraIcon className="w-10 h-10" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <p className="font-black text-xl tracking-tight">Open AI Camera</p>
                      <p className="text-[var(--text-muted)] text-xs font-medium">
                        Center your plate inside the frame
                      </p>
                    </div>
                  </div>
                </button>

                <div className="grid grid-cols-3 gap-2 w-full">
                  {[
                    { icon: EyeIcon, label: 'Detect' },
                    { icon: SparklesIcon, label: 'Predict' },
                    { icon: CpuChipIcon, label: 'Macros' },
                  ].map(({ icon: Icon, label }) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-white/8 bg-white/[0.03] py-3 px-2 flex flex-col items-center gap-1.5"
                    >
                      <Icon className="w-4 h-4 text-[var(--primary)]" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 w-full">
                  <button
                    onClick={openUpload}
                    disabled={isLoading}
                    className="flex-1 py-4 px-5 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold tracking-tight hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2"
                  >
                    <PhotoIcon className="w-4 h-4 opacity-70" />
                    Gallery
                  </button>
                  <button
                    onClick={openCamera}
                    disabled={isLoading}
                    className="flex-[1.3] py-4 px-5 rounded-2xl bg-[var(--primary)] text-black text-sm font-black tracking-tight shadow-[0_0_28px_rgba(0,255,136,0.25)] hover:shadow-[0_0_40px_rgba(0,255,136,0.4)] transition-all flex items-center justify-center gap-2"
                  >
                    <CameraIcon className="w-4 h-4" />
                    Capture
                  </button>
                </div>
              </div>
            )}
          </CameraInput>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* Stage header */}
            <div className="flex items-center justify-between gap-3 px-1">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[var(--primary)] mb-1">
                  {stage === 'analyzing'
                    ? 'Neural Pass'
                    : stage === 'result'
                      ? 'Prediction Ready'
                      : 'Pre-Scan'}
                </p>
                <h2 className="text-xl font-black tracking-tight">
                  {stage === 'analyzing'
                    ? 'AI is reading your meal'
                    : stage === 'result'
                      ? 'Nutrition unlocked'
                      : 'Guide the model'}
                </h2>
              </div>
              {!isLoading && (
                <button
                  onClick={handleReset}
                  className="shrink-0 text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-white transition-colors"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 lg:gap-8 md:items-stretch">
                {/* Preview / analysis viewport */}
                <div className="relative w-full aspect-square rounded-[2rem] overflow-hidden border border-[var(--primary)]/20 bg-[#0a0f14] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_30px_80px_-30px_rgba(0,0,0,0.9)] ring-1 ring-white/5">
                  <img
                    src={preview}
                    alt="Meal preview"
                    className={`absolute inset-0 w-full h-full object-contain transition-transform duration-700 ${isLoading ? 'scale-[1.02]' : ''}`}
                  />
                  {isLoading && <AiScanOverlay prompt={prompt} />}

                  {!isLoading && !nutritionData && (
                    <>
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-white/40 rounded-tl-lg" />
                        <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-white/40 rounded-tr-lg" />
                        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-white/40 rounded-bl-lg" />
                        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-white/40 rounded-br-lg" />
                      </div>
                      <button
                        onClick={() => {
                          setPreview(null);
                          setSelectedFile(null);
                        }}
                        className="absolute top-4 right-4 z-20 p-2.5 rounded-xl bg-black/65 text-white backdrop-blur-xl hover:bg-black/80 transition-colors border border-white/15"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </>
                  )}

                  {nutritionData && (
                    <div className="absolute bottom-4 left-4 right-4 z-20">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 border border-[var(--primary)]/40 backdrop-blur-md">
                        <SparklesIcon className="w-3.5 h-3.5 text-[var(--primary)]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">
                          {nutritionData.food_name}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Side panel — analyzing / prompt / result */}
                <div className="flex flex-col w-full md:h-full md:min-h-0">
                  {isLoading && (
                    <div className="hidden md:flex flex-col justify-center gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 h-full min-h-0">
                      <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--primary)]">
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-75 animate-ping" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--primary)]" />
                        </span>
                        AI Vision Active
                      </div>
                      <p className="text-lg font-black tracking-tight">Analyzing your meal…</p>
                      <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                        Detecting ingredients, estimating portions, and calculating macros. This
                        usually takes a few seconds.
                      </p>
                      <div className="flex gap-2 mt-2">
                        {[0, 1, 2].map((d) => (
                          <span
                            key={d}
                            className="w-2 h-2 rounded-full bg-[var(--primary)]"
                            style={{ animation: `pulse 1s ease-in-out ${d * 0.2}s infinite` }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {!nutritionData && !isLoading && (
                    <div className="flex flex-col h-full min-h-[280px] md:min-h-0 rounded-3xl border border-white/10 bg-white/[0.03] p-4 md:p-5">
                      <div className="flex justify-between items-center shrink-0">
                        <label
                          htmlFor="prompt"
                          className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]"
                        >
                          Context for AI
                        </label>
                        <span className="text-[10px] font-bold text-[var(--primary)]">Optional</span>
                      </div>
                      <textarea
                        id="prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g. 2 slices pepperoni pizza + coke…"
                        className="w-full flex-1 min-h-[112px] md:min-h-0 mt-3 p-4 bg-black/30 border border-white/8 rounded-2xl focus:border-[var(--primary)]/50 focus:bg-black/40 outline-none resize-none text-sm font-medium transition-all placeholder:text-white/25"
                      />
                      <p className="text-[11px] text-[var(--text-muted)] leading-relaxed shrink-0 mt-3">
                        Tip: name portions or hidden ingredients — AI folds them into the prediction.
                      </p>
                    </div>
                  )}

                  {nutritionData && (
                    <div className="flex flex-col justify-center gap-5 h-full">
                      <NutritionCard data={nutritionData} />

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-3">
                        <button
                          onClick={async () => {
                            if (selectedFile && nutritionData) {
                              const success = await saveFoodLog(selectedFile, nutritionData);
                              if (success) handleReset();
                            }
                          }}
                          disabled={isSaving}
                          className="w-full py-4 btn-primary text-xs font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                          {isSaving ? (
                            <>
                              <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                              Saving…
                            </>
                          ) : (
                            'Log This Meal'
                          )}
                        </button>
                        <button
                          onClick={handleReset}
                          disabled={isSaving}
                          className="w-full py-4 rounded-2xl border border-white/10 bg-white/5 text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                        >
                          Scan Another
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {!nutritionData && !isLoading && (
                <div className="flex justify-center px-1">
                  <button
                    onClick={handleScan}
                    className="w-full max-w-md py-5 rounded-2xl bg-[var(--primary)] text-black text-sm font-black uppercase tracking-[0.18em] flex items-center justify-center gap-3 shadow-[0_0_32px_rgba(0,255,136,0.35)] hover:shadow-[0_0_48px_rgba(0,255,136,0.5)] transition-all"
                  >
                    <SparklesIcon className="w-5 h-5" />
                    Run AI Scan
                  </button>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-2xl text-center">
                  <p className="text-red-400 text-xs font-bold uppercase tracking-tight">{error}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
