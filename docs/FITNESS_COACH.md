# 🏋️ Elite AI Fitness Coach Documentation

The Fitness Coach is a virtual consultant that calculates your metabolic needs and provides professional fitness strategy.

## 🛠️ Logic Flow

### 1. Goal Setting (`FitnessSetupWizard.tsx`)
Users enter their:
- **Physical Stats**: Gender, Age, Height, Weight.
- **Activity Level**: Sedentary to Extra Active.
- **Objectives**: Weight Loss, Maintenance, or Muscle Gain.

### 2. AI Consultation (`src/app/api/fitness-consultant/route.ts`)
The wizard sends this data to the Gemini-powered consultant.
- **TDEE Calculation**: The AI calculates the Total Daily Energy Expenditure.
- **Feasibility Check**: The AI evaluates if the user's `target_date` and `target_weight` are safe. If the weight loss is too aggressive (e.g., losing 10kg in 1 week), the AI sets the status to `rejected`.
- **Macro Distribution**: Based on the goal, it calculates the grams of Protein, Carbs, and Fats.

### 3. Strategy Implementation
Once the user "Activates" the plan, the targets are saved to the `profiles` table. The entire app (Dashboard and Notifications) then uses these AI-generated targets as the baseline for all progress tracking.

---

## 📋 AI Response Schema
```json
{
  "status": "approved",
  "reasoning": "A healthy 0.5kg/week loss is achievable...",
  "targets": {
    "calories": 2100,
    "protein": 160,
    "carbs": 200,
    "fats": 70
  },
  "advice": "Focus on high-volume low-calorie foods..."
}
```

---

## 🛠️ Customizing the Coach
To modify the coach's personality or strictness, update the `prompt` variable in `src/app/api/fitness-consultant/route.ts`. You can instruct it to follow specific diets (e.g., Paleo, Vegan) or be more encouraging.
