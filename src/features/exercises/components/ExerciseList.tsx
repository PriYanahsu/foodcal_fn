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
      <div className="flex flex-col items-center justify-center py-20 md:py-32 text-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[var(--primary)]/5 rounded-full blur-[100px] -z-10" />

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.4, scale: 1 }}
          className="w-20 h-20 md:w-28 md:h-28 mb-8 rounded-3xl border-2 border-dashed border-[var(--card-border)] flex items-center justify-center text-4xl md:text-5xl"
        >
          <SparklesIcon className="w-10 h-10 text-[var(--foreground)]" />
        </motion.div>

        <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-4 text-[var(--foreground)]">
          Find Your <span className="text-[var(--primary)]">Exercise</span>
        </h3>
        <p className="max-w-xs text-xs md:text-sm text-[var(--text-muted)] font-medium leading-relaxed">
          Select a muscle group or search above to find professional training guides.
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-[500px]">
      <AnimatePresence mode="wait">
        {!selectedExercise ? (
          // --- STAGE 1: LIST VIEW ---
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-6">
              <div className="space-y-1">
                <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-[var(--foreground)] flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[var(--primary)] shadow-[0_0_8px_var(--primary)]" />
                  {difficulty ? `${difficulty.toUpperCase()} ` : ''}
                  {query.length > 2
                    ? `Results: "${searchQuery}"`
                    : selectedMuscle
                      ? `${selectedMuscle} Exercises`
                      : 'All Exercises'}
                </h3>
                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">
                  {filteredExercises.length} Exercises Found
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {filteredExercises.length > 0 ? (
                filteredExercises.map((ex, i) => (
                  <motion.button
                    key={ex.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedExercise(ex)}
                    className="group relative bg-[var(--surface)] backdrop-blur-md border border-[var(--card-border)] hover:border-[var(--primary)]/40 p-5 md:p-6 rounded-[2rem] transition-all flex flex-col gap-4 shadow-2xl overflow-hidden"
                  >
                    {/* Hover Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="flex items-start justify-between relative z-10">
                      <div className="w-12 h-12 rounded-2xl bg-[var(--surface)] border border-[var(--card-border)] flex items-center justify-center text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-black transition-all duration-300">
                        <BoltIcon className="w-6 h-6" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${ex.difficulty === 'beginner'
                          ? 'text-green-400 border-green-400/20 bg-green-400/5'
                          : ex.difficulty === 'intermediate'
                            ? 'text-orange-400 border-orange-400/20 bg-orange-400/5'
                            : 'text-red-400 border-red-400/20 bg-red-400/5'
                          }`}>
                          {ex.difficulty}
                        </span>
                      </div>
                    </div>

                    <div className="relative z-10 space-y-2">
                      <h4 className="text-lg font-black text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors leading-tight uppercase tracking-tight">
                        {ex.name}
                      </h4>
                      <p className="text-xs text-[var(--text-muted)] line-clamp-2 font-medium leading-relaxed group-hover:text-[var(--foreground)]/60 transition-colors">
                        {ex.description}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between relative z-10 mt-auto">
                      <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-all">
                        <div className="w-1 h-1 rounded-full bg-[var(--surface-strong)]" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--primary)]">View Details</span>
                      </div>
                      <ChevronLeftIcon className="w-4 h-4 rotate-180 text-[var(--text-muted)] group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all" />
                    </div>
                  </motion.button>
                ))
              ) : (
                <div className="col-span-full py-16 text-center bg-[var(--surface)] rounded-[3rem] border border-dashed border-[var(--card-border)]">
                  <p className="text-[var(--text-muted)] italic text-sm md:text-base font-medium">
                    Sector clear. No matching protocols found.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          // --- STAGE 2: DETAIL VIEW ---
          <motion.div
            key="detail"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-black/40 backdrop-blur-3xl border border-[var(--card-border)] p-6 md:p-10 rounded-[3rem] shadow-5xl space-y-10 relative overflow-hidden"
          >
            {/* Visual HUD Accents */}
            <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[var(--primary)]/5 blur-[120px] pointer-events-none" />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 pb-10 border-b border-[var(--card-border)] relative z-10">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setSelectedExercise(null)}
                  className="w-14 h-14 bg-[var(--surface)] hover:bg-[var(--primary)] hover:text-black rounded-2xl transition-all text-[var(--foreground)] border border-[var(--card-border)] flex items-center justify-center group shrink-0"
                >
                  <ChevronLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </button>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${selectedExercise.difficulty === 'beginner' ? 'text-green-400' :
                      selectedExercise.difficulty === 'intermediate' ? 'text-orange-400' : 'text-red-400'
                      }`}>
                      {selectedExercise.difficulty}
                    </span>
                    <div className="w-1 h-1 rounded-full bg-[var(--surface-strong)]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--primary)]">
                      {selectedExercise.muscleGroup}
                    </span>
                  </div>
                  <h3 className="text-3xl md:text-5xl font-black text-[var(--foreground)] uppercase tracking-tighter leading-none">
                    {selectedExercise.name}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-3 px-6 py-3 bg-[var(--primary)]/5 rounded-2xl border border-[var(--primary)]/20 shadow-lg">
                <SparklesIcon className="w-5 h-5 text-[var(--primary)] animate-pulse" />
                <span className="text-[10px] font-black text-[var(--foreground)] tracking-[0.2em] uppercase">
                  Proper Form & Guide
                </span>
              </div>
            </div>

            {/* Detail Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
              {/* Main Body */}
              <div className="lg:col-span-8 space-y-10">
                <div className="space-y-4">
                  <h4 className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">
                    <div className="w-6 h-[1px] bg-[var(--surface-strong)]" /> Description
                  </h4>
                  <p className="text-lg md:text-xl text-[var(--foreground)] leading-relaxed font-bold italic font-serif">
                    "{selectedExercise.description}"
                  </p>
                </div>

                {/* Execution Protocol */}
                <div className="space-y-6">
                  <h4 className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">
                    <div className="w-6 h-[1px] bg-[var(--surface-strong)]" /> How to perform
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    {selectedExercise.steps.map((step, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex gap-6 p-6 rounded-3xl bg-[var(--surface)] border border-[var(--card-border)] items-center group hover:bg-[var(--primary)]/5 hover:border-[var(--primary)]/30 transition-all duration-300"
                      >
                        <div className="w-10 h-10 rounded-2xl bg-[var(--surface)] border border-[var(--card-border)] flex items-center justify-center text-[var(--text-muted)] font-black text-sm group-hover:bg-[var(--primary)] group-hover:text-black group-hover:border-[var(--primary)] transition-all duration-300">
                          0{idx + 1}
                        </div>
                        <p className="flex-1 text-sm md:text-base text-[var(--text-muted)] font-bold group-hover:text-[var(--foreground)] transition-colors leading-relaxed">
                          {step}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar Info */}
              <div className="lg:col-span-4 space-y-8">
                {/* Equipment Hud */}
                <div className="glass-panel p-8 bg-[var(--surface)] border-[var(--card-border)] space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] flex items-center gap-2">
                    <BeakerIcon className="w-4 h-4" /> Equipment needed
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedExercise.equipment.map((item, i) => (
                      <span
                        key={i}
                        className="px-4 py-2 bg-[var(--surface)] rounded-xl border border-[var(--card-border)] text-[10px] font-black text-[var(--foreground)] uppercase tracking-tight hover:bg-[var(--primary)]/10 hover:border-[var(--primary)]/30 transition-all cursor-default"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Training Insight */}
                {selectedExercise.tips && selectedExercise.tips.length > 0 && (
                  <div className="p-8 rounded-[2rem] bg-gradient-to-br from-[var(--primary)]/20 to-transparent border border-[var(--primary)]/30 space-y-4 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[var(--primary)] rounded-2xl flex items-center justify-center text-black shadow-[0_0_15px_rgba(118,185,0,0.3)]">
                        <SparklesIcon className="w-5 h-5" />
                      </div>
                      <p className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest">
                        Pro Training Tips
                      </p>
                    </div>
                    <ul className="space-y-3">
                      {selectedExercise.tips.map((tip, i) => (
                        <li key={i} className="text-sm text-[var(--foreground)] font-bold leading-relaxed flex gap-3">
                          <div className="w-1 h-1 rounded-full bg-[var(--primary)] mt-2 shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  onClick={() => setSelectedExercise(null)}
                  className="w-full py-5 rounded-3xl bg-[var(--surface)] border border-[var(--card-border)] text-[var(--text-muted)] font-black uppercase text-xs tracking-[0.2em] hover:bg-[var(--surface-strong)] hover:border-[var(--card-border)] hover:text-[var(--foreground)] transition-all shadow-xl group"
                >
                  Back to <span className="text-[var(--text-muted)] group-hover:text-[var(--foreground)]/40 transition-colors">Exercises</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
