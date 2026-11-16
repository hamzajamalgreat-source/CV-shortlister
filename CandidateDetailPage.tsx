import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useCandidate } from '../hooks/useCandidate';
import { ExtractedProfileSchema } from '../lib/schemas';
import ProfileSection from '../components/candidate-detail/ProfileSection';
import ScoreDetail from '../components/candidate-detail/ScoreDetail';
import StatusOverrideForm from '../components/candidate-detail/StatusOverrideForm';
import StatusBadge from '../components/common/StatusBadge';
import Layout from '../components/common/Layout';
import { supabase } from '../lib/supabase';
import { ArrowLeft, CheckCircle, FileText, TrendingUp } from 'lucide-react';

export default function CandidateDetailPage() {
  const { id: jobId = '', cid: candidateId = '' } = useParams<{ id: string; cid: string }>();
  const { detail, loading, error } = useCandidate(candidateId);
  const navigate = usenavigate(`/jobs/${jobId}/results`);
  const [markingReviewed, setMarkingReviewed] = useState(false);

  async function handleMarkReviewed() {
    setMarkingReviewed(true);
    await supabase.from('candidates').update({ override_status: 'Eligible', override_reason: 'Reviewed by recruiter' }).eq('id', candidateId);
    setMarkingReviewed(false);
    navigate(`/jobs/${jobId}/results`);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fee2e2 100%)' }} aria-label="Loading">
        <div className="relative w-16 h-16">
          <div style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #dc2626 100%)' }} className="w-full h-full rounded-full animate-spin" />
          <div className="absolute inset-2 rounded-full" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fee2e2 100%)' }} />
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <Layout maxWidth="lg">
        <Link to={`/jobs/${jobId}/results`}/results`} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 mb-6 focus:outline-none">
          <ArrowLeft size={16} />
          Back to Results
        </Link>
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-700 font-semibold">{error ?? 'Candidate not found'}</p>
        </div>
      </Layout>
    );
  }

  const { candidate, analysis, score } = detail;
  const profileParse = analysis ? ExtractedProfileSchema.safeParse(analysis.extracted_profile) : null;
  const profile = profileParse?.success ? profileParse.data : null;
  const displayStatus = candidate.override_status ?? candidate.eligibility_status;

  return (
    <Layout maxWidth="lg">
      <div className="mb-8">
        <Link to={`/jobs/${jobId}/results`}/results`} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 mb-4 focus:outline-none">
          <ArrowLeft size={16} />
          Back to Results
        </Link>
      </div>

      <div style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #dc2626 100%)' }} className="rounded-3xl p-8 mb-8 text-white">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <FileText size={28} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">{candidate.filename.replace(/\.(pdf|docx)$/i, '')}</h1>
                {displayStatus && <StatusBadge status={displayStatus} />}
              </div>
              {score && (
                <p className="text-white/90">
                  Final Score: <span className="text-xl font-bold">{score.final_score}/100</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          {score && (
            <div className="rounded-2xl bg-white border-2 border-gray-200 p-6 space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={18} className="text-orange-600" />
                <h2 className="font-semibold text-gray-900">Score Breakdown</h2>
              </div>
              <ScoreDetail score={score} />
            </div>
          )}

          <div className="rounded-2xl bg-white border-2 border-gray-200 p-6 space-y-5">
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-emerald-600" />
              <h2 className="font-semibold text-gray-900">Actions</h2>
            </div>
            <button
              type="button"
              onClick={handleMarkReviewed}
              disabled={markingReviewed}
              style={{
                background: markingReviewed ? '#d1d5db' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              }}
              className="w-full flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              <CheckCircle size={16} />
              {markingReviewed ? 'Saving...' : 'Mark as Reviewed'}
            </button>
            <div className="border-t border-gray-100 pt-4">
              <StatusOverrideForm
                candidateId={candidateId}
                currentStatus={displayStatus}
                onUpdated={() => navigate(\/jobs/\/results\)}
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {profile ? (
            <div className="rounded-2xl bg-white border-2 border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-5">
                <FileText size={18} className="text-indigo-600" />
                <h2 className="font-semibold text-gray-900">Extracted Profile</h2>
              </div>
              <ProfileSection profile={profile} />
            </div>
          ) : (
            <div className="rounded-2xl bg-gray-50 border-2 border-dashed border-gray-300 py-16 text-center">
              <FileText size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="text-gray-600 font-semibold">No extracted profile</p>
              <p className="text-sm text-gray-500 mt-1">Profile extraction failed or not available</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}