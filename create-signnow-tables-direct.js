// Direct script to create SignNow tables in Supabase
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

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

// Read the SQL files
const connectionsSql = fs.readFileSync('./create-signnow-connections-table.sql', 'utf8');
const webhookEventsSql = fs.readFileSync('./create-signnow-webhook-events-table.sql', 'utf8');

async function createTables() {
  try {
    console.log('🔄 Creating signnow_connections table...');
    
    // Execute the connections table SQL
    const { error: connectionsError } = await supabase.rpc('exec_sql', { 
      sql: connectionsSql 
    });
    
    if (connectionsError) {
      if (connectionsError.message.includes('function exec_sql') && connectionsError.message.includes('does not exist')) {
        console.log('⚙️ Creating exec_sql function...');
        
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
        
        // Execute the SQL directly using the REST API
        const { error: createFunctionError } = await supabase
          .from('_sqlexec')
          .insert({ query: createFunctionSql });
          
        if (createFunctionError) {
          console.error('❌ Error creating exec_sql function:', createFunctionError.message);
          console.error('⚠️ You may need to run this SQL manually in the Supabase SQL editor:');
          console.error(connectionsSql);
          console.error(webhookEventsSql);
          process.exit(1);
        }
        
        console.log('✅ exec_sql function created successfully');
        console.log('🔄 Trying again to create tables...');
        
        // Try again with the exec_sql function
        const { error: retryError } = await supabase.rpc('exec_sql', { 
          sql: connectionsSql 
        });
        
        if (retryError) {
          throw new Error(`Error creating signnow_connections table: ${retryError.message}`);
        }
      } else {
        throw new Error(`Error creating signnow_connections table: ${connectionsError.message}`);
      }
    }
    
    console.log('✅ signnow_connections table created successfully');
    
    console.log('🔄 Creating signnow_webhook_events table...');
    
    // Execute the webhook events table SQL
    const { error: webhookError } = await supabase.rpc('exec_sql', { 
      sql: webhookEventsSql 
    });
    
    if (webhookError) {
      throw new Error(`Error creating signnow_webhook_events table: ${webhookError.message}`);
    }
    
    console.log('✅ signnow_webhook_events table created successfully');
    
    // Verify the tables were created
    console.log('🔄 Verifying tables were created...');
    
    const { data, error: verifyError } = await supabase.rpc('exec_sql', { 
      sql: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'signnow%';" 
    });
    
    if (verifyError) {
      console.warn(`⚠️ Warning during verification: ${verifyError.message}`);
    } else {
      console.log('✅ Tables verified successfully');
      console.log(data);
    }
    
    console.log('🎉 SignNow tables setup complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('⚠️ You may need to run this SQL manually in the Supabase SQL editor:');
    console.error(connectionsSql);
    console.error(webhookEventsSql);
    process.exit(1);
  }
}

// Create the tables
createTables();
