import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import crypto from 'crypto';
import { ethers } from 'ethers';
import qs from 'querystring';

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
 * Refresh DocuSign access token if it's expired
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
    // DocuSign OAuth configuration
    const DOCUSIGN_CLIENT_ID = process.env.DOCUSIGN_CLIENT_ID!;
    const DOCUSIGN_CLIENT_SECRET = process.env.DOCUSIGN_CLIENT_SECRET!;
    const authServer = 'account-d.docusign.com';
    
    // Prepare token refresh request
    const tokenUrl = `https://${authServer}/oauth/token`;
    const requestBody = {
      grant_type: 'refresh_token',
      refresh_token: connection.refresh_token,
      client_id: DOCUSIGN_CLIENT_ID
    };
    
    // If client secret is available, use client credentials
    const headers: any = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };
    
    if (DOCUSIGN_CLIENT_SECRET) {
      const authString = Buffer.from(`${DOCUSIGN_CLIENT_ID}:${DOCUSIGN_CLIENT_SECRET}`).toString('base64');
      headers['Authorization'] = `Basic ${authString}`;
    }
    
    // Make token refresh request
    const response = await axios.post(tokenUrl, qs.stringify(requestBody), { headers });
    
    // Calculate new expiration time (tokens are valid for 8 hours)
    const expiresInSeconds = response.data.expires_in || 28800; // Default to 8 hours
    const newExpiresAt = new Date(now.getTime() + expiresInSeconds * 1000);
    
    // Update tokens in database
    const { error } = await supabase
      .from('docusign_connections')
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
 * Process a DocuSign webhook event
 * This function is called asynchronously after the webhook handler has already responded with 200 OK
 */
export async function processDocuSignWebhook(payload: any) {
  try {
    console.log('📄 Processing webhook payload:', JSON.stringify(payload, null, 2));
    
    // Extract data from the DocuSign Connect payload format
    const envelopeId = payload?.data?.envelopeId;
    const accountId = payload?.data?.accountId;
    const status = payload?.data?.envelopeSummary?.status;

    if (!envelopeId || !accountId) {
      console.warn('⚠️ Missing envelopeId or accountId in webhook payload');
      return;
    }

    if (status !== 'completed') {
      console.log(`⏭️ Ignoring non-completed event. Status: ${status}`);
      return;
    }

    console.log('🔄 Processing completed envelope:', envelopeId);

    // Lookup the DocuSign access_token for this user/account
    const { data: connection, error } = await supabase
      .from('docusign_connections')
      .select('*')
      .eq('docusign_account_id', accountId)
      .maybeSingle();

    if (error || !connection) {
      console.error('❌ No matching DocuSign connection found:', error);
      return;
    }

    console.log(`🔗 Found connection for account ${accountId}, user ${connection.user_id}`);
    
    // Refresh token if needed
    let accessToken;
    try {
      accessToken = await refreshAccessToken(connection);
    } catch (refreshError: any) {
      console.error('❌ Failed to refresh token, will try with existing token:', refreshError.message);
      accessToken = connection.access_token;
    }

    // Download the completed document
    const baseUrl = connection.docusign_base_uri || 'https://demo.docusign.net';
    console.log(`📥 Downloading document from ${baseUrl} for envelope ${envelopeId}`);
    
    const documentResponse = await axios.get(
      `${baseUrl}/restapi/v2.1/accounts/${accountId}/envelopes/${envelopeId}/documents/combined`,
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

    // Upload to Supabase Storage
    console.log(`📤 Uploading document to vault/signed-documents/${envelopeId}.pdf`);
    const upload = await supabase.storage
      .from('vault')
      .upload(`signed-documents/${envelopeId}.pdf`, pdfBuffer, {
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
        resource_type: 'envelope',
        resource_id: envelopeId,
        metadata: {
          envelope_id: envelopeId,
          account_id: accountId,
          status: status,
          storage_path: `signed-documents/${envelopeId}.pdf`,
          source: 'docusign_webhook',
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
        envelope_id: envelopeId,
        document_name: 'Signed Envelope Document',
        vault_path: `signed-documents/${envelopeId}.pdf`,
        document_hash: docHashHex,
        blockchain_txid: blockchainTxid || null,
        created_at: new Date().toISOString()
      });
    } catch (vaultError) {
      console.log('Note: vault_documents table may not exist yet:', vaultError.message);
      // This is optional, so continue if it fails
    }

    console.log('🎉 Successfully vaulted and blockchain-anchored signed document:', envelopeId);
    
    // Log the webhook event
    await supabase
      .from('docusign_webhook_events')
      .insert({
        envelope_id: envelopeId,
        account_id: accountId,
        status: status,
        event_type: payload.event || 'envelope-completed',
        payload: payload,
        processed_at: new Date().toISOString(),
        success: true
      });
      
  } catch (error: any) {
    console.error('❌ Webhook processing error:', error.message);
    
    // Log the error
    try {
      await supabase
        .from('docusign_webhook_events')
        .insert({
          envelope_id: payload?.data?.envelopeId || 'unknown',
          account_id: payload?.data?.accountId || 'unknown',
          status: 'error',
          event_type: payload?.event || 'unknown',
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
