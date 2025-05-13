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
export const generateApiKey = async (
  userId: string,
  name: string,
  permissions: { read: boolean; write: boolean }
): Promise<{ key: string; keyId: string }> => {
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
  } catch (error: any) {
    console.error('Error generating API key:', error);
    throw new Error(`Failed to generate API key: ${error.message}`);
  }
};

/**
 * Validate an API key
 * @param apiKey API key to validate
 * @returns Validation result
 */
export const validateApiKey = async (
  apiKey: string
): Promise<{
  valid: boolean;
  keyId?: string;
  userId?: string;
  permissions?: { read: boolean; write: boolean };
}> => {
  try {
    // Hash the API key for comparison
    const hashedKey = crypto
      .createHash('sha256')
      .update(apiKey)
      .digest('hex');
    
    const supabase = getSupabaseClient();
    
    // Look up the API key in the database
    const { data, error } = await supabase
      .from('api_keys')
      .select('id, user_id, permissions, is_active')
      .eq('key_hash', hashedKey)
      .single();
    
    if (error || !data) {
      console.error('API key validation failed:', error || 'Key not found');
      return { valid: false };
    }
    
    // Check if the key is active
    if (!data.is_active) {
      console.error('API key is inactive');
      return { valid: false };
    }
    
    // Update last used timestamp
    await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', data.id);
    
    return {
      valid: true,
      keyId: data.id,
      userId: data.user_id,
      permissions: data.permissions
    };
  } catch (error: any) {
    console.error('Error validating API key:', error);
    return { valid: false };
  }
};

/**
 * Delete an API key
 * @param userId User ID
 * @param keyId Key ID
 * @returns Success status
 */
export const deleteApiKey = async (
  userId: string,
  keyId: string
): Promise<boolean> => {
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
  } catch (error: any) {
    console.error('Error deleting API key:', error);
    return false;
  }
};

/**
 * Get API keys for a user
 * @param userId User ID
 * @returns List of API keys
 */
export const getApiKeys = async (userId: string): Promise<any[]> => {
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
  } catch (error: any) {
    console.error('Error getting API keys:', error);
    throw new Error(`Failed to get API keys: ${error.message}`);
  }
};
