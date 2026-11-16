import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import { extractProfile } from '../src/lib/grokClient';
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

  // --- Auth ---
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const supabase = serverSupabase();
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });

  // --- Validate body ---
  const parsed = RequestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(422).json({ error: 'Invalid request', details: parsed.error.issues });
  const { candidateId, jobId } = parsed.data;

  // --- Load job + candidate ---
  const { data: job } = await supabase.from('jobs').select('*').eq('id', jobId).eq('owner_id', user.id).single();
  if (!job) return res.status(404).json({ error: 'Job not found' });

  const { data: candidate } = await supabase.from('candidates').select('*').eq('id', candidateId).eq('job_id', jobId).single();
  if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

  // --- Transition: Extracting ---
  await supabase.from('candidates').update({ processing_status: 'Extracting' }).eq('id', candidateId);

  // --- Download CV from storage ---
  const { data: fileData, error: dlErr } = await supabase.storage.from('cvs').download(candidate.storage_path as string);
  if (dlErr || !fileData) {
    await supabase.from('candidates').update({ processing_status: 'Failed' }).eq('id', candidateId);
    return res.status(422).json({ error: 'Failed to download CV file', stage: 'extraction' });
  }

  // --- Extract text ---
  const buffer = Buffer.from(await fileData.arrayBuffer());
  let cvText = '';
  try {
    const ext = (candidate.filename as string).split('.').pop()?.toLowerCase();
    if (ext === 'pdf') {
      const result = await new PDFParse({ data: new Uint8Array(buffer) }).getText();
      cvText = result.text;
    } else if (ext === 'docx') {
      const result = await mammoth.extractRawText({ buffer });
      cvText = result.value;
    } else {
      await supabase.from('candidates').update({ processing_status: 'Failed' }).eq('id', candidateId);
      return res.status(422).json({ error: 'Unsupported file type', stage: 'extraction' });
    }
  } catch (_e) {
    await supabase.from('candidates').update({ processing_status: 'Failed' }).eq('id', candidateId);
    return res.status(422).json({ error: 'Text extraction failed', stage: 'extraction' });
  }

  if (!cvText.trim()) {
    await supabase.from('candidates').update({ processing_status: 'Failed' }).eq('id', candidateId);
    await supabase.from('candidate_analysis').insert({ candidate_id: candidateId, schema_version: 1, extracted_profile: {}, warnings: [{ stage: 'extraction', reason: 'empty_text' }] });
    return res.status(422).json({ error: 'CV text is empty', stage: 'extraction' });
  }

  // --- Grok extraction ---
  let rawProfile: unknown;
  try {
    rawProfile = await extractProfile(cvText);
  } catch (e) {
    await supabase.from('candidates').update({ processing_status: 'Failed' }).eq('id', candidateId);
    await supabase.from('candidate_analysis').insert({ candidate_id: candidateId, schema_version: 1, extracted_profile: {}, warnings: [{ stage: 'grok', reason: String(e) }] });
    return res.status(422).json({ error: 'AI extraction failed', stage: 'extraction' });
  }

  // --- Zod validation ---
  const profileResult = ExtractedProfileSchema.safeParse(rawProfile);
  if (!profileResult.success) {
    await supabase.from('candidates').update({ processing_status: 'Failed' }).eq('id', candidateId);
    await supabase.from('candidate_analysis').insert({ candidate_id: candidateId, schema_version: 1, extracted_profile: rawProfile as Record<string, unknown>, warnings: profileResult.error.issues });
    return res.status(422).json({ error: 'Profile validation failed', stage: 'validation' });
  }
  const profile = profileResult.data;

  // --- Transition: Checking ---
  await supabase.from('candidates').update({ processing_status: 'Checking' }).eq('id', candidateId);
  await supabase.from('candidate_analysis').insert({ candidate_id: candidateId, schema_version: 1, extracted_profile: profile });

  // --- Score + eligibility ---
  const criteria = job.criteria as JobCriteria;
  const scoring = scoreCandidate(profile, criteria);
  const eligibility = evaluateEligibility(profile, job.mandatory_requirements as string[]);

  // --- Persist scores ---
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
