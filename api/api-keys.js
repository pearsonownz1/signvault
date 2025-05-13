import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Initialize Supabase client
const getSupabaseClient = () => {
  // Check if we're in a browser environment (frontend) or Node.js environment (API)
  const isNode = typeof window === 'undefined';
  
  let supabaseUrl, supabaseKey;
  
  if (isNode) {
    // Node.js environment (API)
    // For API operations, prefer the service role key for admin operations
    supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || 
                  process.env.VITE_SUPABASE_SERVICE_KEY;
    
    // If service key is not available, fall back to anon key
    if (!supabaseKey) {
      supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    }
    
    console.log('Node.js environment detected in apiKeyService', {
      hasViteSupabaseUrl: !!process.env.VITE_SUPABASE_URL,
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasViteSupabaseAnonKey: !!process.env.VITE_SUPABASE_ANON_KEY,
      hasSupabaseAnonKey: !!process.env.SUPABASE_ANON_KEY,
      hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseUrl: supabaseUrl ? 'present' : 'missing',
      supabaseKey: supabaseKey ? 'present' : 'missing',
      envKeys: Object.keys(process.env).filter(key => key.includes('SUPABASE'))
    });
  } else {
    // Browser environment (frontend)
    // For browser operations, always use the anon key
    supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    console.log('Browser environment detected in apiKeyService', {
      hasViteSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
      hasViteSupabaseAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      supabaseUrl: supabaseUrl ? 'present' : 'missing',
      supabaseKey: supabaseKey ? 'present' : 'missing'
    });
  }
  
  if (!supabaseUrl || !supabaseKey) {
    const error = new Error('Supabase configuration missing');
    console.error('Supabase configuration missing:', {
      isNode,
      supabaseUrl: supabaseUrl ? 'present' : 'missing',
      supabaseKey: supabaseKey ? 'present' : 'missing',
      envKeys: isNode ? Object.keys(process.env).filter(key => key.includes('SUPABASE')) : null
    });
    throw error;
  }
  
  try {
    return createClient(supabaseUrl, supabaseKey);
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    throw error;
  }
};

/**
 * Generate a new API key
 * @param userId User ID
 * @param name Key name
 * @param permissions Key permissions
 * @returns Generated API key and key ID
 */
const generateApiKey = async (userId, name, permissions) => {
  try {
    // Generate a random API key
    const keyPrefix = 'sv_live_';
    const keyValue = crypto.randomBytes(24).toString('hex');
    const apiKey = `${keyPrefix}${keyValue}`;
    
    // Hash the API key for storage
    const hashedKey = crypto
      .createHash('sha256')
      .update(apiKey)
      .digest('hex');
    
    const supabase = getSupabaseClient();
    
    // Store the hashed key in the database
    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        user_id: userId,
        name,
        key_hash: hashedKey,
        permissions,
        is_active: true
      })
      .select('id')
      .single();
    
    if (error) {
      console.error('Error creating API key:', error);
      throw new Error(`Failed to create API key: ${error.message}`);
    }
    
    // Create audit log entry
    await supabase
      .from('audit_logs')
      .insert({
        user_id: userId,
        action: 'api_key_created',
        resource_type: 'api_key',
        resource_id: data.id,
        details: {
          name,
          permissions
        }
      });
    
    return { key: apiKey, keyId: data.id };
  } catch (error) {
    console.error('Error generating API key:', error);
    throw new Error(`Failed to generate API key: ${error.message}`);
  }
};

/**
 * Get API keys for a user
 * @param userId User ID
 * @returns List of API keys
 */
const getApiKeys = async (userId) => {
  try {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('api_keys')
      .select('id, name, created_at, last_used_at, is_active, permissions')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching API keys:', error);
      throw new Error(`Failed to fetch API keys: ${error.message}`);
    }
    
    return data || [];
  } catch (error) {
    console.error('Error getting API keys:', error);
    throw new Error(`Failed to get API keys: ${error.message}`);
  }
};

/**
 * Delete an API key
 * @param userId User ID
 * @param keyId Key ID
 * @returns Success status
 */
const deleteApiKey = async (userId, keyId) => {
  try {
    const supabase = getSupabaseClient();
    
    // Check if the key belongs to the user
    const { data: keyData, error: keyError } = await supabase
      .from('api_keys')
      .select('id')
      .eq('id', keyId)
      .eq('user_id', userId)
      .single();
    
    if (keyError || !keyData) {
      console.error('API key not found or does not belong to user:', keyError || 'Key not found');
      return false;
    }
    
    // Delete the key
    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', keyId)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error deleting API key:', error);
      return false;
    }
    
    // Create audit log entry
    await supabase
      .from('audit_logs')
      .insert({
        user_id: userId,
        action: 'api_key_deleted',
        resource_type: 'api_key',
        resource_id: keyId,
        details: {}
      });
    
    return true;
  } catch (error) {
    console.error('Error deleting API key:', error);
    return false;
  }
};

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
  
  // Log all available environment variables for debugging
  console.log('Environment variables:', {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_URL: process.env.VERCEL_URL,
    VERCEL_REGION: process.env.VERCEL_REGION,
    supabaseKeys: Object.keys(process.env).filter(key => key.includes('SUPABASE')),
    hasViteSupabaseUrl: !!process.env.VITE_SUPABASE_URL,
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasViteSupabaseAnonKey: !!process.env.VITE_SUPABASE_ANON_KEY,
    hasSupabaseAnonKey: !!process.env.SUPABASE_ANON_KEY,
    hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
  });
  
  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || 
                        process.env.VITE_SUPABASE_SERVICE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase configuration missing:', { 
        supabaseUrl: supabaseUrl ? 'present' : 'missing', 
        supabaseKey: supabaseKey ? 'present' : 'missing',
        envKeys: Object.keys(process.env).filter(key => key.includes('SUPABASE'))
      });
      
      return res.status(500).json({ 
        error: { 
          code: "500", 
          message: "Supabase configuration missing" 
        } 
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get user from session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('Error getting session:', sessionError);
      
      return res.status(401).json({ 
        error: { 
          code: "401", 
          message: "Authentication required" 
        } 
      });
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
          
          return res.status(500).json({ 
            error: { 
              code: "500", 
              message: `Failed to get API keys: ${error.message}` 
            } 
          });
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
          
          return res.status(500).json({ 
            error: { 
              code: "500", 
              message: `Failed to create API key: ${error.message}` 
            } 
          });
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
          
          return res.status(500).json({ 
            error: { 
              code: "500", 
              message: `Failed to delete API key: ${error.message}` 
            } 
          });
        }
        
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error handling API keys request:', error);
    
    return res.status(500).json({ 
      error: { 
        code: "500", 
        message: `Server error: ${error.message}` 
      } 
    });
  }
}
