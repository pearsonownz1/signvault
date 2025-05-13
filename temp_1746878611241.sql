-- Create the oauth_states table in Supabase
-- Copy and paste this into the Supabase SQL Editor and click "Run"

create table if not exists oauth_states (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  state text not null unique,
  code_verifier text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  expires_at timestamp with time zone default (timezone('utc'::text, now()) + interval '1 hour')
);

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS oauth_states_user_id_idx ON oauth_states(user_id);
CREATE INDEX IF NOT EXISTS oauth_states_state_idx ON oauth_states(state);
CREATE INDEX IF NOT EXISTS oauth_states_expires_at_idx ON oauth_states(expires_at);

-- Add RLS policies
ALTER TABLE oauth_states ENABLE ROW LEVEL SECURITY;

-- Check if policies exist before creating them
DO $$
BEGIN
    -- Allow service role to do everything
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'oauth_states' 
        AND policyname = 'oauth_states_service_policy'
    ) THEN
        CREATE POLICY oauth_states_service_policy ON oauth_states
            USING (auth.jwt() ->> 'role' = 'service_role');
    END IF;
END
$$;

-- Create a comment on the table
COMMENT ON TABLE oauth_states IS 'Stores OAuth state parameters for PKCE flow';

-- Create a function to clean up expired states
CREATE OR REPLACE FUNCTION cleanup_expired_oauth_states()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM oauth_states
  WHERE expires_at < timezone('utc'::text, now());
END;
$$;

-- Create a cron job to clean up expired states every hour
SELECT cron.schedule(
  'cleanup-expired-oauth-states',
  '0 * * * *', -- Run every hour
  $$SELECT cleanup_expired_oauth_states()$$
);
