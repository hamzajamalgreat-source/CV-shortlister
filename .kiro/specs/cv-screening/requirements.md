# Requirements Document

## Introduction

The Intelligent CV Screening and Candidate Shortlisting System is a recruiter-facing web application that automates the evaluation of job applicants. Recruiters define job criteria and scoring weights, upload CVs in PDF or DOCX format, and the system extracts candidate profiles via Grok AI, scores them against the defined criteria, enforces mandatory requirement gates, and presents a ranked shortlist with evidence-backed score explanations. The system is deployed on Vercel with Supabase providing authentication, PostgreSQL storage, and file storage.

## Glossary

- **Recruiter**: An authenticated user who creates jobs and reviews candidate results.
- **Job**: A recruiter-defined opening with title, description, skill requirements, experience thresholds, education criteria, score weights, and mandatory requirements.
- **Candidate**: An applicant whose CV has been uploaded to a Job.
- **CV**: A curriculum vitae document in PDF or DOCX format.
- **Extracted_Profile**: A structured JSON object produced by the AI_Extractor containing candidate name, skills, experience entries, education entries, and project entries.
- **AI_Extractor**: The server-side module that sends CV text to the Grok API and receives a structured Extracted_Profile.
- **Scoring_Engine**: The pure TypeScript module that computes component scores and a weighted final score from an Extracted_Profile and Job criteria.
- **Component_Score**: One of four numeric scores (0–100) representing Skills, Experience, Projects, or Education.
- **Final_Score**: The weighted sum of Component_Scores divided by 100, bounded to the range [0, 100].
- **Mandatory_Requirement**: A job criterion that a candidate must satisfy; failure results in Not Eligible status.
- **Eligibility_Status**: One of three outcomes: Not_Eligible, Needs_Review, or Eligible.
- **Processing_Status**: The pipeline state of a CV: Uploaded, Extracting, Checking, Scored, Failed, or Needs_Review.
- **Shortlist**: The ranked list of Eligible candidates for a Job.
- **Evidence_Snippet**: A verbatim or paraphrased excerpt from a CV that justifies a score.
- **Score_Weight**: A recruiter-defined percentage (0–100) assigned to each Component_Score; all four weights must sum to exactly 100.
- **Row_Level_Security**: Supabase PostgreSQL policy that restricts data access to the authenticated owner.
- **Validator**: The Zod schema layer that validates Extracted_Profile objects before scoring.
- **Schema_Version**: An integer identifying the version of the Zod validation schema used during extraction.
- **Rule_Version**: An integer identifying the version of the Scoring_Engine rules used during scoring.

---

## Requirements

### Requirement 1: Recruiter Authentication

**User Story:** As a recruiter, I want to sign in with my email and password, so that I can securely access my jobs and candidate data.

#### Acceptance Criteria

1. WHEN a recruiter submits a valid email and password, THE Authentication_Service SHALL authenticate the recruiter and redirect them to the Dashboard.
2. WHEN a recruiter submits an invalid email or incorrect password, THE Authentication_Service SHALL display a descriptive error message and retain the email field value.
3. WHEN an unauthenticated user attempts to access any protected route, THE Router SHALL redirect them to the Login page.
4. THE Login_Page SHALL provide a visible link to a Sign Up page for new recruiters.
5. WHEN a recruiter successfully signs up with a valid email and password, THE Authentication_Service SHALL create a new recruiter account and redirect them to the Dashboard.
6. IF the Authentication_Service returns a network error during sign-in, THEN THE Login_Page SHALL display an error message and allow the recruiter to retry.

---

### Requirement 2: Job Management

**User Story:** As a recruiter, I want to create and manage job openings with full criteria definitions, so that I can configure the screening parameters for each role.

#### Acceptance Criteria

1. THE Dashboard SHALL display all Jobs owned by the authenticated recruiter, each with a title and a status badge.
2. WHEN a recruiter clicks the "New Job" button on the Dashboard, THE Router SHALL navigate to the Job_Setup_Page.
3. WHEN a recruiter submits a Job with a title, description, at least one required skill, and valid score weights, THE Job_Service SHALL persist the Job to the database and redirect the recruiter to the Job's CV_Upload_Page.
4. THE Job_Setup_Page SHALL provide a multi-tag input for required skills and a separate multi-tag input for preferred skills.
5. THE Job_Setup_Page SHALL provide a numeric input for minimum years of experience accepting values from 0 to 50.
6. THE Job_Setup_Page SHALL provide a dropdown for education requirement with options: None, High School, Bachelor's, Master's, PhD.
7. THE Job_Setup_Page SHALL provide four numeric inputs for Score_Weights labeled Skills %, Experience %, Projects %, and Education %.
8. WHILE the recruiter is editing Score_Weights, THE Job_Setup_Page SHALL display the live sum of the four inputs and highlight the sum in red when it does not equal 100.
9. IF a recruiter submits the Job_Setup_Page with Score_Weights that do not sum to 100, THEN THE Job_Setup_Page SHALL prevent form submission and display a validation error.
10. THE Job_Setup_Page SHALL provide a mechanism to add Mandatory_Requirements as free-text tags.
11. WHEN a recruiter saves an existing Job, THE Job_Service SHALL update the Job record and display a success notification.
12. IF the Job_Service fails to persist a Job, THEN THE Job_Setup_Page SHALL display an error message and retain all entered values.

---

### Requirement 3: CV Upload and Ingestion

**User Story:** As a recruiter, I want to upload multiple CVs at once, so that I can process all applicants for a job efficiently.

#### Acceptance Criteria

1. THE CV_Upload_Page SHALL accept PDF and DOCX file uploads via drag-and-drop and a file picker.
2. WHEN a recruiter selects or drops files, THE CV_Upload_Page SHALL display each file with its Processing_Status initialized to Uploaded.
3. THE CV_Upload_Page SHALL reject files that are not PDF or DOCX and display an inline error for each rejected file.
4. THE CV_Upload_Page SHALL reject files exceeding 10 MB and display an inline size error for each rejected file.
5. WHEN a file is accepted, THE Upload_Service SHALL store the file in the private Supabase Storage bucket and create a Candidate record with Processing_Status set to Uploaded.
6. WHEN a Candidate record is created, THE Processing_Pipeline SHALL automatically transition the Candidate's Processing_Status to Extracting and initiate text extraction.
7. THE CV_Upload_Page SHALL update each file's displayed Processing_Status in real time as it transitions through Uploaded → Extracting → Checking → Scored | Failed | Needs_Review.
8. WHEN a Candidate's Processing_Status becomes Failed, THE CV_Upload_Page SHALL display a Retry button for that file.
9. WHEN a recruiter clicks Retry on a failed Candidate, THE Processing_Pipeline SHALL re-initiate processing from the Extracting stage.
10. THE Upload_Service SHALL extract text from PDF files using pdf-parse and from DOCX files using Mammoth.js.
11. IF text extraction produces an empty string, THEN THE Processing_Pipeline SHALL set the Candidate's Processing_Status to Failed and record a descriptive warning.

---

### Requirement 4: AI-Powered Profile Extraction

**User Story:** As a recruiter, I want candidate profiles to be automatically extracted from uploaded CVs, so that I do not need to manually parse unstructured documents.

#### Acceptance Criteria

1. WHEN CV text is available, THE AI_Extractor SHALL send the text to the Grok API and receive a structured response.
2. THE AI_Extractor SHALL parse the Grok API response into an Extracted_Profile containing: candidate name, list of skills, list of experience entries (employer, title, duration in years, description), list of education entries (institution, degree, field), and list of project entries (name, technologies, description).
3. WHEN an Extracted_Profile is received, THE Validator SHALL validate it against the current Zod schema.
4. IF the Extracted_Profile fails Zod validation, THEN THE Processing_Pipeline SHALL set the Candidate's Processing_Status to Failed and store the validation errors as warnings.
5. WHEN the Extracted_Profile passes validation, THE Processing_Pipeline SHALL persist the Extracted_Profile to the candidate_analysis table with the current Schema_Version and transition Processing_Status to Checking.
6. IF the Grok API returns an error or times out after 30 seconds, THEN THE AI_Extractor SHALL retry the request once and, upon second failure, set the Candidate's Processing_Status to Failed.
7. THE AI_Extractor SHALL operate exclusively on the server side; the Grok API key SHALL NOT be exposed in client-side code.

---

### Requirement 5: Candidate Scoring

**User Story:** As a recruiter, I want each candidate to receive an objective score based on the job criteria and my defined weights, so that I can compare candidates consistently.

#### Acceptance Criteria

1. WHEN a validated Extracted_Profile is available, THE Scoring_Engine SHALL compute a Skills_Score as: (number of required skills matched / total number of required skills) × 100.
2. WHEN a validated Extracted_Profile is available, THE Scoring_Engine SHALL compute an Experience_Score as: min(total years of experience / required minimum years, 1) × 100. WHERE the required minimum years is 0, THE Scoring_Engine SHALL assign an Experience_Score of 100.
3. WHEN a validated Extracted_Profile is available, THE Scoring_Engine SHALL compute an Education_Score using the following tiers: PhD = 100, Master's = 70, Bachelor's = 50, High School or below = 0, relative to the job's education requirement; a degree at or above the requirement SHALL receive full tier credit.
4. WHEN a validated Extracted_Profile is available, THE Scoring_Engine SHALL compute a Projects_Score as the average across all project entries of: (Tech_Relevance × 0.5 + Requirement_Relevance × 0.3 + Evidence_Quality × 0.2), where each sub-score is 0–100.
5. WHEN Component_Scores are computed, THE Scoring_Engine SHALL compute the Final_Score as: (Skills_Score × Skills_Weight + Experience_Score × Experience_Weight + Projects_Score × Projects_Weight + Education_Score × Education_Weight) / 100.
6. THE Scoring_Engine SHALL round all Component_Scores and the Final_Score to two decimal places.
7. WHEN scoring is complete, THE Scoring_Engine SHALL store the component scores, Final_Score, preferred skill matches, score explanation, and Rule_Version in the candidate_scores table.
8. IF the Extracted_Profile contains no project entries, THEN THE Scoring_Engine SHALL assign a Projects_Score of 0.

---

### Requirement 6: Mandatory Requirement Gating

**User Story:** As a recruiter, I want candidates who fail mandatory requirements to be automatically excluded from the shortlist, so that I only review qualified applicants.

#### Acceptance Criteria

1. WHEN Component_Scores are computed, THE Eligibility_Engine SHALL evaluate each Mandatory_Requirement against the Extracted_Profile.
2. IF a candidate fails one or more Mandatory_Requirements with certainty, THEN THE Eligibility_Engine SHALL set the Candidate's Eligibility_Status to Not_Eligible.
3. IF a Mandatory_Requirement cannot be verified from the Extracted_Profile, THEN THE Eligibility_Engine SHALL set the Candidate's Eligibility_Status to Needs_Review.
4. WHEN all Mandatory_Requirements are satisfied, THE Eligibility_Engine SHALL set the Candidate's Eligibility_Status to Eligible.
5. WHEN a Candidate's Eligibility_Status is set, THE Processing_Pipeline SHALL set the Processing_Status to Scored and persist the Eligibility_Status to the candidates table.

---

### Requirement 7: Candidate Ranking and Shortlist Display

**User Story:** As a recruiter, I want to see candidates ranked by their final score with tie-break rules applied, so that I can quickly identify the strongest applicants.

#### Acceptance Criteria

1. THE Results_Page SHALL display a ranked table of Eligible candidates for the selected Job, ordered by Final_Score descending.
2. WHEN two Eligible candidates have the same Final_Score, THE Ranking_Engine SHALL apply tie-break order: (1) number of preferred skills matched descending, (2) Projects_Score descending, (3) Experience_Score descending, (4) Candidate record creation order ascending.
3. THE Results_Page SHALL display for each Eligible candidate: rank, candidate name, Final_Score, and all four Component_Scores.
4. WHEN a recruiter expands a candidate row, THE Results_Page SHALL display the score explanation and Evidence_Snippets for each Component_Score.
5. THE Results_Page SHALL display a separate flagged section listing Not_Eligible and Needs_Review candidates with their Eligibility_Status and reasons.
6. THE Results_Page SHALL update automatically when new candidates finish processing without requiring a full page reload.

---

### Requirement 8: Candidate Detail View

**User Story:** As a recruiter, I want to view the full extracted profile and score breakdown for a candidate, so that I can make an informed decision on each applicant.

#### Acceptance Criteria

1. WHEN a recruiter clicks a candidate on the Results_Page, THE Router SHALL navigate to the Candidate_Detail_Page for that candidate.
2. THE Candidate_Detail_Page SHALL display the Extracted_Profile including name, skills, experience entries, education entries, and project entries.
3. THE Candidate_Detail_Page SHALL display all four Component_Scores with the scoring rules applied to produce each score.
4. THE Candidate_Detail_Page SHALL display Evidence_Snippets from the CV for each Component_Score.
5. THE Candidate_Detail_Page SHALL provide a button to mark the candidate as Reviewed.
6. THE Candidate_Detail_Page SHALL provide a mechanism for the recruiter to override the Eligibility_Status with a reason.
7. WHEN a recruiter overrides Eligibility_Status, THE Candidate_Service SHALL persist the override and reason to the candidates table and reflect the change on the Results_Page.

---

### Requirement 9: Data Security and Privacy

**User Story:** As a system operator, I want all candidate and job data to be protected by access control policies, so that recruiters can only access their own data.

#### Acceptance Criteria

1. THE Database SHALL enforce Row_Level_Security policies on the jobs, candidates, candidate_analysis, and candidate_scores tables such that all queries are restricted to rows where owner_id equals the authenticated user's ID.
2. THE Supabase_Storage SHALL store CVs in a private bucket that requires authenticated access.
3. THE Grok_API_Key SHALL be stored exclusively as a server-side environment variable and SHALL NOT appear in any client-side bundle or log output.
4. THE Processing_Pipeline SHALL NOT include raw CV text in any application log entries.
5. WHEN a recruiter signs out, THE Authentication_Service SHALL invalidate the recruiter's session token.
6. THE API_Layer SHALL reject all requests lacking a valid Supabase session token with a 401 response.

---

### Requirement 10: CV Text Parsing

**User Story:** As a system operator, I want CV text to be reliably extracted from both PDF and DOCX files, so that the AI extraction step receives complete input.

#### Acceptance Criteria

1. WHEN a PDF file is processed, THE Text_Extractor SHALL use pdf-parse to extract all readable text from the document.
2. WHEN a DOCX file is processed, THE Text_Extractor SHALL use Mammoth.js to extract all readable text from the document.
3. THE Text_Extractor SHALL preserve paragraph structure in the extracted text to aid AI extraction accuracy.
4. IF pdf-parse or Mammoth.js throws an exception, THEN THE Text_Extractor SHALL catch the exception, record it as a warning, and return an empty string to trigger the Failed pipeline transition.
5. THE Text_Extractor SHALL operate exclusively on the server side within a Vercel Function.

---

### Requirement 11: Zod Schema Validation

**User Story:** As a developer, I want all AI-extracted profiles to be validated against a schema before scoring, so that the Scoring_Engine receives only well-formed data.

#### Acceptance Criteria

1. THE Validator SHALL define a Zod schema for Extracted_Profile that requires: name (string), skills (array of strings), experience (array of objects with employer, title, years, description), education (array of objects with institution, degree, field), and projects (array of objects with name, technologies array, description).
2. WHEN the Validator receives an Extracted_Profile, THE Validator SHALL parse it through the Zod schema and return a typed result.
3. IF the Zod schema parse fails, THEN THE Validator SHALL return a structured error containing the field paths and failure reasons.
4. THE Validator SHALL coerce numeric fields (such as years of experience) from string representations where the source data provides them as strings.
5. THE Validator SHALL accept empty arrays for skills, experience, education, and projects as valid, partial profiles.

---

### Requirement 12: Processing Pipeline Observability

**User Story:** As a developer, I want processing status transitions to be tracked in the database, so that I can diagnose failures and monitor pipeline throughput.

#### Acceptance Criteria

1. WHEN a Candidate's Processing_Status changes, THE Processing_Pipeline SHALL update the processing_status column in the candidates table within 5 seconds of the transition.
2. WHEN a failure occurs at any pipeline stage, THE Processing_Pipeline SHALL record a structured warning in the candidate_analysis warnings field identifying the stage and failure reason.
3. THE Processing_Pipeline SHALL record the analyzed_at timestamp in candidate_analysis when extraction completes.
4. THE Processing_Pipeline SHALL record the scored_at timestamp in candidate_scores when scoring completes.
5. THE CV_Upload_Page SHALL poll or subscribe to Processing_Status changes and reflect updates within 3 seconds of the database change.
