'use client';

import React from 'react';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 md:px-6">
      <div className="max-w-4xl mx-auto space-y-12 animate-fade-in">
        <header className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-[10px] font-black uppercase tracking-widest border border-[var(--primary)]/20">
            <ShieldCheckIcon className="w-3 h-3" /> Security & Privacy
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter">
            Privacy <span className="text-[var(--primary)]">Policy</span>
          </h1>
          <p className="text-[var(--text-muted)] text-sm font-medium opacity-70">
            Last updated: January 22, 2026
          </p>
        </header>

        <section className="glass-card p-8 md:p-12 space-y-8 leading-relaxed text-[var(--text-muted)]">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[var(--foreground)]">1. Introduction</h2>
            <p>
              Welcome to FoodCal. We are committed to protecting your personal information and your
              right to privacy. This Privacy Policy explains how we collect, use, and safeguard your
              data when you use our AI-powered nutrition tracking platform.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[var(--foreground)]">2. Data Collection</h2>
            <p>
              We collect information that you provide directly to us, such as when you create an
              account, log meals, or interact with our AI Coach. This includes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Account information (name, email)</li>
              <li>Health and fitness data (weight, goals, dietary preferences)</li>
              <li>Meal images and nutritional logs</li>
              <li>Usage data and correspondence with our AI systems</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[var(--foreground)]">3. How We Use Your Data</h2>
            <p>Your data is primarily used to provide and improve our services, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Analyzing meal images using Gemini AI</li>
              <li>Generating personalized coaching advice</li>
              <li>Tracking your progress towards health goals</li>
              <li>Ensuring the security and integrity of our platform</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[var(--foreground)]">4. AI Analysis & Processing</h2>
            <p>
              Our platform uses advanced AI models to process meal images. While these images are
              stored securely, anonymous data may be used to improve the accuracy of our nutritional
              analysis. We never sell your personal identification to third parties.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[var(--foreground)]">5. Security</h2>
            <p>
              We implement industry-standard security measures to protect your data. However, no
              method of transmission over the internet is 100% secure. We strive to use commercially
              acceptable means to protect your personal information.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[var(--foreground)]">6. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at{' '}
              <span className="text-[var(--primary)]">privacy@krixen-org.com</span>.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
