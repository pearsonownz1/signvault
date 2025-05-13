import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import crypto from 'crypto';
import { ethers } from 'ethers';

// Initialize Supabase client with service role key for admin access
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Polygon configuration
const RPC_URL = 'https://polygon-rpc.com'; // Public Polygon endpoint
const WALLET_PRIVATE_KEY = process.env.POLYGON_PRIVATE_KEY!;

/**
 * Hash a document buffer using SHA-256
 */
export function hashDocument(buffer: Buffer): string {
  const hash = crypto.createHash('sha256');
  hash.update(buffer);
  return hash.digest('hex');
}

/**
 * Publish a document hash to the Polygon blockchain
 */
export async function publishHashToBlockchain(hashHex: string): Promise<string> {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);

  // Send a 0 MATIC transaction with hash embedded in the data field
  const tx = await wallet.sendTransaction({
    to: '0x0000000000000000000000000000000000000000', // "burn" address
    value: 0,
    data: '0x' + hashHex, // Add 0x prefix
  });

  console.log('🔗 Blockchain TX Hash:', tx.hash);

  return tx.hash;
}

/**
 * Refresh SignNow access token if it's expired
 */
async function refreshAccessToken(connection: any): Promise<string> {
  console.log('🔄 Checking if token needs refresh...');
  
  // Check if token is expired or will expire in the next 5 minutes
  const expiresAt = new Date(connection.expires_at);
  const now = new Date();
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
  
  if (expiresAt > fiveMinutesFromNow) {
    console.log('✅ Token is still valid, no refresh needed');
    return connection.access_token;
  }
  
  console.log('🔄 Token is expired or will expire soon, refreshing...');
  
  try {
    // SignNow OAuth configuration
    const SIGNNOW_CLIENT_ID = process.env.SIGNNOW_CLIENT_ID!;
    const SIGNNOW_SECRET_KEY = process.env.SIGNNOW_SECRET_KEY!;
    const SIGNNOW_AUTH_SERVER = process.env.SIGNNOW_AUTH_SERVER!;
    
    // Prepare token refresh request
    const tokenUrl = `https://${SIGNNOW_AUTH_SERVER}/oauth2/token`;
    
    // Make token refresh request
    const response = await axios.post(
      tokenUrl,
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: connection.refresh_token,
        client_id: SIGNNOW_CLIENT_ID,
        client_secret: SIGNNOW_SECRET_KEY
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    // Calculate new expiration time
    const expiresInSeconds = response.data.expires_in || 3600; // Default to 1 hour
    const newExpiresAt = new Date(now.getTime() + expiresInSeconds * 1000);
    
    // Update tokens in database
    const { error } = await supabase
      .from('signnow_connections')
      .update({
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token || connection.refresh_token, // Use new refresh token if provided
        expires_at: newExpiresAt.toISOString(),
        updated_at: now.toISOString()
      })
      .eq('id', connection.id);
    
    if (error) {
      console.error('❌ Failed to update tokens in database:', error);
      throw new Error('Failed to update tokens in database');
    }
    
    console.log('✅ Successfully refreshed and updated access token');
    return response.data.access_token;
  } catch (error: any) {
    console.error('❌ Failed to refresh access token:', error.message);
    throw new Error(`Failed to refresh access token: ${error.message}`);
  }
}

/**
 * Process a SignNow webhook event
 * This function is called asynchronously after the webhook handler has already responded with 200 OK
 */
export async function processSignNowWebhook(payload: any) {
  try {
    console.log('📄 Processing webhook payload:', JSON.stringify(payload, null, 2));
    
    // Extract data from the SignNow webhook payload
    const documentId = payload?.document_id;
    const userId = payload?.user_id;
    const eventType = payload?.event_type;

    if (!documentId || !userId) {
      console.warn('⚠️ Missing documentId or userId in webhook payload');
      return;
    }

    if (eventType !== 'document.completed') {
      console.log(`⏭️ Ignoring non-completed event. Event type: ${eventType}`);
      return;
    }

    console.log('🔄 Processing completed document:', documentId);

    // Lookup the SignNow access_token for this user
    const { data: connections, error } = await supabase
      .from('signnow_connections')
      .select('*')
      .eq('signnow_user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error || !connections || connections.length === 0) {
      console.error('❌ No matching SignNow connection found:', error);
      return;
    }

    const connection = connections[0];
    console.log(`🔗 Found connection for user ${userId}, internal user ${connection.user_id}`);
    
    // Refresh token if needed
    let accessToken;
    try {
      accessToken = await refreshAccessToken(connection);
    } catch (refreshError: any) {
      console.error('❌ Failed to refresh token, will try with existing token:', refreshError.message);
      accessToken = connection.access_token;
    }

    // Download the completed document
    const SIGNNOW_API_BASE_URL = process.env.SIGNNOW_API_BASE_URL!;
    console.log(`📥 Downloading document from ${SIGNNOW_API_BASE_URL} for document ${documentId}`);
    
    const documentResponse = await axios.get(
      `${SIGNNOW_API_BASE_URL}/document/${documentId}/download?type=pdf`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        responseType: 'arraybuffer', // important to get binary PDF
      }
    );

    const pdfBuffer = documentResponse.data;
    console.log(`📊 Downloaded document, size: ${pdfBuffer.length} bytes`);

    // Hash the document
    console.log('🔐 Hashing document...');
    const docHashHex = hashDocument(pdfBuffer);
    console.log(`🔑 Document hash: ${docHashHex}`);

    // Publish hash to blockchain
    console.log('⛓️ Publishing hash to Polygon blockchain...');
    let blockchainTxid;
    try {
      blockchainTxid = await publishHashToBlockchain(docHashHex);
      console.log(`✅ Hash published to blockchain, TXID: ${blockchainTxid}`);
    } catch (blockchainError: any) {
      console.error('❌ Failed to publish hash to blockchain:', blockchainError.message);
      // Continue with vaulting even if blockchain publishing fails
    }

    // Get document details for better naming
    const documentDetailsResponse = await axios.get(
      `${SIGNNOW_API_BASE_URL}/document/${documentId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        }
      }
    );
    
    const documentName = documentDetailsResponse.data.name || `SignNow Document ${documentId}`;

    // Upload to Supabase Storage
    console.log(`📤 Uploading document to vault/signed-documents/signnow-${documentId}.pdf`);
    const upload = await supabase.storage
      .from('vault')
      .upload(`signed-documents/signnow-${documentId}.pdf`, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (upload.error) {
      console.error('❌ Failed to upload PDF:', upload.error);
      return;
    }

    console.log('✅ Document uploaded successfully');

    // Create an audit log entry
    console.log('📝 Creating audit log entry');
    const { error: auditError } = await supabase
      .from('audit_logs')
      .insert({
        user_id: connection.user_id,
        action: 'document_vaulted',
        resource_type: 'document',
        resource_id: documentId,
        metadata: {
          document_id: documentId,
          signnow_user_id: userId,
          event_type: eventType,
          storage_path: `signed-documents/signnow-${documentId}.pdf`,
          source: 'signnow_webhook',
          document_hash: docHashHex,
          blockchain_txid: blockchainTxid || null
        },
        blockchain_txid: blockchainTxid || null
      });

    if (auditError) {
      console.error('⚠️ Failed to create audit log:', auditError);
      // Continue anyway since the document was successfully vaulted
    }

    // Also save to vault_documents table if it exists
    try {
      await supabase.from('vault_documents').insert({
        user_id: connection.user_id,
        envelope_id: documentId, // Using envelope_id field for document_id
        document_name: documentName,
        vault_path: `signed-documents/signnow-${documentId}.pdf`,
        document_hash: docHashHex,
        blockchain_txid: blockchainTxid || null,
        created_at: new Date().toISOString()
      });
    } catch (vaultError) {
      console.log('Note: vault_documents table may not exist yet:', vaultError.message);
      // This is optional, so continue if it fails
    }

    console.log('🎉 Successfully vaulted and blockchain-anchored signed document:', documentId);
    
    // Log the webhook event
    await supabase
      .from('signnow_webhook_events')
      .insert({
        document_id: documentId,
        user_id: userId,
        event_type: eventType,
        payload: payload,
        processed_at: new Date().toISOString(),
        success: true
      });
      
  } catch (error: any) {
    console.error('❌ Webhook processing error:', error.message);
    
    // Log the error
    try {
      await supabase
        .from('signnow_webhook_events')
        .insert({
          document_id: payload?.document_id || 'unknown',
          user_id: payload?.user_id || 'unknown',
          event_type: payload?.event_type || 'unknown',
          payload: payload,
          processed_at: new Date().toISOString(),
          success: false,
          error_message: error.message
        });
    } catch (logError) {
      console.error('❌ Failed to log webhook error:', logError);
    }
  }
}
