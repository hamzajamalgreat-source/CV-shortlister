-- Migration 003: Private storage bucket for CV files
-- Apply after 002_rls_policies.sql

-- Create private bucket for CV files
INSERT INTO storage.buckets (id, name, public)
VALUES ('cvs', 'cvs', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated recruiters to upload to their own folder: {owner_id}/{job_id}/{filename}
CREATE POLICY "cvs_upload_own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'cvs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow authenticated recruiters to read their own CV files
CREATE POLICY "cvs_select_own" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'cvs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow authenticated recruiters to delete their own CV files
CREATE POLICY "cvs_delete_own" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'cvs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
