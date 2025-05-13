import fetch from 'node-fetch';
import fs from 'fs';
import dotenv from 'dotenv';
import crypto from 'crypto';

// Initialize dotenv
dotenv.config();

// Configuration
const API_URL = 'https://www.signvault.co/api/api-keys';
const API_KEY_NAME = 'Test API Key';
const PERMISSIONS = {
  read: true,
  write: true
};

// Supabase configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_SERVICE_KEY;

// Create API key directly in Supabase
const createApiKeyDirectly = async () => {
  try {
    console.log(`Creating API key with name: ${API_KEY_NAME}`);
    console.log(`Permissions: ${JSON.stringify(PERMISSIONS)}`);
    
    // Generate a random API key
    const keyPrefix = 'sv_live_';
    const keyValue = crypto.randomBytes(24).toString('hex');
    const apiKey = `${keyPrefix}${keyValue}`;
    
    // Hash the API key for storage
    const hashedKey = crypto
      .createHash('sha256')
      .update(apiKey)
      .digest('hex');
    
    // Create a user ID for testing
    const userId = process.env.TEST_USER_ID || '00000000-0000-0000-0000-000000000000';
    
    // Create the API key directly in Supabase
    const response = await fetch(`${SUPABASE_URL}/rest/v1/api_keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      },
      body: JSON.stringify({
        user_id: userId,
        name: API_KEY_NAME,
        key_hash: hashedKey,
        permissions: PERMISSIONS,
        is_active: true
      })
    });
    
    console.log(`Create API key response status: ${response.status}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error creating API key:', errorData);
      throw new Error(`Failed to create API key: ${response.status} ${response.statusText}`);
    }
    
    const responseData = await response.json();
    console.log('Response:', JSON.stringify(responseData, null, 2));
    
    // Create a response object similar to what the API would return
    const result = {
      success: true,
      apiKey: {
        id: responseData.id,
        name: API_KEY_NAME,
        key: apiKey,
        permissions: PERMISSIONS,
        created_at: new Date().toISOString(),
        is_active: true
      }
    };
    
    console.log('API key created successfully!');
    console.log('API Key:', apiKey);
    
    // Save API key to file for reference
    fs.writeFileSync('api-key-info.json', JSON.stringify(result, null, 2));
    console.log('API key information saved to api-key-info.json');
    
    return result;
  } catch (error) {
    console.error('Error creating API key:', error.message);
    return { success: false, error: error.message };
  }
};

// Run the script
createApiKeyDirectly();
