import { MealDetailView } from '@/features/history';

export default async function MealDetailPage({ params }: { params: Promise<{ date: string; mealId: string }> }) {
  const { date, mealId } = await params;
  return (
    <div className="container mx-auto px-4 py-6">
      <MealDetailView date={date} mealId={mealId} />
    </div>
  );
}
