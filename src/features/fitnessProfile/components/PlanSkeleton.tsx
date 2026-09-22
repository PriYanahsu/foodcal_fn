import { PageSkeleton } from '@/components/ui/PageSkeleton';
import { Skeleton, SkeletonCard, SkeletonText } from '@/components/ui/Skeleton';

/** My Plan's shape while it loads: header with action, target tiles, then detail cards. */
export default function PlanSkeleton() {
  return (
    <PageSkeleton label="Loading your plan…">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-4 bg-canvas px-4 py-4 md:gap-5 md:px-8 md:py-8">
        <div className="flex items-end justify-between gap-3">
          <span className="flex flex-col gap-2.5">
            <Skeleton className="h-8 w-36 md:h-9" />
            <Skeleton className="h-3.5 w-56 max-w-[60vw]" />
          </span>
          <Skeleton className="h-11 w-32 shrink-0 rounded-xl" />
        </div>

        <div className="grid items-start gap-4 md:gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="flex min-w-0 flex-col gap-4 md:gap-5">
            {/* Progress: title + stats, trend area, weigh-in row. */}
            <SkeletonCard className="p-6">
              <div className="flex items-start justify-between gap-4">
                <span className="flex flex-col gap-2">
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-3 w-36" />
                </span>
                <span className="hidden gap-6 sm:flex">
                  {[0, 1, 2].map((i) => (
                    <Skeleton key={i} className="h-8 w-14" />
                  ))}
                </span>
              </div>
              <Skeleton className="mt-5 h-32 w-full rounded-2xl" />
              <Skeleton className="mt-6 h-4 w-32" />
              <div className="mt-4 flex gap-3">
                <Skeleton className="h-14 w-14 rounded-2xl" />
                <Skeleton className="h-14 flex-1 max-w-56 rounded-2xl" />
                <Skeleton className="h-14 w-14 rounded-2xl" />
                <Skeleton className="h-14 w-24 rounded-2xl" />
              </div>
            </SkeletonCard>

            {/* Daily targets. */}
            <SkeletonCard className="p-6">
              <span className="flex flex-col gap-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-20" />
              </span>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 rounded-2xl" />
                ))}
              </div>
            </SkeletonCard>
          </div>

          <div className="flex flex-col gap-4 md:gap-5">
            {/* Coach. */}
            <SkeletonCard className="p-6">
              <div className="flex items-center gap-3">
                <Skeleton className="h-11 w-11 rounded-xl" />
                <span className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-24" />
                </span>
              </div>
              <SkeletonText lines={2} className="mt-5" />
              <Skeleton className="mt-5 h-12 w-full rounded-xl" />
            </SkeletonCard>

            {/* Your body: two columns of label/value rows. */}
            <SkeletonCard className="p-6">
              <Skeleton className="h-5 w-28" />
              <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5">
                {Array.from({ length: 6 }, (_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            </SkeletonCard>
          </div>
        </div>
      </div>
    </PageSkeleton>
  );
}
