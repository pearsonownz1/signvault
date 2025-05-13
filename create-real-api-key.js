/**
 * Script to create a real API key in the database
 * This script uses the apiKeyService to generate a real API key for a user
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Initialize environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials not found in .env file');
  console.error('Make sure VITE_SUPABASE_URL/SUPABASE_URL and SUPABASE_SERVICE_KEY/SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Generate a new API key
 * @param {string} userId - User ID
 * @param {string} name - Key name
 * @param {Object} permissions - Key permissions
 * @returns {Promise<Object>} - Generated API key and key ID
 */
async function generateApiKey(userId, name, permissions) {
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
    
    console.log('🔐 Generated API key (save this, it will not be shown again):', apiKey);
    console.log('🔒 Hashed key:', hashedKey);
    
    // Store the hashed key in the database
    console.log('💾 Storing API key in database...');
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
      console.error('❌ Error creating API key:', error);
      
      // Check if the error is about the user_id foreign key
      if (error.message && error.message.includes('foreign key constraint')) {
        console.error('❌ Foreign key constraint error. Make sure the user exists.');
        console.error('   You can find users in the auth.users table in Supabase.');
      }
      
      // Check if the error is about the key_hash unique constraint
      if (error.message && error.message.includes('unique constraint')) {
        console.error('❌ Unique constraint error. The key_hash must be unique.');
      }
      
      throw error;
    }
    
    console.log(`✅ API key stored successfully with ID: ${data.id}`);
    
    // Create audit log entry
    try {
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
      console.log('✅ Audit log entry created');
    } catch (auditError) {
      console.warn('⚠️ Could not create audit log entry:', auditError);
      // Continue even if audit log fails
    }
    
    // Save the API key to a file for reference (in a real scenario, you would show this to the user once)
    const apiKeyInfo = {
      id: data.id,
      name,
      key: apiKey,
      permissions,
      created_at: new Date().toISOString(),
      is_active: true
    };
    
    fs.writeFileSync('api-key-info.json', JSON.stringify(apiKeyInfo, null, 2));
    console.log('✅ API key information saved to api-key-info.json');
    
    return { key: apiKey, keyId: data.id };
  } catch (error) {
    console.error('❌ Error generating API key:', error);
    throw error;
  }
}

/**
 * Get a user from the database
 * @returns {Promise<string>} - User ID
 */
async function getUser() {
  try {
    console.log('👤 Getting a user from the database...');
    
    // Get the first user from the auth.users table
    const { data, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1
    });
    
    if (error) {
      console.error('❌ Error getting users:', error);
      throw error;
    }
    
    if (!data || !data.users || data.users.length === 0) {
      console.error('❌ No users found in the database');
      throw new Error('No users found');
    }
    
    const userId = data.users[0].id;
    console.log(`✅ Found user with ID: ${userId}`);
    return userId;
  } catch (error) {
    console.error('❌ Error getting user:', error);
    
    // If we can't get a user automatically, ask for a user ID
    if (process.argv.length > 2) {
      const userId = process.argv[2];
      console.log(`✅ Using provided user ID: ${userId}`);
      return userId;
    }
    
    console.error('❌ Please provide a user ID as a command line argument:');
    console.error('   node create-real-api-key.js USER_ID');
    process.exit(1);
  }
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('🔑 Creating a real API key...');
    
    // Get a user ID
    const userId = await getUser();
    
    // Generate an API key
    const apiKeyName = process.argv[3] || 'API Key';
    const permissions = {
      read: true,
      write: process.argv[4] === 'write' ? true : false
    };
    
    console.log(`🔧 Creating API key with name: ${apiKeyName} and permissions:`, permissions);
    
    const { key, keyId } = await generateApiKey(userId, apiKeyName, permissions);
    
    console.log('✅ API key creation completed successfully');
    console.log('🔑 API Key:', key);
    console.log('🆔 Key ID:', keyId);
    console.log('👤 User ID:', userId);
    console.log('📝 Name:', apiKeyName);
    console.log('🔐 Permissions:', permissions);
    console.log('⚠️ IMPORTANT: Save this API key as it will not be shown again!');
  } catch (error) {
    console.error('❌ Error in main function:', error);
    process.exit(1);
  }
}

// Run the main function
main();
