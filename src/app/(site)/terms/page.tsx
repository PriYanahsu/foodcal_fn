'use client';

import React from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

export default function TermsOfService() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 md:px-6">
      <div className="max-w-4xl mx-auto space-y-12 animate-fade-in">
        <header className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-[10px] font-black uppercase tracking-widest border border-[var(--primary)]/20">
            <DocumentTextIcon className="w-3 h-3" /> Agreement & Terms
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter">
            Terms of <span className="text-[var(--primary)]">Service</span>
          </h1>
          <p className="text-[var(--text-muted)] text-sm font-medium opacity-70">
            Last updated: January 22, 2026
          </p>
        </header>

        <section className="glass-card p-8 md:p-12 space-y-8 leading-relaxed text-[var(--text-muted)]">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing and using FoodCal, you agree to be bound by these Terms of Service. If
              you do not agree to these terms, please do not use our services.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">2. Description of Service</h2>
            <p>
              FoodCal provides an AI-powered platform for nutritional analysis and health coaching.
              Our services include meal scanning, nutritional logging, progress tracking, and
              AI-generated coaching advice.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">3. User Responsibilities</h2>
            <p>As a user of FoodCal, you are responsible for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Providing accurate information</li>
              <li>Maintaining the security of your account</li>
              <li>
                Ensuring that the content you upload does not violate any laws or third-party rights
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">4. Health Disclaimer</h2>
            <p className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl text-red-200">
              <strong className="text-white block mb-1">IMPORTANT:</strong> FoodCal and its AI Coach
              provide information for educational purposes only. We are not medical professionals.
              The AI-generated advice should not be taken as medical prescription or professional
              health advice. Always consult with a qualified physician before making significant
              changes to your diet or exercise routine.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">5. Intellectual Property</h2>
            <p>
              The content, features, and functionality of FoodCal, including the AI models and
              coaching algorithms, are the exclusive property of KRIXEN-ORG and its licensors.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">6. Limitation of Liability</h2>
            <p>
              KRIXEN-ORG shall not be liable for any indirect, incidental, special, or consequential
              damages resulting from the use or inability to use our services or for any nutritional
              data inaccuracies.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">7. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will provide notice of any
              significant changes. Your continued use of the platform after such changes constitutes
              acceptance of the new terms.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
