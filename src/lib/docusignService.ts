import axios from 'axios';
import crypto from 'crypto';
import { supabase } from './supabase';

// DocuSign configuration
const DOCUSIGN_INTEGRATION_KEY = import.meta.env.VITE_DOCUSIGN_INTEGRATION_KEY as string;
const DOCUSIGN_SECRET = import.meta.env.VITE_DOCUSIGN_SECRET as string;
const DOCUSIGN_REDIRECT_URI = import.meta.env.VITE_DOCUSIGN_REDIRECT_URI as string;
const DOCUSIGN_AUTH_SERVER = import.meta.env.VITE_DOCUSIGN_AUTH_SERVER as string;

/**
 * Generate a random string for PKCE code verifier
 */
function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString('base64url');
}

/**
 * Generate code challenge from code verifier using SHA-256
 */
function generateCodeChallenge(codeVerifier: string): string {
  const hash = crypto.createHash('sha256').update(codeVerifier).digest();
  return Buffer.from(hash).toString('base64url');
}

/**
 * Generate a random state parameter for OAuth
 */
function generateState(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Store OAuth state and code verifier in the database
 */
async function storeOAuthState(userId: string, state: string, codeVerifier: string): Promise<boolean> {
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

/**
 * Get the authorization URL for DocuSign OAuth
 */
export async function getDocuSignAuthUrl(userId: string): Promise<string | null> {
  try {
    // Generate PKCE code verifier and challenge
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    const state = generateState();

    // Store state and code verifier in the database
    const stored = await storeOAuthState(userId, state, codeVerifier);
    if (!stored) {
      throw new Error('Failed to store OAuth state');
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

    return authUrl.toString();
  } catch (error) {
    console.error('Error generating DocuSign auth URL:', error);
    return null;
  }
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(code: string, state: string): Promise<any> {
  try {
    // Get the code verifier from the database
    const { data: oauthState, error: fetchError } = await supabase
      .from('oauth_states')
      .select('*')
      .eq('state', state)
      .maybeSingle();

    if (fetchError || !oauthState) {
      throw new Error('Invalid state parameter or state not found');
    }

    const codeVerifier = oauthState.code_verifier;
    const userId = oauthState.user_id;

    // Exchange the code for tokens
    const tokenResponse = await axios.post(
      `https://${DOCUSIGN_AUTH_SERVER}/oauth/token`,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: DOCUSIGN_INTEGRATION_KEY,
        client_secret: DOCUSIGN_SECRET,
        redirect_uri: DOCUSIGN_REDIRECT_URI,
        code_verifier: codeVerifier
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Get user info from DocuSign
    const userInfoResponse = await axios.get(
      `https://${DOCUSIGN_AUTH_SERVER}/oauth/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      }
    );

    const userInfo = userInfoResponse.data;
    const account = userInfo.accounts.find((acc: any) => acc.is_default);

    if (!account) {
      throw new Error('No default DocuSign account found');
    }

    // Calculate token expiration time
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + expires_in);

    // Store the connection in the database
    const { error: insertError } = await supabase
      .from('docusign_connections')
      .insert({
        user_id: userId,
        docusign_account_id: account.account_id,
        docusign_account_name: account.account_name,
        docusign_base_uri: account.base_uri,
        access_token,
        refresh_token,
        expires_at: expiresAt.toISOString(),
        email: userInfo.email,
        name: userInfo.name
      });

    if (insertError) {
      throw new Error(`Failed to store DocuSign connection: ${insertError.message}`);
    }

    // Clean up the OAuth state
    await supabase
      .from('oauth_states')
      .delete()
      .eq('state', state);

    return {
      success: true,
      userId,
      accountId: account.account_id,
      accountName: account.account_name
    };
  } catch (error: any) {
    console.error('Error exchanging code for token:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Refresh an expired access token
 */
export async function refreshDocuSignToken(connectionId: string): Promise<boolean> {
  try {
    // Get the connection from the database
    const { data: connection, error: fetchError } = await supabase
      .from('docusign_connections')
      .select('*')
      .eq('id', connectionId)
      .maybeSingle();

    if (fetchError || !connection) {
      throw new Error('Connection not found');
    }

    // Refresh the token
    const tokenResponse = await axios.post(
      `https://${DOCUSIGN_AUTH_SERVER}/oauth/token`,
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: connection.refresh_token,
        client_id: DOCUSIGN_INTEGRATION_KEY,
        client_secret: DOCUSIGN_SECRET
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Calculate new expiration time
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + expires_in);

    // Update the connection in the database
    const { error: updateError } = await supabase
      .from('docusign_connections')
      .update({
        access_token,
        refresh_token,
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', connectionId);

    if (updateError) {
      throw new Error(`Failed to update DocuSign connection: ${updateError.message}`);
    }

    return true;
  } catch (error) {
    console.error('Error refreshing DocuSign token:', error);
    return false;
  }
}

/**
 * Get user's DocuSign connections
 */
export async function getUserDocuSignConnections(userId: string) {
  try {
    const { data, error } = await supabase
      .from('docusign_connections')
      .select('id, docusign_account_id, docusign_account_name, email, name, created_at')
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return { connections: data || [] };
  } catch (error) {
    console.error('Error getting DocuSign connections:', error);
    return { connections: [] };
  }
}

/**
 * Delete a DocuSign connection
 */
export async function deleteDocuSignConnection(connectionId: string, userId: string) {
  try {
    const { error } = await supabase
      .from('docusign_connections')
      .delete()
      .eq('id', connectionId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting DocuSign connection:', error);
    return { success: false };
  }
}

/**
 * Get a valid access token for a user
 * This will refresh the token if it's expired
 */
export async function getValidAccessToken(userId: string): Promise<string> {
  try {
    // Get the user's DocuSign connection
    const { data: connections, error: fetchError } = await supabase
      .from('docusign_connections')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (fetchError || !connections || connections.length === 0) {
      throw new Error('No DocuSign connection found for user');
    }

    const connection = connections[0];

    // Check if the token is expired
    const now = new Date();
    const expiresAt = new Date(connection.expires_at);

    // If the token expires in less than 5 minutes, refresh it
    if (expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
      const refreshed = await refreshDocuSignToken(connection.id);
      if (!refreshed) {
        throw new Error('Failed to refresh DocuSign token');
      }

      // Get the updated connection
      const { data: updatedConnection, error: updateFetchError } = await supabase
        .from('docusign_connections')
        .select('*')
        .eq('id', connection.id)
        .single();

      if (updateFetchError || !updatedConnection) {
        throw new Error('Failed to get updated DocuSign connection');
      }

      return updatedConnection.access_token;
    }

    return connection.access_token;
  } catch (error: any) {
    console.error('Error getting valid access token:', error);
    throw new Error(`Failed to get valid access token: ${error.message}`);
  }
}

/**
 * Get information about a DocuSign envelope
 */
export async function getEnvelopeInfo(
  accessToken: string,
  baseUri: string,
  accountId: string,
  envelopeId: string
): Promise<any> {
  try {
    const response = await axios.get(
      `${baseUri}/restapi/v2.1/accounts/${accountId}/envelopes/${envelopeId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json'
        }
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error getting envelope info:', error);
    throw new Error(`Failed to get envelope info: ${error.message}`);
  }
}

/**
 * Download documents from a DocuSign envelope
 */
export async function downloadEnvelopeDocuments(
  accessToken: string,
  baseUri: string,
  accountId: string,
  envelopeId: string
): Promise<Buffer> {
  try {
    const response = await axios.get(
      `${baseUri}/restapi/v2.1/accounts/${accountId}/envelopes/${envelopeId}/documents/combined`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/pdf'
        },
        responseType: 'arraybuffer'
      }
    );

    return Buffer.from(response.data);
  } catch (error: any) {
    console.error('Error downloading envelope documents:', error);
    throw new Error(`Failed to download envelope documents: ${error.message}`);
  }
}
