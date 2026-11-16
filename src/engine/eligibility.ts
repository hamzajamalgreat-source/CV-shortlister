import { EligibilityResult, EligibilityStatus } from '../types';
import { ExtractedProfile } from '../lib/schemas';

function buildSearchBlob(profile: ExtractedProfile): string {
  const parts: string[] = [
    ...profile.skills,
    ...profile.experience.map((e) => e.description),
    ...profile.education.flatMap((e) => [e.degree, e.field]),
    ...profile.projects.flatMap((p) => [p.name, p.description]),
  ];
  // Normalise the same way as tokenise: strip non-word chars so "Node.js" → "nodejs"
  return parts
    .join(' ')
    .toLowerCase()
    .replace(/[^\w\s]/g, '');
}

function tokenise(requirement: string): string[] {
  return requirement
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.replace(/[^\w]/g, ''))
    .filter((w) => w.length > 2);
}

type Match = 'satisfied' | 'unclear' | 'failed';

function matchRequirement(requirement: string, blob: string): Match {
  const words = tokenise(requirement);
  if (words.length === 0) return 'satisfied';

  const matched = words.filter((w) => blob.includes(w));

  if (matched.length === words.length) return 'satisfied';
  if (matched.length >= 1) return 'unclear';
  return 'failed';
}

export function evaluateEligibility(
  profile: ExtractedProfile,
  mandatoryRequirements: string[],
): EligibilityResult {
  if (mandatoryRequirements.length === 0) {
    return { status: 'Eligible', failedRequirements: [], unclearRequirements: [] };
  }

  const blob = buildSearchBlob(profile);
  const failed: string[] = [];
  const unclear: string[] = [];

  for (const req of mandatoryRequirements) {
    const result = matchRequirement(req, blob);
    if (result === 'failed') failed.push(req);
    else if (result === 'unclear') unclear.push(req);
  }

  let status: EligibilityStatus;
  if (failed.length > 0) status = 'Not_Eligible';
  else if (unclear.length > 0) status = 'Needs_Review';
  else status = 'Eligible';

  return { status, failedRequirements: failed, unclearRequirements: unclear };
}
