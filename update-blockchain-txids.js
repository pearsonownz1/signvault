/**
 * This script updates existing documents in the database with blockchain transaction IDs
 * It's useful for documents that were vaulted before the blockchain anchoring feature was implemented
 */

import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';
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

// Polygon configuration
const RPC_URL = 'https://polygon-rpc.com';
const WALLET_PRIVATE_KEY = process.env.VITE_POLYGON_PRIVATE_KEY;

if (!WALLET_PRIVATE_KEY) {
  console.error('❌ Missing Polygon private key in .env file');
  process.exit(1);
}

/**
 * Publish a document hash to the Polygon blockchain
 * @param {string} hashHex - The document hash to publish
 * @returns {Promise<string>} - The blockchain transaction ID
 */
async function publishHashToBlockchain(hashHex) {
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);

    // Send a 0 MATIC transaction with hash embedded in the data field
    const tx = await wallet.sendTransaction({
      to: '0x0000000000000000000000000000000000000000', // "burn" address
      value: 0,
      data: '0x' + hashHex, // Add 0x prefix
    });

    console.log(`🔗 Blockchain TX Hash: ${tx.hash}`);
    
    // Wait for transaction to be mined
    await tx.wait();
    console.log('✅ Transaction confirmed on blockchain');
    
    return tx.hash;
  } catch (error) {
    console.error('❌ Error publishing hash to blockchain:', error);
    throw error;
  }
}

/**
 * Create an audit log entry for a document
 * @param {string} documentId - The document ID
 * @param {string} eventType - The type of event
 * @param {string} actor - The user or system that performed the action
 * @param {Object} metadata - Additional metadata about the event
 */
async function createAuditLogEntry(documentId, eventType, actor, metadata = {}) {
  try {
    const { error } = await supabase
      .from('audit_log')
      .insert({
        document_id: documentId,
        event_type: eventType,
        actor: actor,
        event_time: new Date().toISOString(),
        metadata: metadata,
      });
      
    if (error) {
      throw new Error(`Error creating audit log entry: ${error.message}`);
    }
  } catch (error) {
    console.error('❌ Audit log error:', error);
  }
}

/**
 * Update documents with blockchain transaction IDs
 */
async function updateDocumentsWithBlockchainTxids() {
  try {
    console.log('🔍 Finding documents without blockchain transaction IDs...');
    
    // Get documents without blockchain_txid
    const { data: documents, error } = await supabase
      .from('documents')
      .select('id, file_hash')
      .is('blockchain_txid', null);
      
    if (error) {
      throw new Error(`Error fetching documents: ${error.message}`);
    }
    
    console.log(`📄 Found ${documents.length} documents without blockchain transaction IDs`);
    
    // Process each document
    for (const document of documents) {
      try {
        console.log(`\n📝 Processing document ${document.id}`);
        console.log(`🔑 Document hash: ${document.file_hash}`);
        
        // Publish hash to blockchain
        console.log('⛓️ Publishing hash to Polygon blockchain...');
        const blockchainTxid = await publishHashToBlockchain(document.file_hash);
        console.log(`✅ Hash published to blockchain, TXID: ${blockchainTxid}`);
        
        // Update document with blockchain transaction ID
        const { error: updateError } = await supabase
          .from('documents')
          .update({ blockchain_txid: blockchainTxid })
          .eq('id', document.id);
          
        if (updateError) {
          throw new Error(`Error updating document: ${updateError.message}`);
        }
        
        console.log(`✅ Document ${document.id} updated with blockchain transaction ID`);
        
        // Create blockchain anchoring audit log entry
        await createAuditLogEntry(document.id, 'blockchain_anchored', 'system', {
          blockchain: 'polygon',
          txid: blockchainTxid,
          document_hash: document.file_hash
        });
        
        console.log(`✅ Audit log entry created for document ${document.id}`);
      } catch (docError) {
        console.error(`❌ Error processing document ${document.id}:`, docError);
        // Continue with next document
      }
    }
    
    console.log('\n✅ All documents processed');
  } catch (error) {
    console.error('❌ Error updating documents:', error);
  }
}

// Run the main function
updateDocumentsWithBlockchainTxids();
