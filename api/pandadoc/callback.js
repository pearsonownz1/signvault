import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

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
const PANDADOC_SECRET_KEY = process.env.VITE_PANDADOC_SECRET_KEY || process.env.PANDADOC_SECRET_KEY;
const PANDADOC_REDIRECT_URI = process.env.VITE_PANDADOC_REDIRECT_URI || process.env.PANDADOC_REDIRECT_URI;
const PANDADOC_API_BASE_URL = process.env.VITE_PANDADOC_API_BASE_URL || process.env.PANDADOC_API_BASE_URL;

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.redirect('/integrations/pandadoc-complete?error=invalid_request&message=Missing+required+parameters');
    }

    // Get the state from the database
    const { data: oauthState, error: fetchError } = await supabase
      .from('oauth_states')
      .select('*')
      .eq('state', state)
      .eq('provider', 'pandadoc')
      .maybeSingle();

    if (fetchError || !oauthState) {
      console.error('Error fetching OAuth state:', fetchError);
      return res.redirect('/integrations/pandadoc-complete?error=invalid_state&message=Invalid+state+parameter');
    }

    const userId = oauthState.user_id;

    try {
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
        console.error('Error storing PandaDoc connection:', insertError);
        return res.redirect('/integrations/pandadoc-complete?error=database_error&message=Failed+to+store+connection');
      }

      // Clean up the OAuth state
      await supabase
        .from('oauth_states')
        .delete()
        .eq('state', state);

      // Redirect to the completion page with success
      return res.redirect(`/integrations/pandadoc-complete?success=true&account=${encodeURIComponent(userInfo.email)}`);
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      return res.redirect(`/integrations/pandadoc-complete?error=token_error&message=${encodeURIComponent(error.message || 'Failed to exchange code for token')}`);
    }
  } catch (error) {
    console.error('Error in PandaDoc callback handler:', error);
    return res.redirect('/integrations/pandadoc-complete?error=server_error&message=Internal+server+error');
  }
}
