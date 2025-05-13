-- Create the oauth_states table if it doesn't exist
CREATE TABLE IF NOT EXISTS oauth_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  state TEXT NOT NULL,
  provider TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS oauth_states_state_idx ON oauth_states(state);
CREATE INDEX IF NOT EXISTS oauth_states_user_id_idx ON oauth_states(user_id);

-- Enable RLS on the oauth_states table
ALTER TABLE oauth_states ENABLE ROW LEVEL SECURITY;

-- Create policy for service role to manage all states
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'oauth_states' AND policyname = 'oauth_states_service_policy'
  ) THEN
    CREATE POLICY oauth_states_service_policy ON oauth_states
      FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END
$$;

-- Create the signnow_connections table if it doesn't exist
CREATE TABLE IF NOT EXISTS signnow_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS signnow_connections_user_id_idx ON signnow_connections(user_id);

-- Enable RLS on the signnow_connections table
ALTER TABLE signnow_connections ENABLE ROW LEVEL SECURITY;

-- Create policies for signnow_connections table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'signnow_connections' AND policyname = 'signnow_connections_select_policy'
  ) THEN
    CREATE POLICY signnow_connections_select_policy ON signnow_connections
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'signnow_connections' AND policyname = 'signnow_connections_insert_policy'
  ) THEN
    CREATE POLICY signnow_connections_insert_policy ON signnow_connections
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'signnow_connections' AND policyname = 'signnow_connections_update_policy'
  ) THEN
    CREATE POLICY signnow_connections_update_policy ON signnow_connections
      FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'signnow_connections' AND policyname = 'signnow_connections_delete_policy'
  ) THEN
    CREATE POLICY signnow_connections_delete_policy ON signnow_connections
      FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Create the signnow_webhook_events table if it doesn't exist
CREATE TABLE IF NOT EXISTS signnow_webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE,
  success BOOLEAN,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for signnow_webhook_events
CREATE INDEX IF NOT EXISTS signnow_webhook_events_document_id_idx ON signnow_webhook_events(document_id);
CREATE INDEX IF NOT EXISTS signnow_webhook_events_user_id_idx ON signnow_webhook_events(user_id);
CREATE INDEX IF NOT EXISTS signnow_webhook_events_event_type_idx ON signnow_webhook_events(event_type);
CREATE INDEX IF NOT EXISTS signnow_webhook_events_success_idx ON signnow_webhook_events(success);

-- Enable RLS on the signnow_webhook_events table
ALTER TABLE signnow_webhook_events ENABLE ROW LEVEL SECURITY;

-- Create service role policy for signnow_webhook_events
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'signnow_webhook_events' AND policyname = 'signnow_webhook_events_service_policy'
  ) THEN
    CREATE POLICY signnow_webhook_events_service_policy ON signnow_webhook_events
      FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END
$$;
