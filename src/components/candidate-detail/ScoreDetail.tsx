import type { CandidateScore } from '../../types';

interface Props {
  score: CandidateScore;
}

const COMPONENTS: {
  key: keyof CandidateScore['component_scores'];
  label: string;
  ruleKey: keyof NonNullable<CandidateScore['explanation']>;
}[] = [
  { key: 'skills',     label: 'Skills',     ruleKey: 'skillsRule' },
  { key: 'experience', label: 'Experience', ruleKey: 'experienceRule' },
  { key: 'education',  label: 'Education',  ruleKey: 'educationRule' },
  { key: 'projects',   label: 'Projects',   ruleKey: 'projectsRule' },
];

export default function ScoreDetail({ score }: Props) {
  const explanation = score.explanation;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Score Breakdown</h3>
        <span className="text-2xl font-bold text-slate-900">
          {score.final_score.toFixed(1)}
          <span className="text-sm font-normal text-slate-400">/100</span>
        </span>
      </div>

      <dl className="space-y-3">
        {COMPONENTS.map(({ key, label, ruleKey }) => {
          const componentScore = score.component_scores[key];
          const rule = explanation?.[ruleKey] as string | undefined;
          const snippets = explanation?.evidenceSnippets?.[key] ?? [];

          return (
            <div key={key} className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
              <div className="flex items-center justify-between mb-1">
                <dt className="text-sm font-medium text-slate-700">{label}</dt>
                <dd className="text-sm font-bold text-slate-900">{componentScore}/100</dd>
              </div>

              {/* Score bar */}
              <div
                className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden"
                aria-hidden="true"
              >
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{ width: `${componentScore}%` }}
                />
              </div>

              {rule && <p className="mt-2 text-xs text-slate-500">{rule}</p>}

              {snippets.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {snippets.map((snippet, i) => (
                    <li
                      key={i}
                      className="text-xs text-slate-600 italic before:content-['\u201c'] after:content-['\u201d']"
                    >
                      {snippet}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </dl>
    </div>
  );
}
