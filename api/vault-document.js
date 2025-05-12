import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import fs from 'fs';
import { validateApiKey } from '../src/lib/apiKeyService';
import crypto from 'crypto';

// Disable body parsing, we'll handle it with formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  console.log('Vault Document API endpoint called with method:', req.method);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
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
    
    // Check if the API key has write permission
    if (!keyValidation.permissions.write) {
      return res.status(403).json({ error: 'API key does not have write permission' });
    }
    
    // Initialize Supabase client
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return res.status(500).json({ error: 'Supabase configuration missing' });
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Parse the multipart form data
    const form = new formidable.IncomingForm();
    form.keepExtensions = true;
    
    const formData = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          reject(err);
          return;
        }
        resolve({ fields, files });
      });
    });
    
    const { fields, files } = formData;
    
    // Validate required fields
    if (!files.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const file = files.file;
    const fileBuffer = fs.readFileSync(file.filepath);
    
    // Generate file hash
    const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    
    // Parse metadata if provided
    let metadata = {};
    if (fields.metadata) {
      try {
        metadata = JSON.parse(fields.metadata);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid metadata format. Must be valid JSON.' });
      }
    }
    
    // Upload file to Supabase Storage
    const fileName = file.originalFilename || 'document.pdf';
    const filePath = `${keyValidation.userId}/${Date.now()}_${fileName}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, fileBuffer, {
        contentType: file.mimetype || 'application/octet-stream',
        upsert: false
      });
    
    if (uploadError) {
      console.error('Error uploading file to storage:', uploadError);
      return res.status(500).json({ error: 'Failed to upload document', details: uploadError.message });
    }
    
    // Create document record in database
    const { data: documentData, error: documentError } = await supabase
      .from('documents')
      .insert({
        user_id: keyValidation.userId,
        file_name: fileName,
        file_path: filePath,
        file_hash: fileHash,
        file_size: file.size,
        mime_type: file.mimetype,
        source: fields.source || 'api',
        metadata: metadata,
        retention_period: fields.retention_period || '7 years',
        api_key_id: keyValidation.keyId
      })
      .select()
      .single();
    
    if (documentError) {
      console.error('Error creating document record:', documentError);
      return res.status(500).json({ error: 'Failed to create document record', details: documentError.message });
    }
    
    // Create audit log entry
    await supabase
      .from('audit_logs')
      .insert({
        user_id: keyValidation.userId,
        action: 'document_vaulted',
        resource_type: 'document',
        resource_id: documentData.id,
        details: {
          source: 'api',
          api_key_id: keyValidation.keyId,
          file_name: fileName,
          file_hash: fileHash
        }
      });
    
    // Return success response
    return res.status(201).json({
      success: true,
      document: {
        id: documentData.id,
        file_name: documentData.file_name,
        vault_time: documentData.created_at,
        file_hash: documentData.file_hash,
        blockchain_txid: documentData.blockchain_txid
      }
    });
    
  } catch (error) {
    console.error('Error handling vault document request:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
