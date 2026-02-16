'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { MuscleMap } from '@/features/exercises/components/MuscleMap';
import { ExerciseList } from '@/features/exercises/components/ExerciseList';
import { MuscleGroup } from '@/features/exercises/data/types';

export default function ExercisesPage() {
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  const handleMuscleSelect = (muscle: MuscleGroup | null) => {
    setSelectedMuscle(muscle);
    if (muscle) setSearchQuery(''); // Clear search when picking a specific muscle map part
  };

  return (
    <div className="page-container max-w-7xl min-h-screen relative overflow-hidden pb-32">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[10%] left-[5%] w-[400px] h-[400px] rounded-full bg-[var(--primary)]/5 blur-[120px]" />
        <div className="absolute bottom-[20%] right-[5%] w-[500px] h-[500px] rounded-full bg-[var(--secondary)]/5 blur-[150px]" />
      </div>

      {/* Header Section */}
      <header className="relative space-y-8 mb-16 animate-fade-in">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--primary)] text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(0,255,136,0.1)]">
              <SparklesIcon className="w-3.5 h-3.5" /> Exercise Library
            </div>
            <div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase leading-[0.9]">
                EXERCISE <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]">DIRECTORY</span>
              </h1>
              <p className="text-xs md:text-sm font-bold text-[var(--text-muted)] mt-4 uppercase tracking-[0.3em] opacity-60">
                Select a muscle to find the best exercises for your workout
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            {/* HUD Search Bar */}
            <div className="relative group w-full sm:w-80 lg:w-96">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
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
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 focus:border-[var(--primary)]/50 focus:bg-white/[0.08] text-white text-sm py-4 pl-14 pr-6 rounded-2xl outline-none transition-all shadow-2xl placeholder:opacity-20 font-bold"
              />
            </div>
          </div>
        </div>

        {/* Tactical Filters */}
        <div className="flex flex-wrap items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 p-2 rounded-2xl w-fit">
          <div className="flex items-center gap-2 px-3 border-r border-white/10 mr-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
              Difficulty:
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {['beginner', 'intermediate', 'advanced'].map((level) => (
              <button
                key={level}
                onClick={() => setSelectedDifficulty(selectedDifficulty === level ? null : level)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all relative overflow-hidden group ${selectedDifficulty === level
                  ? 'border-[var(--primary)] text-[var(--primary)] bg-[var(--primary)]/10 shadow-[0_0_20px_rgba(0,255,136,0.1)]'
                  : 'border-white/5 text-[var(--text-muted)] hover:border-white/20 hover:text-white hover:bg-white/5'
                  }`}
              >
                {level}
                {selectedDifficulty === level && (
                  <motion.div
                    layoutId="filter-ring"
                    className="absolute inset-0 border border-[var(--primary)] rounded-xl"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
          {selectedDifficulty && (
            <button
              onClick={() => setSelectedDifficulty(null)}
              className="px-3 text-[10px] font-black uppercase tracking-widest text-red-400/60 hover:text-red-400 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </header>

      {/* Main Tactical Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Focus: Anatomical Interface */}
        <div className="xl:col-span-5 space-y-12 animate-slide-up order-1">
          <div className="relative group">
            {/* Visual HUD Accents */}
            <div className="absolute -top-6 -left-6 w-12 h-12 border-t-2 border-l-2 border-[var(--primary)]/20 rounded-tl-3xl group-hover:border-[var(--primary)] transition-colors duration-500" />
            <div className="absolute -bottom-6 -right-6 w-12 h-12 border-b-2 border-r-2 border-[var(--primary)]/20 rounded-br-3xl group-hover:border-[var(--primary)] transition-colors duration-500" />

            <div className="glass-panel p-8 md:p-10 relative bg-black/40 border-white/5 shadow-3xl mb-12">
              <MuscleMap
                onSelectMuscle={handleMuscleSelect}
                selectedMuscle={selectedMuscle}
                searchQuery={searchQuery}
              />
            </div>
          </div>
        </div>

        {/* Right Focus: Intelligence List */}
        <div className="xl:col-span-7 pb-32 order-2">
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
