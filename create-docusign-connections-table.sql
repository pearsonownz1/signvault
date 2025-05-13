-- Create the docusign_connections table in Supabase
-- Copy and paste this into the Supabase SQL Editor and click "Run"

create table if not exists docusign_connections (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  docusign_account_id text not null,
  docusign_account_name text not null,
  docusign_base_uri text not null,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamp with time zone not null,
  email text,
  name text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS docusign_connections_user_id_idx ON docusign_connections(user_id);
CREATE INDEX IF NOT EXISTS docusign_connections_docusign_account_id_idx ON docusign_connections(docusign_account_id);
CREATE UNIQUE INDEX IF NOT EXISTS docusign_connections_user_account_idx ON docusign_connections(user_id, docusign_account_id);

-- Add RLS policies
ALTER TABLE docusign_connections ENABLE ROW LEVEL SECURITY;

-- Check if policies exist before creating them
DO $$
BEGIN
    -- Allow users to see only their own connections
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'docusign_connections' 
        AND policyname = 'docusign_connections_select_policy'
    ) THEN
        CREATE POLICY docusign_connections_select_policy ON docusign_connections
            FOR SELECT USING (auth.uid() = user_id);
    END IF;

    -- Allow users to delete only their own connections
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'docusign_connections' 
        AND policyname = 'docusign_connections_delete_policy'
    ) THEN
        CREATE POLICY docusign_connections_delete_policy ON docusign_connections
            FOR DELETE USING (auth.uid() = user_id);
    END IF;

    -- Allow service role to do everything
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'docusign_connections' 
        AND policyname = 'docusign_connections_service_policy'
    ) THEN
        CREATE POLICY docusign_connections_service_policy ON docusign_connections
            USING (auth.jwt() ->> 'role' = 'service_role');
    END IF;
END
$$;

-- Create a comment on the table
COMMENT ON TABLE docusign_connections IS 'Stores DocuSign OAuth connections for users';
