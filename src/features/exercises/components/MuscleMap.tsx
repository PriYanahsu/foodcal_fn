'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MuscleGroup } from '../data/types';

interface MuscleMapProps {
  onSelectMuscle: (muscle: MuscleGroup) => void;
  selectedMuscle: MuscleGroup | null;
  searchQuery: string;
}

export const MuscleMap: React.FC<MuscleMapProps> = ({
  onSelectMuscle,
  selectedMuscle,
  searchQuery,
}) => {
  const [hoveredMuscle, setHoveredMuscle] = useState<MuscleGroup | null>(null);
  const query = searchQuery.toLowerCase();

  const muscles: { id: MuscleGroup; name: string; view: 'front' | 'back' }[] = [
    { id: 'chest', name: 'Pectorals (Chest)', view: 'front' },
    { id: 'abs', name: 'Abs (Core)', view: 'front' },
    { id: 'shoulders', name: 'Deltoids (Shoulders)', view: 'front' },
    { id: 'biceps', name: 'Biceps', view: 'front' },
    { id: 'quads', name: 'Quadriceps (Legs)', view: 'front' },
    { id: 'forearms', name: 'Forearms', view: 'front' },
    { id: 'back', name: 'Lats & Mid Back', view: 'back' },
    { id: 'traps', name: 'Trapezius (Traps)', view: 'back' },
    { id: 'triceps', name: 'Triceps', view: 'back' },
    { id: 'glutes', name: 'Gluteus (Glutes)', view: 'back' },
    { id: 'hamstrings', name: 'Hamstrings', view: 'back' },
    { id: 'calves', name: 'Calves', view: 'back' },
    { id: 'cardio', name: 'Cardio', view: 'front' },
    { id: 'full_body', name: 'Full Body', view: 'front' },
  ];

  const getMuscleStyle = (group: MuscleGroup) => {
    const isSelected = selectedMuscle === group;
    const isHovered = hoveredMuscle === group;
    const isSearchHit =
      query.length > 1 &&
      muscles
        .find((m) => m.id === group)
        ?.name.toLowerCase()
        .includes(query);
    const hasSearch = query.length > 1;
    const isInteractable = !hasSearch || isSearchHit;

    return {
      fill: isSelected
        ? 'var(--primary)'
        : isSearchHit
          ? 'rgba(var(--primary-rgb), 0.6)'
          : isHovered
            ? 'var(--primary-hover)'
            : '#252529',
      stroke: isSelected
        ? '#fff'
        : isSearchHit
          ? 'var(--primary)'
          : isHovered
            ? 'rgba(255,255,255,0.5)'
            : '#444',
      strokeWidth: isSelected || isSearchHit ? 2 : 1,
      opacity: isInteractable ? 1 : 0.2,
      cursor: isInteractable ? 'pointer' : 'not-allowed',
      transition: { duration: 0.2 },
    };
  };

  const handleSelect = (group: MuscleGroup) => {
    const isSearchHit =
      query.length <= 1 ||
      muscles
        .find((m) => m.id === group)
        ?.name.toLowerCase()
        .includes(query);
    if (isSearchHit) {
      onSelectMuscle(group);
    }
  };

  return (
    <div className="flex flex-col xl:flex-row items-center justify-center gap-12 w-full">

      {/* Anatomical Main View */}
      <div className="flex-1 w-full relative group">
        <div className="grid grid-cols-2 gap-8 md:gap-12 items-center justify-items-center">
          {/* Anterior View */}
          <div className="flex flex-col items-center gap-6 w-full">
            <div className="space-y-1 text-center">
              <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--primary)] shadow-sm">
                Anterior
              </h3>
              <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-[var(--primary)]/50 to-transparent mx-auto" />
            </div>

            <div className="relative w-full max-w-[140px] sm:max-w-[170px] aspect-[1/2.2] group/map">
              {/* Holographic Base Grid */}
              <div className="absolute inset-x-[-20%] inset-y-[-10%] opacity-20 pointer-events-none">
                <svg width="100%" height="100%" className="text-[var(--primary)]/10">
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>

              <svg
                viewBox="0 0 200 450"
                className="w-full h-full drop-shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-visible relative z-10"
              >
                <defs>
                  <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1a1a20" />
                    <stop offset="100%" stopColor="#0d0d10" />
                  </linearGradient>
                </defs>

                <path
                  d="M100 25 L115 45 Q125 70 115 110 L145 140 L135 250 L155 420 L130 420 L120 280 L100 280 L80 280 L70 420 L45 420 L65 250 L55 140 L85 110 Q75 70 85 45 Z"
                  fill="url(#bodyGrad)"
                  stroke="rgba(var(--primary-rgb), 0.1)"
                  strokeWidth="1.5"
                  className="transition-colors duration-700 group-hover/map:stroke-[var(--primary)]/20"
                />

                <motion.path
                  d="M85 95 Q100 85 115 95 L118 145 Q100 155 82 145 Z"
                  {...getMuscleStyle('chest')}
                  onMouseEnter={() => setHoveredMuscle('chest')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  onClick={() => handleSelect('chest')}
                  className="cursor-pointer transition-all duration-300"
                />
                <motion.path
                  d="M100 95 Q115 85 130 95 L133 145 Q115 155 97 145 Z"
                  {...getMuscleStyle('chest')}
                  onMouseEnter={() => setHoveredMuscle('chest')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  onClick={() => handleSelect('chest')}
                  className="cursor-pointer transition-all duration-300"
                />
                <motion.path
                  d="M85 155 L115 155 L110 240 L90 240 Z"
                  {...getMuscleStyle('abs')}
                  onMouseEnter={() => setHoveredMuscle('abs')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  onClick={() => handleSelect('abs')}
                  className="cursor-pointer transition-all duration-300"
                />
                <motion.path
                  d="M72 100 Q62 110 68 140 L80 140 Q80 110 90 100 Z"
                  {...getMuscleStyle('shoulders')}
                  onMouseEnter={() => setHoveredMuscle('shoulders')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  onClick={() => handleSelect('shoulders')}
                  className="cursor-pointer transition-all duration-300"
                />
                <motion.path
                  d="M128 100 Q138 110 132 140 L120 140 Q120 110 110 100 Z"
                  {...getMuscleStyle('shoulders')}
                  onMouseEnter={() => setHoveredMuscle('shoulders')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  onClick={() => handleSelect('shoulders')}
                  className="cursor-pointer transition-all duration-300"
                />
                <motion.path
                  d="M60 150 Q52 175 62 205 L72 200 Q70 175 75 150 Z"
                  {...getMuscleStyle('biceps')}
                  onMouseEnter={() => setHoveredMuscle('biceps')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  onClick={() => handleSelect('biceps')}
                  className="cursor-pointer transition-all duration-300"
                />
                <motion.path
                  d="M140 150 Q148 175 138 205 L128 200 Q130 175 125 150 Z"
                  {...getMuscleStyle('biceps')}
                  onMouseEnter={() => setHoveredMuscle('biceps')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  onClick={() => handleSelect('biceps')}
                  className="cursor-pointer transition-all duration-300"
                />
                <motion.path
                  d="M68 255 L92 255 L88 340 L64 330 Z"
                  {...getMuscleStyle('quads')}
                  onMouseEnter={() => setHoveredMuscle('quads')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  onClick={() => handleSelect('quads')}
                  className="cursor-pointer transition-all duration-300"
                />
                <motion.path
                  d="M132 255 L108 255 L112 340 L136 330 Z"
                  {...getMuscleStyle('quads')}
                  onMouseEnter={() => setHoveredMuscle('quads')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  onClick={() => handleSelect('quads')}
                  className="cursor-pointer transition-all duration-300"
                />
              </svg>
            </div>
          </div>

          {/* Posterior View */}
          <div className="flex flex-col items-center gap-6 w-full">
            <div className="space-y-1 text-center">
              <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--primary)] shadow-sm">
                Posterior
              </h3>
              <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-[var(--primary)]/50 to-transparent mx-auto" />
            </div>

            <div className="relative w-full max-w-[140px] sm:max-w-[170px] aspect-[1/2.2] group/map">
              <div className="absolute inset-x-[-20%] inset-y-[-10%] opacity-20 pointer-events-none">
                <svg width="100%" height="100%" className="text-[var(--primary)]/10">
                  <use href="#grid" />
                </svg>
              </div>

              <svg
                viewBox="0 0 200 450"
                className="w-full h-full drop-shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-visible relative z-10"
              >
                <path
                  d="M100 25 L115 45 Q125 70 115 110 L145 140 L135 250 L155 420 L130 420 L120 280 L100 280 L80 280 L70 420 L45 420 L65 250 L55 140 L85 110 Q75 70 85 45 Z"
                  fill="url(#bodyGrad)"
                  stroke="rgba(var(--primary-rgb), 0.1)"
                  strokeWidth="1.5"
                  className="transition-colors duration-700 group-hover/map:stroke-[var(--primary)]/20"
                />

                <motion.path
                  d="M80 60 Q100 50 120 60 L130 95 Q100 110 70 95 Z"
                  {...getMuscleStyle('traps')}
                  onMouseEnter={() => setHoveredMuscle('traps')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  onClick={() => handleSelect('traps')}
                  className="cursor-pointer transition-all duration-300"
                />
                <motion.path
                  d="M75 105 Q100 120 125 105 L120 190 Q100 205 80 190 Z"
                  {...getMuscleStyle('back')}
                  onMouseEnter={() => setHoveredMuscle('back')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  onClick={() => handleSelect('back')}
                  className="cursor-pointer transition-all duration-300"
                />
                <motion.path
                  d="M55 145 Q45 175 55 210 L68 200 Q65 175 70 145 Z"
                  {...getMuscleStyle('triceps')}
                  onMouseEnter={() => setHoveredMuscle('triceps')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  onClick={() => handleSelect('triceps')}
                  className="cursor-pointer transition-all duration-300"
                />
                <motion.path
                  d="M145 145 Q155 175 145 210 L132 200 Q135 175 130 145 Z"
                  {...getMuscleStyle('triceps')}
                  onMouseEnter={() => setHoveredMuscle('triceps')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  onClick={() => handleSelect('triceps')}
                  className="cursor-pointer transition-all duration-300"
                />
                <motion.path
                  d="M72 230 Q100 220 128 230 L132 275 Q100 290 68 275 Z"
                  {...getMuscleStyle('glutes')}
                  onMouseEnter={() => setHoveredMuscle('glutes')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  onClick={() => handleSelect('glutes')}
                  className="cursor-pointer transition-all duration-300"
                />
                <motion.path
                  d="M75 285 L95 285 L92 350 L68 340 Z"
                  {...getMuscleStyle('hamstrings')}
                  onMouseEnter={() => setHoveredMuscle('hamstrings')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  onClick={() => handleSelect('hamstrings')}
                  className="cursor-pointer transition-all duration-300"
                />
                <motion.path
                  d="M125 285 L105 285 L108 350 L132 340 Z"
                  {...getMuscleStyle('hamstrings')}
                  onMouseEnter={() => setHoveredMuscle('hamstrings')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  onClick={() => handleSelect('hamstrings')}
                  className="cursor-pointer transition-all duration-300"
                />
                <motion.path
                  d="M62 360 L80 365 L75 415 L55 415 Z"
                  {...getMuscleStyle('calves')}
                  onMouseEnter={() => setHoveredMuscle('calves')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  onClick={() => handleSelect('calves')}
                  className="cursor-pointer transition-all duration-300"
                />
                <motion.path
                  d="M138 360 L120 365 L125 415 L145 415 Z"
                  {...getMuscleStyle('calves')}
                  onMouseEnter={() => setHoveredMuscle('calves')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  onClick={() => handleSelect('calves')}
                  className="cursor-pointer transition-all duration-300"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Dynamic Scan Info Center Overlay */}
        <AnimatePresence>
          {(hoveredMuscle || selectedMuscle) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-3xl border border-[var(--primary)]/30 p-1 rounded-full z-50 pointer-events-none shadow-5xl w-32 h-32 md:w-40 md:h-40 flex flex-col items-center justify-center text-center ring-4 ring-[var(--card-border)]"
            >
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] leading-none">
                  Selected
                </p>
                <div className="h-[1px] w-8 bg-[var(--surface-strong)] mx-auto my-2" />
                <p className="text-xs md:text-sm font-black text-[var(--foreground)] uppercase tracking-tighter">
                  {hoveredMuscle || selectedMuscle}
                </p>
                <div className="mt-2 flex items-center justify-center gap-1">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-1 h-1 rounded-full bg-[var(--primary)] opacity-40" />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Interactive Muscle Dock (Bottom) */}
      <div className="absolute inset-x-0 -bottom-12 flex justify-center h-16">
        <div className="flex items-center gap-1.5 px-4 bg-[var(--surface)] backdrop-blur-xl border border-[var(--card-border)] rounded-2xl shadow-2xl overflow-x-auto max-w-[90%] custom-scrollbar">
          {muscles.map((m) => (
            <button
              key={m.id}
              onMouseEnter={() => setHoveredMuscle(m.id)}
              onMouseLeave={() => setHoveredMuscle(null)}
              onClick={() => handleSelect(m.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap group relative ${selectedMuscle === m.id
                ? 'bg-[var(--primary)]/20 text-[var(--primary)] font-bold'
                : 'text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)]'
                }`}
            >
              <span className="text-[10px] font-black uppercase tracking-tight">{m.name.split(' (')[0]}</span>
              {selectedMuscle === m.id && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--primary)] shadow-[0_0_10px_var(--primary)]" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
