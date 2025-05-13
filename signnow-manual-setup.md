# SignNow Manual Database Setup

Since we're having issues with the automated setup, here's how to manually set up the SignNow tables in your Supabase database.

## Steps to Create Tables

1. Log in to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to the SQL Editor (in the left sidebar)
4. Create a new query
5. Copy and paste the following SQL into the editor:

```sql
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
```

6. Click "Run" to execute the SQL

## Verify Tables Were Created

After running the SQL, you can verify the tables were created by running:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'signnow%';
```

You should see both `signnow_connections` and `signnow_webhook_events` in the results.

## Next Steps

Once the tables are created:

1. Configure the webhook in the SignNow developer portal (see signnow-setup-guide.md)
2. Start your application and test the integration
