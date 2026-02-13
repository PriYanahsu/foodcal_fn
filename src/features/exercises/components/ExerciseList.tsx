'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Exercise, MuscleGroup } from '../data/types';
import { EXERCISES } from '../data/exercises';
import { ChevronLeftIcon, SparklesIcon, BoltIcon, BeakerIcon } from '@heroicons/react/24/outline';

interface ExerciseListProps {
  selectedMuscle: MuscleGroup | null;
  searchQuery: string;
  difficulty: string | null;
}

export const ExerciseList: React.FC<ExerciseListProps> = ({
  selectedMuscle,
  searchQuery,
  difficulty,
}) => {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const query = searchQuery.toLowerCase();

  // Reset selected exercise when muscle, search, or difficulty changes
  useEffect(() => {
    setSelectedExercise(null);
  }, [selectedMuscle, searchQuery, difficulty]);

  const filteredExercises = EXERCISES.filter((ex) => {
    const matchesMuscle = selectedMuscle ? ex.muscleGroup === selectedMuscle : true;
    const matchesDifficulty = difficulty ? ex.difficulty === difficulty : true;
    const matchesSearch =
      query.length > 0
        ? ex.name.toLowerCase().includes(query) ||
          ex.description.toLowerCase().includes(query) ||
          ex.muscleGroup.toLowerCase().includes(query)
        : true;

    const finalMatches = matchesSearch && matchesDifficulty;

    return selectedMuscle
      ? matchesMuscle && finalMatches
      : query.length > 2 || difficulty
        ? finalMatches
        : false;
  });

  if (!selectedMuscle && query.length <= 2 && !difficulty) {
    return (
      <div className="flex flex-col items-center justify-center py-20 md:py-32 text-center opacity-40">
        <div className="w-16 h-16 md:w-24 md:h-24 mb-6 md:mb-8 rounded-full border-2 border-dashed border-[var(--text-muted)] flex items-center justify-center text-3xl md:text-4xl grayscale">
          🏋️
        </div>
        <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight mb-2 text-white">
          Select a Muscle
        </h3>
        <p className="max-w-xs text-xs md:text-sm">
          Explore professional routines by selecting a focus area or using search.
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-[400px]">
      <AnimatePresence mode="wait">
        {!selectedExercise ? (
          // --- STAGE 1: LIST VIEW ---
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-white">
                {difficulty ? `${difficulty.toUpperCase()} ` : ''}
                {query.length > 2
                  ? `Results for "${searchQuery}"`
                  : selectedMuscle
                    ? `${selectedMuscle} Routines`
                    : 'Routines'}
              </h3>
              <span className="text-[10px] font-black bg-[var(--primary)] text-black px-2 py-1 rounded">
                {filteredExercises.length} AVAILABLE
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {filteredExercises.length > 0 ? (
                filteredExercises.map((ex, i) => (
                  <motion.button
                    key={ex.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedExercise(ex)}
                    className="bg-[var(--card-bg)]/80 backdrop-blur-xl border border-[var(--card-border)] hover:border-[var(--primary)]/50 p-4 md:p-5 rounded-2xl md:rounded-3xl transition-all group text-left flex items-center justify-between shadow-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[var(--primary)] group-hover:scale-110 transition-transform">
                        <BoltIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white group-hover:text-[var(--primary)] transition-colors text-sm md:text-base">
                          {ex.name}
                        </h4>
                        <span
                          className={`text-[9px] font-black uppercase tracking-widest ${
                            ex.difficulty === 'beginner'
                              ? 'text-green-400'
                              : ex.difficulty === 'intermediate'
                                ? 'text-orange-400'
                                : 'text-red-400'
                          }`}
                        >
                          {ex.difficulty}
                        </span>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronLeftIcon className="w-4 h-4 rotate-180 text-[var(--primary)]" />
                    </div>
                  </motion.button>
                ))
              ) : (
                <div className="col-span-full py-12 text-center bg-black/20 rounded-3xl border border-dashed border-[var(--card-border)]">
                  <p className="text-[var(--text-muted)] italic text-sm md:text-base">
                    No matching exercises found.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          // --- STAGE 2: DETAIL VIEW ---
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-[var(--card-bg)]/80 backdrop-blur-3xl border border-[var(--card-border)] p-4 md:p-6 rounded-2xl md:rounded-[2rem] shadow-2xl space-y-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--primary)]/5 blur-[80px] pointer-events-none" />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedExercise(null)}
                  className="p-2.5 bg-white/5 hover:bg-[var(--primary)] hover:text-black rounded-lg transition-all text-white group"
                >
                  <ChevronLeftIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[9px] font-black uppercase tracking-[0.2em] ${
                        selectedExercise.difficulty === 'beginner'
                          ? 'text-green-400'
                          : selectedExercise.difficulty === 'intermediate'
                            ? 'text-orange-400'
                            : 'text-red-400'
                      }`}
                    >
                      {selectedExercise.difficulty}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--primary)]">
                      {selectedExercise.muscleGroup}
                    </span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight leading-none">
                    {selectedExercise.name}
                  </h3>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/10">
                <BeakerIcon className="w-4 h-4 text-[var(--primary)]" />
                <span className="text-[10px] font-black text-white/60 tracking-widest uppercase">
                  PRO ROUTINE
                </span>
              </div>
            </div>

            {/* Description & Equipment */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <div className="md:col-span-2 space-y-4">
                <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--primary)]">
                  <SparklesIcon className="w-4 h-4" />
                  The Goal
                </h4>
                <p className="text-sm md:text-base text-[var(--text-muted)] leading-relaxed italic">
                  "{selectedExercise.description}"
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--primary)]">
                  <BeakerIcon className="w-4 h-4" />
                  Gear Needed
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedExercise.equipment.map((item, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-white/5 rounded-lg border border-white/5 text-[10px] font-bold text-white uppercase"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Execution Guide */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30 whitespace-nowrap">
                  Execution Protocol
                </h4>
                <div className="h-[1px] w-full bg-white/5" />
              </div>
              <div className="grid grid-cols-1 gap-4">
                {selectedExercise.steps.map((step, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex gap-5 p-4 rounded-2xl bg-white/5 border border-white/5 items-center group hover:bg-[var(--primary)]/5 hover:border-[var(--primary)]/20 transition-all shadow-sm"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] font-black text-sm shrink-0 group-hover:bg-[var(--primary)] group-hover:text-black transition-colors">
                      {idx + 1}
                    </div>
                    <p className="text-sm md:text-base text-white/80 font-medium group-hover:text-white transition-colors leading-relaxed">
                      {step}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Tips */}
            {selectedExercise.tips && selectedExercise.tips.length > 0 && (
              <div className="p-5 rounded-2xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-start gap-4">
                <div className="p-2 bg-[var(--primary)]/20 rounded-lg text-[var(--primary)]">
                  <SparklesIcon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest">
                    Training Pro Tip
                  </p>
                  <ul className="space-y-1">
                    {selectedExercise.tips.map((tip, i) => (
                      <li key={i} className="text-sm text-white font-medium">
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedExercise(null)}
              className="w-full py-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase text-[10px] md:text-xs tracking-widest hover:bg-white/10 hover:border-white/20 transition-all mt-4"
            >
              Return to Selection
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
