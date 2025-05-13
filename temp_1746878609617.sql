-- Create the storage bucket for vaulting signed documents
-- Copy and paste this into the Supabase SQL Editor and click "Run"

-- Check if the bucket exists
DO $$
DECLARE
    bucket_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM storage.buckets WHERE name = 'vault'
    ) INTO bucket_exists;

    IF NOT bucket_exists THEN
        -- Create the vault bucket (private)
        INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
        VALUES ('vault', 'vault', false, false, 10485760, '{application/pdf}');
        
        RAISE NOTICE 'Created vault storage bucket';
    ELSE
        RAISE NOTICE 'Vault storage bucket already exists';
    END IF;
END
$$;

-- Set up RLS policies for the vault bucket
-- Allow users to read only their own documents
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage'
        AND policyname = 'vault_documents_select_policy'
    ) THEN
        CREATE POLICY vault_documents_select_policy ON storage.objects
            FOR SELECT
            USING (
                bucket_id = 'vault' AND 
                (storage.foldername(name))[1] = auth.uid()::text
            );
        
        RAISE NOTICE 'Created vault select policy';
    END IF;
    
    -- Allow service role to insert documents
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage'
        AND policyname = 'vault_documents_insert_policy'
    ) THEN
        CREATE POLICY vault_documents_insert_policy ON storage.objects
            FOR INSERT
            WITH CHECK (
                bucket_id = 'vault' AND
                auth.jwt() ->> 'role' = 'service_role'
            );
        
        RAISE NOTICE 'Created vault insert policy';
    END IF;
END
$$;

-- Create a comment on the bucket
COMMENT ON TABLE storage.buckets IS 'Storage buckets, including the vault for signed documents';
