import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Candidate, CandidateScore } from '../types';

export interface CandidateResult {
  candidate: Candidate;
  score: CandidateScore | null;
}

export function useResults(jobId: string) {
  const [eligible, setEligible] = useState<CandidateResult[]>([]);
  const [flagged, setFlagged] = useState<CandidateResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchResults() {
    const { data: candidates, error: cErr } = await supabase
      .from('candidates')
      .select('*')
      .eq('job_id', jobId)
      .eq('processing_status', 'Scored')
      .order('created_at', { ascending: true });

    if (cErr) { setError(cErr.message); setLoading(false); return; }

    const rows = (candidates ?? []) as Candidate[];
    const ids = rows.map(c => c.id);

    const { data: scores } = ids.length > 0
      ? await supabase.from('candidate_scores').select('*').in('candidate_id', ids)
      : { data: [] };

    const scoreMap = new Map<string, CandidateScore>();
    for (const s of (scores ?? []) as CandidateScore[]) {
      scoreMap.set(s.candidate_id, s);
    }

    const results: CandidateResult[] = rows.map(c => ({
      candidate: c,
      score: scoreMap.get(c.id) ?? null,
    }));

    const eligibleResults = results
      .filter(r => (r.candidate.override_status ?? r.candidate.eligibility_status) === 'Eligible')
      .sort((a, b) => (b.score?.final_score ?? 0) - (a.score?.final_score ?? 0));

    const flaggedResults = results.filter(
      r => (r.candidate.override_status ?? r.candidate.eligibility_status) !== 'Eligible',
    );

    setEligible(eligibleResults);
    setFlagged(flaggedResults);
    setLoading(false);
  }

  useEffect(() => {
    if (!jobId) return;
    void fetchResults();

    const channel = supabase
      .channel(`results:${jobId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'candidates', filter: `job_id=eq.${jobId}` },
        () => { void fetchResults(); })
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  return { eligible, flagged, loading, error };
}
