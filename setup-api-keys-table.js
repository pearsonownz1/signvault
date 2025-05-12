import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables: VITE_SUPABASE_URL or SUPABASE_SERVICE_KEY');
  process.exit(1);
}

// Initialize Supabase client with service key for admin privileges
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupApiKeysTable() {
  try {
    console.log('Setting up API keys table...');
    
    // Read the SQL file
    const sqlContent = fs.readFileSync('./create-api-keys-table.sql', 'utf8');
    
    // Split the SQL content into individual statements
    const statements = sqlContent
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
    
    // Execute each SQL statement
    for (const statement of statements) {
      console.log(`Executing SQL statement: ${statement.substring(0, 50)}...`);
      
      const { error } = await supabase.rpc('exec_sql', {
        query: statement
      });
      
      if (error) {
        console.error('Error executing SQL statement:', error);
        // Continue with other statements even if one fails
      }
    }
    
    console.log('API keys table setup completed successfully!');
    
    // Verify the table was created
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error verifying API keys table:', error);
    } else {
      console.log('API keys table verified successfully!');
    }
    
  } catch (error) {
    console.error('Error setting up API keys table:', error);
    process.exit(1);
  }
}

// Run the setup
setupApiKeysTable();
