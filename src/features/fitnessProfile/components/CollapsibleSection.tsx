"use client";
import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

export default function CollapsibleSection({
    title,
    subtitle,
    icon: Icon,
    defaultOpen = false,
    children,
    className = '',
    headerClassName = '',
  }: {
    title: string;
    subtitle?: string;
    icon: React.ComponentType<{ className?: string }>;
    defaultOpen?: boolean;
    children: React.ReactNode;
    className?: string;
    headerClassName?: string;
  }) {
    const [open, setOpen] = useState(defaultOpen);
  
    return (
      <section
        className={`bg-[var(--card-bg)]/80 backdrop-blur-xl border border-[var(--card-border)] rounded-2xl lg:rounded-3xl shadow-lg overflow-hidden ${className}`}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`lg:hidden w-full flex items-center justify-between gap-3 p-4 text-left ${headerClassName}`}
          aria-expanded={open}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 shrink-0">
              <Icon className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-[var(--foreground)] text-sm truncate">{title}</h3>
              {subtitle && (
                <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <ChevronDownIcon
            className={`w-5 h-5 text-[var(--text-muted)] shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </button>
  
        <div className="hidden lg:flex items-center gap-3 p-5 lg:p-6 pb-0">
          <div className="p-2 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20">
            <Icon className="w-5 h-5 text-[var(--primary)]" />
          </div>
          <div>
            <h3 className="font-bold text-[var(--foreground)]">{title}</h3>
            {subtitle && (
              <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">
                {subtitle}
              </p>
            )}
          </div>
        </div>
  
        <div className={`${open ? 'block' : 'hidden'} lg:block p-4 lg:p-6 lg:pt-4`}>{children}</div>
      </section>
    );
  }
  