'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MealLog } from '../types';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface MealDetailViewProps {
    mealId: string;
}

export default function MealDetailView({ mealId }: MealDetailViewProps) {
    const supabase = createClient();
    const router = useRouter();
    const [meal, setMeal] = useState<MealLog | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMeal() {
            const { data, error } = await supabase
                .from('food_logs')
                .select('*')
                .eq('id', mealId)
                .single();

            if (data) {
                setMeal(data as MealLog);
                if (data.image_path) {
                    const { data: imgData } = await supabase.storage
                        .from('meal_images')
                        .download(data.image_path);

                    // Actually, let's try createSignedUrl or download. AvatarUpload used download.
                    if (data.image_path.startsWith('http')) {
                        setImageUrl(data.image_path);
                    } else {
                        const { data: blob } = await supabase.storage.from('meal_images').download(data.image_path);
                        if (blob) {
                            setImageUrl(URL.createObjectURL(blob));
                        }
                    }
                }
            }
            setLoading(false);
        }
        fetchMeal();
    }, [mealId, supabase]);

    if (loading) return <div>Loading details...</div>;
    if (!meal) return <div>Meal not found.</div>;

    return (
        <div className="max-w-md mx-auto space-y-6">
            <button onClick={() => router.back()} className="flex items-center text-sm text-gray-500 hover:text-white mb-4">
                <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back
            </button>

            {/* Image */}
            <div className="w-full h-64 bg-gray-800 rounded-xl overflow-hidden flex items-center justify-center">
                {imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={imageUrl} alt={meal.food_name} className="w-full h-full object-cover" />
                ) : (
                    <span className="text-gray-500">No image available</span>
                )}
            </div>

            {/* Header */}
            <div>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold">{meal.food_name}</h1>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-bold mt-2 ${meal.is_manual ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                            {meal.is_manual ? 'Manual Entry' : 'AI Analysis'}
                        </span>
                    </div>
                    <div className="text-right">
                        <span className="block text-4xl font-bold text-[var(--primary)]">{meal.calories}</span>
                        <span className="text-gray-400">kcal</span>
                    </div>
                </div>
            </div>

            {/* Macros */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-[var(--card-bg)] p-4 rounded-xl text-center border border-[var(--card-border)]">
                    <span className="block text-xl font-bold text-blue-400">{meal.protein ?? 0}g</span>
                    <span className="text-xs text-gray-500">Protein</span>
                </div>
                <div className="bg-[var(--card-bg)] p-4 rounded-xl text-center border border-[var(--card-border)]">
                    <span className="block text-xl font-bold text-yellow-400">{meal.carbs ?? 0}g</span>
                    <span className="text-xs text-gray-500">Carbs</span>
                </div>
                <div className="bg-[var(--card-bg)] p-4 rounded-xl text-center border border-[var(--card-border)]">
                    <span className="block text-xl font-bold text-red-400">{meal.fats ?? 0}g</span>
                    <span className="text-xs text-gray-500">Fats</span>
                </div>
            </div>

            {/* Additional Info */}
            <div className="bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--card-border)] text-sm space-y-2">
                <div className="flex justify-between">
                    <span className="text-gray-400">Time</span>
                    <span>{new Date(meal.created_at).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-400">Meal Type</span>
                    <span className="capitalize">{meal.meal_type}</span>
                </div>
                {!meal.is_manual && (
                    <div className="flex justify-between">
                        <span className="text-gray-400">AI Confidence</span>
                        <span>{Math.round((meal.confidence || 0) * 100)}%</span>
                    </div>
                )}
            </div>
        </div>
    );
}
