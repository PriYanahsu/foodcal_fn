import { redirect } from 'next/navigation';
import { historyHref } from '@/features/Nutrition/utils/formatLogTime';
import { toApiDate } from '@/features/Nutrition/utils/toLocalDate';

/** Old meal URL — the meal now opens inside the history calendar's day panel. */
export default async function MealDetailPage({
  params,
}: {
  params: Promise<{ date: string; mealId: string }>;
}) {
  const { date, mealId } = await params;
  redirect(historyHref(toApiDate(date), mealId));
}
