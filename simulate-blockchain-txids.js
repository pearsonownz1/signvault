// Script to simulate blockchain transactions for documents
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

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

// Generate a random Polygon transaction ID
function generatePolygonTxId() {
  // Generate a random 32-byte hex string prefixed with 0x
  return '0x' + crypto.randomBytes(32).toString('hex');
}

async function simulateBlockchainTransactions() {
  try {
    console.log('🔄 Fetching documents without blockchain transaction IDs...');
    
    // Get documents that don't have a blockchain_txid
    const { data: documents, error } = await supabase
      .from('documents')
      .select('id, file_name')
      .is('blockchain_txid', null);
      
    if (error) {
      throw new Error(`Error fetching documents: ${error.message}`);
    }
    
    if (!documents || documents.length === 0) {
      console.log('✅ No documents found that need blockchain transaction IDs');
      return;
    }
    
    console.log(`🔄 Found ${documents.length} documents without blockchain transaction IDs`);
    
    // Update each document with a simulated blockchain transaction ID
    for (const doc of documents) {
      const txid = generatePolygonTxId();
      
      console.log(`🔄 Updating document "${doc.file_name}" (${doc.id}) with transaction ID: ${txid}`);
      
      const { error: updateError } = await supabase
        .from('documents')
        .update({ blockchain_txid: txid })
        .eq('id', doc.id);
        
      if (updateError) {
        console.error(`❌ Error updating document ${doc.id}: ${updateError.message}`);
      }
    }
    
    console.log('✅ Finished simulating blockchain transactions');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the simulation
simulateBlockchainTransactions();
