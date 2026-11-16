# ?? PRODUCTION DEPLOYMENT CHECKLIST

## Step 1: Verify Code is Ready
? All code committed to GitHub
? Build passing (npm run build)
? TypeScript: 0 errors
? Tests: 59+ passing

## Step 2: Create Required Accounts

### 2.1 Vercel Account (if needed)
- Go to https://vercel.com
- Sign up with GitHub (recommended for easy integration)
- Create new team/workspace

### 2.2 Supabase Account (if needed)
- Go to https://supabase.com
- Sign up with GitHub or email
- Create new organization

### 2.3 Grok API Key (xAI)
- Go to https://console.x.ai
- Sign up
- Create API key
- Keep the key safe (starts with 'xai-')

## Step 3: Deploy to Vercel

### 3.1 Connect GitHub to Vercel
1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your GitHub repo: hamzajamalgreat-source/CV-shortlister
4. Click "Continue"

### 3.2 Set Environment Variables in Vercel
Before deploying, add these to Vercel Settings ? Environment Variables:

(You'll get these from Supabase setup below)

Leave blank for now, we'll get the values from Supabase.

### 3.3 Deploy
- Vercel will auto-build and deploy
- Wait for deployment to complete (~5-10 minutes)
- You'll get a URL like: https://cv-shortlister-xxxxx.vercel.app

## Step 4: Set Up Supabase

### 4.1 Create Project
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Enter:
   - Project name: "cv-screening" (or your choice)
   - Database password: (create secure password)
   - Region: Choose closest to you
4. Click "Create new project"
5. Wait for provisioning (~2-3 minutes)

### 4.2 Get API Keys
1. Go to Project Settings ? API
2. Copy these values:
   - **Project URL** (starts with https://xxxxx.supabase.co)
   - **Anon Key** (starts with eyJhbGc...)
   - **Service Role Key** (starts with eyJhbGc..., keep secret!)
3. Save these safely

### 4.3 Run Database Migrations
1. Open terminal in project directory
2. Install Supabase CLI (if needed):
   \\\ash
   npm install -g supabase
   \\\
3. Login:
   \\\ash
   supabase login
   \\\
4. Link to your project:
   \\\ash
   supabase link --project-id YOUR_PROJECT_ID
   \\\
   (Find YOUR_PROJECT_ID in Supabase dashboard URL)
5. Run migrations:
   \\\ash
   supabase db push
   \\\
   This creates all tables and RLS policies.

## Step 5: Update Vercel Environment Variables

Now that you have Supabase keys, add them to Vercel:

1. Go to Vercel Dashboard ? Your Project ? Settings ? Environment Variables
2. Add these variables:

| Variable Name | Value | Example |
|---|---|---|
| VITE_SUPABASE_URL | From Supabase API | https://xxxxx.supabase.co |
| VITE_SUPABASE_ANON_KEY | From Supabase API | eyJhbGc... |
| SUPABASE_SERVICE_ROLE_KEY | From Supabase API | eyJhbGc... (keep secret!) |
| GROK_API_KEY | From xAI console | xai-... |

3. Click "Save"
4. Vercel will auto-redeploy with the new variables

## Step 6: Test Production

### 6.1 Create Test Account
1. Go to your Vercel URL
2. Click "Sign Up"
3. Enter test email and password
4. Create account

### 6.2 Create Test Job
1. Click "New Job"
2. Option A: Manual entry
   - Title: "Senior React Developer"
   - Skills: React, TypeScript, Node.js
   - Experience: 3 years
   - Education: Bachelor's
   - Weights: Default (25, 25, 25, 25)
3. Option B: Upload job description (PDF)
   - Should auto-fill fields
4. Click "Create Job"

### 6.3 Upload Test CV
1. On Upload page, drag-drop a PDF resume
2. Watch status update: Uploading ? Extracting ? Checking ? Scored
3. Once Scored, click "View Results"

### 6.4 Check Results
1. See ranked candidates
2. Click a candidate to view:
   - Full profile (name, skills, experience, education, projects)
   - Score breakdown (component scores and rules)
   - Option to override eligibility

## Step 7: Monitor Deployment

### Vercel Dashboard
- Check function logs: https://vercel.com/dashboard ? Your Project ? Functions
- Monitor errors and performance

### Supabase Dashboard
- Check database queries: Project ? Logs
- Monitor storage usage
- Check auth sign-ups

---

## ?? Troubleshooting

### Error 401 Unauthorized
- Check SUPABASE_SERVICE_ROLE_KEY is set in Vercel
- Verify key is correct (no trailing spaces)
- Check JWT is being sent in API calls

### CV Processing Fails
- Check file is valid PDF/DOCX
- Check file size < 10MB
- Check GROK_API_KEY is valid and has quota
- Check Supabase Storage bucket exists (should be auto-created)

### Job Description Upload Fails
- Check /api/process-job is deployed
- Check Grok API key works
- Try uploading smaller file

### Database Connection Error
- Check VITE_SUPABASE_URL is correct
- Verify project is active in Supabase
- Check RLS policies are enabled

---

## ? Deployment Complete When:
- ? Vercel shows deployment successful
- ? Can access app URL without errors
- ? Can sign up and log in
- ? Can create a job
- ? Can upload a CV
- ? CV processes and shows scores
- ? Can view ranked results

---

## ?? Next Steps After Deployment
1. **Invite team members** via Supabase Auth
2. **Upload real job descriptions** to test
3. **Monitor performance** in Vercel/Supabase dashboards
4. **Scale database** if needed (Supabase auto-scaling)
5. **Set up alerts** for errors

---

**Total Setup Time: ~30-60 minutes**

Ready to start? Begin with Step 1 and follow the checklist!
