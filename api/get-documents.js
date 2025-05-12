import { createClient } from '@supabase/supabase-js';
import { validateApiKey } from '../src/lib/apiKeyService';

export default async function handler(req, res) {
  console.log('Get Documents API endpoint called with method:', req.method);
  
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
    
    // Initialize Supabase client
    const supabaseUrl = process.env.VITE_SUPABASE_URL || req.env?.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || req.env?.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase configuration missing:', { supabaseUrl, supabaseAnonKey });
      return res.status(500).json({ error: 'Supabase configuration missing' });
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Parse query parameters
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    const source = req.query.source;
    
    // Build query
    let query = supabase
      .from('documents')
      .select('id, file_name, file_hash, file_size, mime_type, created_at, blockchain_txid, source, metadata')
      .eq('user_id', keyValidation.userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    // Add source filter if provided
    if (source) {
      query = query.eq('source', source);
    }
    
    // Execute query
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Error fetching documents:', error);
      return res.status(500).json({ error: 'Failed to fetch documents', details: error.message });
    }
    
    // Create audit log entry
    await supabase
      .from('audit_logs')
      .insert({
        user_id: keyValidation.userId,
        action: 'documents_listed',
        resource_type: 'document',
        details: {
          source: 'api',
          api_key_id: keyValidation.keyId,
          count: data.length,
          filters: { source }
        }
      });
    
    // Return success response
    return res.status(200).json({
      success: true,
      documents: data.map(doc => ({
        id: doc.id,
        file_name: doc.file_name,
        vault_time: doc.created_at,
        file_hash: doc.file_hash,
        file_size: doc.file_size,
        mime_type: doc.mime_type,
        blockchain_txid: doc.blockchain_txid,
        source: doc.source,
        metadata: doc.metadata
      })),
      pagination: {
        total: count,
        limit,
        offset,
        has_more: data.length === limit
      }
    });
    
  } catch (error) {
    console.error('Error handling get documents request:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
