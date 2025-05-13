// Test script for API key generation
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Initialize environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials not found in .env file');
  console.error('Make sure VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Function to generate a test API key
async function generateTestApiKey() {
  try {
    console.log('🔑 Testing API key generation...');
    
    // For testing purposes, we'll use a mock approach
    console.log('🧪 Using mock approach for testing...');
    
    // Generate a random API key
    const keyPrefix = 'sv_test_';
    const keyValue = crypto.randomBytes(24).toString('hex');
    const apiKey = `${keyPrefix}${keyValue}`;
    
    // Hash the API key for storage
    const hashedKey = crypto
      .createHash('sha256')
      .update(apiKey)
      .digest('hex');
    
    console.log('🔐 Generated API key (save this, it will not be shown again):', apiKey);
    console.log('🔒 Hashed key:', hashedKey);
    
    // Create a mock API key object
    const mockApiKey = {
      id: crypto.randomUUID(),
      user_id: crypto.randomUUID(),
      name: 'Test API Key',
      key_hash: hashedKey,
      permissions: { read: true, write: true },
      is_active: true,
      created_at: new Date().toISOString()
    };
    
    console.log('✅ Mock API key created successfully:');
    console.log(mockApiKey);
    
    // In a real scenario, we would store this in the database
    console.log('💾 In a real scenario, this would be stored in the database');
    
    // Return the mock API key
    return mockApiKey;
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
generateTestApiKey();
