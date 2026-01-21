import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';

export async function POST(req: Request) {
    console.log('--- Fitness Consultant API Started ---');
    try {
        const body = await req.json();
        console.log('Request Body:', JSON.stringify(body, null, 2));

        const { stats, goals } = body;

        if (!stats || !goals) {
            return NextResponse.json(
                { error: 'User stats and goals are required' },
                { status: 400 }
            );
        }

        if (!process.env.GEMINI_API_KEY) {
            console.error('CRITICAL: GEMINI_API_KEY is missing');
            return NextResponse.json(
                { error: 'AI Service configuration error' },
                { status: 500 }
            );
        }

        console.log('API Key present (starts with):', process.env.GEMINI_API_KEY.substring(0, 10));

        // Initialize Gemini
        let responseText = '';
        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

            const prompt = `
            You are a highly intelligent, world-class elite fitness coach and nutritionist who specializes in POSITIVE PSYCHOLOGY and MOTIVATIONAL INTERVIEWING.
            Your goal is to be a supportive, empathetic, and encouraging partner to the user.
            
            USER STATS:
            - Gender: ${stats.gender}
            - Age: ${stats.age}
            - Height: ${stats.height} cm
            - Current Weight: ${stats.weight} kg
            - Activity Level: ${stats.activity_level}
            
            USER GOALS:
            - Objective: ${goals.objective}
            - Target Weight: ${goals.target_weight} kg
            - Target Date: ${goals.target_date}
            
            INSTRUCTIONS:
            1. Feasibility Check: Is the goal realistic and safe?
            2. Calculations: TDEE, daily calories, and macro split (P/C/F in grams).
            3. Expert Advice (THE MOST IMPORTANT PART): 
               - Use human-like, warm, and highly encouraging language.
               - Instead of "You need to eat more," say "You're doing great! A small nutrient-dense addition to your next meal will help you stay perfectly fueled for your goals."
               - Focus on "WE" and "Partnership" (e.g., "Let's hit this target together!").
               - Use positive reinforcement (celebrate what they've already achieved).
               - Keep it to 3-4 powerful, motivational sentences.

            OUTPUT FORMAT:
            Return ONLY a JSON object:
            {
                "status": "approved" | "rejected",
                "reasoning": "Quick explanation here",
                "targets": { "calories": number, "protein": number, "carbs": number, "fats": number },
                "advice": "Empathetic and motivational coaching advice here"
            }
            Do not include any conversational filler outside the JSON.
            `;

            console.log('--- Calling Gemini ---');
            const result = await model.generateContent(prompt);
            const response = await result.response;
            responseText = response.text();
            console.log('--- Gemini Success ---');
        } catch (geminiError: any) {
            console.error('Gemini Error:', geminiError);
            return NextResponse.json(
                { error: `AI Service Error: ${geminiError.message}` },
                { status: 500 }
            );
        }

        // More robust JSON extraction
        let cleanContent = responseText;
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            cleanContent = jsonMatch[0];
        }

        try {
            const analysis = JSON.parse(cleanContent);
            return NextResponse.json({ data: analysis });
        } catch (e) {
            console.error("JSON Parse Error. Raw content:", responseText);
            return NextResponse.json({
                error: "Failed to parse AI response. The coach was a bit too talkative.",
                raw: responseText
            }, { status: 500 });
        }

    } catch (error: any) {
        console.error('Fitness Consultant Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to consult fitness coach', stack: error.stack },
            { status: 500 }
        );
    }
}
