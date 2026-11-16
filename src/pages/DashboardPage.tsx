import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import JobCard from '../components/dashboard/JobCard';
import type { Job } from '../types';
import { Plus } from 'lucide-react';

export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login');
          return;
        }

        const { data, error: err } = await supabase
          .from('jobs')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false });

        if (err) throw err;
        setJobs(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, [navigate]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0e27', color: 'white' }}>
      <header style={{ padding: '24px', borderBottom: '1px solid #2a2d4a', backgroundColor: '#12152e' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0' }}>Dashboard</h1>
            <p style={{ color: '#9ca3af', margin: 0 }}>Manage your recruitment jobs</p>
          </div>
          <button
            onClick={() => navigate('/jobs/new')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
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
            <Plus size={20} />
            New Job
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        {error && (
          <div style={{ padding: '12px 16px', backgroundColor: '#7f1d1d', borderRadius: '8px', marginBottom: '24px', color: '#fecaca' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: '#9ca3af' }}>Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: '#9ca3af' }}>
            <p style={{ marginBottom: '16px' }}>No jobs yet. Create one to get started.</p>
            <button
              onClick={() => navigate('/jobs/new')}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Create First Job
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} candidateCount={0} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
