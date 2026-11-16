import { describe, it, expect } from 'vitest';
import { rankCandidates } from './ranking';
import { RankedCandidate } from '../types';

function makeCandidate(id: string, finalScore: number, preferredMatches = 0): RankedCandidate {
  return {
    candidateId: id,
    name: `Candidate ${id}`,
    finalScore,
    componentScores: { skills: 0, experience: 0, projects: 0, education: 0 },
    preferredMatches,
    rank: 0,
    createdAt: '2024-01-01T00:00:00Z',
  };
}

describe('rankCandidates', () => {
  it('assigns rank 1 to a single candidate', () => {
    const result = rankCandidates([makeCandidate('a', 75)]);
    expect(result[0].rank).toBe(1);
  });

  it('higher final score ranks first', () => {
    const result = rankCandidates([makeCandidate('b', 50), makeCandidate('a', 90)]);
    expect(result[0].candidateId).toBe('a');
    expect(result[0].rank).toBe(1);
    expect(result[1].rank).toBe(2);
  });

  it('breaks ties by preferredMatches', () => {
    const result = rankCandidates([
      makeCandidate('low', 80, 1),
      makeCandidate('high', 80, 3),
    ]);
    expect(result[0].candidateId).toBe('high');
  });

  it('returns empty array for empty input', () => {
    expect(rankCandidates([])).toEqual([]);
  });

  it('does not mutate the original array', () => {
    const input = [makeCandidate('b', 50), makeCandidate('a', 90)];
    rankCandidates(input);
    expect(input[0].candidateId).toBe('b');
  });
});
