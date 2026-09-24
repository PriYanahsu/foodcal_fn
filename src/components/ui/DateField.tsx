'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { MonthCalendar } from '@/components/ui/MonthCalendar';
import { fromLocalDate } from '@/features/Nutrition/utils/toLocalDate';
import { PHONE_QUERY, useMediaQuery } from '@/hooks/useMediaQuery';

const PANEL_WIDTH = 320;
const PANEL_HEIGHT = 380;
const GAP = 8;
const EDGE = 12;

const formatDate = (iso: string) =>
  fromLocalDate(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

/**
 * A themed replacement for `<input type="date">`: looks like the app's other inputs and
 * opens the same month calendar as the dashboard. Phones: bottom sheet. Larger screens:
 * a panel under the field (above it when there's no room), portalled so a scrolling
 * container can't clip it.
 */
export function DateField({
  value,
  onChange,
  min,
  max,
  placeholder = 'Pick a date',
  label,
  className = '',
}: {
  value: string;
  onChange: (date: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
  /** Accessible name when there's no visible `<label>` wrapping the field. */
  label?: string;
  /** Classes for the field itself, so it matches the inputs around it. */
  className?: string;
}) {
  const isPhone = useMediaQuery(PHONE_QUERY);
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);

  const close = () => setOpen(false);
  const pick = (date: string) => {
    onChange(date);
    setOpen(false);
    buttonRef.current?.focus();
  };

  useLayoutEffect(() => {
    if (!open || isPhone || !buttonRef.current) return;
    const place = () => {
      const rect = buttonRef.current!.getBoundingClientRect();
      const width = Math.min(PANEL_WIDTH, window.innerWidth - EDGE * 2);
      const left = Math.max(EDGE, Math.min(rect.left, window.innerWidth - width - EDGE));
      const below = rect.bottom + GAP;
      const top =
        below + PANEL_HEIGHT > window.innerHeight
          ? Math.max(EDGE, rect.top - GAP - PANEL_HEIGHT)
          : below;
      setPos({ top, left, width });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, isPhone]);

  useEffect(() => {
    if (!open || isPhone) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!panelRef.current?.contains(target) && !buttonRef.current?.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open, isPhone]);

  const calendar = <MonthCalendar value={value} onSelect={pick} min={min} max={max} />;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={label ? `${label}: ${value ? formatDate(value) : 'not set'}` : undefined}
        className={`flex items-center justify-between gap-2 text-left ${className}`}
      >
        <span className={`truncate ${value ? 'text-fg' : 'text-muted'}`}>
          {value ? formatDate(value) : placeholder}
        </span>
        <CalendarDaysIcon className="h-5 w-5 shrink-0 text-muted" />
      </button>

      {isPhone ? (
        <BottomSheet open={open} onClose={close} label={label ?? 'Choose a date'}>
          <div className="pb-2">{calendar}</div>
        </BottomSheet>
      ) : (
        typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {open && pos && (
              <motion.div
                ref={panelRef}
                role="dialog"
                aria-label={label ?? 'Choose a date'}
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                style={{ top: pos.top, left: pos.left, width: pos.width }}
                className="fixed z-[120] rounded-3xl border border-line-strong bg-surface-1 p-4 font-ui shadow-[var(--fc-shadow-pop)]"
              >
                {calendar}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )
      )}
    </>
  );
}
