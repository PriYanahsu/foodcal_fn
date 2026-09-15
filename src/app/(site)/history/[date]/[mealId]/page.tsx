import MealDetailView from '@/features/history/components/MealDetailView';

export default async function MealDetailPage({ params }: { params: Promise<{ date: string, mealId: string }> }) {
  const { mealId } = await params;
  const { date } = await params;
  return (
    <div className="container mx-auto px-4 py-6">
      <MealDetailView date={date} mealId={mealId} />
    </div>
  );
}
