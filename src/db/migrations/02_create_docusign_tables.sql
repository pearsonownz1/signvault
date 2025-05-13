-- Create DocuSign connections table
CREATE TABLE IF NOT EXISTS docusign_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  docusign_account_id TEXT NOT NULL,
  docusign_account_name TEXT,
  docusign_base_uri TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  email TEXT,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, docusign_account_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_docusign_connections_user_id ON docusign_connections(user_id);

-- Create DocuSign envelopes table to track processed envelopes
CREATE TABLE IF NOT EXISTS docusign_envelopes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_id UUID NOT NULL REFERENCES docusign_connections(id) ON DELETE CASCADE,
  envelope_id TEXT NOT NULL,
  envelope_status TEXT NOT NULL,
  subject TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  document_id UUID REFERENCES documents(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(connection_id, envelope_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_docusign_envelopes_user_id ON docusign_envelopes(user_id);
CREATE INDEX IF NOT EXISTS idx_docusign_envelopes_connection_id ON docusign_envelopes(connection_id);
CREATE INDEX IF NOT EXISTS idx_docusign_envelopes_envelope_id ON docusign_envelopes(envelope_id);

-- Create DocuSign webhook events table to track received webhook events
CREATE TABLE IF NOT EXISTS docusign_webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  envelope_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL,
  raw_data JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  processing_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_docusign_webhook_events_envelope_id ON docusign_webhook_events(envelope_id);
CREATE INDEX IF NOT EXISTS idx_docusign_webhook_events_processed ON docusign_webhook_events(processed);

-- Create RLS policies

-- DocuSign connections policies
ALTER TABLE docusign_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own DocuSign connections"
  ON docusign_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own DocuSign connections"
  ON docusign_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own DocuSign connections"
  ON docusign_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own DocuSign connections"
  ON docusign_connections FOR DELETE
  USING (auth.uid() = user_id);

-- DocuSign envelopes policies
ALTER TABLE docusign_envelopes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own DocuSign envelopes"
  ON docusign_envelopes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own DocuSign envelopes"
  ON docusign_envelopes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own DocuSign envelopes"
  ON docusign_envelopes FOR UPDATE
  USING (auth.uid() = user_id);

-- DocuSign webhook events policies
-- Note: Webhook events are managed by the server, not directly by users
ALTER TABLE docusign_webhook_events ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage webhook events
CREATE POLICY "Service role can manage webhook events"
  ON docusign_webhook_events
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update the updated_at column
CREATE TRIGGER update_docusign_connections_updated_at
  BEFORE UPDATE ON docusign_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_docusign_envelopes_updated_at
  BEFORE UPDATE ON docusign_envelopes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_docusign_webhook_events_updated_at
  BEFORE UPDATE ON docusign_webhook_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
