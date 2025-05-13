import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';
import { ethers } from 'ethers';

/**
 * Document vaulting service
 * Handles secure storage, hashing, blockchain anchoring, and audit trail for documents
 */

// Document status types
export type DocumentStatus = 'vaulted' | 'pending';

// Document source types
export type DocumentSource = 'upload' | 'adobe_sign' | 'pandadoc' | 'docusign' | 'other';

// Audit event types
export type AuditEventType = 'vaulted' | 'viewed' | 'downloaded' | 'shared' | 'verified' | 'blockchain_anchored';

/**
 * Polygon network configuration with reliable RPC endpoints
 */
const POLYGON_MAINNET = {
  chainId: '0x89', // 137 in decimal
  rpcUrls: [
    'https://polygon-rpc.com/',
    'https://polygon-bor.publicnode.com',
    'https://polygon.blockpi.network/v1/rpc/public'
  ],
  blockExplorerUrls: ['https://polygonscan.com/']
};

/**
 * Publish a document hash to the Polygon blockchain
 * @param hashHex The document hash to publish
 * @returns The blockchain transaction ID
 */
export const publishHashToBlockchain = async (hashHex: string): Promise<string> => {
  try {
    // Get Polygon configuration from environment variables
    const WALLET_PRIVATE_KEY = import.meta.env.VITE_POLYGON_PRIVATE_KEY || '';
    
    if (!WALLET_PRIVATE_KEY) {
      throw new Error('Polygon private key not configured');
    }
    
    // Try each RPC endpoint until one works
    let provider;
    let lastError;
    
    for (const rpcUrl of POLYGON_MAINNET.rpcUrls) {
      try {
        console.log(`🔌 Connecting to Polygon via ${rpcUrl}...`);
        provider = new ethers.JsonRpcProvider(rpcUrl);
        
        // Test the connection with a simple call
        await provider.getBlockNumber();
        console.log(`✅ Successfully connected to Polygon via ${rpcUrl}`);
        break;
      } catch (error) {
        console.warn(`⚠️ Failed to connect to ${rpcUrl}:`, error);
        lastError = error;
        provider = null;
      }
    }
    
    if (!provider) {
      throw new Error(`Failed to connect to any Polygon RPC endpoint: ${lastError?.message}`);
    }
    
    const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);

    // Send a 0 MATIC transaction with hash embedded in the data field
    console.log('📝 Preparing transaction with document hash...');
    const tx = await wallet.sendTransaction({
      to: '0x0000000000000000000000000000000000000000', // "burn" address
      value: 0,
      data: '0x' + hashHex, // Add 0x prefix
    });

    console.log('🔗 Transaction sent! Hash:', tx.hash);
    
    // Wait for transaction confirmation
    console.log('⏳ Waiting for transaction confirmation...');
    const receipt = await tx.wait();
    console.log('✅ Transaction confirmed in block:', receipt?.blockNumber);
    
    return tx.hash;
  } catch (error) {
    console.error('❌ Error publishing hash to blockchain:', error);
    throw error;
  }
};

/**
 * Vault a document - securely store, hash, and blockchain anchor it
 * @param file The file to vault
 * @param userId The user ID of the document owner
 * @param source The source of the document
 * @param retentionPeriod Optional retention period
 * @returns The vaulted document information
 */
export const vaultDocument = async (
  file: File,
  userId: string,
  source: DocumentSource = 'upload',
  retentionPeriod: string = '7 years'
) => {
  try {
    // Generate a unique document ID
    const documentId = uuidv4();
    
    // Create the file path in storage
    const filePath = `vaulted/${userId}/${documentId}/${file.name}`;
    
    // Upload the original file to storage
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);
      
    if (uploadError) {
      throw new Error(`Error uploading document: ${uploadError.message}`);
    }
    
    // Generate SHA-256 hash of the file
    const fileHash = await generateFileHash(file);
    
    // Get the current timestamp for vaulting
    const vaultTime = new Date().toISOString();
    
    // Insert document record into the database
    const { data: document, error: insertError } = await supabase
      .from('documents')
      .insert({
        id: documentId,
        user_id: userId,
        file_path: filePath,
        file_name: file.name,
        file_hash: fileHash,
        source: source,
        vault_time: vaultTime,
        status: 'vaulted' as DocumentStatus,
        retention_period: retentionPeriod,
      })
      .select()
      .single();
      
    if (insertError) {
      throw new Error(`Error inserting document record: ${insertError.message}`);
    }
    
    // Create the first audit log entry
    await createAuditLogEntry(documentId, 'vaulted', 'system', {
      hash: fileHash,
      vault_method: 'supabase_storage',
      source: source
    });
    
    // Publish hash to blockchain
    let blockchainTxid = null;
    try {
      console.log('⛓️ Publishing hash to Polygon blockchain...');
      blockchainTxid = await publishHashToBlockchain(fileHash);
      console.log(`✅ Hash published to blockchain, TXID: ${blockchainTxid}`);
      
      // Update document with blockchain transaction ID
      await supabase
        .from('documents')
        .update({
          blockchain_txid: blockchainTxid
        })
        .eq('id', documentId);
      
      // Create blockchain anchoring audit log entry
      await createAuditLogEntry(documentId, 'blockchain_anchored', 'system', {
        blockchain: 'polygon',
        txid: blockchainTxid,
        document_hash: fileHash
      });
    } catch (blockchainError) {
      console.error('❌ Failed to publish hash to blockchain:', blockchainError);
      // Continue with vaulting even if blockchain publishing fails
    }
    
    // Return the document with blockchain transaction ID
    return {
      ...document,
      blockchain_txid: blockchainTxid
    };
  } catch (error) {
    console.error('Vaulting error:', error);
    throw error;
  }
};

/**
 * Generate a SHA-256 hash of a file using Web Crypto API
 * @param file The file to hash
 * @returns SHA-256 hash as a hex string
 */
export const generateFileHash = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target?.result;
        if (!arrayBuffer) {
          reject(new Error('Failed to read file'));
          return;
        }
        
        // Use Web Crypto API to create hash
        const hashBuffer = await crypto.subtle.digest(
          'SHA-256', 
          arrayBuffer as ArrayBuffer
        );
        
        // Convert hash to hex string
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
        
        resolve(hashHex);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Create an audit log entry for a document
 * @param documentId The document ID
 * @param eventType The type of event
 * @param actor The user or system that performed the action
 * @param metadata Additional metadata about the event
 * @returns The created audit log entry
 */
export const createAuditLogEntry = async (
  documentId: string,
  eventType: AuditEventType,
  actor: string,
  metadata: Record<string, any> = {}
) => {
  try {
    const { data, error } = await supabase
      .from('audit_log')
      .insert({
        id: uuidv4(),
        document_id: documentId,
        event_type: eventType,
        actor: actor,
        event_time: new Date().toISOString(),
        metadata: metadata,
      })
      .select()
      .single();
      
    if (error) {
      throw new Error(`Error creating audit log entry: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error('Audit log error:', error);
    throw error;
  }
};

/**
 * Verify a document's integrity by comparing its hash with the stored hash
 * @param file The file to verify
 * @param documentId Optional document ID to check against
 * @returns Verification result
 */
export const verifyDocumentIntegrity = async (file: File, documentId?: string) => {
  try {
    // Generate hash of the uploaded file
    const uploadedFileHash = await generateFileHash(file);
    
    // If document ID is provided, check against that specific document
    if (documentId) {
      const { data: document, error } = await supabase
        .from('documents')
        .select('id, file_hash, file_name')
        .eq('id', documentId)
        .single();
        
      if (error) {
        throw new Error(`Error retrieving document: ${error.message}`);
      }
      
      const isMatch = document.file_hash === uploadedFileHash;
      
      // Log the verification attempt
      await createAuditLogEntry(documentId, 'verified', 'system', {
        verification_result: isMatch ? 'match' : 'mismatch',
        uploaded_hash: uploadedFileHash,
        stored_hash: document.file_hash
      });
      
      return {
        status: isMatch ? 'match' : 'mismatch',
        message: isMatch ? 'Document is authentic' : 'Document has been tampered with',
        document: document
      };
    } 
    // Otherwise, search for any document with a matching hash
    else {
      const { data: documents, error } = await supabase
        .from('documents')
        .select('id, file_hash, file_name')
        .eq('file_hash', uploadedFileHash);
        
      if (error) {
        throw new Error(`Error searching for documents: ${error.message}`);
      }
      
      if (documents && documents.length > 0) {
        // Log the verification attempt for the first matching document
        await createAuditLogEntry(documents[0].id, 'verified', 'system', {
          verification_result: 'match',
          uploaded_hash: uploadedFileHash
        });
        
        return {
          status: 'match',
          message: 'Document is authentic',
          document: documents[0],
          allMatches: documents
        };
      } else {
        return {
          status: 'mismatch',
          message: 'No matching document found in the vault'
        };
      }
    }
  } catch (error) {
    console.error('Verification error:', error);
    throw error;
  }
};

/**
 * Get the URL for a vaulted document
 * @param filePath The file path in storage
 * @param watermarked Whether to get the watermarked version
 * @returns The URL to the document
 */
export const getDocumentUrl = async (filePath: string, watermarked: boolean = false) => {
  try {
    // If watermarked version is requested, adjust the path
    const path = watermarked 
      ? filePath.replace('vaulted/', 'vaulted/watermarked/')
      : filePath;
    
    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(path, 60 * 60); // 1 hour expiry
      
    if (error) {
      throw new Error(`Error creating signed URL: ${error.message}`);
    }
    
    return data.signedUrl;
  } catch (error) {
    console.error('Error getting document URL:', error);
    throw error;
  }
};

/**
 * Get a document by ID
 * @param documentId The document ID
 * @returns The document information
 */
export const getDocument = async (documentId: string) => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select(`
        id, 
        file_path, 
        file_name, 
        file_hash, 
        source, 
        vault_time, 
        status, 
        retention_period,
        user_id,
        blockchain_txid
      `)
      .eq('id', documentId)
      .single();
      
    if (error) {
      throw new Error(`Error retrieving document: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error getting document:', error);
    throw error;
  }
};

/**
 * Get audit log entries for a document
 * @param documentId The document ID
 * @returns Array of audit log entries
 */
export const getDocumentAuditLog = async (documentId: string) => {
  try {
    const { data, error } = await supabase
      .from('audit_log')
      .select('*')
      .eq('document_id', documentId)
      .order('event_time', { ascending: false });
      
    if (error) {
      throw new Error(`Error retrieving audit log: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error getting audit log:', error);
    throw error;
  }
};

/**
 * Vault a document from binary data (for API integrations) and anchor to blockchain
 * @param params Object containing document data and metadata
 * @returns The vaulted document information
 */
export const vaultDocumentFromBinary = async (params: {
  userId: string;
  fileName: string;
  fileContent: Uint8Array;
  metadata?: Record<string, any>;
  source?: DocumentSource;
  retentionPeriod?: string;
}) => {
  try {
    const {
      userId,
      fileName,
      fileContent,
      metadata = {},
      source = 'docusign',
      retentionPeriod = '7 years'
    } = params;
    
    // Generate a unique document ID
    const documentId = uuidv4();
    
    // Create the file path in storage
    const filePath = `vaulted/${userId}/${documentId}/${fileName}`;
    
    // Upload the binary data to storage
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, fileContent, {
        contentType: 'application/pdf'
      });
      
    if (uploadError) {
      throw new Error(`Error uploading document: ${uploadError.message}`);
    }
    
    // Generate SHA-256 hash of the file
    const fileHash = await generateBinaryHash(fileContent);
    
    // Get the current timestamp for vaulting
    const vaultTime = new Date().toISOString();
    
    // Insert document record into the database
    const { data: document, error: insertError } = await supabase
      .from('documents')
      .insert({
        id: documentId,
        user_id: userId,
        file_path: filePath,
        file_name: fileName,
        file_hash: fileHash,
        source: source,
        vault_time: vaultTime,
        status: 'vaulted' as DocumentStatus,
        retention_period: retentionPeriod,
        metadata: metadata
      })
      .select()
      .single();
      
    if (insertError) {
      throw new Error(`Error inserting document record: ${insertError.message}`);
    }
    
    // Create the first audit log entry
    await createAuditLogEntry(documentId, 'vaulted', 'system', {
      hash: fileHash,
      vault_method: 'supabase_storage',
      source: source,
      ...metadata
    });
    
    // Publish hash to blockchain
    let blockchainTxid = null;
    try {
      console.log('⛓️ Publishing hash to Polygon blockchain...');
      blockchainTxid = await publishHashToBlockchain(fileHash);
      console.log(`✅ Hash published to blockchain, TXID: ${blockchainTxid}`);
      
      // Update document with blockchain transaction ID
      await supabase
        .from('documents')
        .update({
          blockchain_txid: blockchainTxid
        })
        .eq('id', documentId);
      
      // Create blockchain anchoring audit log entry
      await createAuditLogEntry(documentId, 'blockchain_anchored', 'system', {
        blockchain: 'polygon',
        txid: blockchainTxid,
        document_hash: fileHash
      });
    } catch (blockchainError) {
      console.error('❌ Failed to publish hash to blockchain:', blockchainError);
      // Continue with vaulting even if blockchain publishing fails
    }
    
    // Return the document with blockchain transaction ID
    return {
      ...document,
      blockchain_txid: blockchainTxid
    };
  } catch (error) {
    console.error('Vaulting error:', error);
    throw error;
  }
};

/**
 * Generate a SHA-256 hash of binary data using Web Crypto API
 * @param data The binary data to hash
 * @returns SHA-256 hash as a hex string
 */
export const generateBinaryHash = async (data: Uint8Array): Promise<string> => {
  try {
    // Use Web Crypto API to create hash
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    
    // Convert hash to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return hashHex;
  } catch (error) {
    console.error('Error generating hash:', error);
    throw error;
  }
};
