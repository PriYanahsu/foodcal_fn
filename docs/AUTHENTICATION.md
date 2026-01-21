# 🔐 Authentication Documentation

FoodCal uses **Supabase Auth** for secure, session-based authentication. The system supports both Email/Password and Username-based login.

## 🛠️ Logic Flow

### 1. Unified Login (`src/features/auth/services/auth.api.ts`)
The `login` function is flexible. If the input does not contain an `@`, the system:
1.  Queries the `profiles` table to find the email associated with that `username`.
2.  If found, it proceeds with the standard `signInWithPassword` using the retrieved email.

### 2. Signup & Profile Sync
When a user signs up:
1.  The `signUp` method is called with additional `user_metadata` (full name, username, gender).
2.  **Supabase Trigger**: A PostgreSQL function (`handle_new_user`) in the database automatically creates a corresponding record in the `public.profiles` table. This ensures the profile always exists for every auth user.

### 3. State Management (`src/features/auth/hooks/useAuth.ts`)
The `useAuth` hook simplifies auth interactions:
- **`user`**: Real-time state of the current authenticated user.
- **`onAuthStateChange`**: A listener that automatically updates the `user` state when sessions expire, or users log in/out.

---

## 📋 Types & Interfaces
```typescript
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}
```

---

## 🛡️ Security Best Practices
- **Cookies**: Sessions are persisted via HTTP-only cookies managed by Supabase.
- **RLS Integration**: Most database queries rely on `auth.uid() = user_id` to enforce data isolation between users.
