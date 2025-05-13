import { createClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// DocuSign configuration
const DOCUSIGN_INTEGRATION_KEY = '923951ff-0900-4890-b6b5-d9b5bf926c65'; // New integration key from DocuSign
const DOCUSIGN_AUTH_SERVER = 'account-d.docusign.com'; // Developer sandbox environment
const DOCUSIGN_REDIRECT_URI = 'https://signvault.co/api/docusign/callback'; // Exact redirect URI to register in DocuSign

/**
 * Generate a random string for PKCE code verifier
 */
function generateCodeVerifier() {
  return crypto.randomBytes(32).toString('base64url');
}

/**
 * Generate code challenge from code verifier using SHA-256
 */
function generateCodeChallenge(codeVerifier) {
  const hash = crypto.createHash('sha256').update(codeVerifier).digest();
  return Buffer.from(hash).toString('base64url');
}

/**
 * Generate a random state parameter for OAuth
 */
function generateState() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Store OAuth state and code verifier in the database
 */
async function storeOAuthState(userId, state, codeVerifier) {
  const { error } = await supabase
    .from('oauth_states')
    .insert({
      user_id: userId,
      state: state,
      code_verifier: codeVerifier
    });

  if (error) {
    console.error('Error storing OAuth state:', error);
    return false;
  }

  return true;
}

export default async function handler(req, res) {
  try {
    // Get the user ID from the query parameter
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    console.log(`Generating OAuth URL for user: ${userId}`);

    // Generate PKCE code verifier and challenge
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    const state = generateState();

    console.log(`Generated code verifier (${codeVerifier.length} chars): ${codeVerifier.substring(0, 10)}...`);
    console.log(`Generated code challenge (${codeChallenge.length} chars): ${codeChallenge.substring(0, 10)}...`);
    console.log(`Generated state (${state.length} chars): ${state}`);

    // Store state and code verifier in the database
    const stored = await storeOAuthState(userId, state, codeVerifier);
    if (!stored) {
      return res.status(500).json({ error: 'Failed to store OAuth state' });
    }

    // Construct the authorization URL
    const authUrl = new URL(`https://${DOCUSIGN_AUTH_SERVER}/oauth/auth`);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', 'signature');
    authUrl.searchParams.append('client_id', DOCUSIGN_INTEGRATION_KEY);
    authUrl.searchParams.append('redirect_uri', DOCUSIGN_REDIRECT_URI);
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('code_challenge', codeChallenge);
    authUrl.searchParams.append('code_challenge_method', 'S256');

    console.log(`Generated auth URL: ${authUrl.toString()}`);

    // Return the authorization URL
    return res.status(200).json({ url: authUrl.toString() });
  } catch (error) {
    console.error('Error generating DocuSign auth URL:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
