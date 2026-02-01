'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CameraIcon,
    ChartPieIcon,
    TrophyIcon,
    SparklesIcon,
    BellAlertIcon,
    UserIcon,
    CalendarDaysIcon,
    ClipboardDocumentListIcon,
    ArrowPathIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { BRAND_ASSETS } from '@/lib/brand-config';

export const DEMO_STEPS = [
    {
        title: "AI Profile Setup",
        description: "Tell our AI your height, weight, age, and activity level. Get instant personalized macro targets.",
        icon: UserIcon,
        color: "from-violet-500 to-purple-400",
        details: "The AI analyzes your body metrics and lifestyle to calculate your perfect daily calorie, protein, carbs, and fat targets.",
        fullExplanation: {
            overview: "Our AI-powered profile setup creates a personalized nutrition plan tailored specifically to your body and goals.",
            howItWorks: [
                "Enter your basic stats: height, weight, age, and gender",
                "Select your activity level (Sedentary, Lightly Active, Moderately Active, Very Active, or Extremely Active)",
                "AI calculates your Basal Metabolic Rate (BMR) and Total Daily Energy Expenditure (TDEE)",
                "Receive instant macro targets optimized for your body composition and lifestyle"
            ],
            benefits: [
                "100% personalized to YOUR body—no generic one-size-fits-all plans",
                "Science-backed calculations using proven metabolic formulas",
                "Accounts for your unique activity level and lifestyle",
                "Updates automatically as your weight and activity change"
            ]
        }
    },
    {
        title: "Set Your Goal",
        description: "Choose weight loss, gain, or maintain. Set your target weight and timeline—AI validates it's healthy.",
        icon: TrophyIcon,
        color: "from-amber-500 to-orange-400",
        details: "Our AI coach ensures your goals are realistic and sustainable, suggesting adjustments if needed for your safety.",
        fullExplanation: {
            overview: "Set ambitious yet achievable goals with AI validation to ensure your health and success.",
            howItWorks: [
                "Choose your objective: Weight Loss, Weight Gain, or Maintain Weight",
                "Set your target weight and desired timeline",
                "AI analyzes if your goal is safe (e.g., not losing more than 2 lbs/week)",
                "Get personalized calorie adjustments to reach your goal sustainably",
                "AI suggests modifications if your timeline is too aggressive or too slow"
            ],
            benefits: [
                "Prevents unhealthy crash diets or unrealistic expectations",
                "Ensures you lose/gain weight at a medically safe rate",
                "Adjusts your daily calorie target to match your goal",
                "Keeps you motivated with achievable milestones"
            ]
        }
    },
    {
        title: "Snap & Identify",
        description: "Point your camera at any meal. AI identifies ingredients and portions in seconds.",
        icon: CameraIcon,
        color: "from-blue-500 to-cyan-400",
        details: "Advanced computer vision recognizes food items, estimates serving sizes, and logs everything automatically.",
        fullExplanation: {
            overview: "Say goodbye to manual food logging. Our AI-powered camera instantly recognizes what you're eating.",
            howItWorks: [
                "Open the scan feature and point your camera at your meal",
                "AI computer vision identifies individual food items on your plate",
                "Portion sizes are estimated using visual analysis",
                "All items are automatically added to your food log",
                "Review and confirm (or manually adjust) before saving"
            ],
            benefits: [
                "Saves 5-10 minutes per meal compared to manual logging",
                "Eliminates the tedious task of searching food databases",
                "More accurate portion estimates than guessing",
                "Works with home-cooked meals, restaurant dishes, and packaged foods"
            ]
        }
    },
    {
        title: "Instant Macros",
        description: "Automatic calorie and macronutrient calculation. Zero manual data entry required.",
        icon: ChartPieIcon,
        color: "from-emerald-500 to-teal-400",
        details: "See real-time updates on your dashboard showing calories, protein, carbs, and fats consumed vs. your targets.",
        fullExplanation: {
            overview: "Every scanned meal instantly updates your macro totals—no math, no guessing, just results.",
            howItWorks: [
                "AI calculates total calories from identified foods",
                "Breaks down macros: protein, carbohydrates, and fats",
                "Updates your daily totals in real-time on the dashboard",
                "Shows visual progress bars for each macro category",
                "Alerts you when you're close to or over your targets"
            ],
            benefits: [
                "Know exactly where you stand at any moment of the day",
                "Make informed decisions about your next meal",
                "Avoid overeating or undereating by tracking in real-time",
                "Perfect for flexible dieting (IIFYM) enthusiasts"
            ]
        }
    },
    {
        title: "Smart Dashboard",
        description: "Track your daily progress with beautiful charts. See if you're on track or falling behind.",
        icon: ClipboardDocumentListIcon,
        color: "from-pink-500 to-rose-400",
        details: "Visual progress bars, meal history, and AI-generated advice appear when you need a boost to hit your goals.",
        fullExplanation: {
            overview: "Your personal nutrition command center—see everything at a glance with stunning visualizations.",
            howItWorks: [
                "View daily calorie and macro progress with color-coded bars",
                "See your meal history with photos and timestamps",
                "Check your weekly trends and patterns",
                "Get AI-generated insights when you're off track",
                "Monitor your weight progress toward your goal"
            ],
            benefits: [
                "Instant visual feedback keeps you motivated",
                "Identify patterns in your eating habits",
                "Catch problems early before they derail your progress",
                "Celebrate wins when you hit your targets"
            ]
        }
    },
    {
        title: "AI Coaching",
        description: "Get personalized advice when you're off track. The AI knows when to motivate you.",
        icon: SparklesIcon,
        color: "from-indigo-500 to-blue-400",
        details: "If you're 500 kcal behind at 8 PM, the AI sends targeted suggestions to help you catch up or adjust tomorrow's plan.",
        fullExplanation: {
            overview: "Your 24/7 personal nutrition coach that knows exactly when and how to help you succeed.",
            howItWorks: [
                "AI monitors your daily intake throughout the day",
                "Detects when you're significantly over or under your targets",
                "Sends personalized advice via notifications",
                "Suggests specific foods or adjustments to get back on track",
                "Adapts messaging based on your goal (loss/gain/maintain)"
            ],
            benefits: [
                "Never feel lost or confused about what to eat next",
                "Get help exactly when you need it most",
                "Avoid common pitfalls like late-night overeating",
                "Stay accountable without feeling micromanaged"
            ]
        }
    },
    {
        title: "Step Tracking",
        description: "Sync your daily steps. The AI factors activity into your calorie budget automatically.",
        icon: ArrowPathIcon,
        color: "from-green-500 to-emerald-400",
        details: "More active days = slightly higher calorie allowance. The AI adjusts your targets dynamically based on movement.",
        fullExplanation: {
            overview: "Your activity level matters. We track your steps and adjust your nutrition plan accordingly.",
            howItWorks: [
                "Log your daily step count manually or sync from a fitness tracker",
                "AI calculates calories burned from your activity",
                "Your daily calorie target adjusts dynamically",
                "More active days give you a bit more food to fuel recovery",
                "Less active days reduce your target to prevent weight gain"
            ],
            benefits: [
                "Eat more on days you move more—guilt-free",
                "Prevent undereating on very active days",
                "Optimize recovery and muscle growth",
                "Stay flexible with your lifestyle"
            ]
        }
    },
    {
        title: "Smart Notifications",
        description: "Background push alerts keep you consistent even when the app is closed.",
        icon: BellAlertIcon,
        color: "from-red-500 to-pink-400",
        details: "Get reminders to log meals, motivational messages, and progress updates delivered at the perfect time.",
        fullExplanation: {
            overview: "Stay on track with intelligent notifications that work even when you're not using the app.",
            howItWorks: [
                "Enable push notifications during setup",
                "AI sends reminders to log meals if you haven't in a while",
                "Get motivational messages when you're crushing your goals",
                "Receive alerts when you're falling behind on calories",
                "Weekly progress summaries keep you informed"
            ],
            benefits: [
                "Never forget to log a meal again",
                "Stay consistent without constantly opening the app",
                "Get timely nudges to keep you accountable",
                "Celebrate your wins with positive reinforcement"
            ]
        }
    },
    {
        title: "Meal History",
        description: "Review past meals with photos. See what worked and what didn't for your goals.",
        icon: CalendarDaysIcon,
        color: "from-yellow-500 to-amber-400",
        details: "Browse your food diary by date, analyze patterns, and learn from your nutrition journey over time.",
        fullExplanation: {
            overview: "Your complete food diary with photos, macros, and insights to learn from your journey.",
            howItWorks: [
                "Browse your meal history by date",
                "See photos of every meal you've logged",
                "Review macro breakdowns for each meal and day",
                "Identify patterns in your eating habits",
                "Learn what meals help you hit your targets"
            ],
            benefits: [
                "Visual accountability with meal photos",
                "Learn which meals work best for your goals",
                "Spot patterns like weekend overeating or weekday undereating",
                "Build a personal database of go-to meals"
            ]
        }
    }
];

const FeatureModal: React.FC<{
    feature: typeof DEMO_STEPS[0],
    isOpen: boolean,
    onClose: () => void
}> = ({ feature, isOpen, onClose }) => {
    const Icon = feature.icon;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
                    />

                    {/* Modal Wrapper to handle scrolling correctly */}
                    <div className="fixed inset-0 z-[101] overflow-y-auto" onClick={(e) => e.target === e.currentTarget && onClose()}>
                        <div className="flex min-h-full items-end sm:items-center justify-center p-4 sm:p-6 text-center sm:text-left">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="bg-[#111111] border border-white/10 rounded-3xl max-w-2xl w-full shadow-2xl relative my-8 text-left overflow-hidden"
                            >
                                {/* Close Button */}
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-white/60 hover:text-white z-20"
                                >
                                    <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                                </button>

                                {/* Header */}
                                <div className="p-6 sm:p-8 border-b border-white/5 bg-white/[0.02]">
                                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6 text-center sm:text-left">
                                        <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${feature.color} p-3 shadow-2xl flex items-center justify-center text-white flex-shrink-0`}>
                                            <Icon className="w-8 h-8 sm:w-10 sm:h-10" />
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 sm:mb-3">{feature.title}</h2>
                                            <p className="text-[var(--text-muted)] text-base sm:text-lg leading-relaxed">
                                                {feature.fullExplanation.overview}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 sm:p-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                    {/* How It Works */}
                                    <div>
                                        <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
                                            <span className="text-2xl">⚙️</span>
                                            How It Works
                                        </h3>
                                        <ol className="space-y-3">
                                            {feature.fullExplanation.howItWorks.map((step, index) => (
                                                <li key={index} className="flex gap-3 text-gray-300 text-sm sm:text-base">
                                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--primary)]/20 text-[var(--primary)] text-sm font-bold flex items-center justify-center">
                                                        {index + 1}
                                                    </span>
                                                    <span className="leading-relaxed">{step}</span>
                                                </li>
                                            ))}
                                        </ol>
                                    </div>

                                    {/* Benefits */}
                                    <div>
                                        <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
                                            <span className="text-2xl">✨</span>
                                            Key Benefits
                                        </h3>
                                        <ul className="space-y-3">
                                            {feature.fullExplanation.benefits.map((benefit, index) => (
                                                <li key={index} className="flex gap-3 text-gray-300 text-sm sm:text-base">
                                                    <span className="text-[var(--primary)] flex-shrink-0 mt-1">✓</span>
                                                    <span className="leading-relaxed">{benefit}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="p-5 sm:p-6 border-t border-white/5 bg-white/5">
                                    <button
                                        onClick={onClose}
                                        className="w-full py-3 px-6 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-black font-bold rounded-xl transition-all active:scale-95"
                                    >
                                        Got it!
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export const FeatureCard: React.FC<{ step: typeof DEMO_STEPS[0], index: number }> = ({ step, index }) => {
    const Icon = step.icon;
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                onClick={() => setIsModalOpen(true)}
                className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[var(--primary)]/30 transition-all duration-500 relative overflow-hidden cursor-pointer hover:scale-[1.02]"
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

                        <button className="text-[var(--primary)] text-xs font-bold hover:underline flex items-center gap-1">
                            Learn more
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </motion.div>

            <FeatureModal
                feature={step}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
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
                    Click any feature to learn exactly how it works and why it will transform your nutrition journey.
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
