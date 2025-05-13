// Script to check if the oauth_states table exists
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase credentials not found in .env file');
  console.error('Make sure VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY are set');
  process.exit(1);
}

// Create Supabase client with service key for admin privileges
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTable() {
  try {
    console.log('🔍 Checking if oauth_states table exists...');
    
    // Query the information_schema to check if the table exists
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'oauth_states');
    
    if (error) {
      throw new Error(`Error checking table: ${error.message}`);
    }
    
    if (data && data.length > 0) {
      console.log('✅ oauth_states table exists');
    } else {
      console.log('❌ oauth_states table does not exist');
      console.log('Creating oauth_states table...');
      
      // Create the oauth_states table
      const createTableSql = `
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
      `;
      
      const { error: createError } = await supabase
        .from('_sqlexec')
        .insert({ query: createTableSql });
      
      if (createError) {
        throw new Error(`Error creating table: ${createError.message}`);
      }
      
      console.log('✅ oauth_states table created successfully');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    // If we can't query the information_schema, try to create the table directly
    console.log('⚙️ Attempting to create the table directly...');
    
    try {
      const createTableSql = `
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
      `;
      
      const { error: createError } = await supabase
        .from('_sqlexec')
        .insert({ query: createTableSql });
      
      if (createError) {
        throw new Error(`Error creating table: ${createError.message}`);
      }
      
      console.log('✅ oauth_states table created successfully');
    } catch (directError) {
      console.error('❌ Error creating table directly:', directError.message);
      console.error('⚠️ You may need to run this SQL manually in the Supabase SQL editor:');
      console.error(`
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
      `);
    }
  }
}

// Run the check
checkTable();
