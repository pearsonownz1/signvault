import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY;

// Check if the required environment variables are set
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.error('VITE_SUPABASE_URL or SUPABASE_URL:', supabaseUrl);
  console.error('VITE_SUPABASE_SERVICE_KEY or SUPABASE_SERVICE_KEY:', supabaseServiceKey ? '[SET]' : '[NOT SET]');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Service Key:', supabaseServiceKey ? '[SET]' : '[NOT SET]');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test 1: Check if we can query the oauth_states table
    console.log('\nTest 1: Querying oauth_states table');
    const { data: oauthStates, error: selectError } = await supabase
      .from('oauth_states')
      .select('*')
      .limit(5);
    
    if (selectError) {
      console.error('Error querying oauth_states table:', selectError);
    } else {
      console.log('Successfully queried oauth_states table');
      console.log(`Found ${oauthStates.length} records`);
    }
    
    // Test 2: Insert a test record into oauth_states
    console.log('\nTest 2: Inserting test record into oauth_states');
    const testState = {
      user_id: '00000000-0000-0000-0000-000000000000',
      state: 'test-state-' + Date.now(),
      provider: 'test'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('oauth_states')
      .insert(testState)
      .select();
    
    if (insertError) {
      console.error('Error inserting into oauth_states table:', insertError);
    } else {
      console.log('Successfully inserted test record into oauth_states table');
      console.log('Inserted record:', insertData);
      
      // Test 3: Delete the test record
      console.log('\nTest 3: Deleting test record from oauth_states');
      const { error: deleteError } = await supabase
        .from('oauth_states')
        .delete()
        .eq('state', testState.state);
      
      if (deleteError) {
        console.error('Error deleting from oauth_states table:', deleteError);
      } else {
        console.log('Successfully deleted test record from oauth_states table');
      }
    }
    
  } catch (error) {
    console.error('Unexpected error during tests:', error);
  }
}

testConnection();
