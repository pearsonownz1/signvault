-- Create a table to store OAuth states and code verifiers
CREATE TABLE IF NOT EXISTS oauth_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  state TEXT NOT NULL UNIQUE,
  code_verifier TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT oauth_states_state_key UNIQUE (state)
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS oauth_states_state_idx ON oauth_states(state);
CREATE INDEX IF NOT EXISTS oauth_states_user_id_idx ON oauth_states(user_id);

-- Add RLS policies
ALTER TABLE oauth_states ENABLE ROW LEVEL SECURITY;

-- Allow users to see only their own OAuth states
CREATE POLICY oauth_states_select_policy ON oauth_states
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own OAuth states
CREATE POLICY oauth_states_insert_policy ON oauth_states
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own OAuth states
CREATE POLICY oauth_states_delete_policy ON oauth_states
  FOR DELETE USING (auth.uid() = user_id);

-- Allow service role to do everything
CREATE POLICY oauth_states_service_policy ON oauth_states
  USING (auth.jwt() ->> 'role' = 'service_role');
