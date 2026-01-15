import { NextRequest, NextResponse } from 'next/server';
import { NutritionData } from '@/features/food-scan/types';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json(
        { success: false, error: 'No image provided' },
        { status: 400 }
      );
    }

    // Mock nutrition data - in production, this would call an AI/ML service
    const mockNutritionData: NutritionData = {
      calories: Math.floor(Math.random() * 500) + 100,
      protein: Math.floor(Math.random() * 50) + 10,
      carbs: Math.floor(Math.random() * 80) + 20,
      fats: Math.floor(Math.random() * 30) + 5,
      name: 'Scanned Food Item',
    };

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return NextResponse.json({
      success: true,
      data: mockNutritionData,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to process image' },
      { status: 500 }
    );
  }
}
