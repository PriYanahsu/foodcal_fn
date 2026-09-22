import { PageSkeleton } from '@/components/ui/PageSkeleton';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';

/** Profile's shape while it loads: identity card up top, then field cards. */
export default function ProfileSkeleton() {
  return (
    <PageSkeleton label="Loading your profile…">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-5 bg-canvas px-4 py-6 md:px-8 md:py-8">
        <span className="hidden flex-col gap-2.5 md:flex">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-3.5 w-64" />
        </span>

        <SkeletonCard className="flex items-center gap-4 md:gap-5">
          <Skeleton className="h-16 w-16 shrink-0 rounded-full md:h-20 md:w-20" />
          <span className="flex min-w-0 flex-1 flex-col gap-2.5">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-52 max-w-full" />
            <Skeleton className="mt-1 h-2 w-full max-w-xs rounded-full" />
          </span>
        </SkeletonCard>

        <div className="grid gap-5 lg:grid-cols-2">
          {[4, 3].map((rows, card) => (
            <SkeletonCard key={card}>
              <Skeleton className="h-4 w-32" />
              <div className="mt-5 grid grid-cols-2 gap-3">
                {Array.from({ length: rows * 2 }, (_, i) => (
                  <span key={i} className="flex flex-col gap-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-11 w-full rounded-xl" />
                  </span>
                ))}
              </div>
            </SkeletonCard>
          ))}
        </div>
      </div>
    </PageSkeleton>
  );
}
