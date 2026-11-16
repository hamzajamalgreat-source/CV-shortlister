const express = require("express");
const multer = require("multer");
const { parseCV } = require("../services/cvParser");
const { extractProfile } = require("../services/grokClient");
const { scoreCandidate } = require("../services/scoring");
const { evaluateEligibility } = require("../services/eligibility");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/shortlist", upload.array("cv_files"), async (req, res) => {
  try {
    const { job_title, job_description, mandatory_requirements, weights, top_n } = req.body;
    let mandatoryReqs = [];
    let weightsObj = {};

    // Parse JSON fields
    if (mandatory_requirements) {
      mandatoryReqs = JSON.parse(mandatory_requirements);
    }
    if (weights) {
      weightsObj = JSON.parse(weights);
    }

    if (!job_title) {
      return res.status(400).json({ error: "job_title is required" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "At least one CV file is required" });
    }

    const results = {
      eligible: [],
      needs_review: [],
      not_eligible: [],
    };

    // Process each CV
    for (const file of req.files) {
      try {
        // 1. Parse CV text
        const cvText = await parseCV(file.buffer, file.originalname);

        // 2. Extract profile via Grok
        let profile;
        try {
          profile = await extractProfile(cvText);
        } catch (error) {
          console.error(`Grok extraction failed for ${file.originalname}:`, error.message);
          // Use mock profile if Grok fails
          profile = {
            name: file.originalname.replace(/\.(pdf|docx)$/i, "").replace(/[_-]/g, " "),
            email: null,
            phone: null,
            skills: [],
            experience_years: 0,
            education: "High School",
            projects: [],
          };
        }

        // 3. Score candidate
        const scores = scoreCandidate(profile, weightsObj);

        // 4. Evaluate eligibility
        const eligibility = evaluateEligibility(profile, mandatoryReqs);

        // 5. Build result object
        const candidate = {
          name: profile.name || "Unknown",
          email: profile.email || null,
          phone: profile.phone || null,
          skills: scores.skills,
          experience: scores.experience,
          projects: scores.projects,
          education: scores.education,
          final: scores.final,
          eligibility: eligibility.status,
          failed_requirements: eligibility.failed_requirements,
          evidence: {
            skills: `${profile.skills?.join(", ") || "No skills found"}`,
            experience: `${profile.experience_years || 0} years`,
            education: profile.education || "Not specified",
            projects: `${profile.projects?.length || 0} projects`,
          },
        };

        // 6. Sort into buckets
        if (eligibility.status === "Eligible") {
          results.eligible.push(candidate);
        } else if (eligibility.status === "Needs_Review") {
          results.needs_review.push(candidate);
        } else {
          results.not_eligible.push(candidate);
        }
      } catch (fileError) {
        console.error(`Error processing ${file.originalname}:`, fileError.message);
        // Continue with next file
      }
    }

    // 7. Sort eligible by final score (desc)
    results.eligible.sort((a, b) => b.final - a.final);

    // 8. Apply top_n limit
    if (top_n) {
      results.eligible = results.eligible.slice(0, parseInt(top_n));
    }

    res.json(results);
  } catch (error) {
    console.error("Shortlist error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

module.exports = router;
