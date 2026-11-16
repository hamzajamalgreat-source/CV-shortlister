import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { ExtractedProfileSchema } from '../src/lib/schemas';
import { scoreCandidate } from '../src/engine/scoring';
import { evaluateEligibility } from '../src/engine/eligibility';
import type { JobCriteria } from '../src/types';

const RequestSchema = z.object({
  candidateId: z.string().uuid(),
  jobId: z.string().uuid(),
});

function serverSupabase() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  if (!url || !key) throw new Error('Missing Supabase server env vars.');
  return createClient(url, key);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const supabase = serverSupabase();
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });

  const parsed = RequestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(422).json({ error: 'Invalid request', details: parsed.error.issues });
  const { candidateId, jobId } = parsed.data;

  const { data: job } = await supabase.from('jobs').select('*').eq('id', jobId).eq('owner_id', user.id).single();
  if (!job) return res.status(404).json({ error: 'Job not found' });

  const { data: analysis } = await supabase.from('candidate_analysis').select('*').eq('candidate_id', candidateId).order('analyzed_at', { ascending: false }).limit(1).single();
  if (!analysis) return res.status(404).json({ error: 'No analysis found for candidate' });

  const profileResult = ExtractedProfileSchema.safeParse(analysis.extracted_profile);
  if (!profileResult.success) return res.status(422).json({ error: 'Stored profile failed validation', stage: 'validation' });

  const profile = profileResult.data;
  const criteria = job.criteria as JobCriteria;
  const scoring = scoreCandidate(profile, criteria);
  const eligibility = evaluateEligibility(profile, job.mandatory_requirements as string[]);

  // Upsert scores (delete old, insert new)
  await supabase.from('candidate_scores').delete().eq('candidate_id', candidateId);
  await supabase.from('candidate_scores').insert({
    candidate_id: candidateId,
    rule_version: 1,
    component_scores: scoring.componentScores,
    preferred_matches: scoring.preferredMatches,
    final_score: scoring.finalScore,
    explanation: scoring.explanation,
  });

  await supabase.from('candidates').update({
    processing_status: 'Scored',
    eligibility_status: eligibility.status,
  }).eq('id', candidateId);

  return res.status(200).json({
    candidateId,
    processingStatus: 'Scored',
    eligibilityStatus: eligibility.status,
    finalScore: scoring.finalScore,
  });
}
