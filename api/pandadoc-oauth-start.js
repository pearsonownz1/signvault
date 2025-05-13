import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY;

// Check if the required environment variables are set
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.error('VITE_SUPABASE_URL or SUPABASE_URL:', supabaseUrl);
  console.error('VITE_SUPABASE_SERVICE_KEY or SUPABASE_SERVICE_KEY:', supabaseServiceKey ? '[SET]' : '[NOT SET]');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// PandaDoc configuration
const PANDADOC_CLIENT_ID = process.env.VITE_PANDADOC_CLIENT_ID || process.env.PANDADOC_CLIENT_ID;
const PANDADOC_REDIRECT_URI = process.env.VITE_PANDADOC_REDIRECT_URI || process.env.PANDADOC_REDIRECT_URI;

/**
 * Generate a random string for state parameter
 */
function generateState() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Store OAuth state in the database
 */
async function storeOAuthState(userId, state) {
  const { error } = await supabase
    .from('oauth_states')
    .insert({
      user_id: userId,
      state: state,
      provider: 'pandadoc',
      code_verifier: '' // Empty string instead of null
    });

  if (error) {
    console.error('Error storing OAuth state:', error);
    return false;
  }

  return true;
}

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId parameter' });
    }

    // Generate state for CSRF protection
    const state = generateState();

    // Store state in the database
    const stored = await storeOAuthState(userId, state);
    if (!stored) {
      return res.status(500).json({ error: 'Failed to store OAuth state' });
    }

    // Construct the authorization URL
    const authUrl = new URL('https://app.pandadoc.com/oauth2/authorize');
    authUrl.searchParams.append('client_id', PANDADOC_CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', PANDADOC_REDIRECT_URI);
    authUrl.searchParams.append('scope', 'read+write');
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('state', state);

    return res.status(200).json({ url: authUrl.toString() });
  } catch (error) {
    console.error('Error generating PandaDoc auth URL:', error);
    return res.status(500).json({ error: 'Failed to generate authorization URL' });
  }
}
