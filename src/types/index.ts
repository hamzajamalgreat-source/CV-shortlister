// ─── Status Union Types ───────────────────────────────────────────────────────

export type ProcessingStatus =
  | 'Uploaded'
  | 'Extracting'
  | 'Checking'
  | 'Scored'
  | 'Failed'
  | 'Needs_Review';

export type EligibilityStatus = 'Eligible' | 'Not_Eligible' | 'Needs_Review';

export type EducationLevel =
  | 'None'
  | 'High School'
  | "Bachelor's"
  | "Master's"
  | 'PhD';

// ─── Education Constants ──────────────────────────────────────────────────────

export const EDUCATION_LEVELS: readonly EducationLevel[] = [
  'None',
  'High School',
  "Bachelor's",
  "Master's",
  'PhD',
] as const;

export const EDUCATION_TIER_SCORES: Record<EducationLevel, number> = {
  None: 0,
  'High School': 0,
  "Bachelor's": 50,
  "Master's": 70,
  PhD: 100,
};

// ─── Scoring Interfaces ───────────────────────────────────────────────────────

export interface ScoreWeights {
  skills: number;
  experience: number;
  projects: number;
  education: number;
}

export interface ComponentScores {
  skills: number;
  experience: number;
  projects: number;
  education: number;
}

export interface JobCriteria {
  requiredSkills: string[];
  preferredSkills: string[];
  minExperienceYears: number;
  educationRequirement: EducationLevel;
  weights: ScoreWeights;
}

export interface ScoreExplanation {
  skillsRule: string;
  experienceRule: string;
  educationRule: string;
  projectsRule: string;
  evidenceSnippets: Record<string, string[]>;
}

export interface ScoringResult {
  componentScores: ComponentScores;
  finalScore: number;
  preferredMatches: string[];
  explanation: ScoreExplanation;
}

// ─── Eligibility Interfaces ───────────────────────────────────────────────────

export interface EligibilityResult {
  status: EligibilityStatus;
  failedRequirements: string[];
  unclearRequirements: string[];
}

// ─── Ranking Interfaces ───────────────────────────────────────────────────────

export interface RankedCandidate {
  candidateId: string;
  name: string;
  finalScore: number;
  componentScores: ComponentScores;
  preferredMatches: number;
  rank: number;
  createdAt: string;
}

// ─── Database Row Types ───────────────────────────────────────────────────────

/**
 * Row type for the `jobs` table.
 * Matches the SQL schema: id, owner_id, title, description, criteria, weights,
 * mandatory_requirements, created_at, updated_at.
 */
export interface Job {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  criteria: JobCriteria;
  weights: ScoreWeights;
  mandatory_requirements: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Row type for the `candidates` table.
 * Matches the SQL schema: id, job_id, filename, storage_path,
 * processing_status, eligibility_status, override_status, override_reason,
 * created_at.
 */
export interface Candidate {
  id: string;
  job_id: string;
  filename: string;
  storage_path: string;
  processing_status: ProcessingStatus;
  eligibility_status: EligibilityStatus | null;
  override_status: EligibilityStatus | null;
  override_reason: string | null;
  created_at: string;
}

/**
 * Row type for the `candidate_analysis` table.
 * Matches the SQL schema: id, candidate_id, schema_version,
 * extracted_profile, evidence_snippets, warnings, analyzed_at.
 */
export interface CandidateAnalysis {
  id: string;
  candidate_id: string;
  schema_version: number;
  extracted_profile: Record<string, unknown>;
  evidence_snippets: Record<string, string[]> | null;
  warnings: Record<string, unknown>[] | null;
  analyzed_at: string;
}

/**
 * Row type for the `candidate_scores` table.
 * Matches the SQL schema: id, candidate_id, rule_version, component_scores,
 * preferred_matches, final_score, rank, explanation, scored_at.
 */
export interface CandidateScore {
  id: string;
  candidate_id: string;
  rule_version: number;
  component_scores: ComponentScores;
  preferred_matches: string[] | null;
  final_score: number;
  rank: number | null;
  explanation: ScoreExplanation | null;
  scored_at: string;
}
