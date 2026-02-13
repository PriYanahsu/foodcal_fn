'use client';

import React from 'react';
import Link from 'next/link';
import { CameraIcon, ChartBarIcon, SparklesIcon, FireIcon } from '@heroicons/react/24/outline';
import FeatureCard from './FeatureCard';
import { CoachWorkflow } from './CoachWorkflow';
import { ROUTES } from '@/constants/routes';

export default function HeroSection() {
  const features = [
    {
      title: 'Snap & Scan',
      description:
        'Simply point your camera at any meal. Our advanced AI instantly identifies ingredients and portion sizes in seconds.',
      icon: <CameraIcon className="w-7 h-7" />,
    },
    {
      title: 'AI Analysis',
      description:
        'Get detailed nutritional breakdowns including calories, protein, carbs, and fats with 98% accuracy.',
      icon: <FireIcon className="w-7 h-7" />,
    },
    {
      title: 'Track Progress',
      description:
        'Automatically log your daily intake and visualize your journey towards your health goals with beautiful charts.',
      icon: <ChartBarIcon className="w-7 h-7" />,
    },
    {
      title: 'Get Coached',
      description:
        'Receive personalized tips and feedback from your AI Health Coach safely based on your eating habits.',
      icon: <SparklesIcon className="w-7 h-7" />,
    },
  ];

  return (
    <div className="relative w-full min-h-[85vh] flex flex-col justify-center overflow-hidden py-12">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[var(--primary)]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-[var(--secondary)]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 w-full">
        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--primary)] text-xs font-bold animate-fade-in uppercase tracking-wider">
            <SparklesIcon className="w-3 h-3" />
            <span>The Future of Nutrition Tracking</span>
          </div>

          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight animate-slide-up"
            style={{ animationDelay: '0.1s' }}
          >
            Eat Smarter. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]">
              Live Better.
            </span>
          </h1>

          <p
            className="text-[var(--text-muted)] text-lg md:text-xl leading-relaxed animate-slide-up"
            style={{ animationDelay: '0.2s' }}
          >
            Experience the easiest way to track your diet. Just snap a photo, and let our AI handle
            the rest. No more manual entry.
          </p>

          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-slide-up"
            style={{ animationDelay: '0.3s' }}
          >
            <Link href={ROUTES.SCAN}>
              <button className="btn-primary w-full sm:w-auto text-lg px-8 py-4 shadow-[0_0_30px_rgba(0,255,136,0.3)] hover:shadow-[0_0_50px_rgba(0,255,136,0.5)]">
                Start Tracking Now
              </button>
            </Link>
            <Link href={ROUTES.LOGIN || '/login'}>
              {/* Fallback route if dashboard isn't clear */}
              <button className="btn-secondary w-full sm:w-auto text-lg px-8 py-4 bg-transparent border-[var(--card-border)] hover:bg-white/5">
                View Dashboard
              </button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-[var(--card-border)] via-[var(--primary)]/30 to-[var(--card-border)] -translate-y-1/2 -z-10" />

          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              stepNumber={index + 1}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              delay={400 + index * 100}
            />
          ))}
        </div>

        {/* AI Coach Workflow Section */}
        <CoachWorkflow />
      </div>
    </div>
  );
}
