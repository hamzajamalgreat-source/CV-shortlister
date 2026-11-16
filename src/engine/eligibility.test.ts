import { describe, it, expect } from 'vitest';
import { evaluateEligibility } from './eligibility';
import { ExtractedProfile } from '../lib/schemas';

const baseProfile: ExtractedProfile = {
  name: 'Jane Doe',
  skills: ['TypeScript', 'React', 'Node.js'],
  experience: [{ employer: 'Acme', title: 'Engineer', years: 3, description: 'Built REST APIs with Node.js and PostgreSQL' }],
  education: [{ institution: 'MIT', degree: "Bachelor's", field: 'Computer Science' }],
  projects: [{ name: 'Dashboard', technologies: ['React'], description: 'A React dashboard with charting' }],
};

describe('evaluateEligibility', () => {
  it('returns Eligible when requirements list is empty', () => {
    const result = evaluateEligibility(baseProfile, []);
    expect(result).toEqual({ status: 'Eligible', failedRequirements: [], unclearRequirements: [] });
  });

  it('returns Eligible when all requirements are satisfied', () => {
    const result = evaluateEligibility(baseProfile, ['TypeScript React', 'Node.js PostgreSQL']);
    expect(result.status).toBe('Eligible');
    expect(result.failedRequirements).toHaveLength(0);
    expect(result.unclearRequirements).toHaveLength(0);
  });

  it('returns Not_Eligible when a requirement has no matching words', () => {
    const result = evaluateEligibility(baseProfile, ['Kubernetes Terraform']);
    expect(result.status).toBe('Not_Eligible');
    expect(result.failedRequirements).toContain('Kubernetes Terraform');
  });

  it('returns Needs_Review when a requirement partially matches', () => {
    // 'React' matches but 'GraphQL' does not
    const result = evaluateEligibility(baseProfile, ['React GraphQL']);
    expect(result.status).toBe('Needs_Review');
    expect(result.unclearRequirements).toContain('React GraphQL');
  });

  it('Not_Eligible takes priority over Needs_Review', () => {
    const result = evaluateEligibility(baseProfile, ['React GraphQL', 'Kubernetes Terraform']);
    expect(result.status).toBe('Not_Eligible');
    expect(result.unclearRequirements).toContain('React GraphQL');
    expect(result.failedRequirements).toContain('Kubernetes Terraform');
  });

  it('ignores short words (≤2 chars) when tokenising', () => {
    // 'to' and 'be' are stripped; only significant words count
    const result = evaluateEligibility(baseProfile, ['to be TypeScript']);
    expect(result.status).toBe('Eligible');
  });

  it('matching is case-insensitive', () => {
    const result = evaluateEligibility(baseProfile, ['TYPESCRIPT REACT']);
    expect(result.status).toBe('Eligible');
  });
});
