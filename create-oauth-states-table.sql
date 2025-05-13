-- Create the oauth_states table
CREATE TABLE IF NOT EXISTS oauth_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  state TEXT NOT NULL,
  provider TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index on state for faster lookups
CREATE INDEX IF NOT EXISTS oauth_states_state_idx ON oauth_states(state);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS oauth_states_user_id_idx ON oauth_states(user_id);
