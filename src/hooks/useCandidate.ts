import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Candidate, CandidateAnalysis, CandidateScore } from '../types';

export interface CandidateDetail {
  candidate: Candidate;
  analysis: CandidateAnalysis | null;
  score: CandidateScore | null;
}

export function useCandidate(candidateId: string) {
  const [detail, setDetail] = useState<CandidateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!candidateId) return;

    async function fetch() {
      const { data: candidate, error: cErr } = await supabase
        .from('candidates')
        .select('*')
        .eq('id', candidateId)
        .single();

      if (cErr || !candidate) {
        setError(cErr?.message ?? 'Candidate not found');
        setLoading(false);
        return;
      }

      const [{ data: analysis }, { data: score }] = await Promise.all([
        supabase
          .from('candidate_analysis')
          .select('*')
          .eq('candidate_id', candidateId)
          .order('analyzed_at', { ascending: false })
          .limit(1)
          .single(),
        supabase
          .from('candidate_scores')
          .select('*')
          .eq('candidate_id', candidateId)
          .order('scored_at', { ascending: false })
          .limit(1)
          .single(),
      ]);

      setDetail({
        candidate: candidate as Candidate,
        analysis: (analysis as CandidateAnalysis) ?? null,
        score: (score as CandidateScore) ?? null,
      });
      setLoading(false);
    }

    void fetch();
  }, [candidateId]);

  return { detail, loading, error };
}
