import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ valid: false, reason: 'Method not allowed' });
  }

  const { hash } = req.query;

  if (!hash || typeof hash !== 'string') {
    return res.status(400).json({ valid: false, reason: 'No hash provided' });
  }

  try {
    // First check vault_documents table
    let data;
    let error;

    // Try vault_documents table first
    try {
      const vaultResult = await supabase
        .from('vault_documents')
        .select('blockchain_txid, created_at')
        .eq('document_hash', hash)
        .maybeSingle();
      
      data = vaultResult.data;
      error = vaultResult.error;
    } catch (e) {
      console.log('vault_documents table may not exist, checking audit_logs instead');
    }

    // If not found or error, try audit_logs table
    if (!data && !error) {
      const auditResult = await supabase
        .from('audit_logs')
        .select('blockchain_txid, created_at')
        .contains('metadata', { document_hash: hash })
        .maybeSingle();
      
      data = auditResult.data;
      error = auditResult.error;
    }

    // If still not found, check if the hash is in any blockchain_txid field
    // This is a fallback in case the hash was stored directly in the txid field
    if (!data && !error) {
      const txidResult = await supabase
        .from('audit_logs')
        .select('blockchain_txid, created_at')
        .ilike('blockchain_txid', `%${hash}%`)
        .maybeSingle();
      
      data = txidResult.data;
      error = txidResult.error;
    }

    if (error) {
      console.error('Supabase lookup error:', error);
      return res.status(500).json({ valid: false, reason: 'Database error' });
    }

    if (data && data.blockchain_txid) {
      return res.status(200).json({ 
        valid: true, 
        txid: data.blockchain_txid,
        created_at: data.created_at
      });
    } else {
      return res.status(404).json({ valid: false, reason: 'Hash not found' });
    }
  } catch (error: any) {
    console.error('Error verifying hash:', error);
    return res.status(500).json({ valid: false, reason: error.message });
  }
}
