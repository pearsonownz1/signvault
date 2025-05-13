-- Create the signnow_webhook_events table
CREATE TABLE IF NOT EXISTS signnow_webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  success BOOLEAN NOT NULL DEFAULT FALSE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index on document_id for faster lookups
CREATE INDEX IF NOT EXISTS signnow_webhook_events_document_id_idx ON signnow_webhook_events(document_id);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS signnow_webhook_events_user_id_idx ON signnow_webhook_events(user_id);

-- Create index on event_type for faster lookups
CREATE INDEX IF NOT EXISTS signnow_webhook_events_event_type_idx ON signnow_webhook_events(event_type);

-- Create index on success for faster lookups
CREATE INDEX IF NOT EXISTS signnow_webhook_events_success_idx ON signnow_webhook_events(success);
