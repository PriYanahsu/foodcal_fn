'use client';

import { useRef, useState, type ReactNode } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

/**
 * Left/right slides. Phones swipe natively (CSS scroll-snap, so it follows the finger
 * and settles on a slide); larger screens also get arrows, and every screen gets dots.
 * Arrow keys work once the carousel has focus.
 */
export function SwipeCarousel({
  label,
  slides,
  className = '',
}: {
  /** Accessible name, e.g. "How FoodCal works". */
  label: string;
  slides: { id: string; title: string; content: ReactNode }[];
  className?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const last = slides.length - 1;

  const goTo = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const next = Math.max(0, Math.min(last, i));
    track.scrollTo({ left: next * track.clientWidth, behavior: 'smooth' });
  };

  // The scroll position is the source of truth, so swipes and buttons agree.
  const onScroll = () => {
    const track = trackRef.current;
    if (!track || !track.clientWidth) return;
    const i = Math.round(track.scrollLeft / track.clientWidth);
    if (i !== index) setIndex(i);
  };

  const arrow =
    'hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line bg-surface-1 text-fg-2 transition-colors hover:bg-surface-2 hover:text-fg disabled:cursor-not-allowed disabled:opacity-30 md:flex';

  return (
    <section
      aria-roledescription="carousel"
      aria-label={label}
      className={`flex min-h-0 flex-col gap-3 ${className}`}
    >
      <div
        ref={trackRef}
        onScroll={onScroll}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            goTo(index + 1);
          } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            goTo(index - 1);
          }
        }}
        className="flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-3xl outline-none [scrollbar-width:none] focus-visible:ring-2 focus-visible:ring-brand/60 [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${slides.length}: ${slide.title}`}
            aria-hidden={i !== index}
            className="flex w-full shrink-0 snap-center snap-always"
          >
            {slide.content}
          </div>
        ))}
      </div>

      <div className="flex shrink-0 items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
          aria-label="Previous"
          className={arrow}
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>

        <div className="flex flex-1 items-center justify-center gap-1.5">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to ${slide.title}`}
              aria-current={i === index ? 'step' : undefined}
              className="flex h-6 items-center justify-center px-0.5"
            >
              <span
                className={`block h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? 'w-5 bg-brand' : 'w-1.5 bg-surface-3'
                }`}
              />
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => goTo(index + 1)}
          disabled={index === last}
          aria-label="Next"
          className={arrow}
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}
