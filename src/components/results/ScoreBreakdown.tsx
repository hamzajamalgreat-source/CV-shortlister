import { useState } from 'react';
import type { CandidateScore } from '../../types';

interface Props {
  score: CandidateScore;
}

export default function ScoreBreakdown({ score }: Props) {
  const [open, setOpen] = useState(false);
  const explanation = score.explanation;

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 focus:outline-none focus:underline"
      >
        <svg
          className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-90' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {open ? 'Hide details' : 'Show score details'}
      </button>

      {open && explanation && (
        <dl className="mt-3 space-y-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-xs">
          {[
            { label: 'Skills', rule: explanation.skillsRule, score: score.component_scores.skills },
            { label: 'Experience', rule: explanation.experienceRule, score: score.component_scores.experience },
            { label: 'Education', rule: explanation.educationRule, score: score.component_scores.education },
            { label: 'Projects', rule: explanation.projectsRule, score: score.component_scores.projects },
          ].map(({ label, rule, score: s }) => (
            <div key={label}>
              <dt className="font-medium text-slate-700">
                {label} — <span className="text-slate-900">{s}/100</span>
              </dt>
              <dd className="mt-0.5 text-slate-500">{rule}</dd>
            </div>
          ))}

          {explanation.evidenceSnippets && Object.keys(explanation.evidenceSnippets).length > 0 && (
            <div className="pt-2 border-t border-slate-200">
              <dt className="font-medium text-slate-700 mb-1">Evidence from CV</dt>
              {Object.entries(explanation.evidenceSnippets).map(([category, items]) =>
                items.length > 0 ? (
                  <dd key={category} className="mb-1">
                    <span className="font-medium capitalize">{category}: </span>
                    {items.join(' · ')}
                  </dd>
                ) : null
              )}
            </div>
          )}
        </dl>
      )}
    </div>
  );
}
