import { useState } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import type { CandidateResult } from '../../hooks/useResults';

interface Props {
  results: CandidateResult[];
  jobId: string;
}

export default function FlaggedSection({ results, jobId }: Props) {
  const [open, setOpen] = useState(false);

  if (results.length === 0) return null;

  return (
    <section aria-label="Flagged candidates">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-xl border border-orange-200 bg-orange-50 px-5 py-3 text-left focus:outline-none focus:ring-2 focus:ring-orange-400"
      >
        <span className="text-sm font-semibold text-orange-800">
          Flagged candidates ({results.length})
        </span>
        <svg
          className={`h-4 w-4 text-orange-600 transition-transform ${open ? 'rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <ul className="mt-2 space-y-2" role="list">
          {results.map(({ candidate }) => {
            const status = candidate.override_status ?? candidate.eligibility_status;
            return (
              <li
                key={candidate.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-5 py-3"
              >
                <Link
                  to={`/jobs/${jobId}/candidates/${candidate.id}`}
                  className="text-sm font-medium text-slate-800 hover:text-blue-700 hover:underline focus:outline-none focus:underline truncate"
                >
                  {candidate.filename.replace(/\.(pdf|docx)$/i, '')}
                </Link>
                <div className="shrink-0 flex items-center gap-2">
                  {status && <StatusBadge status={status} />}
                  {candidate.override_reason && (
                    <span className="text-xs text-slate-400 truncate max-w-[180px]" title={candidate.override_reason}>
                      {candidate.override_reason}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
