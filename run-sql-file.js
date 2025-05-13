// Script to run SQL files against Supabase
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Check if a file path was provided
if (process.argv.length < 3) {
  console.error('❌ No SQL file specified');
  console.error('Usage: node run-sql-file.js <path-to-sql-file>');
  process.exit(1);
}

// Get the SQL file path from command line arguments
const sqlFilePath = process.argv[2];

// Read the SQL file
let sql;
try {
  sql = fs.readFileSync(sqlFilePath, 'utf8');
  console.log(`📄 Read SQL from ${sqlFilePath}`);
} catch (error) {
  console.error(`❌ Error reading SQL file: ${error.message}`);
  process.exit(1);
}

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

async function runSql() {
  try {
    console.log('🔄 Running SQL query...');
    
    // Execute the SQL query directly using the REST API
    const { error: sqlError } = await supabase
      .from('_sqlexec')
      .insert({ query: sql });
    
    if (sqlError) {
      throw new Error(`Error executing SQL: ${sqlError.message}`);
    }
    
    console.log('✅ SQL query executed successfully');
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('permission denied')) {
      console.error('❌ Permission denied. Make sure you are using the service role key.');
      console.error('⚠️ You may need to run this SQL manually in the Supabase SQL editor:');
      console.error(sql);
    } else {
      console.error('⚠️ You may need to run this SQL manually in the Supabase SQL editor:');
      console.error(sql);
    }
    
    process.exit(1);
  }
}

// Run the SQL query
runSql();
