import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Job, Candidate } from '../types';
import { ArrowLeft, Trophy } from 'lucide-react';

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [eligible, setEligible] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) { navigate('/dashboard'); return; }
      const { data: jobData } = await supabase.from('jobs').select('*').eq('id', id).single();
      setJob(jobData);
      const { data: candData } = await supabase.from('candidates').select('*').eq('job_id', id).eq('processing_status', 'Scored');
      setEligible((candData || []).filter(c => c.eligibility_status === 'Eligible'));
      setLoading(false);
    };
    load();
  }, [id, navigate]);

  if (loading || !job) return <div style={{ padding: '24px' }}>Loading...</div>;

  return (
    <div style={{ backgroundColor: '#0a0e27', color: 'white', minHeight: '100vh' }}>
      <header style={{ padding: '24px', borderBottom: '1px solid #2a2d4a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: '#7c3aed', cursor: 'pointer' }}>
            <ArrowLeft size={24} />
          </button>
          <Trophy size={28} />
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{job.title}</h1>
        </div>
      </header>
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        <div style={{ backgroundColor: '#12152e', border: '1px solid #2a2d4a', borderRadius: '8px', padding: '24px', textAlign: 'center', color: '#9ca3af' }}>
          <p>Results page - Eligible candidates: {eligible.length}</p>
        </div>
      </main>
    </div>
  );
}
