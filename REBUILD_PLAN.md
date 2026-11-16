# CV Screening System - Rebuild Plan (In Progress)

## ✅ Completed (This Session)

### Frontend (React + TypeScript)
- ✅ LoginPage.tsx - Supabase auth (email/password)
- ✅ SignUpPage.tsx - New recruiter registration  
- ✅ Home.tsx - Main dashboard (Muaaz UI pattern)
  - Job setup (title, description, mandatory requirements)
  - Weight sliders (Skills/Exp/Projects/Edu) - must sum 100%
  - Drag-drop CV upload zone (PDF/DOCX)
  - Results display (Eligible | Needs Review | Not Eligible)
  - Evidence breakdown expandable rows
- ✅ App.tsx - React Router setup
  - Public: /login, /signup
  - Protected: / (Home)

### Infrastructure
- ✅ Build passing (npm run build)
- ✅ Tests passing (npm test)
- ✅ TypeScript clean
- ✅ All code committed to GitHub

---

## ❌ Still Needed (Phase 3 - Backend API)

### API Layer Choice
You have 3 options for the backend:

**Option A: Node.js/Express (Fastest for your setup)**
```
POST http://localhost:3001/api/shortlist
Body: FormData (job_title, job_description, mandatory_requirements, weights, cv_files, top_n)
Returns: {eligible: [...], needs_review: [...], not_eligible: [...]}
```
- Files needed:
  - `backend/index.js` - Express server
  - `backend/routes/shortlist.js` - Main endpoint
  - `backend/engines/scoring.js` - Proposal formula
  - `backend/engines/eligibility.js` - Gate logic
  - `backend/parsers/cvParser.js` - PDF/DOCX extraction
  - `backend/llm/grokClient.js` - Grok integration

**Option B: Python/FastAPI** (If you prefer Python)
- Same structure as above

**Option C: Vercel Serverless Functions** (What your original spec designed)
- Requires deployment to Vercel


### What the API Needs to Do
1. Accept FormData with:
   - job_title (string)
   - job_description (string)
   - mandatory_requirements (JSON stringified array)
   - weights (JSON: {skills: 25, experience: 25, projects: 25, education: 25})
   - cv_files (File array)
   - top_n (number)

2. For each CV:
   - Extract text (PDF via pdf-parse, DOCX via mammoth.js)
   - Call Grok AI to extract structured profile
   - Validate with Zod schema
   - Score using YOUR proposal formula:
     ```
     final = (skills×ws + exp×we + proj×wp + edu×wd) / 100
     ```
   - Evaluate eligibility vs mandatory requirements
   - Classify: Eligible | Needs_Review | Not_Eligible

3. Return sorted results:
   ```json
   {
     "eligible": [ranked candidates],
     "needs_review": [unclear candidates],
     "not_eligible": [failed candidates]
   }
   ```

---

## Next Steps

### Pick Your Backend Stack:
1. **Quick Start (Node.js/Express):**
   - npm init -y && npm install express multer zod pdf-parse mammoth groq
   - Build in `backend/` directory
   - Run: node backend/index.js
   
2. **Using Existing Python:**
   - FastAPI + Python (if you have Python installed)
   - Run: pip install fastapi uvicorn zod-equivalent pdf-parse groq
   - Run: uvicorn backend.main:app --reload

3. **Stick with Original Spec (Vercel Serverless):**
   - Use existing `api/` directory structure
   - Deploy to Vercel when ready

---

## Building Block Files Needed

### Core Engine (You have this - already tested)
- ✅ src/engine/scoring.ts - Proposal formula
- ✅ src/engine/eligibility.ts - Gate logic
- ✅ src/engine/ranking.ts - Sorting

### API Code (Pick backend, then build these)
- [ ] CV text extraction (PDF + DOCX)
- [ ] Grok client (AI extraction)
- [ ] Scoring wrapper
- [ ] Eligibility wrapper
- [ ] Main `/api/shortlist` endpoint
- [ ] Form data handling
- [ ] Error handling & retry logic

### Frontend Integration
- [ ] Fix Home.tsx imports (remove unused `supabase`)
- [ ] Set API_URL environment variable
- [ ] Test end-to-end

---

## Timeline
- Phase 3 (Backend): 30-45 mins to complete
- Testing: 15 mins
- Deployment ready: ~1 hour

---

## Your Choice
**Which backend do you want?**
1. Node.js/Express - Quick, familiar
2. Python/FastAPI - Cleaner syntax
3. Vercel Functions - Matches original spec
