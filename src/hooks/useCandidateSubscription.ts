import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { ProcessingStatus } from '../types';
import type { FileUploadState } from './useFileUpload';

interface CandidateUpdate {
  id: string;
  processing_status: ProcessingStatus;
}

export function useCandidateSubscription(
  jobId: string,
  updateFile: (id: string, patch: Partial<FileUploadState>) => void,
) {
  useEffect(() => {
    if (!jobId) return;

    const channel = supabase
      .channel(`candidates:job_id=eq.${jobId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'candidates',
          filter: `job_id=eq.${jobId}`,
        },
        (payload) => {
          const updated = payload.new as CandidateUpdate;
          updateFile(updated.id, { status: updated.processing_status });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [jobId, updateFile]);
}
