import { Link } from 'react-router-dom';
import ScoreBreakdown from './ScoreBreakdown';
import type { CandidateResult } from '../../hooks/useResults';
import { Trophy, Award, Medal, Star, Briefcase, Code, BookOpen, Zap } from 'lucide-react';

interface Props {
  results: CandidateResult[];
  jobId: string;
}

export default function CandidateTable({ results, jobId }: Props) {
  if (results.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full mb-4" style={{ background: '#f3f4f6' }}>
          <Briefcase size={40} className="text-gray-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">No candidates yet</h3>
        <p className="text-gray-600">Upload CVs to see ranked candidates</p>
      </div>
    );
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return { bg: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', icon: Trophy };
    if (rank === 2) return { bg: 'linear-gradient(135deg, #c7d2e0 0%, #9ca3af 100%)', icon: Award };
    if (rank === 3) return { bg: 'linear-gradient(135deg, #fdba74 0%, #f97316 100%)', icon: Medal };
    return { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', icon: Star };
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Ranked Candidates</h2>
        <p className="text-gray-600 mt-2">{results.length} candidate{results.length !== 1 ? 's' : ''} found</p>
      </div>

      <div className="space-y-4">
        {results.map((result, index) => {
          const { candidate, score } = result;
          const rank = index + 1;
          const displayName = candidate.filename.replace(/\.(pdf|docx)\$/i, '');
          const { bg, icon: Icon } = getRankColor(rank);

          return (
            <div key={candidate.id} style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)', border: '2px solid rgba(230,230,250,0.5)' }} className="rounded-2xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-6">
                {/* Rank */}
                <div style={{ background: bg }} className="h-14 w-14 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-lg">
                  <Icon size={24} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <Link
                      to={'/jobs/' + jobId + '/candidates/' + candidate.id}
                      className="text-xl font-bold text-gray-900 hover:text-indigo-600 truncate"
                    >
                      {displayName}
                    </Link>
                    {score && (
                      <div className="text-right flex-shrink-0">
                        <div className="text-3xl font-bold text-indigo-600">
                          {score.final_score.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-500">/100</div>
                      </div>
                    )}
                  </div>

                  {/* Score bar */}
                  {score && (
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
                      <div
                        style={{
                          width: score.final_score + '%',
                          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                        }}
                        className="h-full rounded-full transition-all duration-500"
                      />
                    </div>
                  )}

                  {/* Component scores */}
                  {score && (
                    <div className="grid grid-cols-4 gap-3 mb-4">
                      <div style={{ background: '#f0f4ff', borderLeft: '4px solid #667eea' }} className="p-3 rounded-lg">
                        <div className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                          <Briefcase size={12} />
                          Skills
                        </div>
                        <div className="text-2xl font-bold text-indigo-600">{score.component_scores.skills}</div>
                      </div>
                      <div style={{ background: '#f0f4ff', borderLeft: '4px solid #764ba2' }} className="p-3 rounded-lg">
                        <div className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                          <Code size={12} />
                          Experience
                        </div>
                        <div className="text-2xl font-bold text-purple-600">{score.component_scores.experience}</div>
                      </div>
                      <div style={{ background: '#f0f4ff', borderLeft: '4px solid #667eea' }} className="p-3 rounded-lg">
                        <div className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                          <Zap size={12} />
                          Projects
                        </div>
                        <div className="text-2xl font-bold text-indigo-600">{score.component_scores.projects}</div>
                      </div>
                      <div style={{ background: '#f0f4ff', borderLeft: '4px solid #764ba2' }} className="p-3 rounded-lg">
                        <div className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                          <BookOpen size={12} />
                          Education
                        </div>
                        <div className="text-2xl font-bold text-purple-600">{score.component_scores.education}</div>
                      </div>
                    </div>
                  )}

                  {score && (
                    <div className="border-t border-gray-200 pt-4">
                      <ScoreBreakdown score={score} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
