/**
 * API endpoint for vaulting documents from external applications
 * This endpoint uses API key authentication
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const busboy = require('busboy');

module.exports = async (req, res) => {
  console.log('Vault document API endpoint called with method:', req.method);
  
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
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Only POST requests are supported.' 
    });
  }
  
  try {
    // Extract API key from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: 'Missing or invalid Authorization header. Please provide an API key using Bearer authentication.' 
      });
    }
    
    const apiKey = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase configuration missing');
      return res.status(500).json({ 
        success: false, 
        error: 'Server configuration error. Please try again later.' 
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Validate API key
    const hashedKey = crypto
      .createHash('sha256')
      .update(apiKey)
      .digest('hex');
    
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from('api_keys')
      .select('id, user_id, permissions, is_active')
      .eq('key_hash', hashedKey)
      .single();
    
    if (apiKeyError || !apiKeyData) {
      console.error('API key validation failed:', apiKeyError || 'Key not found');
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid API key.' 
      });
    }
    
    // Check if the key is active
    if (!apiKeyData.is_active) {
      console.error('API key is inactive');
      return res.status(401).json({ 
        success: false, 
        error: 'API key is inactive.' 
      });
    }
    
    // Check if the key has write permission
    if (!apiKeyData.permissions.write) {
      console.error('API key does not have write permission');
      return res.status(403).json({ 
        success: false, 
        error: 'API key does not have write permission.' 
      });
    }
    
    // Update last used timestamp
    await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', apiKeyData.id);
    
    // Process the multipart form data
    return new Promise((resolve) => {
      const fields = {};
      let fileBuffer = null;
      let fileName = null;
      let fileType = null;
      
      const bb = busboy({ headers: req.headers });
      
      bb.on('file', (name, file, info) => {
        const { filename, mimeType } = info;
        fileName = filename;
        fileType = mimeType;
        
        const chunks = [];
        file.on('data', (data) => {
          chunks.push(data);
        });
        
        file.on('end', () => {
          fileBuffer = Buffer.concat(chunks);
        });
      });
      
      bb.on('field', (name, val) => {
        fields[name] = val;
      });
      
      bb.on('close', async () => {
        try {
          if (!fileBuffer) {
            return resolve(res.status(400).json({ 
              success: false, 
              error: 'No file provided.' 
            }));
          }
          
          // Generate a file hash for the document
          const fileHash = crypto
            .createHash('sha256')
            .update(fileBuffer)
            .digest('hex');
          
          // Upload the file to Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('documents')
            .upload(`${apiKeyData.user_id}/${fileHash}/${fileName}`, fileBuffer, {
              contentType: fileType,
              upsert: false
            });
          
          if (uploadError) {
            console.error('Error uploading file:', uploadError);
            return resolve(res.status(500).json({ 
              success: false, 
              error: 'Failed to upload document. Please try again later.' 
            }));
          }
          
          // Create a document record in the database
          const { data: documentData, error: documentError } = await supabase
            .from('documents')
            .insert({
              user_id: apiKeyData.user_id,
              file_name: fileName,
              file_hash: fileHash,
              file_type: fileType,
              file_size: fileBuffer.length,
              storage_path: uploadData.path,
              source: fields.source || 'api',
              metadata: fields.metadata ? JSON.parse(fields.metadata) : {},
              retention_period: fields.retention_period || '7 years'
            })
            .select('id, file_name, file_hash, created_at, blockchain_txid')
            .single();
          
          if (documentError) {
            console.error('Error creating document record:', documentError);
            return resolve(res.status(500).json({ 
              success: false, 
              error: 'Failed to create document record. Please try again later.' 
            }));
          }
          
          // Create audit log entry
          await supabase
            .from('audit_logs')
            .insert({
              user_id: apiKeyData.user_id,
              action: 'document_vaulted',
              resource_type: 'document',
              resource_id: documentData.id,
              details: {
                file_name: fileName,
                file_hash: fileHash,
                source: fields.source || 'api',
                api_key_id: apiKeyData.id
              }
            });
          
          // Return success response
          return resolve(res.status(201).json({
            success: true,
            document: {
              id: documentData.id,
              file_name: documentData.file_name,
              vault_time: documentData.created_at,
              file_hash: documentData.file_hash,
              blockchain_txid: documentData.blockchain_txid
            }
          }));
        } catch (error) {
          console.error('Error processing document:', error);
          return resolve(res.status(500).json({ 
            success: false, 
            error: 'An error occurred while processing the document. Please try again later.' 
          }));
        }
      });
      
      // Pass the request to busboy
      if (req.rawBody) {
        bb.end(req.rawBody);
      } else {
        req.pipe(bb);
      }
    });
  } catch (error) {
    console.error('Error in vault document endpoint:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'An error occurred while processing your request. Please try again later.' 
    });
  }
};
