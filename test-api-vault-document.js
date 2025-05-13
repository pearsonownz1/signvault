/**
 * Test script to demonstrate using the API key to vault a document
 * This script uses the API key to vault a sample document
 */

import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import path from 'path';
import dotenv from 'dotenv';

// Initialize environment variables
dotenv.config();

// Read the API key from the file
let apiKey;
try {
  const apiKeyInfo = JSON.parse(fs.readFileSync('api-key-info.json', 'utf8'));
  apiKey = apiKeyInfo.key;
  console.log('🔑 Using API key from api-key-info.json');
} catch (error) {
  console.error('❌ Error reading API key from file:', error);
  console.error('Please run create-real-api-key.js first to generate an API key');
  process.exit(1);
}

// Check if the API key has write permission
try {
  const apiKeyInfo = JSON.parse(fs.readFileSync('api-key-info.json', 'utf8'));
  if (!apiKeyInfo.permissions.write) {
    console.error('❌ The API key does not have write permission');
    console.error('Please generate a new API key with write permission:');
    console.error('node create-real-api-key.js USER_ID "API Key with Write" write');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error checking API key permissions:', error);
  process.exit(1);
}

/**
 * Vault a document using the API
 */
async function vaultDocument() {
  try {
    console.log('📄 Vaulting a document...');
    
    // Create a sample document if it doesn't exist
    const sampleDocPath = 'sample-document.txt';
    if (!fs.existsSync(sampleDocPath)) {
      console.log('📝 Creating a sample document...');
      fs.writeFileSync(sampleDocPath, 'This is a sample document for testing the API integration.');
      console.log('✅ Sample document created');
    }
    
    // Create a form with the document and metadata
    const form = new FormData();
    form.append('file', fs.createReadStream(sampleDocPath));
    
    // Add metadata
    const metadata = {
      source: 'api-test',
      description: 'Test document uploaded via API',
      tags: ['test', 'api', 'integration']
    };
    form.append('metadata', JSON.stringify(metadata));
    
    // Add source
    form.append('source', 'api-test-script');
    
    // Determine the base URL
    const baseUrl = process.env.VITE_API_URL || process.env.API_URL || 'http://localhost:3000';
    const url = `${baseUrl}/api/vault-document`;
    
    console.log(`🌐 Sending request to ${url}`);
    
    // Send the request
    const response = await axios.post(url, form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    console.log('✅ Document vaulted successfully:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('❌ Error vaulting document:');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`Status: ${error.response.status}`);
      console.error('Response data:', error.response.data);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server');
      console.error(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
    }
    
    console.error('Error config:', error.config);
    throw error;
  }
}

/**
 * Get documents using the API
 */
async function getDocuments() {
  try {
    console.log('📋 Getting documents...');
    
    // Determine the base URL
    const baseUrl = process.env.VITE_API_URL || process.env.API_URL || 'http://localhost:3000';
    const url = `${baseUrl}/api/get-documents`;
    
    console.log(`🌐 Sending request to ${url}`);
    
    // Send the request
    const response = await axios.get(url, {
      params: {
        limit: 10,
        offset: 0,
        source: 'api-test-script'
      },
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    console.log('✅ Documents retrieved successfully:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('❌ Error getting documents:');
    
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received from server');
    } else {
      console.error('Error setting up request:', error.message);
    }
    
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('🚀 Testing API integration...');
    
    // Get documents first to see what's already there
    await getDocuments();
    
    // Vault a document
    await vaultDocument();
    
    // Get documents again to see the new document
    await getDocuments();
    
    console.log('✅ API integration test completed successfully');
  } catch (error) {
    console.error('❌ Error in main function:', error);
    process.exit(1);
  }
}

// Run the main function
main();
