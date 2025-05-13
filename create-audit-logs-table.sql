-- Create the audit_logs table in Supabase
-- Copy and paste this into the Supabase SQL Editor and click "Run"

create table if not exists audit_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete set null,
  action text not null,
  resource_type text not null,
  resource_id text not null,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS audit_logs_action_idx ON audit_logs(action);
CREATE INDEX IF NOT EXISTS audit_logs_resource_type_idx ON audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS audit_logs_resource_id_idx ON audit_logs(resource_id);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs(created_at);

-- Add RLS policies
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Check if policies exist before creating them
DO $$
BEGIN
    -- Allow users to see only their own audit logs
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'audit_logs' 
        AND policyname = 'audit_logs_select_policy'
    ) THEN
        CREATE POLICY audit_logs_select_policy ON audit_logs
            FOR SELECT USING (auth.uid() = user_id);
    END IF;

    -- Allow service role to insert audit logs
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'audit_logs' 
        AND policyname = 'audit_logs_insert_policy'
    ) THEN
        CREATE POLICY audit_logs_insert_policy ON audit_logs
            FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
    END IF;

    -- Allow service role to do everything
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'audit_logs' 
        AND policyname = 'audit_logs_service_policy'
    ) THEN
        CREATE POLICY audit_logs_service_policy ON audit_logs
            USING (auth.jwt() ->> 'role' = 'service_role');
    END IF;
END
$$;

-- Create a comment on the table
COMMENT ON TABLE audit_logs IS 'Audit logs for tracking important actions in the system';
