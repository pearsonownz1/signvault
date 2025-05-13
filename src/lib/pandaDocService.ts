import axios from 'axios';
import crypto from 'crypto';
import { supabase } from './supabase';

// PandaDoc configuration
const PANDADOC_CLIENT_ID = import.meta.env.VITE_PANDADOC_CLIENT_ID as string;
const PANDADOC_SECRET_KEY = import.meta.env.VITE_PANDADOC_SECRET_KEY as string;
const PANDADOC_REDIRECT_URI = import.meta.env.VITE_PANDADOC_REDIRECT_URI as string;
const PANDADOC_API_BASE_URL = import.meta.env.VITE_PANDADOC_API_BASE_URL as string;

/**
 * Generate a random string for state parameter
 */
function generateState(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Store OAuth state in the database
 */
async function storeOAuthState(userId: string, state: string): Promise<boolean> {
  const { error } = await supabase
    .from('oauth_states')
    .insert({
      user_id: userId,
      state: state,
      provider: 'pandadoc'
    });

  if (error) {
    console.error('Error storing OAuth state:', error);
    return false;
  }

  return true;
}

/**
 * Get the authorization URL for PandaDoc OAuth
 */
export async function getPandaDocAuthUrl(userId: string): Promise<string | null> {
  try {
    // Generate state for CSRF protection
    const state = generateState();

    // Store state in the database
    const stored = await storeOAuthState(userId, state);
    if (!stored) {
      throw new Error('Failed to store OAuth state');
    }

    // Construct the authorization URL
    const authUrl = new URL('https://app.pandadoc.com/oauth2/authorize');
    authUrl.searchParams.append('client_id', PANDADOC_CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', PANDADOC_REDIRECT_URI);
    authUrl.searchParams.append('scope', 'read+write');
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('state', state);

    return authUrl.toString();
  } catch (error) {
    console.error('Error generating PandaDoc auth URL:', error);
    return null;
  }
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(code: string, state: string): Promise<any> {
  try {
    // Get the state from the database
    const { data: oauthState, error: fetchError } = await supabase
      .from('oauth_states')
      .select('*')
      .eq('state', state)
      .eq('provider', 'pandadoc')
      .maybeSingle();

    if (fetchError || !oauthState) {
      throw new Error('Invalid state parameter or state not found');
    }

    const userId = oauthState.user_id;

    // Exchange the code for tokens
    const tokenResponse = await axios.post(
      'https://api.pandadoc.com/oauth2/access_token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: PANDADOC_CLIENT_ID,
        client_secret: PANDADOC_SECRET_KEY,
        redirect_uri: PANDADOC_REDIRECT_URI,
        scope: 'read write'
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Get user info from PandaDoc
    const userInfoResponse = await axios.get(
      'https://api.pandadoc.com/public/v1/users/me',
      {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      }
    );

    const userInfo = userInfoResponse.data;

    // Calculate token expiration time
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + expires_in);

    // Store the connection in the database
    const { error: insertError } = await supabase
      .from('pandadoc_connections')
      .insert({
        user_id: userId,
        pandadoc_user_id: userInfo.id,
        access_token,
        refresh_token,
        expires_at: expiresAt.toISOString(),
        email: userInfo.email,
        name: userInfo.name || userInfo.email
      });

    if (insertError) {
      throw new Error(`Failed to store PandaDoc connection: ${insertError.message}`);
    }

    // Clean up the OAuth state
    await supabase
      .from('oauth_states')
      .delete()
      .eq('state', state);

    return {
      success: true,
      userId,
      email: userInfo.email,
      name: userInfo.name || userInfo.email
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
export async function refreshPandaDocToken(connectionId: string): Promise<boolean> {
  try {
    // Get the connection from the database
    const { data: connection, error: fetchError } = await supabase
      .from('pandadoc_connections')
      .select('*')
      .eq('id', connectionId)
      .maybeSingle();

    if (fetchError || !connection) {
      throw new Error('Connection not found');
    }

    // Refresh the token
    const tokenResponse = await axios.post(
      'https://api.pandadoc.com/oauth2/access_token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: connection.refresh_token,
        client_id: PANDADOC_CLIENT_ID,
        client_secret: PANDADOC_SECRET_KEY,
        scope: 'read write'
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
      .from('pandadoc_connections')
      .update({
        access_token,
        refresh_token,
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', connectionId);

    if (updateError) {
      throw new Error(`Failed to update PandaDoc connection: ${updateError.message}`);
    }

    return true;
  } catch (error) {
    console.error('Error refreshing PandaDoc token:', error);
    return false;
  }
}

/**
 * Get user's PandaDoc connections
 */
export async function getUserPandaDocConnections(userId: string) {
  try {
    const { data, error } = await supabase
      .from('pandadoc_connections')
      .select('id, pandadoc_user_id, email, name, created_at')
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return { connections: data || [] };
  } catch (error) {
    console.error('Error getting PandaDoc connections:', error);
    return { connections: [] };
  }
}

/**
 * Delete a PandaDoc connection
 */
export async function deletePandaDocConnection(connectionId: string, userId: string) {
  try {
    const { error } = await supabase
      .from('pandadoc_connections')
      .delete()
      .eq('id', connectionId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting PandaDoc connection:', error);
    return { success: false };
  }
}

/**
 * Get a valid access token for a user
 * This will refresh the token if it's expired
 */
export async function getValidAccessToken(userId: string): Promise<string> {
  try {
    // Get the user's PandaDoc connection
    const { data: connections, error: fetchError } = await supabase
      .from('pandadoc_connections')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (fetchError || !connections || connections.length === 0) {
      throw new Error('No PandaDoc connection found for user');
    }

    const connection = connections[0];

    // Check if the token is expired
    const now = new Date();
    const expiresAt = new Date(connection.expires_at);

    // If the token expires in less than 5 minutes, refresh it
    if (expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
      const refreshed = await refreshPandaDocToken(connection.id);
      if (!refreshed) {
        throw new Error('Failed to refresh PandaDoc token');
      }

      // Get the updated connection
      const { data: updatedConnection, error: updateFetchError } = await supabase
        .from('pandadoc_connections')
        .select('*')
        .eq('id', connection.id)
        .single();

      if (updateFetchError || !updatedConnection) {
        throw new Error('Failed to get updated PandaDoc connection');
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
 * Download a document from PandaDoc
 */
export async function downloadDocument(
  accessToken: string,
  documentId: string
): Promise<Buffer> {
  try {
    const response = await axios.get(
      `${PANDADOC_API_BASE_URL}/public/v1/documents/${documentId}/download`,
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
    console.error('Error downloading document:', error);
    throw new Error(`Failed to download document: ${error.message}`);
  }
}

/**
 * Get document details from PandaDoc
 */
export async function getDocumentDetails(
  accessToken: string,
  documentId: string
): Promise<any> {
  try {
    const response = await axios.get(
      `${PANDADOC_API_BASE_URL}/public/v1/documents/${documentId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json'
        }
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error getting document details:', error);
    throw new Error(`Failed to get document details: ${error.message}`);
  }
}
