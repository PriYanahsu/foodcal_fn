# Deploy Edge Function to Supabase

## Option 1: Using Supabase CLI (Recommended)

### Step 1: Install Supabase CLI

**For Windows (using Scoop):**
```powershell
# Install Scoop if you don't have it
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# Install Supabase CLI
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Or download directly:**
1. Go to: https://github.com/supabase/cli/releases
2. Download the Windows executable
3. Add it to your PATH

**Or use npx (no installation needed):**
```bash
npx supabase@latest functions deploy check-notifications
```

### Step 2: Login to Supabase
```bash
npx supabase login
# Or if installed: supabase login
```

### Step 3: Link Your Project
```bash
npx supabase link --project-ref your-project-ref
# You can find your project ref in Supabase Dashboard > Settings > General > Reference ID
```

### Step 4: Deploy the Function
```bash
npx supabase functions deploy check-notifications
```

### Step 5: Set Environment Variables

After deployment, set environment variables in Supabase Dashboard:

1. Go to: **Supabase Dashboard** → **Project Settings** → **Edge Functions** → **Environment Variables**
2. Add these variables:
   - `SUPABASE_URL` - Your Supabase project URL (usually auto-set)
   - `SUPABASE_SERVICE_ROLE_KEY` - Your service role key (usually auto-set)
   - `API_BASE_URL` - Your Next.js app URL (e.g., `https://your-app.vercel.app` or `http://localhost:3000` for dev)

Or use CLI:
```bash
npx supabase secrets set API_BASE_URL=https://your-app.vercel.app
```

---

## Option 2: Manual Deployment via Supabase Dashboard

### Step 1: Prepare the Function

1. Navigate to `supabase/functions/check-notifications/`
2. Ensure `index.ts` is ready

### Step 2: Deploy via Dashboard

1. Go to **Supabase Dashboard** → **Edge Functions**
2. Click **Create a new function**
3. Name it: `check-notifications`
4. Copy the contents of `index.ts` into the editor
5. Click **Deploy**

### Step 3: Set Environment Variables

1. Go to **Project Settings** → **Edge Functions** → **Environment Variables**
2. Add:
   - `API_BASE_URL` = `https://your-app.vercel.app` (or your Next.js URL)

---

## Option 3: Using npx (Quickest - No Installation)

```bash
# Navigate to your project root
cd E:\KRIXEN\foodcal_fe

# Login (first time only)
npx supabase@latest login

# Link project (first time only)
npx supabase@latest link --project-ref YOUR_PROJECT_REF

# Deploy the function
npx supabase@latest functions deploy check-notifications

# Set environment variable
npx supabase@latest secrets set API_BASE_URL=https://your-app.vercel.app
```

---

## Verify Deployment

### Test the Function

1. **Via API endpoint:**
   ```bash
   curl -X POST "http://localhost:3000/api/check-notifications?test=true"
   ```

2. **Direct function call:**
   ```bash
   curl -X POST "https://YOUR_PROJECT_REF.supabase.co/functions/v1/check-notifications?test=true" \
     -H "Authorization: Bearer YOUR_ANON_KEY"
   ```

3. **Check logs:**
   ```bash
   npx supabase@latest functions logs check-notifications
   ```

---

## Troubleshooting

### Function Not Found
- Make sure you're in the project root directory
- Verify the function folder exists at `supabase/functions/check-notifications/`

### Authentication Errors
- Run `npx supabase@latest login` again
- Check your project ref is correct

### Environment Variables Not Working
- Variables must be set in Supabase Dashboard, not locally
- Restart the function after setting variables

### API_BASE_URL Issues
- Make sure your Next.js app is accessible
- For local dev, use `http://localhost:3000` (only works if edge function can reach it)
- For production, use your deployed URL (e.g., Vercel, Netlify)

---

## Next Steps

After deployment:

1. ✅ Test the function with `?test=true` parameter
2. ✅ Set up a cron job to run it automatically
3. ✅ Monitor logs for any errors
4. ✅ Verify notifications are being created in the database
