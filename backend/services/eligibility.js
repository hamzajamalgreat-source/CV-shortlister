// Eligibility gate: Eligible | Needs_Review | Not_Eligible

function evaluateEligibility(profile, mandatoryReqs = []) {
  if (!mandatoryReqs || mandatoryReqs.length === 0) {
    return {
      status: "Eligible",
      failed_requirements: [],
      unclear_requirements: [],
    };
  }

  const failed = [];
  const unclear = [];

  for (const req of mandatoryReqs) {
    const reqLower = req.toLowerCase();
    
    // Simple keyword matching - expand for production
    const allText = [
      ...(profile.skills || []),
      ...(profile.projects || []),
      profile.education || "",
      profile.experience_years?.toString() || "",
    ]
      .join(" ")
      .toLowerCase();

    if (allText.includes(reqLower)) {
      // Requirement satisfied
    } else if (reqLower.includes("year") || reqLower.includes("experience")) {
      // Experience-based requirements are unclear without parsing
      unclear.push(req);
    } else {
      // Requirement failed
      failed.push(req);
    }
  }

  let status = "Eligible";
  if (failed.length > 0) {
    status = "Not_Eligible";
  } else if (unclear.length > 0) {
    status = "Needs_Review";
  }

  return {
    status,
    failed_requirements: failed,
    unclear_requirements: unclear,
  };
}

module.exports = { evaluateEligibility };
