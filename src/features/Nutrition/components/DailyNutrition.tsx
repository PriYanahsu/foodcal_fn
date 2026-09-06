'use client';

import Link from 'next/link';
import { ChevronRightIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import { StatCard } from '@/components/dashboard/StatCard';
import { ROUTES } from '@/constants/routes';
import type { DailyNutritionProps } from '../type';
import { ITEM_VARIANTS, MACRO_CARDS } from '../utils/Constants';
import { formatLogTime, logDetailHref } from '../utils/formatLogTime';
import { formatMacroUnit, formatMacroValue, getMacroProgress } from '../utils/getMacroProgress';

export default function DailyNutrition({
  stats,
  goals,
  hasPlan,
  recentLogs,
  loading,
  mounted,
  isToday,
  dailyLogRef,
  logScrollable,
  onUnlock,
  children,
}: DailyNutritionProps) {
  return (
    <>
      <section
        className={`grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 relative ${!hasPlan ? 'cursor-pointer' : ''}`}
        onClick={!hasPlan ? onUnlock : undefined}
      >
        {!hasPlan && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-black/40 backdrop-blur-[2px] border border-white/5">
            <div className="flex items-center gap-2 px-4 py-2 bg-[var(--card-bg)] border border-white/10 rounded-xl shadow-lg">
              <LockClosedIcon className="w-4 h-4 text-[var(--primary)]" />
              <span className="text-sm font-bold text-[var(--foreground)]">
                Set up your AI plan to unlock
              </span>
            </div>
          </div>
        )}
        {MACRO_CARDS.map((card) => {
          const value = stats[card.key];
          const goal = goals[card.key];
          return (
            <StatCard
              key={card.key}
              label={card.label}
              value={formatMacroValue(hasPlan, value)}
              unit={formatMacroUnit(hasPlan, goal, card.unit)}
              icon={card.icon}
              color={card.color}
              progress={hasPlan ? getMacroProgress(value, goal) : undefined}
              delay={card.delay}
            />
          );
        })}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
        <motion.div variants={ITEM_VARIANTS} className="lg:col-span-2 min-w-0">
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl sm:rounded-3xl shadow-xl flex flex-col">
            <div className="flex flex-wrap justify-between items-center gap-2 px-3.5 py-3 sm:px-5 sm:py-4 border-b border-[var(--card-border)] shrink-0 bg-[var(--card-bg)] rounded-t-2xl sm:rounded-t-3xl">
              <h2 className="text-base sm:text-xl font-bold flex items-center gap-2 text-[var(--foreground)]">
                Daily Log
                <span className="text-[10px] sm:text-xs font-normal text-[var(--text-muted)] bg-[var(--surface)] px-1.5 sm:px-2 py-0.5 rounded-md border border-[var(--card-border)]">
                  {recentLogs.length} Items
                </span>
              </h2>
              <Link
                href={ROUTES.HISTORY}
                className="text-[var(--primary)] hover:text-[var(--primary-hover)] text-xs sm:text-sm font-bold flex items-center gap-1 group"
              >
                Full History
                <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div
              ref={dailyLogRef}
              className={`max-h-[360px] sm:max-h-[460px] p-2.5 sm:p-4 space-y-2 sm:space-y-3 rounded-b-2xl sm:rounded-b-3xl ${logScrollable ? 'overflow-y-auto' : 'overflow-y-visible'}`}
            >
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-16 sm:h-20 bg-[var(--surface)] rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              ) : recentLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 sm:py-14 px-4 text-center min-h-[240px]">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 mb-4 rounded-full bg-[var(--surface)] flex items-center justify-center text-2xl sm:text-3xl border border-[var(--card-border)]">
                    🍽️
                  </div>
                  <h3 className="text-base sm:text-lg font-bold mb-1.5 text-[var(--foreground)]">
                    Empty Plate?
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] max-w-sm mb-5">
                    You haven&apos;t logged any meals for this day yet.
                    {isToday
                      ? ' Start tracking now to hit your goals!'
                      : ' Select another date to view history.'}
                  </p>
                  {isToday && (
                    <Link href={ROUTES.SCAN}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-2.5 text-sm bg-[var(--primary)] text-black font-bold rounded-xl"
                      >
                        Scan First Meal
                      </motion.button>
                    </Link>
                  )}
                </div>
              ) : (
                <AnimatePresence>
                  {recentLogs.map((log, i) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(i * 0.04, 0.24) }}
                    >
                      <Link href={logDetailHref(log)}>
                        <div className="bg-[var(--surface)] hover:bg-[var(--surface-strong)] border border-[var(--card-border)] hover:border-[var(--primary)]/30 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 flex items-center justify-between gap-2 sm:gap-5 transition-all group">
                          <div className="flex items-center gap-2.5 sm:gap-5 flex-1 min-w-0">
                            <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-lg sm:rounded-2xl bg-[var(--card-bg)] group-hover:bg-[var(--primary)]/10 transition-all flex items-center justify-center text-base sm:text-2xl border border-[var(--card-border)] group-hover:border-[var(--primary)]/20 shrink-0">
                              🥗
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-bold text-[13px] sm:text-lg leading-snug line-clamp-2 text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                                {log.food_name}
                              </h3>
                              <p className="text-[10px] sm:text-xs font-medium text-[var(--text-muted)] flex items-center gap-1.5 sm:gap-2 mt-0.5">
                                <span>{mounted ? formatLogTime(log.created_at) : ''}</span>
                                <span className="w-1 h-1 rounded-full bg-[var(--text-muted)] shrink-0" />
                                <span className="truncate">{Math.round(log.protein)}g Protein</span>
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0 bg-[var(--card-bg)] border border-[var(--card-border)] px-2 py-1 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl">
                            <span className="block font-black text-sm sm:text-xl text-[var(--primary)] leading-none">
                              +{Math.round(log.calories)}
                            </span>
                            <span className="text-[8px] sm:text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                              kcal
                            </span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        </motion.div>

        {children}
      </section>
    </>
  );
}
