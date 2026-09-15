import { DailyMealList } from '@/features/history';

export default async function DailyHistoryPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  return (
    <div className="page-container max-w-7xl pb-24 lg:pb-6">
      <DailyMealList date={date} />
    </div>
  );
}
