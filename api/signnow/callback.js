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

// SignNow configuration
const SIGNNOW_CLIENT_ID = process.env.VITE_SIGNNOW_CLIENT_ID || process.env.SIGNNOW_CLIENT_ID;
const SIGNNOW_SECRET_KEY = process.env.VITE_SIGNNOW_SECRET_KEY || process.env.SIGNNOW_SECRET_KEY;
const SIGNNOW_REDIRECT_URI = process.env.VITE_SIGNNOW_REDIRECT_URI || process.env.SIGNNOW_REDIRECT_URI;
const SIGNNOW_API_BASE_URL = process.env.VITE_SIGNNOW_API_BASE_URL || process.env.SIGNNOW_API_BASE_URL;
const SIGNNOW_AUTH_SERVER = process.env.VITE_SIGNNOW_AUTH_SERVER || process.env.SIGNNOW_AUTH_SERVER;

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.redirect('/integrations/signnow-complete?error=invalid_request&message=Missing+required+parameters');
    }

    // Get the state from the database
    const { data: oauthState, error: fetchError } = await supabase
      .from('oauth_states')
      .select('*')
      .eq('state', state)
      .eq('provider', 'signnow')
      .maybeSingle();

    if (fetchError || !oauthState) {
      console.error('Error fetching OAuth state:', fetchError);
      return res.redirect('/integrations/signnow-complete?error=invalid_state&message=Invalid+state+parameter');
    }

    const userId = oauthState.user_id;

    try {
      // Exchange the code for tokens
      const tokenResponse = await axios.post(
        'https://api.signnow.com/oauth2/token',
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          client_id: SIGNNOW_CLIENT_ID,
          client_secret: SIGNNOW_SECRET_KEY,
          redirect_uri: SIGNNOW_REDIRECT_URI,
          scope: 'all'
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const { access_token, refresh_token, expires_in } = tokenResponse.data;

      // Get user info from SignNow
      // The correct endpoint is https://api.signnow.com/user (without /api/ in the path)
      const userInfoResponse = await axios.get(
        'https://api.signnow.com/user',
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
        .from('signnow_connections')
        .insert({
          user_id: userId,
          signnow_user_id: userInfo.id,
          access_token,
          refresh_token,
          expires_at: expiresAt.toISOString(),
          email: userInfo.email,
          name: `${userInfo.first_name} ${userInfo.last_name}`
        });

      if (insertError) {
        console.error('Error storing SignNow connection:', insertError);
        return res.redirect('/integrations/signnow-complete?error=database_error&message=Failed+to+store+connection');
      }

      // Clean up the OAuth state
      await supabase
        .from('oauth_states')
        .delete()
        .eq('state', state);

      // Redirect to the completion page with success
      return res.redirect(`/integrations/signnow-complete?success=true&account=${encodeURIComponent(userInfo.email)}`);
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      return res.redirect(`/integrations/signnow-complete?error=token_error&message=${encodeURIComponent(error.message || 'Failed to exchange code for token')}`);
    }
  } catch (error) {
    console.error('Error in SignNow callback handler:', error);
    return res.redirect('/integrations/signnow-complete?error=server_error&message=Internal+server+error');
  }
}
