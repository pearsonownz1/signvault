import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

// DocuSign OAuth configuration
const DOCUSIGN_INTEGRATION_KEY = process.env.DOCUSIGN_CLIENT_ID;
const DOCUSIGN_SECRET = process.env.DOCUSIGN_CLIENT_SECRET;
const DOCUSIGN_REDIRECT_URI = process.env.DOCUSIGN_REDIRECT_URI;
const DOCUSIGN_AUTH_SERVER = 'account-d.docusign.com';

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Log Supabase configuration (without exposing the full key)
console.log('Supabase configuration:', {
  url: SUPABASE_URL,
  hasServiceRoleKey: !!SUPABASE_SERVICE_ROLE_KEY,
  serviceRoleKeyPrefix: SUPABASE_SERVICE_ROLE_KEY ? SUPABASE_SERVICE_ROLE_KEY.substring(0, 10) + '...' : null
});

// We'll initialize Supabase client inside the handler function to ensure
// environment variables are properly loaded

export default async function handler(req, res) {
  try {
    // Initialize Supabase client
    console.log('Initializing Supabase client...');
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing Supabase configuration');
      return res.status(500).send('Missing Supabase configuration. Please check environment variables.');
    }
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    console.log('Supabase client initialized successfully');
    
    // Log environment variables (without exposing secrets)
    console.log('Environment variables check:', {
      hasClientId: !!DOCUSIGN_INTEGRATION_KEY,
      hasClientSecret: !!DOCUSIGN_SECRET,
      redirectUri: DOCUSIGN_REDIRECT_URI,
      authServer: DOCUSIGN_AUTH_SERVER,
      hasSupabaseUrl: !!SUPABASE_URL,
      hasSupabaseServiceRoleKey: !!SUPABASE_SERVICE_ROLE_KEY
    });
    
    // Log the request query parameters
    console.log('DocuSign callback received with query params:', JSON.stringify(req.query));
    
    // Get the authorization code and state from URL
    const { code, state } = req.query;
    
    if (!code) {
      console.error('Missing code in OAuth callback');
      return res.status(400).send('Missing code');
    }
    
    if (!state) {
      console.error('Missing state in OAuth callback');
      return res.status(400).send('Missing state');
    }
    
    // Exchange code for tokens
    console.log('Exchanging code for tokens...');
    
    try {
      // We already initialized Supabase client above
      
      // Get the code verifier from Supabase
      console.log('Looking up code verifier in Supabase for state:', state.substring(0, 10) + '...');
      
      const { data: oauthState, error: oauthStateError } = await supabase
        .from('oauth_states')
        .select('code_verifier, user_id')
        .eq('state', state)
        .single();
      
      if (oauthStateError || !oauthState) {
        console.error('Error retrieving OAuth state from Supabase:', oauthStateError);
        
        // Try to get the code verifier from our temporary storage as a fallback
        const tempCodeVerifier = global.codeVerifiers?.[state];
        
        if (!tempCodeVerifier) {
          console.error('No code verifier found for state:', state);
          return res.status(400).send(`No code verifier found for state: ${state}. Please try connecting again.`);
        }
        
        console.log('Retrieved code verifier from temporary storage:', state.substring(0, 10) + '...');
        console.log('Code verifier length:', tempCodeVerifier.length);
        console.log('Code verifier first 10 chars:', tempCodeVerifier.substring(0, 10));
        
        var codeVerifier = tempCodeVerifier;
        var userId = state.split(':')[0];
      } else {
        console.log('Retrieved code verifier from Supabase for state:', state.substring(0, 10) + '...');
        console.log('Code verifier length:', oauthState.code_verifier.length);
        console.log('Code verifier first 10 chars:', oauthState.code_verifier.substring(0, 10));
        console.log('User ID from Supabase:', oauthState.user_id);
        
        var codeVerifier = oauthState.code_verifier;
        var userId = oauthState.user_id;
        
        // Clean up the OAuth state from Supabase
        const { error: deleteError } = await supabase
          .from('oauth_states')
          .delete()
          .eq('state', state);
        
        if (deleteError) {
          console.warn('Error deleting OAuth state from Supabase:', deleteError);
        }
      }
      
      // Create Basic Auth header
      const authString = Buffer.from(`${DOCUSIGN_INTEGRATION_KEY}:${DOCUSIGN_SECRET}`).toString('base64');
      
      // Prepare request parameters
      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: DOCUSIGN_REDIRECT_URI,
        code_verifier: codeVerifier
      });
      
      console.log('Token request parameters:', {
        grant_type: 'authorization_code',
        code: code.substring(0, 10) + '...',
        redirect_uri: DOCUSIGN_REDIRECT_URI,
        has_code_verifier: !!codeVerifier
      });
      
      // Exchange code for tokens with PKCE
      const tokenResponse = await axios.post(
        `https://${DOCUSIGN_AUTH_SERVER}/oauth/token`,
        params.toString(),
        {
          headers: {
            'Authorization': `Basic ${authString}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      
      // Clean up the code verifier from memory
      if (global.codeVerifiers && global.codeVerifiers[state]) {
        delete global.codeVerifiers[state];
      }
      
      console.log('Token response received:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        hasAccessToken: !!tokenResponse.data.access_token,
        hasRefreshToken: !!tokenResponse.data.refresh_token,
      });
      
      const { access_token, refresh_token, expires_in } = tokenResponse.data;
      
      // Calculate token expiration time
      const expiresAt = Date.now() + expires_in * 1000;
      
      // Get user information from DocuSign
      console.log('Fetching user info from DocuSign...');
      const userInfoResponse = await axios.get(
        `https://${DOCUSIGN_AUTH_SERVER}/oauth/userinfo`,
        {
          headers: {
            'Authorization': `Bearer ${access_token}`,
          },
        }
      );
      
      console.log('User info received:', {
        hasEmail: !!userInfoResponse.data.email,
        hasAccounts: Array.isArray(userInfoResponse.data.accounts) && userInfoResponse.data.accounts.length > 0,
      });
      
      const userInfo = userInfoResponse.data;
      
      // We already have userId from the OAuth state lookup
      // If not, extract it from the state parameter as a fallback
      if (!userId && state.includes(':')) {
        userId = state.split(':')[0];
        console.log('Extracted user ID from state:', userId);
      }
      
      if (!userId) {
        console.error('Could not extract user ID from state');
        return res.status(400).send('Invalid state parameter');
      }
      
      // Save the connection to the database
      console.log('Saving connection to database for user:', userId);
      
      const { error: saveError } = await supabase
        .from('docusign_connections')
        .upsert({
          user_id: userId,
          docusign_account_id: userInfo.accounts[0].account_id,
          docusign_account_name: userInfo.accounts[0].account_name,
          docusign_base_uri: userInfo.accounts[0].base_uri,
          access_token: access_token,
          refresh_token: refresh_token,
          expires_at: new Date(expiresAt).toISOString(),
          email: userInfo.email,
          name: `${userInfo.name || ''} ${userInfo.family_name || ''}`.trim(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      
      if (saveError) {
        console.error('Error saving connection to database:', saveError);
        return res.status(500).send(`Failed to save DocuSign connection: ${saveError.message}`);
      }
      
      console.log('Connection saved successfully');
      
      // Redirect to the dashboard
      console.log('Redirecting to dashboard...');
      return res.redirect(302, '/dashboard/integrations');
      
    } catch (tokenError) {
      console.error('Error exchanging code for token:', tokenError.message);
      if (tokenError.response) {
        console.error('Response data:', tokenError.response.data);
        console.error('Response status:', tokenError.response.status);
        console.error('Response headers:', tokenError.response.headers);
      }
      
      return res.status(500).send(
        'OAuth callback failed: ' + 
        (tokenError.response?.data?.error_description || 
         tokenError.response?.data?.error || 
         tokenError.message)
      );
    }
  } catch (error) {
    console.error('Error processing DocuSign callback:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
    console.error('Error stack:', error.stack);
    
    return res.status(500).send('Internal server error: ' + error.message);
  }
}
