# Implementation Plan: Intelligent CV Screening and Candidate Shortlisting System

## Overview

Implementation follows a bottom-up dependency order: project scaffold → database → shared types and schemas → pure engine modules → API layer → frontend pages. Each task builds on the previous ones and ends with wiring components together. Property-based tests are placed close to the implementation they validate to catch regressions early.

---

## Tasks

- [x] 1. Scaffold project structure and install dependencies
  - Initialize Vite + React + TypeScript project at workspace root (`npm create vite@latest . -- --template react-ts`)
  - Install runtime dependencies: `@supabase/supabase-js`, `react-router-dom`, `tailwindcss`, `postcss`, `autoprefixer`, `zod`, `mammoth`, `pdf-parse`
  - Install dev dependencies: `vitest`, `@vitest/ui`, `jsdom`, `@testing-library/react`, `@testing-library/user-event`, `fast-check`, `@types/pdf-parse`, `@types/mammoth`
  - Configure Tailwind CSS (`npx tailwindcss init -p`) and add directives to `src/index.css`
  - Configure Vitest in `vite.config.ts` with jsdom environment and globals
  - Create directory structure: `src/pages/`, `src/components/`, `src/lib/`, `src/engine/`, `src/hooks/`, `src/types/`, `api/`, `supabase/migrations/`
  - Create `.env.local` template (not committed) with `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `GROK_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
  - Create `vercel.json` routing config mapping `api/**` to Vercel Functions
  - _Requirements: All_

- [x] 2. Define shared TypeScript types and Zod schemas
  - [x] 2.1 Create `src/types/index.ts` with all shared types
    - Define `ProcessingStatus`, `EligibilityStatus`, `EducationLevel` union types
    - Define `EDUCATION_LEVELS` array and `EDUCATION_TIER_SCORES` record
    - Define `ScoreWeights`, `ComponentScores`, `JobCriteria`, `ScoringResult`, `EligibilityResult`, `RankedCandidate` interfaces
    - Define database row types: `Job`, `Candidate`, `CandidateAnalysis`, `CandidateScore`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1_

  - [x] 2.2 Create `src/lib/schemas.ts` with Zod schemas for Extracted_Profile
    - Implement `ExperienceEntrySchema`, `EducationEntrySchema`, `ProjectEntrySchema`, `ExtractedProfileSchema`
    - Use `z.coerce.number()` for years fields to handle string-encoded numbers
    - Export inferred TypeScript types alongside schemas
    - _Requirements: 11.1, 11.4_

  - [x]* 2.3 Write property test for Zod schema validation
    - **Property 9: Validator round-trip and coercion** — for any valid profile where years may be numeric strings, parse succeeds and years are numbers
    - **Property 10: Validator error structure on invalid input** — for any profile missing required fields or with wrong types, parse fails with path-annotated errors
    - **Validates: Requirements 11.2, 11.3, 11.4**
    - File: `src/lib/schemas.property.test.ts`

- [x] 3. Implement Scoring Engine
  - [x] 3.1 Create `src/engine/scoring.ts` with pure scoring functions
    - Implement `computeSkillsScore(candidateSkills, requiredSkills)`: case-insensitive intersection / required length × 100, rounded to 2 dp
    - Implement `computeExperienceScore(actualYears, requiredYears)`: `min(actual/required, 1) × 100`; return 100 when required is 0; round to 2 dp
    - Implement `computeEducationScore(candidateDegree, requiredDegree)`: look up candidate tier from `EDUCATION_TIER_SCORES`, return tier value regardless of requirement (requirement used for display context only)
    - Implement `computeProjectsScore(projects, requiredSkills)`: compute per-project `(tech×0.5 + req×0.3 + evidence×0.2)`, average across projects, return 0 for empty list, round to 2 dp
    - Implement `computeFinalScore(scores, weights)`: weighted sum divided by 100, round to 2 dp, clamp to [0, 100]
    - Implement `scoreCandidate(profile, criteria)`: orchestrate all sub-functions, compute preferred skill matches, build explanation object
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

  - [x]* 3.2 Write unit tests for Scoring Engine edge cases
    - Test `computeSkillsScore` with zero required skills (return 0 or 100 as defined), empty candidate skills
    - Test `computeExperienceScore` with 0 required years → 100, actual > required → cap at 100
    - Test `computeEducationScore` for each EducationLevel pair
    - Test `computeProjectsScore` with empty project list → 0
    - File: `src/engine/scoring.test.ts`

  - [x]* 3.3 Write property tests for Scoring Engine
    - **Property 2: Skills_Score formula correctness** — for any requiredSkills (non-empty) and candidateSkills, score = intersection/required × 100 rounded 2dp, in [0,100]
    - **Property 3: Experience_Score formula correctness** — for any (actual, required) ≥ 0, score = min(actual/required,1)×100 when required>0; 100 when required=0
    - **Property 4: Education_Score tier ordering** — for any (candidate, required) degree pair, score = EDUCATION_TIER_SCORES[candidateDegree]
    - **Property 5: Projects_Score weighted average** — for any non-empty project list with sub-scores in [0,100], score = mean of weighted sums
    - **Property 6: Final_Score weighted sum, bounds, and rounding** — for any component scores in [0,100] and weights summing to 100, finalScore = weighted sum / 100, in [0,100], 2dp
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.8**
    - File: `src/engine/scoring.property.test.ts`

- [x] 4. Implement Eligibility Engine
  - [x] 4.1 Create `src/engine/eligibility.ts` with pure eligibility evaluation
    - Implement `evaluateEligibility(profile, mandatoryRequirements)`:
      - For each requirement string, check if candidate profile text/skills/experience satisfy it using keyword matching
      - Categorise each requirement as: satisfied, failed, or unclear
      - If any requirement is failed → `Not_Eligible`
      - Else if any requirement is unclear → `Needs_Review`
      - Else → `Eligible`
    - Return `EligibilityResult` with status, `failedRequirements[]`, and `unclearRequirements[]`
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x]* 4.2 Write unit tests for Eligibility Engine edge cases
    - Test empty mandatory requirements → always Eligible
    - Test all requirements unclear → Needs_Review
    - Test mix of failed and unclear → Not_Eligible (failed takes priority)
    - File: `src/engine/eligibility.test.ts`

  - [x]* 4.3 Write property tests for Eligibility Engine
    - **Property 7: Eligibility gate correctness** — (a) any profile failing ≥1 requirement → Not_Eligible; (b) no failures, ≥1 unclear → Needs_Review; (c) all satisfied → Eligible
    - **Validates: Requirements 6.2, 6.3, 6.4**
    - File: `src/engine/eligibility.property.test.ts`

- [x] 5. Implement Ranking Engine
  - [x] 5.1 Create `src/engine/ranking.ts` with pure candidate ranking
    - Implement `rankCandidates(candidates)`: sort Eligible candidates by Final_Score descending; apply tie-break: preferred_matches desc → Projects_Score desc → Experience_Score desc → created_at asc (record order); assign sequential rank integers starting from 1
    - _Requirements: 7.1, 7.2_

  - [x]* 5.2 Write unit tests for Ranking Engine edge cases
    - Test single candidate → rank 1
    - Test all tied on all criteria → stable order by record number
    - File: `src/engine/ranking.test.ts`

  - [x]* 5.3 Write property tests for Ranking Engine
    - **Property 8: Tie-break ordering consistency and transitivity** — for any list of candidates with equal Final_Scores, ranking is consistent across multiple calls and follows the specified priority order
    - **Validates: Requirements 7.2**
    - File: `src/engine/ranking.property.test.ts`

- [x] 6. Checkpoint — ensure all engine tests pass
  - Run `npx vitest --run src/engine` and `npx vitest --run src/lib`
  - All tests must pass before proceeding. Ask the user if questions arise.

- [x] 7. Set up Supabase schema and migrations
  - [x] 7.1 Create `supabase/migrations/001_initial_schema.sql`
    - Write CREATE TABLE statements for `jobs`, `candidates`, `candidate_analysis`, `candidate_scores` matching the design data model
    - Add TIMESTAMPTZ columns with DEFAULT now()
    - _Requirements: 9.1_

  - [x] 7.2 Create `supabase/migrations/002_rls_policies.sql`
    - Enable RLS on all four tables
    - Write USING and WITH CHECK policies for each table based on owner_id = auth.uid() chain through foreign keys
    - _Requirements: 9.1_

  - [x] 7.3 Create `supabase/migrations/003_storage_bucket.sql`
    - Create private storage bucket named `cvs`
    - Add RLS policy allowing authenticated users to upload to their own job's folder (`owner_id/job_id/filename`)
    - _Requirements: 9.2_

- [x] 8. Implement Supabase and Grok client libraries
  - [x] 8.1 Create `src/lib/supabase.ts`
    - Export `supabase` browser client using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
    - Export `createServerClient()` factory using `SUPABASE_SERVICE_ROLE_KEY` (used only in `api/`)
    - _Requirements: 9.1_

  - [x] 8.2 Create `src/lib/grokClient.ts`
    - Implement `extractProfile(cvText: string): Promise<unknown>` calling Grok API via `fetch` with 30-second timeout using `AbortController`
    - Implement single retry on timeout or 5xx: wait 5 seconds then retry once
    - Never log `cvText` or API key value
    - Export only server-side; add comment warning against client-side import
    - _Requirements: 4.1, 4.6, 4.7, 9.3_

- [x] 9. Implement Vercel Function: `api/process-cv.ts`
  - Validate request body with Zod (`candidateId`, `jobId` as UUIDs)
  - Verify JWT via Supabase auth, return 401 if invalid
  - Load Job and Candidate records; return 404 if not found or not owned
  - Transition `processing_status` → `Extracting`; update candidates table
  - Download CV bytes from Supabase Storage
  - Extract text: call `pdf-parse` for PDF, `mammoth.extractRawText` for DOCX; detect type from stored filename extension
  - If text is empty: set status → `Failed`, record warning, return 422
  - Call `grokClient.extractProfile(text)`, handle retry logic
  - Validate response with `ExtractedProfileSchema`; on failure set status → `Failed`, store warnings, return 422
  - Transition status → `Checking`; insert into `candidate_analysis`
  - Call `scoreCandidate(profile, criteria)` and `evaluateEligibility(profile, mandatory)`
  - Insert into `candidate_scores`; update `candidates.eligibility_status` and `processing_status` → `Scored`
  - Return `ProcessCvResponse`
  - _Requirements: 3.5, 3.6, 3.10, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 5.7, 6.5, 9.3, 9.4, 9.6, 12.1, 12.2, 12.3, 12.4_

- [x] 10. Implement Vercel Function: `api/score-candidate.ts`
  - Mirror JWT validation and ownership check from `process-cv.ts`
  - Load existing `candidate_analysis` record; return 404 if not found
  - Re-run `scoreCandidate` and `evaluateEligibility` with current job criteria
  - Upsert `candidate_scores` row; update `candidates.eligibility_status` and `processing_status`
  - _Requirements: 5.7, 6.5_

- [x] 11. Checkpoint — verify API functions compile and auth middleware works
  - Run `npx tsc --noEmit` to verify no TypeScript errors
  - Verify that `api/process-cv.ts` and `api/score-candidate.ts` import only server-safe modules (no Vite env vars)
  - Ask the user if questions arise.

- [x] 12. Implement authentication pages and routing
  - [x] 12.1 Create `src/lib/supabase.ts` auth helpers
    - Export `signIn(email, password)`, `signUp(email, password)`, `signOut()` wrappers
    - _Requirements: 1.1, 1.5_

  - [x] 12.2 Create `src/pages/LoginPage.tsx`
    - Email + password form with controlled inputs
    - Call `signIn()` on submit; redirect to `/dashboard` on success
    - Display Supabase error message on failure; retain email field value
    - Include "Sign up" link to `/signup`
    - _Requirements: 1.1, 1.2, 1.4, 1.6_

  - [x] 12.3 Create `src/pages/SignUpPage.tsx`
    - Email + password form; call `signUp()` on submit; redirect to `/dashboard` on success
    - Display error message on failure
    - _Requirements: 1.5_

  - [x] 12.4 Create `src/components/common/ProtectedRoute.tsx`
    - HOC that checks Supabase session; redirects to `/login` if no session
    - _Requirements: 1.3_

  - [x] 12.5 Configure `src/App.tsx` with React Router routes
    - Public routes: `/login`, `/signup`
    - Protected routes (wrapped in `ProtectedRoute`): `/dashboard`, `/jobs/new`, `/jobs/:id/edit`, `/jobs/:id/upload`, `/jobs/:id/results`, `/jobs/:id/candidates/:cid`
    - Default redirect: `/` → `/dashboard`
    - _Requirements: 1.3_

- [x] 13. Implement Dashboard page
  - Create `src/hooks/useJobs.ts` — Supabase query for all jobs owned by current user, ordered by created_at desc
  - Create `src/components/dashboard/JobCard.tsx` — displays job title, created date, candidate count, and a `StatusBadge` for job status
  - Create `src/components/common/StatusBadge.tsx` — maps `ProcessingStatus` / `EligibilityStatus` to colored badge
  - Create `src/pages/DashboardPage.tsx` — renders `JobList` with `JobCard` items; "New Job" button navigates to `/jobs/new`
  - _Requirements: 2.1, 2.2_

- [x] 14. Implement Job Setup page
  - [x] 14.1 Create `src/components/job-setup/SkillTagInput.tsx`
    - Controlled tag input: press Enter or comma to add a tag; click × to remove
    - _Requirements: 2.4_

  - [x] 14.2 Create `src/components/job-setup/WeightInputGroup.tsx`
    - Four numeric inputs labeled Skills %, Experience %, Projects %, Education %
    - Display live sum; show sum in red and "Must equal 100" message when sum ≠ 100
    - _Requirements: 2.7, 2.8_

  - [x]* 14.3 Write property test for WeightInputGroup live sum logic
    - **Property 1: Score_Weights live sum accuracy** — for any four numeric inputs, the computed sum equals their arithmetic sum; error state is true iff sum ≠ 100
    - **Validates: Requirements 2.8, 2.9**
    - File: `src/components/WeightInputGroup.property.test.ts`

  - [x] 14.4 Create `src/components/job-setup/MandatoryRequirements.tsx`
    - Free-text tag input for adding mandatory requirement strings
    - _Requirements: 2.10_

  - [x] 14.5 Create `src/pages/JobSetupPage.tsx`
    - Form with: title (text), description (textarea), SkillTagInput for required/preferred skills, experience numeric input [0–50], education dropdown, WeightInputGroup, MandatoryRequirements
    - Client-side validation: title required, weights sum = 100; inline error messages
    - On submit: `POST` to Supabase `jobs` table via `useJobForm` hook; redirect to `/jobs/:id/upload`
    - Support editing existing jobs (`/jobs/:id/edit`) by loading existing data
    - _Requirements: 2.3, 2.5, 2.6, 2.7, 2.9, 2.11, 2.12_

- [x] 15. Implement CV Upload page
  - [x] 15.1 Create `src/components/upload/DropZone.tsx`
    - Accept PDF and DOCX via drag-and-drop and file picker (`accept=".pdf,.docx"`)
    - Validate file type (`.pdf` / `.docx`) and size (≤ 10 MB) client-side; display inline errors for rejected files
    - _Requirements: 3.1, 3.3, 3.4_

  - [x] 15.2 Create `src/hooks/useFileUpload.ts`
    - Upload accepted file to Supabase Storage bucket `cvs` at path `{owner_id}/{job_id}/{uuid}_{filename}`
    - Insert `candidates` row with `processing_status = 'Uploaded'`
    - Call `POST /api/process-cv` with `{candidateId, jobId}`
    - Track per-file status in local state
    - _Requirements: 3.2, 3.5, 3.6_

  - [x] 15.3 Create `src/components/upload/FileStatusRow.tsx`
    - Display filename, `StatusBadge` for current `ProcessingStatus`, spinner while processing
    - Show Retry button when status is `Failed`; on click re-call `POST /api/process-cv`
    - _Requirements: 3.2, 3.7, 3.8, 3.9_

  - [x] 15.4 Create `src/hooks/useCandidateSubscription.ts`
    - Subscribe to Supabase Realtime channel on `candidates` table filtered by `job_id`
    - Update local state on `UPDATE` events to reflect new `processing_status`
    - _Requirements: 3.7, 12.5_

  - [x] 15.5 Create `src/pages/UploadPage.tsx`
    - Compose `DropZone`, `FileStatusRow` list, and `useCandidateSubscription`
    - Show overall job stats (total uploaded, processing, scored, failed)
    - Link to Results page once at least one candidate is Scored
    - _Requirements: 3.1, 3.7_

- [x] 16. Checkpoint — verify upload pipeline end-to-end with a test CV
  - Ensure all tests pass (`npx vitest --run`)
  - Manually verify (or write an integration test) that a PDF upload transitions through all statuses to Scored
  - Ask the user if questions arise.

- [x] 17. Implement Results / Shortlist page
  - [x] 17.1 Create `src/hooks/useResults.ts`
    - Query `candidates` + `candidate_scores` for a given `job_id`, joining on `candidate_id`
    - Separate Eligible (ranked) from Not_Eligible and Needs_Review
    - Subscribe to Realtime updates on the candidates table for the job
    - _Requirements: 7.1, 7.6_

  - [x] 17.2 Create `src/components/results/ScoreBreakdown.tsx`
    - Expandable panel showing explanation object fields: rules applied, Evidence_Snippets per component
    - _Requirements: 7.4_

  - [x] 17.3 Create `src/components/results/CandidateTable.tsx`
    - Renders ranked list: rank, name, Final_Score, four Component_Scores, expand toggle
    - Each row links to `/jobs/:id/candidates/:cid`
    - _Requirements: 7.1, 7.3_

  - [x] 17.4 Create `src/components/results/FlaggedSection.tsx`
    - Collapsible section for Not_Eligible and Needs_Review candidates with reason display
    - _Requirements: 7.5_

  - [x] 17.5 Create `src/pages/ResultsPage.tsx`
    - Compose `CandidateTable`, `FlaggedSection`, job summary header
    - _Requirements: 7.1, 7.5_

- [x] 18. Implement Candidate Detail page
  - [x] 18.1 Create `src/hooks/useCandidate.ts`
    - Query `candidates`, `candidate_analysis`, and `candidate_scores` for a given `candidateId`
    - _Requirements: 8.1_

  - [x] 18.2 Create `src/components/candidate-detail/ProfileSection.tsx`
    - Display name, skills list, experience entries (employer, title, years, description), education entries, project entries from Extracted_Profile
    - _Requirements: 8.2_

  - [x] 18.3 Create `src/components/candidate-detail/ScoreDetail.tsx`
    - Display each component score with the scoring rule applied and Evidence_Snippets from CV
    - _Requirements: 8.3, 8.4_

  - [x] 18.4 Create `src/components/candidate-detail/StatusOverrideForm.tsx`
    - Dropdown to select override Eligibility_Status + free-text reason field
    - On submit: PATCH `candidates` table via Supabase JS; show success/error feedback
    - _Requirements: 8.6, 8.7_

  - [x] 18.5 Create `src/pages/CandidateDetailPage.tsx`
    - Compose `ProfileSection`, `ScoreDetail` (one per component), "Mark as Reviewed" button, `StatusOverrideForm`
    - "Mark as Reviewed" updates `override_status = 'Reviewed'` in candidates table
    - _Requirements: 8.1, 8.2, 8.3, 8.5, 8.6_

- [x] 19. Add Kiro steering skills to project
  - Create `src/AGENTS.md` following the Ponytail lean code standards format (stub file; content to be populated from DietrichGebert/ponytail)
  - Run `npx impeccable install` in the workspace root to install the Impeccable design vocabulary steering file into `.kiro/steering/`
  - Create `.kiro/skills/` directory and add Frontend-Design-Audit skill file following the mistyhx/frontend-design-audit structure
  - _Requirements: All (code quality tooling)_

- [x] 20. Checkpoint — final test run and TypeScript verification
  - Run `npx vitest --run` — all tests must pass
  - Run `npx tsc --noEmit` — zero TypeScript errors
  - Verify `.env.local` is in `.gitignore`
  - Verify no Grok API key references in `src/` (client-side) files
  - Ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP; property tests add long-term correctness guarantees but are not required to ship
- The Scoring_Engine, Eligibility_Engine, and Ranking_Engine are pure functions — they can be developed and fully tested before any UI or API work
- Supabase Realtime subscriptions in `useCandidateSubscription` require the Realtime feature to be enabled in the Supabase project dashboard
- The Grok API prompt in `grokClient.ts` may need tuning for the specific model version; keep prompt engineering isolated in that module
- All database migrations should be applied via `supabase db push` or the Supabase dashboard SQL editor before running the app locally
- Property tests use `fast-check` arbitraries; the minimum run count is set via `fc.assert(fc.property(...), { numRuns: 100 })`
