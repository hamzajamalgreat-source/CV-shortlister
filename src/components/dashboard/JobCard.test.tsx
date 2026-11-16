import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import JobCard from './JobCard';
import type { Job } from '../../types';

const mockJob: Job = {
  id: 'job-123',
  owner_id: 'user-123',
  title: 'Senior React Developer',
  description: 'Build amazing web applications',
  criteria: {
    requiredSkills: ['React', 'TypeScript', 'Node.js'],
    preferredSkills: ['GraphQL', 'Docker'],
    minExperienceYears: 5,
    educationRequirement: "Bachelor's",
    weights: {
      skills: 40,
      experience: 30,
      projects: 20,
      education: 10,
    },
  },
  weights: {
    skills: 40,
    experience: 30,
    projects: 20,
    education: 10,
  },
  mandatory_requirements: ['React experience', 'TypeScript knowledge'],
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
};

describe('JobCard', () => {
  it('renders job title', () => {
    const { container } = render(
      <BrowserRouter>
        <JobCard job={mockJob} candidateCount={5} />
      </BrowserRouter>
    );
    expect(container.textContent).toContain('Senior React Developer');
  });

  it('displays job description', () => {
    const { container } = render(
      <BrowserRouter>
        <JobCard job={mockJob} candidateCount={5} />
      </BrowserRouter>
    );
    expect(container.textContent).toContain('Build amazing web applications');
  });

  it('displays candidate count badge', () => {
    const { container } = render(
      <BrowserRouter>
        <JobCard job={mockJob} candidateCount={5} />
      </BrowserRouter>
    );
    expect(container.textContent).toContain('5 candidates');
  });

  it('displays skill count', () => {
    const { container } = render(
      <BrowserRouter>
        <JobCard job={mockJob} candidateCount={0} />
      </BrowserRouter>
    );
    expect(container.textContent).toContain('3 required skills');
  });

  it('displays action buttons', () => {
    const { container } = render(
      <BrowserRouter>
        <JobCard job={mockJob} candidateCount={2} />
      </BrowserRouter>
    );
    expect(container.textContent).toContain('Edit');
    expect(container.textContent).toContain('Upload');
    expect(container.textContent).toContain('Results');
  });

  it('renders with dark mode background', () => {
    const { container } = render(
      <BrowserRouter>
        <JobCard job={mockJob} candidateCount={1} />
      </BrowserRouter>
    );
    const article = container.querySelector('article');
    // Browser converts hex to rgb
    expect(article?.style.backgroundColor).toMatch(/rgb\(26, 31, 46\)/);
    expect(article?.style.borderColor).toMatch(/rgb\(45, 55, 72\)/);
  });

  it('shows singular candidate for count 1', () => {
    const { container } = render(
      <BrowserRouter>
        <JobCard job={mockJob} candidateCount={1} />
      </BrowserRouter>
    );
    expect(container.textContent).toContain('1 candidate');
  });
});
