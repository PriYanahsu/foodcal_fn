'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    CameraIcon,
    ChartPieIcon,
    TrophyIcon,
    SparklesIcon,
    BellAlertIcon,
    UserIcon,
    CalendarDaysIcon,
    ClipboardDocumentListIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import { BRAND_ASSETS } from '@/lib/brand-config';

export const DEMO_STEPS = [
    {
        title: "AI Profile Setup",
        description: "Tell our AI your height, weight, age, and activity level. Get instant personalized macro targets.",
        icon: UserIcon,
        color: "from-violet-500 to-purple-400",
        details: "The AI analyzes your body metrics and lifestyle to calculate your perfect daily calorie, protein, carbs, and fat targets."
    },
    {
        title: "Set Your Goal",
        description: "Choose weight loss, gain, or maintain. Set your target weight and timeline—AI validates it's healthy.",
        icon: TrophyIcon,
        color: "from-amber-500 to-orange-400",
        details: "Our AI coach ensures your goals are realistic and sustainable, suggesting adjustments if needed for your safety."
    },
    {
        title: "Snap & Identify",
        description: "Point your camera at any meal. AI identifies ingredients and portions in seconds.",
        icon: CameraIcon,
        color: "from-blue-500 to-cyan-400",
        details: "Advanced computer vision recognizes food items, estimates serving sizes, and logs everything automatically."
    },
    {
        title: "Instant Macros",
        description: "Automatic calorie and macronutrient calculation. Zero manual data entry required.",
        icon: ChartPieIcon,
        color: "from-emerald-500 to-teal-400",
        details: "See real-time updates on your dashboard showing calories, protein, carbs, and fats consumed vs. your targets."
    },
    {
        title: "Smart Dashboard",
        description: "Track your daily progress with beautiful charts. See if you're on track or falling behind.",
        icon: ClipboardDocumentListIcon,
        color: "from-pink-500 to-rose-400",
        details: "Visual progress bars, meal history, and AI-generated advice appear when you need a boost to hit your goals."
    },
    {
        title: "AI Coaching",
        description: "Get personalized advice when you're off track. The AI knows when to motivate you.",
        icon: SparklesIcon,
        color: "from-indigo-500 to-blue-400",
        details: "If you're 500 kcal behind at 8 PM, the AI sends targeted suggestions to help you catch up or adjust tomorrow's plan."
    },
    {
        title: "Step Tracking",
        description: "Sync your daily steps. The AI factors activity into your calorie budget automatically.",
        icon: ArrowPathIcon,
        color: "from-green-500 to-emerald-400",
        details: "More active days = slightly higher calorie allowance. The AI adjusts your targets dynamically based on movement."
    },
    {
        title: "Smart Notifications",
        description: "Background push alerts keep you consistent even when the app is closed.",
        icon: BellAlertIcon,
        color: "from-red-500 to-pink-400",
        details: "Get reminders to log meals, motivational messages, and progress updates delivered at the perfect time."
    },
    {
        title: "Meal History",
        description: "Review past meals with photos. See what worked and what didn't for your goals.",
        icon: CalendarDaysIcon,
        color: "from-yellow-500 to-amber-400",
        details: "Browse your food diary by date, analyze patterns, and learn from your nutrition journey over time."
    }
];

export const FeatureCard: React.FC<{ step: typeof DEMO_STEPS[0], index: number }> = ({ step, index }) => {
    const Icon = step.icon;
    const [isExpanded, setIsExpanded] = React.useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08 }}
            className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[var(--primary)]/30 transition-all duration-500 relative overflow-hidden cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
        >
            <div className={`absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-10 blur-[40px] transition-opacity duration-500`} />

            <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} p-2.5 shadow-lg flex items-center justify-center text-white flex-shrink-0`}>
                    <Icon className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                        <span className="text-[var(--primary)] text-xs font-mono opacity-50">0{index + 1}</span>
                        {step.title}
                    </h3>

                    <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-3">
                        {step.description}
                    </p>

                    <motion.div
                        initial={false}
                        animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
                        className="overflow-hidden"
                    >
                        <div className="pt-3 border-t border-white/5 mt-3">
                            <p className="text-xs text-gray-400 leading-relaxed italic">
                                💡 {step.details}
                            </p>
                        </div>
                    </motion.div>

                    <button className="text-[var(--primary)] text-xs font-bold mt-2 hover:underline">
                        {isExpanded ? 'Show less' : 'Learn more'}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export const AppDemo: React.FC = () => {
    return (
        <section className="w-full max-w-6xl mx-auto px-4 py-24 sm:py-32">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-20"
            >
                <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--primary)] text-xs font-bold uppercase tracking-widest">
                    Complete Feature Walkthrough
                </div>
                <h2 className="text-4xl sm:text-6xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] via-white to-[var(--secondary)]">
                    How {BRAND_ASSETS.name} Works
                </h2>
                <p className="text-[var(--text-muted)] text-xl max-w-3xl mx-auto leading-relaxed">
                    From AI-powered profile setup to daily tracking and smart coaching—discover every feature that makes {BRAND_ASSETS.name} your ultimate nutrition companion.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-16">
                {DEMO_STEPS.map((step, index) => (
                    <FeatureCard key={index} step={step} index={index} />
                ))}
            </div>

            {/* Bottom Call to Action */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="mt-24 p-0.5 rounded-[3rem] bg-gradient-to-r from-[var(--primary)]/30 via-white/5 to-[var(--secondary)]/30 shadow-2xl"
            >
                <div className="bg-black/60 backdrop-blur-2xl p-10 sm:p-20 rounded-[2.9rem] flex flex-col items-center text-center">
                    <div className="w-20 h-20 mb-8 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <img src={BRAND_ASSETS.logo} alt="" className="w-12 h-12 object-contain" />
                    </div>
                    <h3 className="text-3xl sm:text-5xl font-black text-white mb-6">Ready to transform your health?</h3>
                    <p className="text-lg text-[var(--text-muted)] mb-10 max-w-xl">
                        Join thousands using AI to achieve their fitness goals. No more guessing—just results.
                    </p>
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="px-10 py-5 bg-white text-black font-black text-lg rounded-2xl hover:bg-[var(--primary)] transition-all transform hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
                    >
                        Get Started Today
                    </button>
                </div>
            </motion.div>
        </section>
    );
};
