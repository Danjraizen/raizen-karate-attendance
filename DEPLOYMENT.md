# Quick Deployment Checklist

## ✅ Pre-Deployment Checklist

- [ ] Supabase project created
- [ ] `supabase-schema.sql` run successfully
- [ ] `supabase-seed-vinayagapuram.sql` run successfully (with real UUIDs)
- [ ] 4 instructor auth users created in Supabase
- [ ] `.env.local` file created with Supabase credentials (for local testing)
- [ ] Local app tested (`npm run dev` works, login works)

## 🚀 Deployment Steps

### 1. GitHub Setup
- [ ] Create GitHub repository
- [ ] Push code to GitHub:
  ```bash
  git init
  git add .
  git commit -m "Initial commit"
  git remote add origin YOUR_GITHUB_REPO_URL
  git push -u origin main
  ```

### 2. Vercel Setup
- [ ] Sign up/login at [vercel.com](https://vercel.com)
- [ ] Click "Import Project" → Select your GitHub repo
- [ ] **CRITICAL**: Add Environment Variables:
  - `NEXT_PUBLIC_SUPABASE_URL` = (from Supabase → Settings → API → Project URL)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (from Supabase → Settings → API → anon public key)
- [ ] Click "Deploy"
- [ ] Wait for build to complete (~1-2 minutes)

### 3. Test Production
- [ ] Open the Vercel URL
- [ ] Test login with instructor account
- [ ] Test marking attendance
- [ ] Test viewing students

### 4. Mobile Setup
- [ ] Share Vercel URL with instructors
- [ ] Instructors add to home screen on their phones
- [ ] Test on actual mobile devices

## 📱 Mobile Instructions for Instructors

**Android:**
1. Open the Vercel URL in Chrome
2. Tap menu (3 dots) → "Add to Home screen"
3. App icon appears on home screen

**iPhone:**
1. Open the Vercel URL in Safari
2. Tap Share button → "Add to Home Screen"
3. App icon appears on home screen

## 🔧 Where to Find Supabase Credentials

1. Go to your Supabase project dashboard
2. Click **Settings** (gear icon) → **API**
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## ⚠️ Common Issues

**Build fails:**
- Check environment variables are set correctly in Vercel
- Make sure variable names match exactly (case-sensitive)

**Can't log in:**
- Verify Supabase URL and anon key are correct
- Check instructor auth users exist in Supabase
- Check instructor records exist in `instructors` table

**RLS errors:**
- Make sure `supabase-schema.sql` was run completely
- Verify instructor `auth_user_id` matches auth user UUID
