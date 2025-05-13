-- Drop the table if it exists
DROP TABLE IF EXISTS api_keys CASCADE;

-- Create API keys table without foreign key constraint for testing
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL, -- Removed foreign key constraint for testing
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  permissions JSONB NOT NULL DEFAULT '{"read": true, "write": false}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  last_used_at TIMESTAMP WITH TIME ZONE
);

-- Add indexes
CREATE INDEX api_keys_user_id_idx ON api_keys(user_id);
CREATE INDEX api_keys_key_hash_idx ON api_keys(key_hash);

-- Set up RLS policies
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own API keys
CREATE POLICY api_keys_select_policy ON api_keys
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for users to insert their own API keys
CREATE POLICY api_keys_insert_policy ON api_keys
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own API keys
CREATE POLICY api_keys_update_policy ON api_keys
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy for users to delete their own API keys
CREATE POLICY api_keys_delete_policy ON api_keys
  FOR DELETE
  USING (auth.uid() = user_id);

-- Check if audit_log_types table exists before inserting
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'audit_log_types') THEN
    -- Add audit log entries for API key operations
    INSERT INTO audit_log_types (type, description)
    VALUES 
      ('api_key_created', 'API key created'),
      ('api_key_deleted', 'API key deleted'),
      ('api_key_updated', 'API key updated')
    ON CONFLICT (type) DO NOTHING;
  END IF;
END
$$;
