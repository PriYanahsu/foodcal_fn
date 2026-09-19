interface LogoMarkProps {
  className?: string;
}

/** Ring-and-leaf mark: the ring is a day's goal, the leaf is food. Colour via `currentColor`. */
export function LogoMark({ className = 'h-8 w-8' }: LogoMarkProps) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={className}>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="5.5"
        strokeLinecap="round"
        d="M39.56 13.1A19 19 0 1 1 28.92 5.65"
      />
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M14.5 33.5c0-10.5 6.8-17.3 18.5-17.3 0 11.7-6.8 18.5-17.3 18.5a1.2 1.2 0 0 1-1.2-1.2ZM17.78 31.78L16.22 30.22L25.72 20.72L27.28 22.28Z"
      />
    </svg>
  );
}

interface LogoProps {
  /** Tailwind size classes for the mark. */
  markClassName?: string;
  /** Tailwind text-size class for the wordmark. */
  textClassName?: string;
}

export function Logo({ markClassName = 'h-8 w-8', textClassName = 'text-[22px]' }: LogoProps) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark className={`${markClassName} text-brand`} />
      <span className={`font-display font-bold tracking-[-0.03em] text-fg ${textClassName}`}>
        food<span className="text-brand-ink">cal</span>
      </span>
    </span>
  );
}
