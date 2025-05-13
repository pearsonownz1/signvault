-- Create the signnow_connections table
CREATE TABLE IF NOT EXISTS signnow_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  signnow_user_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  email TEXT,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS signnow_connections_user_id_idx ON signnow_connections(user_id);

-- Add RLS policies
ALTER TABLE signnow_connections ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own connections
CREATE POLICY signnow_connections_select_policy ON signnow_connections
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for users to insert their own connections
CREATE POLICY signnow_connections_insert_policy ON signnow_connections
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own connections
CREATE POLICY signnow_connections_update_policy ON signnow_connections
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy for users to delete their own connections
CREATE POLICY signnow_connections_delete_policy ON signnow_connections
  FOR DELETE
  USING (auth.uid() = user_id);
