import { createClient } from '@supabase/supabase-js';
import { validateApiKey } from '../src/lib/apiKeyService';

export default async function handler(req, res) {
  console.log('Get Document API endpoint called with method:', req.method);
  
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
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Validate API key from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }
    
    const apiKey = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Validate the API key
    const keyValidation = await validateApiKey(apiKey);
    
    if (!keyValidation.valid) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    
    // Check if the API key has read permission
    if (!keyValidation.permissions.read) {
      return res.status(403).json({ error: 'API key does not have read permission' });
    }
    
    // Get document ID from query parameters
    const documentId = req.query.id;
    
    if (!documentId) {
      return res.status(400).json({ error: 'Document ID is required' });
    }
    
    // Initialize Supabase client
    const supabaseUrl = process.env.VITE_SUPABASE_URL || req.env?.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || req.env?.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase configuration missing:', { supabaseUrl, supabaseAnonKey });
      return res.status(500).json({ error: 'Supabase configuration missing' });
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Fetch document
    const { data: document, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', keyValidation.userId)
      .single();
    
    if (error) {
      console.error('Error fetching document:', error);
      return res.status(error.code === 'PGRST116' ? 404 : 500).json({ 
        error: error.code === 'PGRST116' ? 'Document not found' : 'Failed to fetch document', 
        details: error.message 
      });
    }
    
    // Create audit log entry
    await supabase
      .from('audit_logs')
      .insert({
        user_id: keyValidation.userId,
        action: 'document_viewed',
        resource_type: 'document',
        resource_id: document.id,
        details: {
          source: 'api',
          api_key_id: keyValidation.keyId
        }
      });
    
    // Generate download URL if requested
    let downloadUrl = null;
    if (req.query.download === 'true') {
      const { data: urlData, error: urlError } = await supabase.storage
        .from('documents')
        .createSignedUrl(document.file_path, 60); // 60 seconds expiry
      
      if (!urlError && urlData) {
        downloadUrl = urlData.signedUrl;
      }
    }
    
    // Return success response
    return res.status(200).json({
      success: true,
      document: {
        id: document.id,
        file_name: document.file_name,
        vault_time: document.created_at,
        file_hash: document.file_hash,
        file_size: document.file_size,
        mime_type: document.mime_type,
        blockchain_txid: document.blockchain_txid,
        source: document.source,
        metadata: document.metadata,
        download_url: downloadUrl
      }
    });
    
  } catch (error) {
    console.error('Error handling get document request:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
