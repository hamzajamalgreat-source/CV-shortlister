import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createServerClient } from "../src/lib/supabase";
import { scoreCandidate } from "../src/engine/scoring";
import { evaluateEligibility } from "../src/engine/eligibility";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.slice(7);
    const supabase = createServerClient(token);

    const { data: user, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const { candidateId, jobId } = req.body || {};
    if (!candidateId || !jobId) {
      return res.status(422).json({ error: "Missing candidateId or jobId" });
    }

    const { data: job } = await supabase.from("jobs").select("*").eq("id", jobId).single();

    const { data: analysis } = await supabase
      .from("candidate_analysis")
      .select("*")
      .eq("candidate_id", candidateId)
      .single();

    if (!job || !analysis) {
      return res.status(404).json({ error: "Job or analysis not found" });
    }

    const profile = analysis.extracted_profile;

    const scores = scoreCandidate(profile, job.criteria);
    const eligibility = evaluateEligibility(profile, job.mandatory_requirements || []);

    await supabase.from("candidate_scores").upsert({
      candidate_id: candidateId,
      rule_version: 1,
      component_scores: scores.componentScores,
      final_score: scores.finalScore,
      preferred_matches: scores.preferredMatches,
      explanation: scores.explanation,
      scored_at: new Date().toISOString(),
    });

    await supabase
      .from("candidates")
      .update({ eligibility_status: eligibility.status })
      .eq("id", candidateId);

    return res.status(200).json({
      candidateId,
      eligibilityStatus: eligibility.status,
      finalScore: scores.finalScore,
    });
  } catch (err: any) {
    console.error("Error scoring candidate:", err);
    return res.status(500).json({ error: err?.message || "Server error" });
  }
}
