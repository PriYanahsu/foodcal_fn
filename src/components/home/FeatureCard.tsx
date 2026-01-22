import React from 'react';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

interface FeatureCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    stepNumber: number;
    delay?: number;
}

export default function FeatureCard({ title, description, icon, stepNumber, delay = 0 }: FeatureCardProps) {
    return (
        <div
            className="glass-card p-6 relative group overflow-hidden hover:border-[var(--primary)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,136,0.15)] animate-slide-up bg-gradient-to-br from-[var(--card-bg)] to-[var(--card-bg)]/50"
            style={{ animationDelay: `${delay}ms` }}
        >
            {/* Background Glow Effect */}
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-[var(--primary)]/10 rounded-full blur-3xl group-hover:bg-[var(--primary)]/20 transition-colors duration-500" />

            {/* Step Number */}
            <div className="absolute top-4 right-4 text-xs font-bold text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors border border-[var(--card-border)] rounded-full w-6 h-6 flex items-center justify-center">
                {stepNumber}
            </div>

            <div className="relative z-10 flex flex-col h-full">
                {/* Icon Container */}
                <div className="w-14 h-14 rounded-2xl bg-[var(--background)] border border-[var(--card-border)] flex items-center justify-center text-[var(--primary)] mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    {icon}
                </div>

                <h3 className="text-lg font-bold mb-2 group-hover:text-[var(--primary)] transition-colors">
                    {title}
                </h3>

                <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-6 flex-grow">
                    {description}
                </p>

                <div className="flex items-center text-xs font-bold text-[var(--primary)] opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    Learn more <ArrowRightIcon className="w-3 h-3 ml-1" />
                </div>
            </div>
        </div>
    );
}
