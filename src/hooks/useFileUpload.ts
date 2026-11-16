import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { ProcessingStatus, Candidate } from '../types';

export interface FileUploadState {
  id: string;
  filename: string;
  status: ProcessingStatus;
  error?: string;
  progress?: number;
}

export interface UseFileUploadReturn {
  files: FileUploadState[];
  uploading: boolean;
  uploadFiles: (files: File[]) => Promise<void>;
  retryFile: (id: string) => void;
  updateFile: (id: string, patch: Partial<FileUploadState>) => void;
}

export function useFileUpload(jobId: string): UseFileUploadReturn {
  const [files, setFiles] = useState<FileUploadState[]>([]);
  const [uploading, setUploading] = useState(false);

  const uploadFile = useCallback(
    async (file: File) => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!user || userError) {
        console.error('Unable to get current user:', userError);
        return;
      }

      const ownerId = user.id;
      const tempId = crypto.randomUUID();
      const storagePath = `${ownerId}/${jobId}/${tempId}_${file.name}`;

      const uploadState: FileUploadState = {
        id: tempId,
        filename: file.name,
        status: 'Uploaded',
      };

      setFiles((prev) => [...prev, uploadState]);
      setUploading(true);

      try {
        const { error: uploadError } = await supabase.storage
          .from('cvs')
          .upload(storagePath, file);

        if (uploadError) {
          setFiles((prev) =>
            prev.map((u) =>
              u.id === tempId
                ? { ...u, status: 'Failed', error: uploadError.message }
                : u
            )
          );
          return;
        }

        const { data: candidateData, error: insertError } = await supabase
          .from('candidates')
          .insert({
            job_id: jobId,
            filename: file.name,
            storage_path: storagePath,
            processing_status: 'Uploaded',
          })
          .select()
          .single();

        if (insertError) {
          setFiles((prev) =>
            prev.map((u) =>
              u.id === tempId
                ? { ...u, status: 'Failed', error: insertError.message }
                : u
            )
          );
          return;
        }

        const candidateId = (candidateData as unknown as Candidate).id;
        setFiles((prev) =>
          prev.map((u) =>
            u.id === tempId
              ? { ...u, id: candidateId, status: 'Extracting' }
              : u
          )
        );

        const session = await supabase.auth.getSession();
        const token = session.data.session?.access_token;

        if (!token) throw new Error('No auth token');

        const response = await fetch('/api/process-cv', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            candidateId,
            jobId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          setFiles((prev) =>
            prev.map((u) =>
              u.id === candidateId
                ? {
                    ...u,
                    status: 'Failed',
                    error: errorData.error || 'Processing failed',
                  }
                : u
            )
          );
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        setFiles((prev) =>
          prev.map((u) =>
            u.id === tempId
              ? { ...u, status: 'Failed', error: errorMessage }
              : u
          )
        );
      }
    },
    [jobId]
  );

  const uploadFiles = useCallback(
    async (filesToUpload: File[]) => {
      for (const file of filesToUpload) {
        await uploadFile(file);
      }
      setUploading(false);
    },
    [uploadFile]
  );

  const retryFile = useCallback(
    (fileId: string) => {
      const file = files.find((f) => f.id === fileId);
      if (file) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? { ...f, status: 'Uploaded' as const, error: undefined }
              : f
          )
        );
      }
    },
    [files]
  );

  const updateFile = useCallback(
    (id: string, patch: Partial<FileUploadState>) => {
      setFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, ...patch } : f))
      );
    },
    []
  );

  return { files, uploading, uploadFiles, retryFile, updateFile };
}
