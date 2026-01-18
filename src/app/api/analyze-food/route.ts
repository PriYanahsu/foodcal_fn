import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';

export async function POST(req: Request) {
    // if (!process.env.GEMINI_API_KEY) {
    //     return NextResponse.json(
    //         { error: 'GEMINI_API_KEY is missing in environment variables' },
    //         { status: 500 }
    //     );
    // }

    try {
        const { image, additional_prompt } = await req.json();

        if (!image) {
            return NextResponse.json(
                { error: 'Image data is required' },
                { status: 400 }
            );
        }

        // Initialize Gemini
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
        // Use standard alias for best availability (avoids experimental quota limits)
        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

        // Clean base64 string
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');

        const prompt = `
        You are a professional nutritionist API. 
        Analyze the food in the image and return a JSON object with the following fields:
        - food_name: string (concise name of the dish)
        - calories: number (estimated total calories)
        - protein: number (grams)
        - carbs: number (grams)
        - fats: number (grams)
        - confidence: number (0.0 to 1.0, how confident you are that this is food)
        - analysis_notes: string (brief explanation of the estimate)
        
        If the image is NOT food, set confidence to 0 and food_name to "Not Food".
        Return ONLY valid JSON. Do not include markdown formatting like \`\`\`json.
        
        ${additional_prompt ? `User provided additional context: "${additional_prompt}". Take this into account when identifying the food or ingredients.` : ''}
        `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: "image/jpeg", // Assuming JPEG for simplicity, or we could detect/pass it.
                },
            },
        ]);

        const responseText = result.response.text();

        // Clean up markdown if present
        const cleanContent = responseText.replace(/```json\n?|\n?```/g, '').trim();

        let analysis;
        try {
            analysis = JSON.parse(cleanContent);
        } catch (e) {
            console.error("Failed to parse JSON:", cleanContent);
            throw new Error("Failed to parse AI response");
        }

        if (analysis.confidence < 0.5 || analysis.food_name === "Not Food") {
            return NextResponse.json(
                { error: 'No food detected in this image. Please try again.' },
                { status: 422 }
            );
        }

        return NextResponse.json({ data: analysis });

    } catch (error: any) {
        console.error('Food Analysis Error (Gemini):', error);

        // Debug: List available models if possible
        try {
            if (process.env.GEMINI_API_KEY) {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                // Note: listModels might not be directly exposed on the instance in all SDK versions easily without correct type, 
                // but checking connection is useful. 
                // Using a clearer error message for the user.
                console.log("If you are seeing 404, please ensure 'Generative Language API' is ENABLED in your Google Cloud Console.");
            }
        } catch (e) { /* ignore */ }

        return NextResponse.json(
            { error: error.message || 'Failed to analyze food' },
            { status: 500 }
        );
    }
}
