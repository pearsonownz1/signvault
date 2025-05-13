-- Create PandaDoc connections table
CREATE TABLE IF NOT EXISTS pandadoc_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pandadoc_user_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  email TEXT,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS pandadoc_connections_user_id_idx ON pandadoc_connections(user_id);

-- Add RLS policies
ALTER TABLE pandadoc_connections ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view only their own connections
CREATE POLICY pandadoc_connections_select_policy ON pandadoc_connections
  FOR SELECT USING (auth.uid() = user_id);

-- Policy to allow users to insert only their own connections
CREATE POLICY pandadoc_connections_insert_policy ON pandadoc_connections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update only their own connections
CREATE POLICY pandadoc_connections_update_policy ON pandadoc_connections
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy to allow users to delete only their own connections
CREATE POLICY pandadoc_connections_delete_policy ON pandadoc_connections
  FOR DELETE USING (auth.uid() = user_id);
