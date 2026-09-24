'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { ROUTES } from '@/constants/routes';
import { useGettingStarted, type GettingStartedTask } from '../hooks/useGettingStarted';

const ACTION =
  'inline-flex h-9 shrink-0 items-center rounded-xl bg-brand px-3.5 text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover active:scale-95';

function Progress({ done, total }: { done: number; total: number }) {
  return (
    <span aria-hidden="true" className="flex h-1.5 w-full gap-1">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`flex-1 rounded-full transition-colors duration-500 ${
            i < done ? 'bg-brand' : 'bg-surface-3'
          }`}
        />
      ))}
    </span>
  );
}

function TaskList({
  tasks,
  onWeighIn,
  onReminders,
  onNavigate,
}: {
  tasks: GettingStartedTask[];
  onWeighIn: () => void;
  onReminders: () => void;
  onNavigate?: () => void;
}) {
  const action = (task: GettingStartedTask) => {
    if (task.done) return null;
    if (task.id === 'meal') {
      return (
        <Link href={ROUTES.SCAN} onClick={onNavigate} className={ACTION}>
          Scan
        </Link>
      );
    }
    if (task.id === 'weigh') {
      return (
        <button type="button" onClick={onWeighIn} className={ACTION}>
          Add
        </button>
      );
    }
    if (task.id === 'reminders') {
      return (
        <button type="button" onClick={onReminders} className={ACTION}>
          Turn on
        </button>
      );
    }
    return null;
  };

  return (
    <ul className="flex flex-col gap-2">
      {tasks.map((task) => (
        <li
          key={task.id}
          className={`flex items-center gap-3 rounded-2xl border p-3 ${
            task.done ? 'border-line bg-surface-1' : 'border-line-strong bg-surface-2'
          }`}
        >
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
              task.done ? 'bg-brand text-on-brand' : 'border-2 border-line-strong'
            }`}
          >
            {task.done && <CheckIcon className="h-4 w-4" strokeWidth={3} />}
            <span className="sr-only">{task.done ? 'Done' : 'To do'}</span>
          </span>
          <span className="min-w-0 flex-1">
            <span
              className={`block text-sm font-bold ${task.done ? 'text-muted line-through' : 'text-fg'}`}
            >
              {task.title}
            </span>
            <span className="block truncate text-xs text-muted">{task.detail}</span>
          </span>
          {action(task)}
        </li>
      ))}
    </ul>
  );
}

/** Tablet and desktop: a card in the dashboard's side column. */
export function GettingStartedCard({ onWeighIn }: { onWeighIn: () => void }) {
  const { tasks, doneCount, total, visible, dismiss, requestPermission } = useGettingStarted();
  if (!visible) return null;

  return (
    <section
      aria-label="Getting started"
      className="flex flex-col gap-4 rounded-3xl border border-line bg-surface-1 p-5 md:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold leading-tight text-fg">Getting started</h2>
          <p className="text-xs text-muted">
            {doneCount} of {total} done · a few taps each
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="rounded-lg px-2 py-1 text-xs font-semibold text-muted transition-colors hover:bg-surface-2 hover:text-fg"
        >
          Hide
        </button>
      </div>
      <Progress done={doneCount} total={total} />
      <TaskList tasks={tasks} onWeighIn={onWeighIn} onReminders={() => void requestPermission()} />
    </section>
  );
}

/** Small ring showing how much of the checklist is done. */
function ProgressRing({ done, total }: { done: number; total: number }) {
  const r = 12;
  const c = 2 * Math.PI * r;
  return (
    <span className="relative flex h-7 w-7 shrink-0 items-center justify-center">
      <svg viewBox="0 0 28 28" className="absolute inset-0 -rotate-90" aria-hidden="true">
        <circle cx="14" cy="14" r={r} fill="none" strokeWidth="3" className="stroke-surface-3" />
        <circle
          cx="14"
          cy="14"
          r={r}
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - done / total)}
          className="stroke-brand transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <RocketLaunchIcon className="h-3.5 w-3.5 text-brand-ink" />
    </span>
  );
}

/**
 * Phones: a compact button that sits in the dashboard header, so it adds no height
 * and the one-screen dashboard still fits without scrolling. The checklist opens
 * in a bottom sheet.
 */
export function GettingStartedButton({ onWeighIn }: { onWeighIn: () => void }) {
  const { tasks, doneCount, total, visible, dismiss, requestPermission } = useGettingStarted();
  const [open, setOpen] = useState(false);
  if (!visible) return null;

  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label={`Getting started: ${doneCount} of ${total} done`}
        className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl border border-brand/40 bg-brand/10 pl-2 pr-3 transition-transform active:scale-95"
      >
        <ProgressRing done={doneCount} total={total} />
        <span className="text-sm font-bold text-fg">
          {doneCount}/{total}
        </span>
      </button>

      <BottomSheet open={open} onClose={close} label="Getting started">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="font-display text-xl font-bold text-fg">Getting started</h2>
            <p className="text-sm text-muted">
              {doneCount} of {total} done. Each one takes a few taps.
            </p>
          </div>
          <TaskList
            tasks={tasks}
            onNavigate={close}
            onWeighIn={() => {
              close();
              onWeighIn();
            }}
            onReminders={() => void requestPermission()}
          />
          <button
            type="button"
            onClick={() => {
              dismiss();
              close();
            }}
            className="h-11 rounded-xl text-sm font-semibold text-muted transition-colors hover:bg-surface-2 hover:text-fg"
          >
            Hide checklist
          </button>
        </div>
      </BottomSheet>
    </>
  );
}
