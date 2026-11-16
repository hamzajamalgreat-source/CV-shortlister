import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { scoreCandidate } from './scoring';
import { evaluateEligibility } from './eligibility';
import type { ExtractedProfile, ProjectEntry } from '../lib/schemas';
import type { JobCriteria } from '../types';

// Property-based test generators
const skillArb = fc.array(fc.stringMatching(/^[A-Za-z0-9+#.]+$/), { minLength: 0, maxLength: 5 });
const yearsArb = fc.integer({ min: 0, max: 50 });
const descriptionArb = fc.stringMatching(/^[A-Za-z0-9 .!?-]{0,200}$/);

const experienceEntryArb = fc.record({
  employer: fc.stringMatching(/^[A-Za-z ]+$/),
  title: fc.stringMatching(/^[A-Za-z ]+$/),
  years: yearsArb,
  description: descriptionArb,
});

const projectArb: fc.Arbitrary<ProjectEntry> = fc.record({
  name: fc.stringMatching(/^[A-Za-z0-9 ]+$/),
  technologies: skillArb,
  description: descriptionArb,
});

const profileArb: fc.Arbitrary<ExtractedProfile> = fc.record({
  name: fc.stringMatching(/^[A-Za-z ]+$/),
  skills: skillArb,
  experience: fc.array(experienceEntryArb, { maxLength: 3 }),
  education: fc.array(
    fc.record({
      institution: fc.stringMatching(/^[A-Za-z ]+$/),
      degree: fc.oneof(
        fc.constant('None'),
        fc.constant('High School'),
        fc.constant('Bachelor\'s'),
        fc.constant('Master\'s'),
        fc.constant('PhD')
      ),
      field: fc.stringMatching(/^[A-Za-z ]+$/),
    }),
    { maxLength: 2 }
  ),
  projects: fc.array(projectArb, { maxLength: 3 }),
});

const criteriaArb: fc.Arbitrary<JobCriteria> = fc.record({
  requiredSkills: skillArb,
  preferredSkills: fc.array(fc.stringMatching(/^[A-Za-z0-9+#.]+$/), { maxLength: 3 }),
  minExperienceYears: yearsArb,
  educationRequirement: fc.oneof(
    fc.constant('None'),
    fc.constant('High School'),
    fc.constant('Bachelor\'s'),
    fc.constant('Master\'s'),
    fc.constant('PhD')
  ),
  weights: fc.record({
    skills: fc.integer({ min: 0, max: 100 }),
    experience: fc.integer({ min: 0, max: 100 }),
    projects: fc.integer({ min: 0, max: 100 }),
    education: fc.integer({ min: 0, max: 100 }),
  }).filter(w => w.skills + w.experience + w.projects + w.education === 100),
});

describe('System Integration — Property-Based Tests', () => {
  it('scoreCandidate always returns valid score between 0-100', () => {
    fc.assert(
      fc.property(profileArb, criteriaArb, (profile, criteria) => {
        const result = scoreCandidate(profile, criteria);
        expect(result.finalScore).toBeGreaterThanOrEqual(0);
        expect(result.finalScore).toBeLessThanOrEqual(100);
      })
    );
  });

  it('scoreCandidate component scores are all 0-100', () => {
    fc.assert(
      fc.property(profileArb, criteriaArb, (profile, criteria) => {
        const result = scoreCandidate(profile, criteria);
        expect(result.componentScores.skills).toBeGreaterThanOrEqual(0);
        expect(result.componentScores.skills).toBeLessThanOrEqual(100);
        expect(result.componentScores.experience).toBeGreaterThanOrEqual(0);
        expect(result.componentScores.experience).toBeLessThanOrEqual(100);
        expect(result.componentScores.education).toBeGreaterThanOrEqual(0);
        expect(result.componentScores.education).toBeLessThanOrEqual(100);
        expect(result.componentScores.projects).toBeGreaterThanOrEqual(0);
        expect(result.componentScores.projects).toBeLessThanOrEqual(100);
      })
    );
  });

  it('scoreCandidate produces consistent results', () => {
    fc.assert(
      fc.property(profileArb, criteriaArb, (profile, criteria) => {
        const score1 = scoreCandidate(profile, criteria);
        const score2 = scoreCandidate(profile, criteria);
        expect(score1.finalScore).toBe(score2.finalScore);
        expect(score1.componentScores).toEqual(score2.componentScores);
      })
    );
  });

  it('evaluateEligibility always returns valid status', () => {
    fc.assert(
      fc.property(profileArb, fc.array(fc.string(), { maxLength: 3 }), (profile, reqs) => {
        const result = evaluateEligibility(profile, reqs);
        expect(['Eligible', 'Not_Eligible', 'Needs_Review']).toContain(result.status);
        expect(Array.isArray(result.failedRequirements)).toBe(true);
        expect(Array.isArray(result.unclearRequirements)).toBe(true);
      })
    );
  });

  it('evaluateEligibility with no mandatory requirements returns Eligible', () => {
    fc.assert(
      fc.property(profileArb, (profile) => {
        const result = evaluateEligibility(profile, []);
        expect(result.status).toBe('Eligible');
        expect(result.failedRequirements.length).toBe(0);
        expect(result.unclearRequirements.length).toBe(0);
      })
    );
  });

  it('scoreCandidate with no required skills returns 100 skills score', () => {
    fc.assert(
      fc.property(profileArb, (profile) => {
        const criteria: JobCriteria = {
          requiredSkills: [],
          preferredSkills: [],
          minExperienceYears: 0,
          educationRequirement: 'None',
          weights: { skills: 25, experience: 25, projects: 25, education: 25 },
        };
        const result = scoreCandidate(profile, criteria);
        expect(result.componentScores.skills).toBe(100);
      })
    );
  });

  it('scoreCandidate with no projects returns 0 projects score', () => {
    fc.assert(
      fc.property(criteriaArb, (criteria) => {
        const profile: ExtractedProfile = {
          name: 'John Doe',
          skills: ['React'],
          experience: [],
          education: [],
          projects: [],
        };
        const result = scoreCandidate(profile, criteria);
        expect(result.componentScores.projects).toBe(0);
      })
    );
  });

  it('scoreCandidate with 0 required experience returns 100 experience score', () => {
    fc.assert(
      fc.property(profileArb, (profile) => {
        const criteria: JobCriteria = {
          requiredSkills: [],
          preferredSkills: [],
          minExperienceYears: 0,
          educationRequirement: 'None',
          weights: { skills: 25, experience: 25, projects: 25, education: 25 },
        };
        const result = scoreCandidate(profile, criteria);
        expect(result.componentScores.experience).toBe(100);
      })
    );
  });
});

describe('System Integration — Edge Cases', () => {
  it('handles empty profile gracefully', () => {
    const profile: ExtractedProfile = {
      name: '',
      skills: [],
      experience: [],
      education: [],
      projects: [],
    };
    const criteria: JobCriteria = {
      requiredSkills: ['React'],
      preferredSkills: [],
      minExperienceYears: 5,
      educationRequirement: 'Bachelor\'s',
      weights: { skills: 25, experience: 25, projects: 25, education: 25 },
    };

    const result = scoreCandidate(profile, criteria);
    expect(result.finalScore).toBe(0); // No skills matched, no experience, no education, no projects
  });

  it('handles perfect candidate', () => {
    const profile: ExtractedProfile = {
      name: 'Perfect Candidate',
      skills: ['React', 'TypeScript', 'Node.js'],
      experience: [
        {
          employer: 'Google',
          title: 'Senior Engineer',
          years: 10,
          description: 'Developed and deployed large-scale applications',
        },
      ],
      education: [
        {
          institution: 'MIT',
          degree: 'PhD',
          field: 'Computer Science',
        },
      ],
      projects: [
        {
          name: 'E-commerce Platform',
          technologies: ['React', 'TypeScript'],
          description: 'Built a full-stack e-commerce platform which increased sales by 200% and reduced load time by 50%',
        },
      ],
    };

    const criteria: JobCriteria = {
      requiredSkills: ['React', 'TypeScript'],
      preferredSkills: ['Node.js'],
      minExperienceYears: 5,
      educationRequirement: 'Bachelor\'s',
      weights: { skills: 25, experience: 25, projects: 25, education: 25 },
    };

    const result = scoreCandidate(profile, criteria);
    expect(result.finalScore).toBeGreaterThan(90);
    expect(result.componentScores.skills).toBe(100);
    expect(result.componentScores.experience).toBe(100);
  });

  it('handles missing mandatory requirements', () => {
    const profile: ExtractedProfile = {
      name: 'John Doe',
      skills: ['Java'],
      experience: [],
      education: [],
      projects: [],
    };

    const result = evaluateEligibility(profile, ['Kubernetes', 'Docker']);
    expect(result.status).toBe('Not_Eligible');
    expect(result.failedRequirements.length).toBeGreaterThan(0);
  });

  it('handles partial mandatory requirements match', () => {
    const profile: ExtractedProfile = {
      name: 'John Doe',
      skills: ['Docker'],
      experience: [
        {
          employer: 'Tech Co',
          title: 'DevOps Engineer',
          years: 2,
          description: 'Worked with Kubernetes in production',
        },
      ],
      education: [],
      projects: [],
    };

    const result = evaluateEligibility(profile, ['Docker', 'Kubernetes']);
    // Docker should match, Kubernetes is unclear (mentioned in description)
    expect(['Needs_Review', 'Eligible']).toContain(result.status);
  });
});



