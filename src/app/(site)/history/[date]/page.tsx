import DailyMealList from '@/features/history/components/DailyMealList';

export default async function DailyHistoryPage({ params }: { params: Promise<{ date: string }> }) {
    const { date } = await params;
    return (
        <div className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold mb-6">
                {new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </h1>
            <DailyMealList date={date} />
        </div>
    );
}
