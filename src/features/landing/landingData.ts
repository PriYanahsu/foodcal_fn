import type { ComponentType, CSSProperties, SVGProps } from 'react';
import {
  BellAlertIcon,
  BellIcon,
  CalendarDaysIcon,
  CameraIcon,
  ChartPieIcon,
  HomeIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

/** Stand-in for a meal photo until real imagery is added. */
export const MEAL_PHOTO_STYLE: CSSProperties = {
  background:
    'radial-gradient(120% 90% at 30% 20%, rgba(255,190,120,0.35), transparent 55%), radial-gradient(90% 90% at 80% 80%, rgba(118,185,0,0.35), transparent 60%), linear-gradient(135deg, #3a2a1c, #1d2417)',
};

/** Example data shown in the product visuals — one consistent sample day. */
export const SAMPLE_SCAN = {
  name: 'Chicken biryani with raita',
  serving: '1 plate (~350 g)',
  confidence: 86,
  kcal: 620,
  protein: 34,
  carbs: 72,
  fat: 20,
  note: 'Assumes basmati rice cooked with ghee and a 120 g chicken portion.',
  detected: ['Rice', 'Chicken', 'Raita'],
};

export const SAMPLE_DAY = {
  label: 'Thu 18 Sep',
  kcalLeft: 1240,
  kcalEaten: 860,
  kcalGoal: 2100,
  protein: { value: 62, max: 160 },
  carbs: { value: 96, max: 200 },
  fat: { value: 31, max: 70 },
};

export const HERO_POINTS = [
  'Photo or upload',
  'Plan in under 2 minutes',
  'Works on phone and desktop',
];

export const STEPS = [
  {
    title: 'Snap',
    body: 'Take or upload a photo of any meal — home-cooked, canteen or takeaway.',
  },
  {
    title: 'Check',
    body: 'AI estimates the portion and macros. Add details like “cooked in ghee” to sharpen it.',
  },
  {
    title: 'Stay on track',
    body: 'Your plan, daily targets and coach tips update as you log.',
  },
];

export const FEATURES: { title: string; body: string; icon: Icon }[] = [
  {
    title: 'AI plan setup',
    body: 'Answer a few questions and get daily calorie and macro targets in under 2 minutes.',
    icon: SparklesIcon,
  },
  {
    title: 'Smart goal check',
    body: 'Flags targets that would mean losing weight too fast, and suggests a safer date.',
    icon: ShieldCheckIcon,
  },
  {
    title: 'Photo scan',
    body: 'Take a photo or upload one. A short note about portions makes the estimate sharper.',
    icon: CameraIcon,
  },
  {
    title: 'Instant macros',
    body: 'Calories, protein, carbs and fat for every meal, with a confidence score.',
    icon: ChartPieIcon,
  },
  {
    title: 'Today dashboard',
    body: 'Calories left and each macro against your target, readable at a glance.',
    icon: HomeIcon,
  },
  {
    title: 'Coach tips',
    body: 'Short, specific suggestions when a macro is lagging or the day is off track.',
    icon: LightBulbIcon,
  },
  {
    title: 'Meal history',
    body: 'Every day and every meal, with photos, totals and how you did against target.',
    icon: CalendarDaysIcon,
  },
  {
    title: 'Reminders & install as app',
    body: 'Nudges to log meals even when FoodCal is closed. Add it to your home screen.',
    icon: BellIcon,
  },
];

export const COACH_POINTS: { title: string; body: string; icon: Icon }[] = [
  {
    title: 'Reminders when you forget to log',
    body: 'A gentle nudge if nothing’s been logged since breakfast.',
    icon: BellAlertIcon,
  },
  {
    title: 'Tips when a macro is lagging',
    body: 'Specific foods that close the gap before the day ends.',
    icon: SparklesIcon,
  },
  {
    title: 'Milestone nudges',
    body: 'Streaks and on-target days, called out when you hit them.',
    icon: TrophyIcon,
  },
];

export const COACH_NOTIFICATIONS = [
  {
    title: 'Protein is lagging',
    body: 'You’re at 62 g of 160 g protein.',
    suggestion: 'Add a high-protein dinner: paneer, eggs, chicken or dal.',
    time: '10m ago',
    icon: SparklesIcon,
  },
  {
    title: 'Log your lunch?',
    body: 'You haven’t logged anything since breakfast.',
    suggestion: null,
    time: '2h ago',
    icon: BellAlertIcon,
  },
];
