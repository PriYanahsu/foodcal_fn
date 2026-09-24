'use client';

import type { ComponentType, ReactNode, SVGProps } from 'react';
import {
  ArrowTrendingUpIcon,
  BeakerIcon,
  CalendarDaysIcon,
  CameraIcon,
  HomeIcon,
  ScaleIcon,
  SparklesIcon,
  Squares2X2Icon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { SwipeCarousel } from '@/components/ui/SwipeCarousel';

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

/** Literal classes so Tailwind keeps them. */
const TONES = {
  brand: 'bg-brand/15 text-brand-ink',
  carbs: 'bg-carbs/20 text-carbs',
  info: 'bg-info/20 text-info',
  fat: 'bg-fat/20 text-fat',
  protein: 'bg-protein/20 text-protein',
  neutral: 'bg-surface-3 text-fg-2',
};

/** Text that differs between the phone (tab bar) and larger screens (sidebar). */
function Where({ phone, desktop }: { phone: string; desktop: string }) {
  return (
    <>
      <span className="md:hidden">{phone}</span>
      <span className="hidden md:inline">{desktop}</span>
    </>
  );
}

function Slide({
  icon: Icon,
  tone,
  kicker,
  title,
  summary,
  steps,
}: {
  icon: Icon;
  tone: keyof typeof TONES;
  kicker: string;
  title: string;
  summary: ReactNode;
  steps: ReactNode[];
}) {
  return (
    <div className="flex w-full flex-col gap-3 rounded-3xl border border-line bg-surface-2 p-4 short:gap-2 short:p-3 sm:p-5">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl short:h-9 short:w-9 ${TONES[tone]}`}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-caption font-bold uppercase tracking-wide text-muted">{kicker}</p>
          <h4 className="truncate text-base font-bold leading-tight text-fg">{title}</h4>
        </div>
      </div>
      <p className="text-footnote leading-relaxed text-fg-2">{summary}</p>
      <ol className="flex flex-col gap-1.5">
        {steps.map((step, i) => (
          <li key={i} className="flex items-start gap-2.5 text-footnote leading-snug text-fg-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-3 text-[11px] font-bold text-fg">
              {i + 1}
            </span>
            <span className="min-w-0 pt-px">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

const B = ({ children }: { children: ReactNode }) => (
  <strong className="font-semibold text-fg">{children}</strong>
);

/**
 * Plan review: the coach's advice first, then one swipeable card per part of FoodCal,
 * so a new user learns the app while "Activate my plan" stays pinned below.
 */
export function AppTour({ advice, reasoning }: { advice: string; reasoning?: string }) {
  const slides = [
    {
      id: 'coach',
      title: 'Your coach says',
      content: (
        <div className="flex w-full flex-col gap-2 rounded-3xl border border-brand/30 bg-brand/10 p-4 short:p-3 sm:p-5">
          <h4 className="flex items-center gap-1.5 text-footnote font-bold text-brand-ink">
            <SparklesIcon className="h-4 w-4" /> Your coach says
          </h4>
          <p className="line-clamp-6 text-footnote leading-relaxed text-fg-2 short:line-clamp-4">
            {advice}
          </p>
          {reasoning && (
            <p className="line-clamp-3 text-caption leading-relaxed text-muted short:hidden">
              {reasoning}
            </p>
          )}
          <p className="mt-auto pt-1 text-caption font-semibold text-muted">
            Swipe to see how FoodCal works →
          </p>
        </div>
      ),
    },
    {
      id: 'meals',
      title: 'Log a meal',
      content: (
        <Slide
          icon={CameraIcon}
          tone="carbs"
          kicker="Meals"
          title="Log a meal with a photo"
          summary="The AI reads your plate and fills in calories, protein, carbs and fat."
          steps={[
            <>
              Tap{' '}
              <B>
                <Where phone="the camera button" desktop="Scan a meal" />
              </B>{' '}
              and snap or choose a photo.
            </>,
            <>
              Add a note if you like (e.g. &ldquo;cooked in butter&rdquo;), then <B>Run AI scan</B>.
            </>,
            <>
              Check the numbers, <B>Edit values</B> if needed, pick the meal, and tap <B>Log</B>.
            </>,
          ]}
        />
      ),
    },
    {
      id: 'dashboard',
      title: 'Your day',
      content: (
        <Slide
          icon={HomeIcon}
          tone="brand"
          kicker="Dashboard"
          title="See your day at a glance"
          summary="The ring shows calories left today; the bars show protein, carbs and fat against your targets."
          steps={[
            <>
              Each meal you log fills the ring. Past your goal it turns to <B>Over</B>.
            </>,
            <>
              Tap a day in the week strip, or the <B>calendar</B>, to look back.
            </>,
            <>
              <Where
                phone="Tap any tile (Meals, Coach, Water, Weight) to open it."
                desktop="Meals, Coach, Water and Weight each have their own card."
              />
            </>,
          ]}
        />
      ),
    },
    {
      id: 'water',
      title: 'Water',
      content: (
        <Slide
          icon={BeakerIcon}
          tone="info"
          kicker="Water"
          title="One tap per glass"
          summary="Your goal is 3 L a day, counted in 250 ml glasses."
          steps={[
            <>
              Tap{' '}
              <B>
                <Where phone="+ 250 ml" desktop="+" />
              </B>{' '}
              on the Water {<Where phone="tile" desktop="card" />} for each glass.
            </>,
            <>
              Added one by mistake? Open the Water card and tap <B>−</B>.
            </>,
            <>Water is saved on this device, so log it from the one you use most.</>,
          ]}
        />
      ),
    },
    {
      id: 'weight',
      title: 'Weight',
      content: (
        <Slide
          icon={ScaleIcon}
          tone="fat"
          kicker="Weight"
          title="Weigh in, watch the trend"
          summary="One weigh-in a day builds a trend line toward your target weight."
          steps={[
            <>
              On the Weight card, type your weight (or use <B>− / +</B>) and tap <B>Save</B>.
            </>,
            <>The line starts from the weight in your plan; the dashed line is your target.</>,
            <>
              <B>% to goal</B> shows how far you&apos;ve come. Same time each day works best.
            </>,
          ]}
        />
      ),
    },
    {
      id: 'history',
      title: 'History',
      content: (
        <Slide
          icon={CalendarDaysIcon}
          tone="protein"
          kicker="History"
          title="Every day, colour-coded"
          summary={
            <>
              <span className="font-semibold text-brand-ink">Green</span> = on target (within 10%),{' '}
              <span className="font-semibold text-warn">amber</span> = over,{' '}
              <span className="font-semibold text-info">blue</span> = under.
            </>
          }
          steps={[
            <>
              Open <B>History</B> from the <Where phone="tab bar" desktop="sidebar" /> to see the
              month.
            </>,
            <>Tap a day for its meals and macros; tap a meal for the photo and details.</>,
            <>The summary shows days logged, your average and your logging streak.</>,
          ]}
        />
      ),
    },
    {
      id: 'plan',
      title: 'My plan',
      content: (
        <Slide
          icon={ArrowTrendingUpIcon}
          tone="brand"
          kicker="My plan"
          title="Your targets and progress"
          summary="Everything about the plan you're about to activate lives here."
          steps={[
            <>Daily targets, your coach&apos;s advice and your weight progress chart.</>,
            <>
              Goals changed? Tap <B>Update plan</B> and the coach rebuilds your targets.
            </>,
            <>
              Find it under <B>My plan</B> in the <Where phone="tab bar" desktop="sidebar" />.
            </>,
          ]}
        />
      ),
    },
    {
      id: 'profile',
      title: 'Profile',
      content: (
        <Slide
          icon={UserCircleIcon}
          tone="neutral"
          kicker="Profile"
          title="Already filled in for you"
          summary="Your answers here become your profile: age, height, weight, activity and goal."
          steps={[
            <>
              Open it from{' '}
              <Where phone="More → your name" desktop="your name at the bottom of the sidebar" />.
            </>,
            <>Add a photo to finish your profile.</>,
            <>
              Edit body details any time, then <B>Save and update plan</B>.
            </>,
          ]}
        />
      ),
    },
    {
      id: 'nav',
      title: 'Getting around',
      content: (
        <Slide
          icon={Squares2X2Icon}
          tone="neutral"
          kicker="Getting around"
          title="Everything is one tap away"
          summary={
            <Where
              phone="The bar at the bottom of the screen takes you everywhere."
              desktop="The sidebar on the left takes you everywhere."
            />
          }
          steps={[
            <Where
              key="a"
              phone="Nutrition · History · camera · My plan · More"
              desktop="Nutrition · Scan a meal · History · My plan"
            />,
            <Where
              key="b"
              phone="More has notifications, settings, light/dark mode and log out."
              desktop="Notifications, settings and light/dark mode sit under Account."
            />,
            <>
              Ready? Tap <B>Activate my plan</B> below to start.
            </>,
          ]}
        />
      ),
    },
  ];

  return <SwipeCarousel label="How FoodCal works" slides={slides} className="min-h-0 flex-1" />;
}
