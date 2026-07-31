'use client';

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

function toLocalISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseISO(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

interface ThemeDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  max?: string; // YYYY-MM-DD
}

const PANEL_WIDTH = 280;
const VIEWPORT_PAD = 12;

export function ThemeDatePicker({ value, onChange, max }: ThemeDatePickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [panelPos, setPanelPos] = useState<{ top: number; left: number; width: number } | null>(
    null
  );
  const selected = useMemo(() => parseISO(value), [value]);
  const [view, setView] = useState(() => new Date(selected.getFullYear(), selected.getMonth(), 1));
  const todayISO = toLocalISO(new Date());
  const maxISO = max ?? todayISO;

  useEffect(() => {
    if (open) {
      setView(new Date(selected.getFullYear(), selected.getMonth(), 1));
    }
  }, [open, selected]);

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return;

    const updatePosition = () => {
      const rect = buttonRef.current!.getBoundingClientRect();
      const width = Math.min(PANEL_WIDTH, window.innerWidth - VIEWPORT_PAD * 2);
      let left = rect.left + rect.width / 2 - width / 2;
      left = Math.max(VIEWPORT_PAD, Math.min(left, window.innerWidth - width - VIEWPORT_PAD));
      setPanelPos({ top: rect.bottom + 8, left, width });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const days = useMemo(() => {
    const year = view.getFullYear();
    const month = view.getMonth();
    const firstDow = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<{ iso: string; day: number; inMonth: boolean; disabled: boolean }> = [];

    // leading days from prev month
    const prevDays = new Date(year, month, 0).getDate();
    for (let i = firstDow - 1; i >= 0; i--) {
      const d = prevDays - i;
      const date = new Date(year, month - 1, d);
      const iso = toLocalISO(date);
      cells.push({ iso, day: d, inMonth: false, disabled: iso > maxISO });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const iso = toLocalISO(date);
      cells.push({ iso, day: d, inMonth: true, disabled: iso > maxISO });
    }

    // trailing to fill 6 weeks
    while (cells.length % 7 !== 0 || cells.length < 42) {
      const d = cells.length - (firstDow + daysInMonth) + 1;
      const date = new Date(year, month + 1, d);
      const iso = toLocalISO(date);
      cells.push({ iso, day: date.getDate(), inMonth: false, disabled: iso > maxISO });
      if (cells.length >= 42) break;
    }

    return cells;
  }, [view, maxISO]);

  const monthLabel = view.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full px-1.5 sm:px-6 text-center min-w-0 sm:min-w-[140px] group"
      >
        <span className="text-[9px] sm:text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider block leading-none mb-0.5 group-hover:text-[var(--primary)] transition-colors">
          {value === todayISO ? 'Today' : 'Viewing Log'}
        </span>
        <span className="text-[11px] sm:text-sm font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors flex items-center justify-center gap-0.5 sm:gap-1 leading-tight">
          {selected.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
          <span className="text-[10px] text-[var(--text-muted)]">▼</span>
        </span>
      </button>

      {open && panelPos && (
        <div
          className="fixed z-50 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-2xl p-3"
          style={{ top: panelPos.top, left: panelPos.left, width: panelPos.width }}
        >
          <div className="flex items-center justify-between mb-3 px-1">
            <button
              type="button"
              onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold text-[var(--foreground)]">{monthLabel}</span>
            <button
              type="button"
              onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 mb-1">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div
                key={`${d}-${i}`}
                className="h-8 flex items-center justify-center text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {days.map((cell) => {
              const isSelected = cell.iso === value;
              const isToday = cell.iso === todayISO;
              return (
                <button
                  key={cell.iso}
                  type="button"
                  disabled={cell.disabled}
                  onClick={() => {
                    onChange(cell.iso);
                    setOpen(false);
                  }}
                  className={`h-9 rounded-lg text-sm font-semibold transition-colors
                    ${cell.disabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[var(--primary)]/15'}
                    ${!cell.inMonth ? 'text-[var(--text-muted)]' : 'text-[var(--foreground)]'}
                    ${isSelected ? '!bg-[var(--primary)] !text-black hover:!bg-[var(--primary)]' : ''}
                    ${!isSelected && isToday ? 'ring-1 ring-[var(--primary)]/50 text-[var(--primary)]' : ''}
                  `}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-3 pt-2 border-t border-[var(--card-border)]">
            <button
              type="button"
              onClick={() => {
                onChange(todayISO);
                setOpen(false);
              }}
              className="text-xs font-bold text-[var(--primary)] hover:underline px-1 py-1"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs font-bold text-[var(--text-muted)] hover:text-[var(--foreground)] px-1 py-1"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
