-- Migration: Create Vaulting Tables
-- Description: Sets up the necessary tables for document vaulting functionality

-- Documents Table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_hash TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('upload', 'adobe_sign', 'pandadoc', 'docusign', 'other')),
  vault_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL CHECK (status IN ('vaulted', 'pending')),
  retention_period TEXT,
  watermarked_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);

-- Create index on file_hash for verification lookups
CREATE INDEX IF NOT EXISTS idx_documents_file_hash ON documents(file_hash);

-- Audit Log Table
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('vaulted', 'viewed', 'downloaded', 'shared', 'verified')),
  actor TEXT NOT NULL, -- user_id or 'system'
  event_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT
);

-- Create index on document_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_audit_log_document_id ON audit_log(document_id);

-- Create index on event_time for chronological queries
CREATE INDEX IF NOT EXISTS idx_audit_log_event_time ON audit_log(event_time);

-- Document Tags Table (for many-to-many relationship)
CREATE TABLE IF NOT EXISTS document_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique constraint to prevent duplicate tags on a document
CREATE UNIQUE INDEX IF NOT EXISTS idx_document_tags_unique ON document_tags(document_id, tag_name);

-- Create index on tag_name for tag-based searches
CREATE INDEX IF NOT EXISTS idx_document_tags_tag_name ON document_tags(tag_name);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update the updated_at column
CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON documents
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for documents table
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own documents
CREATE POLICY documents_select_policy ON documents
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can only insert their own documents
CREATE POLICY documents_insert_policy ON documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own documents
CREATE POLICY documents_update_policy ON documents
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for audit_log table
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see audit logs for their own documents
CREATE POLICY audit_log_select_policy ON audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = audit_log.document_id
      AND documents.user_id = auth.uid()
    )
  );

-- Policy: System can insert audit logs
CREATE POLICY audit_log_insert_policy ON audit_log
  FOR INSERT WITH CHECK (true);

-- RLS Policies for document_tags table
ALTER TABLE document_tags ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see tags for their own documents
CREATE POLICY document_tags_select_policy ON document_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_tags.document_id
      AND documents.user_id = auth.uid()
    )
  );

-- Policy: Users can only insert tags for their own documents
CREATE POLICY document_tags_insert_policy ON document_tags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_tags.document_id
      AND documents.user_id = auth.uid()
    )
  );

-- Policy: Users can only delete tags for their own documents
CREATE POLICY document_tags_delete_policy ON document_tags
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_tags.document_id
      AND documents.user_id = auth.uid()
    )
  );

-- Storage bucket for vaulted documents
-- Note: This needs to be created in the Supabase dashboard or via the API
-- The following is just a comment for reference:
-- CREATE BUCKET documents WITH public = false;
