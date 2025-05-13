import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// SQL files to execute
const sqlFiles = [
  'create-pandadoc-connections-table.sql',
  'create-pandadoc-webhook-events-table.sql'
];

async function runSqlFile(filePath) {
  try {
    console.log(`Reading SQL file: ${filePath}`);
    const sql = fs.readFileSync(path.resolve(filePath), 'utf8');
    
    console.log(`Executing SQL from ${filePath}...`);
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error(`Error executing SQL from ${filePath}:`, error);
      return false;
    }
    
    console.log(`Successfully executed SQL from ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return false;
  }
}

async function setupTables() {
  console.log('Setting up PandaDoc tables...');
  
  for (const sqlFile of sqlFiles) {
    const success = await runSqlFile(sqlFile);
    if (!success) {
      console.error(`Failed to execute ${sqlFile}. Stopping setup.`);
      process.exit(1);
    }
  }
  
  console.log('PandaDoc tables setup completed successfully!');
}

setupTables().catch(error => {
  console.error('Error setting up PandaDoc tables:', error);
  process.exit(1);
});
