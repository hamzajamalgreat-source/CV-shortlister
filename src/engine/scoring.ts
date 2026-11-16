import {
  ComponentScores,
  EDUCATION_TIER_SCORES,
  EducationLevel,
  JobCriteria,
  ScoreWeights,
  ScoringResult,
} from '../types';
import { ExtractedProfile, ProjectEntry } from '../lib/schemas';

/** Rounds to 2 decimal places */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

const ROLE_WORDS = ['developed', 'built', 'implemented', 'designed', 'led'];
const RESULT_WORDS = ['improved', 'reduced', 'increased', 'deployed'];
const HAS_NUMBER = /\d/;

export function computeSkillsScore(
  candidateSkills: string[],
  requiredSkills: string[]
): number {
  if (requiredSkills.length === 0) return 100;
  const lower = candidateSkills.map((s) => s.toLowerCase());
  const matched = requiredSkills.filter((r) =>
    lower.includes(r.toLowerCase())
  ).length;
  return round2(Math.min((matched / requiredSkills.length) * 100, 100));
}

export function computeExperienceScore(
  actualYears: number,
  requiredYears: number
): number {
  if (requiredYears === 0) return 100;
  return round2(Math.min(actualYears / requiredYears, 1) * 100);
}

export function computeEducationScore(
  candidateDegree: EducationLevel,
  _requiredDegree: EducationLevel
): number {
  return EDUCATION_TIER_SCORES[candidateDegree];
}

export function computeProjectsScore(
  projects: ProjectEntry[],
  requiredSkills: string[]
): number {
  if (projects.length === 0) return 0;

  const lowerRequired = requiredSkills.map((s) => s.toLowerCase());

  const scores = projects.map((project) => {
    // techRelevance
    let techRelevance: number;
    if (requiredSkills.length === 0) {
      techRelevance = 0;
    } else {
      const matched = project.technologies.filter((t) =>
        lowerRequired.includes(t.toLowerCase())
      ).length;
      techRelevance = Math.min((matched / requiredSkills.length) * 100, 100);
    }

    // reqRelevance — heuristic on description length
    const descLen = project.description.length;
    const reqRelevance = descLen > 100 ? 100 : descLen > 50 ? 50 : 0;

    // evidenceQuality
    const desc = project.description.toLowerCase();
    const hasRole = ROLE_WORDS.some((w) => desc.includes(w));
    const hasResult =
      HAS_NUMBER.test(desc) || RESULT_WORDS.some((w) => desc.includes(w));
    const evidenceQuality = hasRole && hasResult ? 100 : hasRole || hasResult ? 50 : 0;

    return techRelevance * 0.5 + reqRelevance * 0.3 + evidenceQuality * 0.2;
  });

  const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  return round2(avg);
}

export function computeFinalScore(
  scores: ComponentScores,
  weights: ScoreWeights
): number {
  const raw =
    (scores.skills * weights.skills +
      scores.experience * weights.experience +
      scores.projects * weights.projects +
      scores.education * weights.education) /
    100;
  return round2(Math.min(Math.max(raw, 0), 100));
}

export function scoreCandidate(
  profile: ExtractedProfile,
  criteria: JobCriteria
): ScoringResult {
  const totalYears = profile.experience.reduce((sum, e) => sum + e.years, 0);

  const skills = computeSkillsScore(profile.skills, criteria.requiredSkills);
  const experience = computeExperienceScore(totalYears, criteria.minExperienceYears);
  const education = computeEducationScore(
    // Map extracted degree string to EducationLevel; default to 'None'
    normalizeEducationLevel(profile.education[0]?.degree),
    criteria.educationRequirement
  );
  const projects = computeProjectsScore(profile.projects, criteria.requiredSkills);

  const componentScores: ComponentScores = { skills, experience, education, projects };
  const finalScore = computeFinalScore(componentScores, criteria.weights);

  const lowerSkills = profile.skills.map((s) => s.toLowerCase());
  const preferredMatches = criteria.preferredSkills.filter((p) =>
    lowerSkills.includes(p.toLowerCase())
  );

  return {
    componentScores,
    finalScore,
    preferredMatches,
    explanation: {
      skillsRule: `Matched ${preferredMatches.length} preferred and scored ${skills}/100 on required skills`,
      experienceRule: `${totalYears} years vs ${criteria.minExperienceYears} required → ${experience}/100`,
      educationRule: `Degree tier score: ${education}/100`,
      projectsRule: `${profile.projects.length} project(s) scored → ${projects}/100`,
      evidenceSnippets: {},
    },
  };
}

/** Maps a free-text degree string to the nearest EducationLevel. */
function normalizeEducationLevel(degree: string | undefined): EducationLevel {
  if (!degree) return 'None';
  const d = degree.toLowerCase();
  if (d.includes('phd') || d.includes('doctor')) return 'PhD';
  if (d.includes('master')) return "Master's";
  if (d.includes('bachelor') || d.includes('b.sc') || d.includes('b.s') || d.includes('b.eng')) return "Bachelor's";
  if (d.includes('high school') || d.includes('secondary') || d.includes('a-level') || d.includes('hs')) return 'High School';
  return 'None';
}
