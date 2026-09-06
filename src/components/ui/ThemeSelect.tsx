'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/16/solid';

export interface ThemeSelectOption {
  value: string;
  label: string;
  hint?: string;
}

interface ThemeSelectProps {
  label?: string;
  value: string;
  placeholder?: string;
  options: readonly ThemeSelectOption[];
  onChange: (value: string) => void;
  hint?: string;
}

export function ThemeSelect({
  label,
  value,
  placeholder = 'Select...',
  options,
  onChange,
  hint,
}: ThemeSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const selected = options.find((option) => option.value === value);

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

  return (
    <div ref={rootRef} className="relative w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-xs sm:text-sm font-medium text-[var(--foreground)] mb-0.5 sm:mb-1"
        >
          {label}
        </label>
      )}
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base bg-[var(--input-bg)] border rounded-lg sm:rounded-xl text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent ${
          open ? 'border-[var(--primary)]' : 'border-[var(--input-border)]'
        }`}
      >
        <span
          className={`min-w-0 truncate ${selected ? 'text-[var(--foreground)]' : 'text-[var(--text-muted)]'}`}
        >
          {selected?.label ?? placeholder}
        </span>
        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-lg sm:rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-2xl"
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <li key={option.value} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 sm:px-4 sm:py-2.5 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-3 ${
                    isSelected
                      ? 'bg-[var(--primary)]/15 text-[var(--foreground)]'
                      : 'text-[var(--foreground)] hover:bg-[var(--surface)]'
                  }`}
                >
                  <span className="text-sm sm:text-base font-medium leading-tight">
                    {option.label}
                  </span>
                  {option.hint && (
                    <span className="text-[10px] sm:text-xs text-[var(--text-muted)] shrink-0">
                      {option.hint}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {hint && (
        <p className="text-[10px] sm:text-xs text-[var(--text-muted)] mt-1 sm:mt-1.5">{hint}</p>
      )}
    </div>
  );
}
