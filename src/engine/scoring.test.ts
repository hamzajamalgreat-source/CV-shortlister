import { describe, it, expect } from 'vitest';
import {
  computeSkillsScore,
  computeExperienceScore,
  computeEducationScore,
  computeProjectsScore,
  computeFinalScore,
} from './scoring';
import { ProjectEntry } from '../lib/schemas';

describe('computeSkillsScore', () => {
  it('returns 100 when no required skills', () => {
    expect(computeSkillsScore(['React'], [])).toBe(100);
  });

  it('returns 100 on full match', () => {
    expect(computeSkillsScore(['React', 'TypeScript'], ['React', 'TypeScript'])).toBe(100);
  });

  it('returns 0 on no match', () => {
    expect(computeSkillsScore(['React'], ['Java', 'Kotlin'])).toBe(0);
  });

  it('returns proportional score on partial match', () => {
    expect(computeSkillsScore(['React'], ['React', 'TypeScript'])).toBe(50);
  });

  it('matching is case-insensitive', () => {
    expect(computeSkillsScore(['REACT'], ['react'])).toBe(100);
  });
});

describe('computeExperienceScore', () => {
  it('returns 100 when required years is 0', () => {
    expect(computeExperienceScore(0, 0)).toBe(100);
  });

  it('caps at 100 when actual exceeds required', () => {
    expect(computeExperienceScore(10, 3)).toBe(100);
  });

  it('returns proportional score when under', () => {
    expect(computeExperienceScore(1, 4)).toBe(25);
  });

  it('returns 100 on exact match', () => {
    expect(computeExperienceScore(5, 5)).toBe(100);
  });
});

describe('computeEducationScore', () => {
  it("returns 100 for PhD", () => {
    expect(computeEducationScore('PhD', 'None')).toBe(100);
  });

  it("returns 50 for Bachelor's", () => {
    expect(computeEducationScore("Bachelor's", 'None')).toBe(50);
  });

  it('returns 0 for None', () => {
    expect(computeEducationScore('None', 'None')).toBe(0);
  });

  it("returns 70 for Master's", () => {
    expect(computeEducationScore("Master's", 'None')).toBe(70);
  });
});

describe('computeProjectsScore', () => {
  it('returns 0 for empty projects', () => {
    expect(computeProjectsScore([], ['React'])).toBe(0);
  });

  it('returns a positive score for a relevant project', () => {
    const project: ProjectEntry = {
      name: 'App',
      technologies: ['React'],
      description: 'I built and deployed this application, which improved load time by 30%.',
    };
    const score = computeProjectsScore([project], ['React']);
    expect(score).toBeGreaterThan(0);
  });

  it('returns 0 tech relevance when required skills empty but still scores on desc/evidence', () => {
    const project: ProjectEntry = {
      name: 'App',
      technologies: ['React'],
      description: 'I built and deployed this application, which improved load time by 30%.',
    };
    // With no required skills, techRelevance = 0 but other sub-scores can contribute
    const score = computeProjectsScore([project], []);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe('computeFinalScore', () => {
  it('computes correct weighted sum', () => {
    const scores = { skills: 80, experience: 60, projects: 40, education: 100 };
    const weights = { skills: 40, experience: 30, projects: 20, education: 10 };
    // (80*40 + 60*30 + 40*20 + 100*10) / 100 = (3200+1800+800+1000)/100 = 68
    expect(computeFinalScore(scores, weights)).toBe(68);
  });

  it('caps at 100', () => {
    const scores = { skills: 100, experience: 100, projects: 100, education: 100 };
    const weights = { skills: 40, experience: 30, projects: 20, education: 10 };
    expect(computeFinalScore(scores, weights)).toBe(100);
  });

  it('floors at 0', () => {
    const scores = { skills: 0, experience: 0, projects: 0, education: 0 };
    const weights = { skills: 40, experience: 30, projects: 20, education: 10 };
    expect(computeFinalScore(scores, weights)).toBe(0);
  });
});
