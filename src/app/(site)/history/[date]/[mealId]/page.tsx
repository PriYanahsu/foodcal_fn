import MealDetailView from '@/features/history/components/MealDetailView';

export default async function MealDetailPage({ params }: { params: Promise<{ mealId: string }> }) {
    const { mealId } = await params;
    return (
        <div className="container mx-auto px-4 py-6">
            <MealDetailView mealId={mealId} />
        </div>
    );
}
