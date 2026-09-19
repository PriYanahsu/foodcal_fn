import { HistoryCalendar } from '@/features/history';

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; meal?: string }>;
}) {
  const { date, meal } = await searchParams;
  return <HistoryCalendar initialDate={date} initialMealId={meal} />;
}
