# 🔔 FoodCal Notification System Documentation

## Overview
The FoodCal Notification System is a lightweight, AI-driven engine designed to keep users on track with their nutritional goals using **Positive Psychology**. Instead of robotic status updates, it provides personalized coaching advice via empathetic, human-like alerts that celebrate progress.

---

## 🏗️ Architecture

### 1. Global State (`NotificationContext`)
The core logic resides in `src/features/notifications/context/NotificationContext.tsx`.
- **Observer Pattern**: Uses a `setInterval` (running every 30 minutes) to check user progress against goals.
- **Provider Pattern**: Wraps the entire application in `ClientLayout.tsx` to ensure monitoring happens globally.
- **Persistence**: Automatically syncs state with `localStorage` (Key: `notifications_[user_id]`).

### 2. Detection Engine
The system calculates "Behind Schedule" status based on:
- **Profile Goal**: (Lose Weight, Maintain, Gain Muscle).
- **Time of Day**: Afternoon (15:00), Evening (18:00), Night (21:00).
- **Current Intake**: Real-time stats from `useDailyStats`.

### 3. AI Coaching Integration
When a threshold is breached, the system:
1.  Calls `GET /api/fitness-consultant`.
2.  Passes current stats and goal gaps.
3.  Retrieves a context-aware meal suggestion (e.g., "Incorporate healthy fats like avocado to reach your goal").

---

## 📱 Notification Channels

### In-App (The Dual-View UI)
- **Dashboard Bell (Inbox)**: Shows only **Unread** notifications. Reading a notification (clicking it) removes it from the dropdown instantly using Framer Motion animations.
- **Dedicated Page (History)**: Located at `/notifications`. Shows **All** notifications (Read & Unread) as a permanent coaching record.

### System-Level (Mobile/Desktop Bar)
- Uses the **Browser Notification API** (`window.Notification`).
- Delivers "Push-style" alerts to the device's notification tray, even if the user isn't actively looking at the browser.

---

## 💾 Data Structure (`AppNotification`)
```typescript
{
  id: string,               // Random unique ID
  title: string,            // Bold header (e.g., "Energy Boost Needed! ⚡")
  message: string,          // The main alert description
  type: NotificationType,   // goal_reminder | milestone | coach_advice | system
  timestamp: string,        // ISO string for sorting/anti-spam
  isRead: boolean,          // Status for UI filtering
  suggestion?: string       // Optional AI-generated advice
}
```

---

## ⚙️ Configuration & Anti-Spam
- **Frequency**: Monitoring runs every 1,800,000ms (30 mins).
- **Anti-Spam**: The system checks if a notification with the same title has already been sent *today* before triggering a new one.
- **Limit**: Local storage is capped at the **last 50** notifications to maintain performance.

---

## 🛠️ How to Customize

### Adding New Trigger Logic
Modify the `checkProgress` function in `NotificationContext.tsx`. You can add new conditions based on protein intake, water targets, or specific milestones.

### Changing UI Styles
Update the `glass-card` classes or the `NotificationItem.tsx` component. The system uses **Glassmorphism** and **Tailwind CSS** for its premium look.
