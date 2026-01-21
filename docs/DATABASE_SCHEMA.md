# 🗄️ Database & Storage Schema Documentation

FoodCal uses **Supabase (PostgreSQL)** for data persistence. This document outlines the table structures, relationships, and Row Level Security (RLS) policies.

---

## 📋 Tables

### 1. `profiles`
The central table for user fitness data. Linked to Supabase Auth via `id`.
- **Columns**: `username`, `full_name`, `email`, `gender`, `age`, `height`, `weight`, `activity_level`, `goal`.
- **Targets**: `daily_calorie_target`, `daily_protein_target`, etc. (Populated by the AI Coach).
- **Triggers**: `handle_new_user()` - Automatically creates a profile record when a new user signs up.

### 2. `food_logs`
Stores every meal entry.
- **Columns**: `food_name`, `calories`, `protein`, `carbs`, `fats`, `confidence`, `meal_type` (Breakfast, Lunch, Dinner, Snack), `image_path` (Link to storage), `is_manual`.
- **Realtime**: Used for dashboard progress bar updates.

### 3. `weight_logs`
Tracks weight changes over time to generate progress charts.
- **Columns**: `weight`, `created_at`.

---

## 🔒 Row Level Security (RLS)
RLS is strictly enforced on all tables to ensure users only access their own data.
- **Selection**: `auth.uid() = user_id`
- **Insertion**: Only authenticated users can insert with their own `auth.uid()`.

---

## 📁 Storage Buckets

### `avatars`
- **Public**: No (but individual files are readable by everyone).
- **Purpose**: Profile pictures.

### `meal_images`
- **Public**: No.
- **Purpose**: Photos of food taken during the scanning process.
- **Policy**: Only the owner can view, upload, or delete their meal images.

---

## 🏗️ SQL Setup Reference
The full schema definition can be found in [supabase_schema.sql](../supabase_schema.sql).
To apply changes, copy the SQL from that file into the **Supabase SQL Editor**.
