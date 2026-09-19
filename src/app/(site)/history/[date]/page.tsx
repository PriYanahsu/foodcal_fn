import { redirect } from 'next/navigation';
import { historyHref } from '@/features/Nutrition/utils/formatLogTime';
import { toApiDate } from '@/features/Nutrition/utils/toLocalDate';

/** Old day URL — the day now opens inside the history calendar. */
export default async function DailyHistoryPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  redirect(historyHref(toApiDate(date)));
}
