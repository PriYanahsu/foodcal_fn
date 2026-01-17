import { NextResponse } from 'next/server';
import OpenAI from 'openai';


export async function POST(req: Request) {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY missing');
    }

    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    try {
        const { image } = await req.json();

        if (!image) {
            return NextResponse.json(
                { error: 'Image data is required' },
                { status: 400 }
            );
        }

        // Remove data:image/jpeg;base64, prefix if present for OpenAI
        const base64Image = image.replace(/^data:image\/[a-z]+;base64,/, '');

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: `You are a professional nutritionist API. 
          Analyze the food in the image and return a JSON object with the following fields:
          - food_name: string (concise name of the dish)
          - calories: number (estimated total calories)
          - protein: number (grams)
          - carbs: number (grams)
          - fats: number (grams)
          - confidence: number (0-1, how confident you are that this is food)
          - analysis_notes: string (brief explanation of the estimate)
          
          If the image is NOT food, set confidence to 0 and food_name to "Not Food".
          Return ONLY valid JSON. Do not include markdown formatting like \`\`\`json.`
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: 'Analyze this image for nutritional content.'
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Image}`,
                            },
                        },
                    ],
                },
            ],
            max_tokens: 500,
        });

        const content = response.choices[0].message.content;

        if (!content) {
            throw new Error('No analysis received from AI');
        }

        // Clean up content if it has markdown code blocks
        const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();

        const analysis = JSON.parse(cleanContent);

        if (analysis.confidence < 0.5 || analysis.food_name === "Not Food") {
            return NextResponse.json(
                { error: 'No food detected in this image. Please try again.' },
                { status: 422 }
            );
        }

        return NextResponse.json({ data: analysis });
    } catch (error: any) {
        console.error('Food Analysis Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to analyze food' },
            { status: 500 }
        );
    }
}
