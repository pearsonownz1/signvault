import { createClient } from '@supabase/supabase-js';
import { generateApiKey, getApiKeys, deleteApiKey } from '../src/lib/apiKeyService';

export default async function handler(req, res) {
  console.log('API Keys endpoint called with method:', req.method);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.VITE_SUPABASE_URL || req.env?.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || req.env?.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase configuration missing:', { supabaseUrl, supabaseAnonKey });
      return res.status(500).json({ error: 'Supabase configuration missing' });
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Get user from session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('Error getting session:', sessionError);
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const userId = session.user.id;
    
    // Handle different HTTP methods
    switch (req.method) {
      case 'GET':
        // List API keys
        try {
          const apiKeys = await getApiKeys(userId);
          return res.status(200).json({ success: true, apiKeys });
        } catch (error) {
          console.error('Error getting API keys:', error);
          return res.status(500).json({ error: 'Failed to get API keys', message: error.message });
        }
        
      case 'POST':
        // Create new API key
        try {
          const { name, permissions } = req.body;
          
          if (!name) {
            return res.status(400).json({ error: 'API key name is required' });
          }
          
          const apiKeyPermissions = {
            read: permissions?.read === false ? false : true,
            write: permissions?.write === true ? true : false
          };
          
          const { key, keyId } = await generateApiKey(userId, name, apiKeyPermissions);
          
          // Create audit log entry
          await supabase
            .from('audit_logs')
            .insert({
              user_id: userId,
              action: 'api_key_created',
              resource_type: 'api_key',
              resource_id: keyId,
              details: {
                name,
                permissions: apiKeyPermissions
              }
            });
          
          return res.status(201).json({
            success: true,
            apiKey: {
              id: keyId,
              name,
              key,
              permissions: apiKeyPermissions,
              created_at: new Date().toISOString(),
              is_active: true
            }
          });
        } catch (error) {
          console.error('Error creating API key:', error);
          return res.status(500).json({ error: 'Failed to create API key', message: error.message });
        }
        
      case 'DELETE':
        // Delete API key
        try {
          const keyId = req.query.id;
          
          if (!keyId) {
            return res.status(400).json({ error: 'API key ID is required' });
          }
          
          const success = await deleteApiKey(userId, keyId);
          
          if (!success) {
            return res.status(404).json({ error: 'API key not found or could not be deleted' });
          }
          
          return res.status(200).json({ success: true });
        } catch (error) {
          console.error('Error deleting API key:', error);
          return res.status(500).json({ error: 'Failed to delete API key', message: error.message });
        }
        
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error handling API keys request:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
