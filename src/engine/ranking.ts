import { RankedCandidate } from '../types';

export function rankCandidates(candidates: RankedCandidate[]): RankedCandidate[] {
  const sorted = [...candidates].sort((a, b) => {
    if (b.finalScore !== a.finalScore) return b.finalScore - a.finalScore;
    if (b.preferredMatches !== a.preferredMatches) return b.preferredMatches - a.preferredMatches;
    if (b.componentScores.projects !== a.componentScores.projects)
      return b.componentScores.projects - a.componentScores.projects;
    if (b.componentScores.experience !== a.componentScores.experience)
      return b.componentScores.experience - a.componentScores.experience;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return sorted.map((candidate, index) => ({ ...candidate, rank: index + 1 }));
}
