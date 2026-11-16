// Proposal Scoring Formula: (skills×ws + exp×we + proj×wp + edu×wd) / 100

const EDUCATION_TIERS = {
  "High School": 0,
  "Bachelor": 50,
  "Master": 70,
  "PhD": 100,
};

function computeSkillsScore(candidateSkills = [], requiredSkills = []) {
  if (!requiredSkills || requiredSkills.length === 0) return 100;
  if (!candidateSkills || candidateSkills.length === 0) return 0;

  const normalized = candidateSkills.map(s => s.toLowerCase());
  const required = requiredSkills.map(s => s.toLowerCase());
  
  const matches = normalized.filter(s => required.includes(s)).length;
  const score = (matches / required.length) * 100;
  
  return Math.round(score * 100) / 100;
}

function computeExperienceScore(actualYears = 0, requiredYears = 0) {
  if (requiredYears === 0) return 100;
  const score = Math.min(actualYears / requiredYears, 1) * 100;
  return Math.round(score * 100) / 100;
}

function computeEducationScore(candidateDegree = "High School") {
  return EDUCATION_TIERS[candidateDegree] || 0;
}

function computeProjectsScore(projects = []) {
  if (!projects || projects.length === 0) return 0;
  // Simple: average score based on project count
  const baseScore = Math.min(projects.length * 25, 100);
  return Math.round(baseScore * 100) / 100;
}

function scoreCandidate(profile, weights) {
  const skillsScore = computeSkillsScore(profile.skills || [], []);
  const experienceScore = computeExperienceScore(profile.experience_years || 0, 0);
  const projectsScore = computeProjectsScore(profile.projects || []);
  const educationScore = computeEducationScore(profile.education || "High School");

  const final = Math.round(
    ((skillsScore * weights.skills +
      experienceScore * weights.experience +
      projectsScore * weights.projects +
      educationScore * weights.education) / 100) * 100
  ) / 100;

  return {
    skills: Math.round(skillsScore * 100) / 100,
    experience: Math.round(experienceScore * 100) / 100,
    projects: Math.round(projectsScore * 100) / 100,
    education: Math.round(educationScore * 100) / 100,
    final: Math.min(100, Math.max(0, final)),
  };
}

module.exports = { scoreCandidate, computeSkillsScore, computeExperienceScore, computeEducationScore, computeProjectsScore };
