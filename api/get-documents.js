/**
 * API endpoint for retrieving documents from external applications
 * This endpoint uses API key authentication
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

module.exports = async (req, res) => {
  console.log('Get documents API endpoint called with method:', req.method);
  
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
    
    // Parse query parameters
    const { limit = 10, offset = 0, sort = 'created_at', order = 'desc' } = req.query;
    
    // Get documents for the user
    const { data: documents, error: documentsError, count } = await supabase
      .from('documents')
      .select('id, file_name, file_hash, file_type, file_size, created_at, blockchain_txid, source, metadata', { count: 'exact' })
      .eq('user_id', apiKeyData.user_id)
      .order(sort, { ascending: order.toLowerCase() === 'asc' })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);
    
    if (documentsError) {
      console.error('Error fetching documents:', documentsError);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to retrieve documents. Please try again later.' 
      });
    }
    
    // Create audit log entry
    await supabase
      .from('audit_logs')
      .insert({
        user_id: apiKeyData.user_id,
        action: 'documents_listed',
        resource_type: 'api',
        resource_id: apiKeyData.id,
        details: {
          count: documents.length,
          api_key_id: apiKeyData.id
        }
      });
    
    // Return documents
    return res.status(200).json({
      success: true,
      documents: documents.map(doc => ({
        id: doc.id,
        file_name: doc.file_name,
        file_hash: doc.file_hash,
        file_type: doc.file_type,
        file_size: doc.file_size,
        vault_time: doc.created_at,
        blockchain_txid: doc.blockchain_txid,
        source: doc.source,
        metadata: doc.metadata
      })),
      pagination: {
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more: count > parseInt(offset) + documents.length
      }
    });
  } catch (error) {
    console.error('Error in get documents endpoint:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'An error occurred while processing your request. Please try again later.' 
    });
  }
};
