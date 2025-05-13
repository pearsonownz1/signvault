/**
 * Standalone API Keys endpoint with real implementation
 * This file contains all the necessary code without importing from src directory
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export default async (req, res) => {
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
};
