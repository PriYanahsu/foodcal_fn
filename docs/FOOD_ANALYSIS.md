# 🍎 Food Analysis & Scanning Documentation

The Food Analysis feature allows users to log meals simply by taking a photo. It uses Computer Vision and Generative AI to estimate nutritional content.

## 🛠️ Logic Flow

### 1. Image Capture & Processing

`src/features/food-scan/services/scan.api.ts`:

- Converts the user's `File` object to a **Base64 string**.
- Sends the payload to the internal API route: `/api/analyze-food`.

### 2. The AI Brain (Gemini Flash)

`src/app/api/analyze-food/route.ts`:

- **Model**: Uses `gemini-1.5-flash` for high-speed image reasoning.
- **Prompting**: A specialized nutritionist prompt instructs the AI to return a strict JSON schema containing `calories`, `protein`, `carbs`, and `fats`.
- **Validation**: If the confidence score returned by AI is `< 0.5`, the system rejects the image as "Not Food".

### 3. Verification & Saving

After analysis, the user is shown the results in a modal:

- They can adjust the values manually if the AI made a slight error.
- Once confirmed, the data is saved to the `food_logs` table in Supabase.

---

## 📊 Nutritional Estimation Logic

The AI estimates portions based on visual cues.

- **Confidence**: 0.0 to 1.0 scale.
- **Notes**: AI provides a brief rationale (e.g., "Estimate based on typical 200g serving of pasta").

---

## 🚀 Optimization Tips

- **Image Quality**: Bright, clear, top-down photos yield the highest accuracy.
- **Experimental Prompting**: The `additional_prompt` field in the API allows users to specify ingredients (e.g., "This is keto-friendly") to help the AI refine its estimate.
