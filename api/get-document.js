/**
 * API endpoint for retrieving a specific document from external applications
 * This endpoint uses API key authentication
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

module.exports = async (req, res) => {
  console.log('Get document API endpoint called with method:', req.method);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Only GET requests are supported.' 
    });
  }
  
  try {
    // Extract API key from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: 'Missing or invalid Authorization header. Please provide an API key using Bearer authentication.' 
      });
    }
    
    const apiKey = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase configuration missing');
      return res.status(500).json({ 
        success: false, 
        error: 'Server configuration error. Please try again later.' 
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Validate API key
    const hashedKey = crypto
      .createHash('sha256')
      .update(apiKey)
      .digest('hex');
    
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from('api_keys')
      .select('id, user_id, permissions, is_active')
      .eq('key_hash', hashedKey)
      .single();
    
    if (apiKeyError || !apiKeyData) {
      console.error('API key validation failed:', apiKeyError || 'Key not found');
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid API key.' 
      });
    }
    
    // Check if the key is active
    if (!apiKeyData.is_active) {
      console.error('API key is inactive');
      return res.status(401).json({ 
        success: false, 
        error: 'API key is inactive.' 
      });
    }
    
    // Check if the key has read permission
    if (!apiKeyData.permissions.read) {
      console.error('API key does not have read permission');
      return res.status(403).json({ 
        success: false, 
        error: 'API key does not have read permission.' 
      });
    }
    
    // Update last used timestamp
    await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', apiKeyData.id);
    
    // Get document ID from query parameters
    const { id, download } = req.query;
    
    if (!id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Document ID is required.' 
      });
    }
    
    // Get document details
    const { data: document, error: documentError } = await supabase
      .from('documents')
      .select('id, file_name, file_hash, file_type, file_size, created_at, blockchain_txid, source, metadata, storage_path')
      .eq('id', id)
      .eq('user_id', apiKeyData.user_id)
      .single();
    
    if (documentError || !document) {
      console.error('Error fetching document:', documentError || 'Document not found');
      return res.status(404).json({ 
        success: false, 
        error: 'Document not found or you do not have permission to access it.' 
      });
    }
    
    // Create audit log entry
    await supabase
      .from('audit_logs')
      .insert({
        user_id: apiKeyData.user_id,
        action: 'document_accessed',
        resource_type: 'document',
        resource_id: document.id,
        details: {
          file_name: document.file_name,
          file_hash: document.file_hash,
          api_key_id: apiKeyData.id,
          download: download === 'true'
        }
      });
    
    // If download parameter is true, return a signed URL for downloading the document
    if (download === 'true') {
      const { data: signedUrl, error: signedUrlError } = await supabase.storage
        .from('documents')
        .createSignedUrl(document.storage_path, 60); // 60 seconds expiry
      
      if (signedUrlError) {
        console.error('Error creating signed URL:', signedUrlError);
        return res.status(500).json({ 
          success: false, 
          error: 'Failed to generate download URL. Please try again later.' 
        });
      }
      
      return res.status(200).json({
        success: true,
        document: {
          id: document.id,
          file_name: document.file_name,
          file_hash: document.file_hash,
          file_type: document.file_type,
          file_size: document.file_size,
          vault_time: document.created_at,
          blockchain_txid: document.blockchain_txid,
          source: document.source,
          metadata: document.metadata,
          download_url: signedUrl.signedUrl
        }
      });
    }
    
    // Return document details without download URL
    return res.status(200).json({
      success: true,
      document: {
        id: document.id,
        file_name: document.file_name,
        file_hash: document.file_hash,
        file_type: document.file_type,
        file_size: document.file_size,
        vault_time: document.created_at,
        blockchain_txid: document.blockchain_txid,
        source: document.source,
        metadata: document.metadata
      }
    });
  } catch (error) {
    console.error('Error in get document endpoint:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'An error occurred while processing your request. Please try again later.' 
    });
  }
};
