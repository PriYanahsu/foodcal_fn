import { PageSkeleton } from '@/components/ui/PageSkeleton';
import { Skeleton, SkeletonCard, SkeletonText } from '@/components/ui/Skeleton';
import { MealCardSkeleton } from '@/components/nutrition/MealCard';

/**
 * The dashboard's shape while the first load is in flight — same containers and
 * rough sizes as the real phone and desktop layouts, so the page fills in place
 * instead of swapping a spinner for a wall of cards.
 */
export default function DashboardSkeleton() {
  return (
    <PageSkeleton label="Loading your day…">
      {/* Phones: mirrors MobileDashboard's one-screen tiles. */}
      <div className="flex h-[calc(100dvh-4rem-68px-env(safe-area-inset-bottom))] min-h-[440px] flex-col gap-3 bg-canvas px-4 py-3 md:hidden">
        <div className="flex items-center justify-between gap-3">
          <span className="flex flex-col gap-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-6 w-44" />
          </span>
          <Skeleton className="h-11 w-11 rounded-xl" />
        </div>
        <WeekSkeleton compact />
        <div className="flex items-center gap-4 rounded-3xl border border-line bg-surface-1 p-4">
          <Skeleton className="h-24 w-24 shrink-0 rounded-full" />
          <span className="flex flex-1 flex-col gap-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-2 w-full rounded-full" />
          </span>
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex flex-col justify-between rounded-3xl border border-line bg-surface-1 p-4"
            >
              <Skeleton className="h-8 w-8 rounded-xl" />
              <span className="flex flex-col gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-3 w-20" />
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tablet and desktop: mirrors the card grid in Nutrition. */}
      <div className="mx-auto hidden min-h-screen w-full max-w-[1200px] flex-col gap-6 bg-canvas px-8 py-8 md:flex">
        <span className="flex flex-col gap-2.5">
          <Skeleton className="h-3.5 w-36" />
          <Skeleton className="h-9 w-72" />
        </span>
        <WeekSkeleton />

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="flex min-w-0 flex-col gap-6">
            <SkeletonCard className="flex items-center gap-8 p-6">
              <Skeleton className="h-40 w-40 shrink-0 rounded-full" />
              <span className="flex flex-1 flex-col gap-5">
                <Skeleton className="h-8 w-40" />
                {[0, 1, 2].map((i) => (
                  <span key={i} className="flex flex-col gap-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-2 w-full rounded-full" />
                  </span>
                ))}
              </span>
            </SkeletonCard>
            <SkeletonCard className="p-6">
              <Skeleton className="h-5 w-32" />
              <div className="mt-4 flex flex-col gap-2.5">
                <MealCardSkeleton />
                <MealCardSkeleton />
              </div>
            </SkeletonCard>
          </div>

          <div className="flex flex-col gap-6">
            <SkeletonCard>
              <Skeleton className="h-4 w-24" />
              <SkeletonText lines={3} className="mt-4" />
            </SkeletonCard>
            <SkeletonCard>
              <Skeleton className="h-4 w-20" />
              <Skeleton className="mt-4 h-10 w-full rounded-xl" />
            </SkeletonCard>
            <SkeletonCard>
              <Skeleton className="h-4 w-20" />
              <Skeleton className="mt-4 h-24 w-full rounded-xl" />
            </SkeletonCard>
          </div>
        </div>
      </div>
    </PageSkeleton>
  );
}

function WeekSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className="grid grid-cols-7 gap-1.5 md:gap-2">
      {Array.from({ length: 7 }, (_, i) => (
        <Skeleton key={i} className={`${compact ? 'h-14' : 'h-[72px]'} rounded-2xl`} />
      ))}
    </div>
  );
}
