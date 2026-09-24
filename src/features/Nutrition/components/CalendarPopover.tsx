'use client';

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MonthCalendar } from '@/components/ui/MonthCalendar';
import { toLocalDate } from '../utils/toLocalDate';

interface CalendarPopoverProps {
  open: boolean;
  selectedDate: string;
  loggedDays: Set<string>;
  onSelect: (date: string) => void;
  onClose: () => void;
}

/** Themed month picker that drops down from the week strip. Future days are disabled. */
export default function CalendarPopover({
  open,
  selectedDate,
  loggedDays,
  onSelect,
  onClose,
}: CalendarPopoverProps) {
  const today = toLocalDate();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    const onPointer = (e: PointerEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) onClose();
    };
    document.addEventListener('keydown', onKey);
    // Deferred so the click that opened the popover doesn't immediately close it.
    const timer = window.setTimeout(() => document.addEventListener('pointerdown', onPointer), 0);
    panelRef.current
      ?.querySelector<HTMLButtonElement>('[aria-current="date"], [aria-pressed="true"]')
      ?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
      window.clearTimeout(timer);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          role="dialog"
          aria-label="Choose a date"
          initial={{ opacity: 0, y: -6, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.97 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="absolute right-0 top-full z-50 mt-2 w-[min(320px,calc(100vw-2rem))] origin-top-right rounded-3xl border border-line-strong bg-surface-1 p-4 shadow-[var(--fc-shadow-pop)]"
        >
          {/* Mounted fresh on each open, so it starts on the selected day's month. */}
          <MonthCalendar
            value={selectedDate}
            max={today}
            marked={loggedDays}
            onSelect={(day) => {
              onSelect(day);
              onClose();
            }}
          />

          {selectedDate !== today && (
            <button
              type="button"
              onClick={() => {
                onSelect(today);
                onClose();
              }}
              className="mt-3 h-10 w-full rounded-xl border border-line-strong text-sm font-semibold text-fg transition-colors hover:bg-surface-2"
            >
              Jump to today
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
