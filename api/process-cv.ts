import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createServerClient } from "../src/lib/supabase";
import { extractProfile } from "../src/lib/grokClient";
import { ExtractedProfileSchema } from "../src/lib/schemas";
import { scoreCandidate } from "../src/engine/scoring";
import { evaluateEligibility } from "../src/engine/eligibility";

async function extractTextFromFile(buffer: Buffer, filename: string): Promise<string> {
  const ext = filename.split(".").pop()?.toLowerCase();

  if (ext === "pdf") {
    try {
      const pdfParse = require("pdf-parse");
      const data = await pdfParse(buffer);
      return data.text || "";
    } catch (err) {
      return "";
    }
  } else if (ext === "docx") {
    try {
      const mammoth = require("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      return result.value || "";
    } catch (err) {
      return "";
    }
  }

  return "";
}

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

    const { data: candidate } = await supabase
      .from("candidates")
      .select("*")
      .eq("id", candidateId)
      .single();

    if (!job || !candidate) {
      return res.status(404).json({ error: "Job or candidate not found" });
    }

    await supabase.from("candidates").update({ processing_status: "Extracting" }).eq("id", candidateId);

    const { data: fileData } = await supabase.storage.from("cvs").download(candidate.storage_path);

    if (!fileData) {
      throw new Error("Failed to download CV");
    }

    const text = await extractTextFromFile(Buffer.from(await fileData.arrayBuffer()), candidate.filename);
    if (!text) {
      await supabase.from("candidates").update({ processing_status: "Failed" }).eq("id", candidateId);
      return res.status(422).json({ error: "Empty CV text" });
    }

    const profileData = (await extractProfile(text)) as any;

    const parseResult = ExtractedProfileSchema.safeParse(profileData);
    if (!parseResult.success) {
      await supabase.from("candidates").update({ processing_status: "Failed" }).eq("id", candidateId);
      return res.status(422).json({ error: "Validation failed" });
    }

    const profile = parseResult.data;

    await supabase.from("candidates").update({ processing_status: "Checking" }).eq("id", candidateId);

    await supabase.from("candidate_analysis").insert({
      candidate_id: candidateId,
      schema_version: 1,
      extracted_profile: profile,
      analyzed_at: new Date().toISOString(),
    });

    const scores = scoreCandidate(profile, job.criteria);
    const eligibility = evaluateEligibility(profile, job.mandatory_requirements || []);

    await supabase.from("candidate_scores").insert({
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
      .update({ processing_status: "Scored", eligibility_status: eligibility.status })
      .eq("id", candidateId);

    return res.status(200).json({
      candidateId,
      processingStatus: "Scored",
      eligibilityStatus: eligibility.status,
      finalScore: scores.finalScore,
    });
  } catch (err: any) {
    console.error("Error processing CV:", err);
    return res.status(500).json({ error: err?.message || "Server error" });
  }
}
