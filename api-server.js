import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import crypto from 'crypto';

// Load environment variables
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create Express app
const app = express();

// Add middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add CORS middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// API Keys endpoint
app.all('/api/api-keys', async (req, res) => {
  console.log('API Keys endpoint called with method:', req.method);
  
  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase configuration missing:', { supabaseUrl, supabaseAnonKey });
      return res.status(500).json({ error: 'Supabase configuration missing' });
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Handle different HTTP methods
    switch (req.method) {
      case 'GET':
        // For demonstration purposes, return mock data for GET requests
        return res.status(200).json({
          success: true,
          apiKeys: [
            {
              id: "550e8400-e29b-41d4-a716-446655440000",
              name: "Production API Key",
              created_at: "2025-05-01T12:00:00Z",
              last_used_at: "2025-05-10T15:30:00Z",
              is_active: true,
              permissions: {
                read: true,
                write: true
              }
            },
            {
              id: "660e8400-e29b-41d4-a716-446655440001",
              name: "Development API Key",
              created_at: "2025-05-05T09:15:00Z",
              last_used_at: null,
              is_active: true,
              permissions: {
                read: true,
                write: false
              }
            }
          ]
        });
        
      case 'POST':
        // Handle API key creation
        try {
          // Parse the request body
          const { name, permissions } = req.body;
          console.log('POST /api/api-keys - Request body:', req.body);
          
          if (!name) {
            return res.status(400).json({ error: 'API key name is required' });
          }
          
          const apiKeyPermissions = {
            read: permissions?.read === false ? false : true,
            write: permissions?.write === true ? true : false
          };
          
          // Generate a mock API key
          const keyPrefix = 'sv_live_';
          const keyValue = Math.random().toString(36).substring(2, 15) + 
                          Math.random().toString(36).substring(2, 15);
          const apiKey = `${keyPrefix}${keyValue}`;
          const keyId = crypto.randomUUID();
          
          const responseData = {
            success: true,
            apiKey: {
              id: keyId,
              name,
              key: apiKey,
              permissions: apiKeyPermissions,
              created_at: new Date().toISOString(),
              is_active: true
            }
          };
          
          console.log('POST /api/api-keys - Response data:', JSON.stringify(responseData, null, 2));
          return res.status(201).json(responseData);
        } catch (error) {
          console.error('Error creating API key:', error);
          return res.status(500).json({ error: 'Failed to create API key', message: error.message });
        }
        
      case 'DELETE':
        // Handle API key deletion
        try {
          const keyId = req.query.id;
          
          if (!keyId) {
            return res.status(400).json({ error: 'API key ID is required' });
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
});

// Get Documents endpoint
app.all('/api/get-documents', async (req, res) => {
  console.log('Get Documents endpoint called with method:', req.method);
  
  try {
    // Return mock data
    return res.status(200).json({
      success: true,
      documents: [
        {
          id: "doc-001",
          file_name: "Contract.pdf",
          vault_time: "2025-05-01T12:00:00Z",
          file_hash: "a1b2c3d4e5f6...",
          file_size: 1024000,
          mime_type: "application/pdf",
          blockchain_txid: "0x123...",
          source: "api",
          metadata: { client: "Acme Corp" }
        },
        {
          id: "doc-002",
          file_name: "Agreement.pdf",
          vault_time: "2025-05-05T09:15:00Z",
          file_hash: "f6e5d4c3b2a1...",
          file_size: 2048000,
          mime_type: "application/pdf",
          blockchain_txid: "0x456...",
          source: "api",
          metadata: { client: "XYZ Inc" }
        }
      ],
      pagination: {
        total: 2,
        limit: 10,
        offset: 0,
        has_more: false
      }
    });
  } catch (error) {
    console.error('Error handling get documents request:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Get Document endpoint
app.all('/api/get-document', async (req, res) => {
  console.log('Get Document endpoint called with method:', req.method);
  
  try {
    // Return mock data
    return res.status(200).json({
      success: true,
      document: {
        id: "doc-001",
        file_name: "Contract.pdf",
        vault_time: "2025-05-01T12:00:00Z",
        file_hash: "a1b2c3d4e5f6...",
        file_size: 1024000,
        mime_type: "application/pdf",
        blockchain_txid: "0x123...",
        source: "api",
        metadata: { client: "Acme Corp" },
        download_url: null
      }
    });
  } catch (error) {
    console.error('Error handling get document request:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Vault Document endpoint
app.all('/api/vault-document', async (req, res) => {
  console.log('Vault Document endpoint called with method:', req.method);
  
  try {
    // Return mock data
    return res.status(201).json({
      success: true,
      document: {
        id: "doc-003",
        file_name: "NewDocument.pdf",
        vault_time: new Date().toISOString(),
        file_hash: "g7h8i9j0k1l2...",
        blockchain_txid: null
      }
    });
  } catch (error) {
    console.error('Error handling vault document request:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Standalone API Keys endpoint
app.all('/api/standalone-api-keys', async (req, res) => {
  console.log('Standalone API Keys endpoint called with method:', req.method);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // For demonstration purposes, return mock data
    switch (req.method) {
      case 'GET':
        // Return mock API keys
        return res.status(200).json({
          success: true,
          apiKeys: [
            {
              id: 'mock-key-1',
              name: 'Test API Key 1',
              created_at: '2025-05-01T12:00:00Z',
              last_used_at: '2025-05-10T15:30:00Z',
              is_active: true,
              permissions: { read: true, write: false }
            },
            {
              id: 'mock-key-2',
              name: 'Test API Key 2',
              created_at: '2025-05-05T14:20:00Z',
              last_used_at: null,
              is_active: true,
              permissions: { read: true, write: true }
            }
          ]
        });
        
      case 'POST':
        // Mock creating a new API key
        const { name, permissions } = req.body || { name: 'Default Key', permissions: { read: true, write: false } };
        
        return res.status(201).json({
          success: true,
          apiKey: {
            id: 'new-mock-key-' + Date.now(),
            name: name || 'Default Key',
            key: 'sv_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            permissions: permissions || { read: true, write: false },
            created_at: new Date().toISOString(),
            is_active: true
          }
        });
        
      case 'DELETE':
        // Mock deleting an API key
        return res.status(200).json({ success: true });
        
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error handling standalone API keys request:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});
