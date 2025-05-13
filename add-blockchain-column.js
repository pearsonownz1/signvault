/**
 * This script adds the blockchain_txid column to the documents table in Supabase
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Add blockchain_txid column to documents table
 */
async function addBlockchainTxidColumn() {
  try {
    console.log('🔧 Adding blockchain_txid column to documents table...');
    
    // Check if column exists
    const { data: columnExists, error: checkError } = await supabase
      .rpc('column_exists', {
        table_name: 'documents',
        column_name: 'blockchain_txid'
      });
    
    if (checkError) {
      // If the RPC function doesn't exist, we'll try a different approach
      console.log('ℹ️ column_exists RPC function not available, trying direct SQL...');
    } else if (columnExists) {
      console.log('✅ blockchain_txid column already exists');
      return;
    }
    
    // Execute SQL to add the column
    const { error } = await supabase.rpc('execute_sql', {
      sql_query: `
        ALTER TABLE documents 
        ADD COLUMN IF NOT EXISTS blockchain_txid TEXT;
        
        COMMENT ON COLUMN documents.blockchain_txid IS 'Polygon blockchain transaction ID containing the document hash';
      `
    });
    
    if (error) {
      // If the RPC function doesn't exist, we'll try a different approach
      console.log('ℹ️ execute_sql RPC function not available');
      console.log('ℹ️ Please add the column manually through the Supabase dashboard with this SQL:');
      console.log(`
        ALTER TABLE documents 
        ADD COLUMN IF NOT EXISTS blockchain_txid TEXT;
        
        COMMENT ON COLUMN documents.blockchain_txid IS 'Polygon blockchain transaction ID containing the document hash';
      `);
      return;
    }
    
    console.log('✅ blockchain_txid column added successfully');
  } catch (error) {
    console.error('❌ Error adding blockchain_txid column:', error);
  }
}

// Run the function
addBlockchainTxidColumn();
