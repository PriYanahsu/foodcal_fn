'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  BellIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const WorkflowStep = ({
  icon,
  title,
  description,
  delay,
}: {
  icon: any;
  title: string;
  description: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="flex gap-4 p-6 rounded-3xl bg-[var(--surface)] border border-[var(--card-border)] hover:border-[var(--primary)]/30 hover:bg-[var(--surface-strong)] transition-all group"
  >
    <div className="w-12 h-12 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <div className="space-y-1">
      <h3 className="font-bold text-lg">{title}</h3>
      <p className="text-[var(--text-muted)] text-sm leading-relaxed">{description}</p>
    </div>
  </motion.div>
);

export const CoachWorkflow: React.FC = () => {
  return (
    <section className="w-full py-24 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-[var(--primary)]/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-[var(--secondary)]/5 rounded-full blur-[120px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight">
            How Your <span className="text-[var(--primary)]">Professional Coach</span> Works
          </h2>
          <p className="text-[var(--text-muted)] text-lg">
            Experience a seamless loop of tracking, analysis, and personalized coaching.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Steps Column */}
          <div className="space-y-6">
            <WorkflowStep
              delay={0.1}
              icon={<BellIcon className="w-6 h-6" />}
              title="Smart Notifications"
              description="Get timely alerts when you reach milestones or veer off track. Your AI coach stays alert so you don't have to."
            />
            <WorkflowStep
              delay={0.2}
              icon={<SparklesIcon className="w-6 h-6" />}
              title="Gemini AI Analysis"
              description="Our advanced AI engine processes your meals, activity, and patterns to understand your unique health journey."
            />
            <WorkflowStep
              delay={0.3}
              icon={<ChatBubbleLeftRightIcon className="w-6 h-6" />}
              title="Personalized Advice"
              description="Receive actionable, professional-grade feedback tailored specifically to your goals and current progress."
            />
          </div>

          {/* Visual Demo Column */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="glass-card p-2 aspect-[4/5] rounded-[3rem] relative overflow-hidden border-[var(--card-border)] shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/80 z-10" />

              {/* Fake Mobile UI */}
              <div className="relative z-20 h-full flex flex-col p-8 space-y-8">
                {/* Status Bar */}
                <div className="flex justify-between items-center opacity-40">
                  <span className="text-xs font-bold">9:41</span>
                  <div className="flex gap-1.5">
                    <div className="w-4 h-4 rounded-full border border-[var(--card-border)]" />
                    <div className="w-4 h-4 rounded-full border border-[var(--card-border)]" />
                  </div>
                </div>

                {/* Notification Alert */}
                <motion.div
                  initial={{ y: -50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="bg-[var(--surface-strong)] backdrop-blur-xl border border-[var(--card-border)] p-4 rounded-2xl flex gap-3 shadow-lg"
                >
                  <div className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center text-black">
                    <BellIcon className="w-6 h-6" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)]">
                      AI Coach Alert
                    </p>
                    <p className="text-sm font-bold">High Protein Pattern Detected! 🥩</p>
                  </div>
                </motion.div>

                {/* AI Coaching Card */}
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="mt-auto bg-gradient-to-br from-gray-900 to-black border border-[var(--primary)]/30 p-6 rounded-3xl space-y-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                >
                  <div className="flex items-center gap-2">
                    <SparklesIcon className="w-4 h-4 text-[var(--primary)]" />
                    <span className="text-xs font-black uppercase tracking-tight text-[var(--text-muted)]">
                      Pro Coach Feedback
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed italic">
                    "I noticed you've increased your protein by 20% this week. This is perfect for
                    muscle recovery. Try adding 200ml more water to stay hydrated!"
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                    <div className="flex-1 h-1 bg-[var(--surface-strong)] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: '85%' }}
                        transition={{ delay: 1.5, duration: 1 }}
                        className="h-full bg-[var(--primary)]"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-[var(--primary)]">
                      WEEKLY GOAL: 85%
                    </span>
                  </div>
                </motion.div>
              </div>

              {/* Background image/gradient for the phone */}
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=2053')] bg-cover bg-center brightness-50" />
            </motion.div>

            {/* Decor Elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-[var(--primary)] opacity-20 blur-3xl" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-[var(--secondary)] opacity-20 blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
};
