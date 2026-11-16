import { Link } from 'react-router-dom';
import type { Job } from '../../types';
import { Briefcase, Users } from 'lucide-react';

export default function JobCard({ job, candidateCount = 0 }: { job: Job; candidateCount?: number }) {
  const date = new Date(job.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const skillCount = (job.criteria?.requiredSkills ?? []).length;

  return (
    <article
      style={{
        backgroundColor: '#1a1f2e',
        border: '1px solid #2d3748',
        borderRadius: '12px',
        padding: '20px',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#7c3aed';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#2d3748';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Job Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Briefcase size={16} style={{ color: '#ffffff' }} />
            </div>
            <h2
              style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#ffffff',
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {job.title}
            </h2>
          </div>

          {/* Job Description */}
          {job.description && (
            <p
              style={{
                fontSize: '13px',
                color: '#8a92a1',
                margin: '0 0 12px 0',
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {job.description}
            </p>
          )}

          {/* Metadata */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: '#8a92a1' }}>
            <span>Created {date}</span>
            {skillCount > 0 && <span>{skillCount} required skill{skillCount !== 1 ? 's' : ''}</span>}
          </div>
        </div>

        {/* Right Section - Stats and Badge */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
          {/* Candidate Count Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              backgroundColor: '#242d3f',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#b4bcc9',
            }}
          >
            <Users size={14} />
            <span>{candidateCount} candidate{candidateCount !== 1 ? 's' : ''}</span>
          </div>

          {/* Action Links */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link
              to={`/jobs/${job.id}/edit`}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                border: '1px solid #2d3748',
                backgroundColor: '#242d3f',
                color: '#b4bcc9',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#7c3aed';
                e.currentTarget.style.color = '#a78bfa';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#2d3748';
                e.currentTarget.style.color = '#b4bcc9';
              }}
            >
              Edit
            </Link>
            <Link
              to={`/jobs/${job.id}/upload`}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',
                color: '#ffffff',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Upload
            </Link>
            <Link
              to={`/jobs/${job.id}/results`}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                color: '#ffffff',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Results
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
