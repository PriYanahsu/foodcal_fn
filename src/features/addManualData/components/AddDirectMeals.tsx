'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { CameraIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { ManualMealData } from '../type';
// import { Button } from '@/components/ui/button'; // Assuming we have UI components, if not using basic HTML or check for them.

export default function AddDirectMeals() {
    const supabase = createClient();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [formData, setFormData] = useState<ManualMealData>({
        food_name: '',
        calories: '',
        protein: '',
        carbs: '',
        fats: '',
        meal_type: 'snack',
    });

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            alert('Please login first');
            return;
        }
        if (!formData.food_name || !formData.calories) {
            alert('Please enter food name and calories');
            return;
        }

        setIsLoading(true);

        try {
            let imagePath = null;

            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${user.id}-${Date.now()}.${fileExt}`;
                const { error: uploadError, data } = await supabase.storage
                    .from('meal_images')
                    .upload(fileName, imageFile);

                if (uploadError) throw uploadError;
                imagePath = data.path;
            }

            const { error: insertError } = await supabase.from('food_logs').insert({
                user_id: user.id,
                food_name: formData.food_name,
                calories: Number(formData.calories),
                protein: formData.protein ? Number(formData.protein) : 0,
                carbs: formData.carbs ? Number(formData.carbs) : 0,
                fats: formData.fats ? Number(formData.fats) : 0,
                meal_type: formData.meal_type,
                image_path: imagePath,
                is_manual: true,
            });

            if (insertError) throw insertError;

            alert('Meal added successfully!');
            // Reset form
            setFormData({
                food_name: '',
                calories: '',
                protein: '',
                carbs: '',
                fats: '',
                meal_type: 'snack',
            });
            setImageFile(null);
            setPreviewUrl(null);

        } catch (error: any) {
            console.error('Error adding meal:', error);
            alert(error.message || 'Failed to add meal');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-4 space-y-6">
            <h1 className="text-2xl font-bold text-center mb-6">Add Meal Manually</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Image Upload Area */}
                <div className="flex justify-center">
                    <div className="relative group w-full h-48 bg-[var(--card-bg)] border-2 border-dashed border-[var(--card-border)] rounded-xl flex flex-col items-center justify-center overflow-hidden transition-colors hover:border-[var(--primary)] text-center">
                        {previewUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center p-4">
                                <PhotoIcon className="h-10 w-10 text-gray-400 mb-2" />
                                <span className="text-sm text-gray-500">Tap to upload image</span>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Food Name *</label>
                        <input
                            type="text"
                            name="food_name"
                            value={formData.food_name}
                            onChange={handleInputChange}
                            placeholder="e.g., Grilled Chicken Salad"
                            className="w-full p-3 bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)] focus:border-[var(--primary)] focus:outline-none transition-colors"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Calories *</label>
                            <input
                                type="number"
                                name="calories"
                                value={formData.calories}
                                onChange={handleInputChange}
                                placeholder="kcal"
                                className="w-full p-3 bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)] focus:border-[var(--primary)] focus:outline-none transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Meal Type</label>
                            <select
                                name="meal_type"
                                value={formData.meal_type}
                                onChange={handleInputChange}
                                className="w-full p-3 bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)] focus:border-[var(--primary)] focus:outline-none transition-colors"
                            >
                                <option value="breakfast">Breakfast</option>
                                <option value="lunch">Lunch</option>
                                <option value="dinner">Dinner</option>
                                <option value="snack">Snack</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Protein (g)</label>
                            <input
                                type="number"
                                name="protein"
                                value={formData.protein}
                                onChange={handleInputChange}
                                placeholder="Optional"
                                className="w-full p-3 bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)] focus:border-[var(--primary)] focus:outline-none transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Carbs (g)</label>
                            <input
                                type="number"
                                name="carbs"
                                value={formData.carbs}
                                onChange={handleInputChange}
                                placeholder="Optional"
                                className="w-full p-3 bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)] focus:border-[var(--primary)] focus:outline-none transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Fats (g)</label>
                            <input
                                type="number"
                                name="fats"
                                value={formData.fats}
                                onChange={handleInputChange}
                                placeholder="Optional"
                                className="w-full p-3 bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)] focus:border-[var(--primary)] focus:outline-none transition-colors"
                            />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-[var(--primary)] text-white font-bold rounded-xl shadow-lg active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Saving...' : 'Add Meal'}
                </button>
            </form>
        </div>
    );
}