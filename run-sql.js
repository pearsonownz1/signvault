// Script to run SQL queries against Supabase
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase credentials not found in .env file');
  console.error('Make sure VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY are set');
  // Exit with error code 1
  process.exit(1);
}

// Create Supabase client with service key for admin privileges
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// SQL query to add blockchain_txid column to documents table
const sql = `
-- Add blockchain_txid column to documents table
ALTER TABLE documents ADD COLUMN IF NOT EXISTS blockchain_txid TEXT;

-- Add comment explaining the blockchain_txid column
COMMENT ON COLUMN documents.blockchain_txid IS 'Polygon blockchain transaction ID containing the document hash';
`;

async function runSql() {
  try {
    console.log('🔄 Running SQL query to add blockchain_txid column to documents table...');
    
    // Execute the SQL query directly using the REST API
    const { error: sqlError } = await supabase
      .from('_sqlexec')
      .insert({ query: sql });
    
    if (sqlError) {
      throw new Error(`Error executing SQL: ${sqlError.message}`);
    }
    
    console.log('✅ SQL query executed successfully');
    console.log('✅ blockchain_txid column added to documents table');
    
    // Verify the column was added
    const { data, error: verifyError } = await supabase
      .from('documents')
      .select('blockchain_txid')
      .limit(1);
      
    if (verifyError) {
      if (verifyError.message.includes('column "blockchain_txid" does not exist')) {
        throw new Error('Column was not added successfully');
      } else {
        console.warn(`⚠️ Warning during verification: ${verifyError.message}`);
      }
    } else {
      console.log('✅ Verified blockchain_txid column exists in documents table');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    // If the error is about the exec_sql function not existing, create it
    if (error.message.includes('function exec_sql') && error.message.includes('does not exist')) {
      console.log('⚙️ Creating exec_sql function...');
      
      try {
        // Create the exec_sql function
        const createFunctionSql = `
          CREATE OR REPLACE FUNCTION exec_sql(sql text)
          RETURNS void
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          BEGIN
            EXECUTE sql;
          END;
          $$;
        `;
        
        const { error: createFunctionError } = await supabase.rpc('exec_sql', { 
          sql: createFunctionSql 
        });
        
        if (createFunctionError) {
          throw new Error(`Error creating exec_sql function: ${createFunctionError.message}`);
        }
        
        console.log('✅ exec_sql function created successfully');
        console.log('🔄 Please run this script again to add the blockchain_txid column');
      } catch (functionError) {
        console.error('❌ Error creating exec_sql function:', functionError.message);
        
        // If we can't create the function, try direct SQL execution
        console.log('⚙️ Attempting direct SQL execution...');
        
        try {
          // Execute the SQL directly using the REST API
          const { error: directSqlError } = await supabase
            .from('_sqlexec')
            .insert({ query: sql });
            
          if (directSqlError) {
            throw new Error(`Error with direct SQL execution: ${directSqlError.message}`);
          }
          
          console.log('✅ SQL executed directly successfully');
        } catch (directError) {
          console.error('❌ Error with direct SQL execution:', directError.message);
          console.error('⚠️ You may need to run this SQL manually in the Supabase SQL editor:');
          console.error(sql);
        }
      }
    } else if (error.message.includes('permission denied')) {
      console.error('❌ Permission denied. Make sure you are using the service role key.');
      console.error('⚠️ You may need to run this SQL manually in the Supabase SQL editor:');
      console.error(sql);
    } else {
      console.error('⚠️ You may need to run this SQL manually in the Supabase SQL editor:');
      console.error(sql);
    }
  }
}

// Run the SQL query
runSql();
