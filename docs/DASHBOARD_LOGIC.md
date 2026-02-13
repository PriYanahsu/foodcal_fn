# 📊 Dashboard & Daily Stats Documentation

The dashboard is the heart of the application, providing real-time feedback on the user's nutritional progress.

## 🛠️ Logic Flow

### 1. Data Aggregation (`src/features/dashboard/hooks/useDailyStats.ts`)

The `useDailyStats` hook is responsible for fetching and totaling the user's intake for a specific day.

- **Filtering**: It fetches all records from `food_logs` where the `created_at` timestamp falls between `00:00:00` and `23:59:59` of the target date.
- **Aggregation**: It uses the `.reduce()` method to sum up `calories`, `protein`, `carbs`, and `fats` from all fetched logs.
- **Timezone Stability**: It normalizes dates to the start of the day in local time to ensure consistency across different user regions.

### 2. Realtime Synchronization

To provide a seamless experience, the dashboard uses a **Supabase Realtime Channel**:

- It listens for any change (`INSERT`, `UPDATE`, `DELETE`) on the `food_logs` table filtered by the current `user_id`.
- When a change is detected, it automatically re-fetches the stats, ensuring the progress bars update instantly without a page reload.

---

## 🏗️ Database Connection

The dashboard relies on the following SQL structure:

```sql
CREATE TABLE public.food_logs (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  calories integer,
  protein float,
  carbs float,
  fats float,
  created_at timestamp WITH time zone DEFAULT now()
);
```

---

## 📈 UI Components

- **Radial/Progress Bars**: Visually represent the percentage of the daily target achieved.
- **Recent Logs**: A chronologically ordered list of what the user has eaten today.
- **AI Advice Card**: Displays the latest context-aware coaching snippet retrieved from the user's profile.
