# Raizen Karate Attendance System

A mobile-first web app for instructors at Raizen Karate Academy to track attendance, students, batches, and belt exam eligibility. Built with **Next.js + Supabase** and deployable for free using **Vercel** (app) and **Supabase** (database + auth).

## 1. Prerequisites

- Node.js 18+ and npm
- A free Supabase account
- A free Vercel account (for production deploy)

## 2. Supabase Setup

1. Create a new Supabase project.
2. In the SQL editor, paste and run **`supabase-schema.sql`** from this repo.
   - This creates tables:
     - `dojos`, `instructors`, `batches`, `students`, `batch_enrollments`,
       `attendance_records`, `belt_exam_windows`
     - View: `student_attendance_summary`
     - Row-level security policies that restrict data per instructor/dojo.
3. In **Authentication → Providers**, make sure **Email/Password** is enabled.
4. Create instructor **Auth users** (email/password):
   - Go to **Authentication → Users**
   - Click **Add user**
   - Enter **Email** and **Password**
   - If you see an option like **Auto confirm user / Confirm email**, enable it (so they can log in immediately)
   - Click **Create user**
5. Copy each instructor’s Auth UUID:
   - In **Authentication → Users**, click the user you just created
   - Copy the **ID** field (this is a UUID and looks like: `a3f1c2d4-5678-4abc-9def-0123456789ab`)
6. In **Table Editor → instructors**, insert instructor rows that link to those auth users:
   - `auth_user_id`: paste the UUID from Authentication → Users
   - `primary_dojo_id`: the dojo that instructor belongs to
7. (Recommended) Seed your initial data:
   - Run **`supabase-seed-vinayagapuram.sql`** after replacing the `AUTH_UUID_*` placeholders with the real UUIDs.

## 3. Configure the Next.js App

1. Copy `.env.example` to `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

2. In Supabase dashboard, copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. Install dependencies and run dev server:

   ```bash
   npm install
   npm run dev
   ```

4. Open `http://localhost:3000` and log in as an instructor you created in Supabase.

## 4. Main Screens

- **Login** (`/login`): instructors sign in with email & password.
- **Dashboard** (`/dashboard`): shows counts for active students and batches.
- **Batches** (`/batches`): list of active batches. Tap a batch to mark attendance.
- **Batch attendance** (`/batches/[batchId]/attendance`):
  - Shows students enrolled in that batch.
  - Quickly mark `Present / Absent / Excused` per student.
  - Bulk actions: “All present”, “All absent”.
- **Students** (`/students`):
  - List of students with belt, status, and whether they have left.
  - Add new students via `/students/new`.
- **Student detail** (`/students/[studentId]`):
  - Status, current belt, join/left dates, current batch, attendance summary.
- **Belt exams** (`/belt-exams`):
  - Shows belt exam windows from `belt_exam_windows`.
  - Uses `student_attendance_summary` to count how many students meet the
    attendance requirement (e.g., 80%).

## 5. Production Deployment (Vercel + Supabase)

### Step-by-Step Deployment Guide

#### 5.1. Push to GitHub

1. Initialize git (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Raizen Karate Attendance System"
   ```

2. Create a new repository on GitHub (e.g., `raizen-karate-attendance`).

3. Push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/raizen-karate-attendance.git
   git branch -M main
   git push -u origin main
   ```

#### 5.2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/login (free account).

2. Click **"Add New Project"** or **"Import Project"**.

3. Import your GitHub repository:
   - Select the `raizen-karate-attendance` repo.
   - Vercel will auto-detect Next.js settings.

4. **Configure Environment Variables** (IMPORTANT):
   - Before deploying, click **"Environment Variables"**.
   - Add these two variables:
     - **Name**: `NEXT_PUBLIC_SUPABASE_URL`
       - **Value**: Your Supabase project URL (from Supabase dashboard → Settings → API → Project URL)
     - **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
       - **Value**: Your Supabase anon/public key (from Supabase dashboard → Settings → API → anon public key)
   - Make sure both are set for **Production**, **Preview**, and **Development** environments.

5. Click **"Deploy"**.

6. Wait for the build to complete (usually 1-2 minutes).

7. Once deployed, Vercel will give you a URL like: `https://raizen-karate-attendance.vercel.app`

#### 5.3. Test Your Deployment

1. Open the Vercel URL in your browser.
2. You should see the login page.
3. Log in with one of your instructor accounts.
4. Test marking attendance, viewing students, etc.

#### 5.4. Use on Mobile Devices

**For Android:**
1. Open the Vercel URL in Chrome browser.
2. Tap the menu (3 dots) → **"Add to Home screen"**.
3. The app will appear on your home screen like a native app.

**For iOS:**
1. Open the Vercel URL in Safari browser.
2. Tap the Share button → **"Add to Home Screen"**.
3. The app will appear on your home screen.

#### 5.5. (Optional) Custom Domain

If you want a custom domain (e.g., `attendance.raizenkarate.com`):
1. In Vercel project settings → **Domains**.
2. Add your domain and follow DNS setup instructions.
3. Vercel provides free SSL certificates automatically.

### Troubleshooting

- **Build fails**: Check that environment variables are set correctly in Vercel.
- **Can't log in**: Verify Supabase URL and anon key are correct.
- **RLS errors**: Make sure you've run `supabase-schema.sql` and created instructor records.

## 6. Notes and Next Steps

- To track who left, set `left_date` and `status = 'left'` in `students`.
- To support multiple dojos later, use `dojos` table and per-instructor `primary_dojo_id`.
- You can extend the schema with fee tracking tables (`fee_plans`, `student_fees`)
  based on your billing rules.

