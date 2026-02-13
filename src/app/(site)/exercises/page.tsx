'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MuscleMap } from '@/features/exercises/components/MuscleMap';
import { ExerciseList } from '@/features/exercises/components/ExerciseList';
import { MuscleGroup } from '@/features/exercises/data/types';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function ExercisesPage() {
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  const handleMuscleSelect = (muscle: MuscleGroup | null) => {
    setSelectedMuscle(muscle);
    if (muscle) setSearchQuery(''); // Clear search when picking a specific muscle map part
  };

  return (
    <div className="p-3 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 min-h-screen">
      {/* Header & Search */}
      <header className="flex flex-col gap-5">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl md:text-3xl lg:text-4xl font-black tracking-tighter text-white leading-none">
                TRAINING <span className="text-[var(--primary)]">LAB</span>
              </h1>
              <p className="text-[9px] md:text-xs font-bold text-[var(--text-muted)] mt-1 uppercase tracking-widest hidden sm:block">
                Professional Anatomical Mapping
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <div className="relative group w-full sm:w-64 lg:w-72">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Find an exercise..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] focus:border-[var(--primary)] text-white text-xs py-3 pl-12 pr-4 rounded-xl outline-none transition-all shadow-lg placeholder:text-white/10"
              />
            </div>

            {selectedMuscle && (
              <div className="flex items-center gap-2 bg-[var(--primary)]/10 px-4 py-3 rounded-xl border border-[var(--primary)]/20 shadow-lg w-full sm:w-auto">
                <span className="text-[9px] font-black uppercase tracking-widest text-[var(--primary)] shrink-0">
                  Target:
                </span>
                <span className="text-[10px] font-black text-white uppercase truncate">
                  {selectedMuscle}
                </span>
                <button
                  onClick={() => setSelectedMuscle(null)}
                  className="ml-1 text-white/40 hover:text-white transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-3 h-3"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mr-1 sm:mr-2">
            Level:
          </p>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {['beginner', 'intermediate', 'advanced'].map((level) => (
              <button
                key={level}
                onClick={() => setSelectedDifficulty(selectedDifficulty === level ? null : level)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-[0.2em] border transition-all ${
                  selectedDifficulty === level
                    ? level === 'beginner'
                      ? 'bg-green-400 border-green-400 text-black shadow-[0_0_15px_-5px_#4ade80]'
                      : level === 'intermediate'
                        ? 'bg-orange-400 border-orange-400 text-black shadow-[0_0_15px_-5px_#fb923c]'
                        : 'bg-red-400 border-red-400 text-black shadow-[0_0_15px_-5px_#f87171]'
                    : 'bg-black/20 border-white/5 text-[var(--text-muted)] hover:border-white/10 hover:text-white'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
          {selectedDifficulty && (
            <button
              onClick={() => setSelectedDifficulty(null)}
              className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] hover:text-white transition-colors ml-2"
            >
              Reset
            </button>
          )}
        </div>
      </header>

      {/* Main Interactive Split - Fully Responsive Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12 items-start">
        <div className="xl:col-span-5 lg:sticky lg:top-12 space-y-8 order-1">
          <MuscleMap
            onSelectMuscle={handleMuscleSelect}
            selectedMuscle={selectedMuscle}
            searchQuery={searchQuery}
          />
        </div>

        <div className="xl:col-span-7 pb-20 order-2">
          <ExerciseList
            selectedMuscle={selectedMuscle}
            searchQuery={searchQuery}
            difficulty={selectedDifficulty}
          />
        </div>
      </div>
    </div>
  );
}
