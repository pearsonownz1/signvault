-- Create PandaDoc webhook events table
CREATE TABLE IF NOT EXISTS pandadoc_webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  document_id TEXT NOT NULL,
  document_status TEXT,
  document_name TEXT,
  document_date TIMESTAMP WITH TIME ZONE,
  document_uuid TEXT,
  raw_data JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on document_id for faster lookups
CREATE INDEX IF NOT EXISTS pandadoc_webhook_events_document_id_idx ON pandadoc_webhook_events(document_id);

-- Create index on event_type for faster lookups
CREATE INDEX IF NOT EXISTS pandadoc_webhook_events_event_type_idx ON pandadoc_webhook_events(event_type);

-- Create index on processed for faster lookups
CREATE INDEX IF NOT EXISTS pandadoc_webhook_events_processed_idx ON pandadoc_webhook_events(processed);
