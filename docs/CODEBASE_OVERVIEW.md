# 🏗️ Codebase Overview: FoodCal

FoodCal is a modern, premium AI-powered calorie tracking application built with **Next.js**, **Supabase**, and **Google Gemini intelligence**.

## 🚀 Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/) (App Router), [React](https://reactjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with a custom glassmorphic design system.
- **Backend & Database**: [Supabase](https://supabase.com/) (Auth, PostgreSQL, Storage, Realtime).
- **AI Intelligence**: [Google Gemini API](https://ai.google.dev/) (Image analysis & Fitness consulting).
- **Animations**: [Framer Motion](https://www.framer.com/motion/) for fluid UI transitions.

---

## 📂 Project Structure

```bash
src/
├── app/             # Next.js App Router (Pages, Routes, API)
├── components/      # Shared UI layout and global components
├── features/        # Modular business logic grouped by domain
│   ├── auth/        # Login, Signup, Session management
│   ├── dashboard/   # Real-time calorie stats & aggregation
│   ├── food-scan/   # AI Camera analysis logic
│   ├── notifications/# Intelligent goal monitoring system
│   └── history/     # Log records and calendar views
├── lib/             # Third-party client initializations (Supabase)
└── utils/           # Shared helper functions
```

---

## 🔐 Database & Security (Supabase)

The application relies heavily on **Supabase Row Level Security (RLS)** to ensure data privacy.

### Core Tables

- `profiles`: Extends `auth.users` with fitness goals, targets, and metabolic stats.
- `food_logs`: Stores meal entries, macronutrients, and images.
- `weight_logs`: Tracks user weight changes over time.

### Realtime Synchronization

The app uses **Supabase Realtime** (`postgres_changes`) to instantly update the Dashboard and Notifications without requiring page refreshes when new food is logged.

---

## 🎨 Design Philosophy

- **Glassmorphism**: High use of backdrop-blur, subtle gradients, and translucent cards.
- **Mobile First**: Optimized for quick usage via smartphone cameras.
- **AI-Native**: Intelligence is woven into the UX, not just a side feature.

---

## 📄 Related Documentation

- [AUTHENTICATION.md](./docs/AUTHENTICATION.md)
- [FOOD_ANALYSIS.md](./docs/FOOD_ANALYSIS.md)
- [NOTIFICATIONS.md](./NOTIFICATIONS_DOCS.md)
