'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MuscleGroup } from '../data/types';

interface MuscleMapProps {
    onSelectMuscle: (muscle: MuscleGroup) => void;
    selectedMuscle: MuscleGroup | null;
    searchQuery: string;
}

export const MuscleMap: React.FC<MuscleMapProps> = ({ onSelectMuscle, selectedMuscle, searchQuery }) => {
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
        const isSearchHit = query.length > 1 && muscles.find(m => m.id === group)?.name.toLowerCase().includes(query);
        const hasSearch = query.length > 1;
        const isInteractable = !hasSearch || isSearchHit;

        return {
            fill: isSelected ? 'var(--primary)' : isSearchHit ? 'rgba(var(--primary-rgb), 0.6)' : isHovered ? 'var(--primary-hover)' : '#252529',
            stroke: isSelected ? '#fff' : isSearchHit ? 'var(--primary)' : isHovered ? 'rgba(255,255,255,0.5)' : '#444',
            strokeWidth: isSelected || isSearchHit ? 2 : 1,
            opacity: isInteractable ? 1 : 0.2,
            cursor: isInteractable ? 'pointer' : 'not-allowed',
            transition: { duration: 0.2 }
        };
    };

    const handleSelect = (group: MuscleGroup) => {
        const isSearchHit = query.length <= 1 || muscles.find(m => m.id === group)?.name.toLowerCase().includes(query);
        if (isSearchHit) {
            onSelectMuscle(group);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12 w-full">
            {/* Interactive Legend */}
            <div className="w-full lg:w-48 xl:w-60 space-y-3 shrink-0">
                <div className="pb-3 border-b border-white/5 mb-3">
                    <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Muscle Index</h4>
                    <p className="text-xs font-bold text-white">Select focus</p>
                </div>
                <div className="flex lg:flex-col overflow-x-auto lg:overflow-y-auto pb-4 lg:pb-0 gap-2 custom-scrollbar lg:max-h-[500px] lg:pr-2">
                    {muscles.map((m) => (
                        <button
                            key={m.id}
                            onMouseEnter={() => setHoveredMuscle(m.id)}
                            onMouseLeave={() => setHoveredMuscle(null)}
                            onClick={() => handleSelect(m.id)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg lg:rounded-xl border transition-all text-left group whitespace-nowrap lg:whitespace-normal shrink-0 ${selectedMuscle === m.id
                                ? 'bg-[var(--primary)] border-[var(--primary)] text-black'
                                : query.length > 1 && m.name.toLowerCase().includes(query)
                                    ? 'bg-[var(--primary)]/20 border-[var(--primary)]/30 text-white'
                                    : 'bg-white/5 border-white/5 text-[var(--text-muted)] hover:text-white'
                                }`}
                        >
                            <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-tight">{m.name.split(' (')[0]}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Anatomical Views */}
            <div className="flex-1 w-full relative">
                <div className="grid grid-cols-2 gap-4 sm:gap-6 items-center justify-items-center">
                    {/* View: Front Container */}
                    <div className="flex flex-col items-center gap-4 w-full">
                        <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] opacity-50">Anterior</h3>
                        <div className="relative w-full max-w-[120px] sm:max-w-[150px] aspect-[1/2.2]">
                            <svg viewBox="0 0 200 450" className="w-full h-full drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-visible">
                                <defs>
                                    <radialGradient id="bodyGlow" cx="50%" cy="50%" r="50%">
                                        <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.05" />
                                        <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                                    </radialGradient>
                                </defs>
                                <circle cx="100" cy="200" r="150" fill="url(#bodyGlow)" />
                                <path d="M100 25 L115 45 Q125 70 115 110 L145 140 L135 250 L155 420 L130 420 L120 280 L100 280 L80 280 L70 420 L45 420 L65 250 L55 140 L85 110 Q75 70 85 45 Z" fill="#141417" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

                                <motion.path d="M85 95 Q100 85 115 95 L118 145 Q100 155 82 145 Z" {...getMuscleStyle('chest')} onMouseEnter={() => setHoveredMuscle('chest')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => handleSelect('chest')} className="cursor-pointer" />
                                <motion.path d="M100 95 Q115 85 130 95 L133 145 Q115 155 97 145 Z" {...getMuscleStyle('chest')} onMouseEnter={() => setHoveredMuscle('chest')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => handleSelect('chest')} className="cursor-pointer" />
                                <motion.path d="M85 155 L115 155 L110 240 L90 240 Z" {...getMuscleStyle('abs')} onMouseEnter={() => setHoveredMuscle('abs')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => handleSelect('abs')} className="cursor-pointer" />
                                <motion.path d="M72 100 Q62 110 68 140 L80 140 Q80 110 90 100 Z" {...getMuscleStyle('shoulders')} onMouseEnter={() => setHoveredMuscle('shoulders')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => handleSelect('shoulders')} className="cursor-pointer" />
                                <motion.path d="M128 100 Q138 110 132 140 L120 140 Q120 110 110 100 Z" {...getMuscleStyle('shoulders')} onMouseEnter={() => setHoveredMuscle('shoulders')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => handleSelect('shoulders')} className="cursor-pointer" />
                                <motion.path d="M60 150 Q52 175 62 205 L72 200 Q70 175 75 150 Z" {...getMuscleStyle('biceps')} onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => handleSelect('biceps')} className="cursor-pointer" />
                                <motion.path d="M140 150 Q148 175 138 205 L128 200 Q130 175 125 150 Z" {...getMuscleStyle('biceps')} onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => handleSelect('biceps')} className="cursor-pointer" />
                                <motion.path d="M68 255 L92 255 L88 340 L64 330 Z" {...getMuscleStyle('quads')} onMouseEnter={() => setHoveredMuscle('quads')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => handleSelect('quads')} className="cursor-pointer" />
                                <motion.path d="M132 255 L108 255 L112 340 L136 330 Z" {...getMuscleStyle('quads')} onMouseEnter={() => setHoveredMuscle('quads')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => handleSelect('quads')} className="cursor-pointer" />
                            </svg>
                        </div>
                    </div>

                    {/* View: Back Container */}
                    <div className="flex flex-col items-center gap-4 w-full">
                        <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] opacity-50">Posterior</h3>
                        <div className="relative w-full max-w-[140px] sm:max-w-[180px] aspect-[1/2.2]">
                            <svg viewBox="0 0 200 450" className="w-full h-full drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-visible">
                                <circle cx="100" cy="200" r="150" fill="url(#bodyGlow)" />
                                <path d="M100 25 L115 45 Q125 70 115 110 L145 140 L135 250 L155 420 L130 420 L120 280 L100 280 L80 280 L70 420 L45 420 L65 250 L55 140 L85 110 Q75 70 85 45 Z" fill="#141417" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

                                <motion.path d="M80 60 Q100 50 120 60 L130 95 Q100 110 70 95 Z" {...getMuscleStyle('traps')} onMouseEnter={() => setHoveredMuscle('traps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => handleSelect('traps')} className="cursor-pointer" />
                                <motion.path d="M75 105 Q100 120 125 105 L120 190 Q100 205 80 190 Z" {...getMuscleStyle('back')} onMouseEnter={() => setHoveredMuscle('back')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => handleSelect('back')} className="cursor-pointer" />
                                <motion.path d="M55 145 Q45 175 55 210 L68 200 Q65 175 70 145 Z" {...getMuscleStyle('triceps')} onMouseEnter={() => setHoveredMuscle('triceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => handleSelect('triceps')} className="cursor-pointer" />
                                <motion.path d="M145 145 Q155 175 145 210 L132 200 Q135 175 130 145 Z" {...getMuscleStyle('triceps')} onMouseEnter={() => setHoveredMuscle('triceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => handleSelect('triceps')} className="cursor-pointer" />
                                <motion.path d="M72 230 Q100 220 128 230 L132 275 Q100 290 68 275 Z" {...getMuscleStyle('glutes')} onMouseEnter={() => setHoveredMuscle('glutes')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => handleSelect('glutes')} className="cursor-pointer" />
                                <motion.path d="M75 285 L95 285 L92 350 L68 340 Z" {...getMuscleStyle('hamstrings')} onMouseEnter={() => setHoveredMuscle('hamstrings')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => handleSelect('hamstrings')} className="cursor-pointer" />
                                <motion.path d="M125 285 L105 285 L108 350 L132 340 Z" {...getMuscleStyle('hamstrings')} onMouseEnter={() => setHoveredMuscle('hamstrings')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => handleSelect('hamstrings')} className="cursor-pointer" />
                                <motion.path d="M62 360 L80 365 L75 415 L55 415 Z" {...getMuscleStyle('calves')} onMouseEnter={() => setHoveredMuscle('calves')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => handleSelect('calves')} className="cursor-pointer" />
                                <motion.path d="M138 360 L120 365 L125 415 L145 415 Z" {...getMuscleStyle('calves')} onMouseEnter={() => setHoveredMuscle('calves')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => handleSelect('calves')} className="cursor-pointer" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Selection Label */}
                <AnimatePresence>
                    {(hoveredMuscle || selectedMuscle) && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-md border border-[var(--primary)]/50 px-4 py-2 rounded-xl z-50 pointer-events-none shadow-2xl flex flex-col items-center"
                        >
                            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--primary)] leading-none mb-1">Target Identified</p>
                            <p className="text-sm font-black text-white uppercase tracking-tight">
                                {hoveredMuscle || selectedMuscle}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
