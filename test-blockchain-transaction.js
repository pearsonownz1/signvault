// Script to test blockchain transaction display in the UI
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

async function testBlockchainTransaction() {
  try {
    console.log('🔍 Checking document blockchain transaction IDs...');
    
    // Check if the blockchain_txid column exists in the documents table
    try {
      const { data: tableInfo, error: tableError } = await supabase
        .from('documents')
        .select('blockchain_txid')
        .limit(1);
        
      if (tableError) {
        if (tableError.message.includes('column "blockchain_txid" does not exist')) {
          console.log('❌ The blockchain_txid column does not exist in the documents table');
          console.log('⚠️ Please run the SQL script to add the blockchain_txid column first');
          return;
        } else {
          console.error('❌ Error checking column existence:', tableError.message);
        }
      } else {
        console.log('✅ The blockchain_txid column exists in the documents table');
      }
    } catch (error) {
      console.error('❌ Error checking column existence:', error.message);
      return;
    }
    
    // Get documents with blockchain_txid
    const { data: documentsWithTxid, error: txidError } = await supabase
      .from('documents')
      .select('id, file_name, blockchain_txid')
      .not('blockchain_txid', 'is', null)
      .limit(5);
      
    if (txidError) {
      throw new Error(`Error fetching documents with blockchain_txid: ${txidError.message}`);
    }
    
    if (!documentsWithTxid || documentsWithTxid.length === 0) {
      console.log('❌ No documents found with blockchain transaction IDs');
      
      // Get documents without blockchain_txid
      const { data: documentsWithoutTxid, error: noTxidError } = await supabase
        .from('documents')
        .select('id, file_name')
        .is('blockchain_txid', null)
        .limit(5);
        
      if (noTxidError) {
        throw new Error(`Error fetching documents without blockchain_txid: ${noTxidError.message}`);
      }
      
      if (documentsWithoutTxid && documentsWithoutTxid.length > 0) {
        console.log(`✅ Found ${documentsWithoutTxid.length} documents without blockchain transaction IDs:`);
        documentsWithoutTxid.forEach(doc => {
          console.log(`   - ${doc.file_name} (${doc.id})`);
        });
      } else {
        console.log('❌ No documents found in the database');
      }
    } else {
      console.log(`✅ Found ${documentsWithTxid.length} documents with blockchain transaction IDs:`);
      documentsWithTxid.forEach(doc => {
        console.log(`   - ${doc.file_name} (${doc.id})`);
        console.log(`     Transaction ID: ${doc.blockchain_txid}`);
        console.log(`     Explorer URL: https://polygonscan.com/tx/${doc.blockchain_txid}`);
        console.log('');
      });
    }
    
    // Check if the blockchain_txid column exists in the documents table
    const { data: columnInfo, error: columnError } = await supabase.rpc('check_column_exists', {
      table_name: 'documents',
      column_name: 'blockchain_txid'
    });
    
    if (columnError) {
      if (columnError.message.includes('function check_column_exists') && columnError.message.includes('does not exist')) {
        console.log('⚠️ The check_column_exists function does not exist in the database');
        
        // Alternative approach to check if column exists
        const { data: tableInfo, error: tableError } = await supabase
          .from('documents')
          .select('blockchain_txid')
          .limit(1);
          
        if (tableError) {
          if (tableError.message.includes('column "blockchain_txid" does not exist')) {
            console.log('❌ The blockchain_txid column does not exist in the documents table');
          } else {
            console.error('❌ Error checking column existence:', tableError.message);
          }
        } else {
          console.log('✅ The blockchain_txid column exists in the documents table');
        }
      } else {
        console.error('❌ Error checking column existence:', columnError.message);
      }
    } else {
      console.log(`✅ Column existence check result: ${columnInfo ? 'Column exists' : 'Column does not exist'}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the test
testBlockchainTransaction();
