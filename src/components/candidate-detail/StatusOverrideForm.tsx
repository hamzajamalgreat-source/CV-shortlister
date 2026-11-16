import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { EligibilityStatus } from '../../types';

interface Props {
  candidateId: string;
  currentStatus: EligibilityStatus | null;
  onUpdated: () => void;
}

const STATUS_OPTIONS: EligibilityStatus[] = ['Eligible', 'Not_Eligible', 'Needs_Review'];

export default function StatusOverrideForm({ candidateId, currentStatus, onUpdated }: Props) {
  const [status, setStatus] = useState<EligibilityStatus>(currentStatus ?? 'Needs_Review');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const { error: err } = await supabase
      .from('candidates')
      .update({ override_status: status, override_reason: reason.trim() || null })
      .eq('id', candidateId);

    if (err) {
      setError(err.message);
    } else {
      setSuccess(true);
      onUpdated();
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-700">Override Eligibility Status</h3>

      <div>
        <label htmlFor="override-status" className="block text-xs font-medium text-slate-600 mb-1">
          New Status
        </label>
        <select
          id="override-status"
          value={status}
          onChange={e => setStatus(e.target.value as EligibilityStatus)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="override-reason" className="block text-xs font-medium text-slate-600 mb-1">
          Reason <span className="text-slate-400">(optional)</span>
        </label>
        <textarea
          id="override-reason"
          rows={2}
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Why are you overriding this status?"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
        />
      </div>

      {error && (
        <p role="alert" className="text-xs text-red-600">{error}</p>
      )}
      {success && (
        <p role="status" className="text-xs text-green-700">Status updated.</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-700 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Saving…' : 'Save Override'}
      </button>
    </form>
  );
}
