import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

// Initialize Supabase client with service role key for admin access
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// DocuSign configuration
const DOCUSIGN_CLIENT_ID = process.env.DOCUSIGN_CLIENT_ID!;
const DOCUSIGN_CLIENT_SECRET = process.env.DOCUSIGN_CLIENT_SECRET!;
const DOCUSIGN_REDIRECT_URI = process.env.DOCUSIGN_REDIRECT_URI!;
const DOCUSIGN_AUTH_SERVER = 'account-d.docusign.com';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // This should be a GET request from DocuSign OAuth redirect
  if (req.method !== 'GET') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const { code, state, error, error_description } = req.query;

    // Handle OAuth errors
    if (error) {
      console.error('DocuSign OAuth error:', error, error_description);
      return res.redirect(`/integrations/docusign-complete?error=${error}&message=${error_description}`);
    }

    // Validate required parameters
    if (!code || !state || typeof code !== 'string' || typeof state !== 'string') {
      console.error('Missing required parameters:', { code, state });
      return res.redirect('/integrations/docusign-complete?error=invalid_request&message=Missing+required+parameters');
    }

    // Get the code verifier from the database
    const { data: oauthState, error: fetchError } = await supabase
      .from('oauth_states')
      .select('*')
      .eq('state', state)
      .maybeSingle();

    if (fetchError || !oauthState) {
      console.error('Invalid state parameter or state not found:', fetchError);
      return res.redirect('/integrations/docusign-complete?error=invalid_state&message=Invalid+state+parameter');
    }

    const codeVerifier = oauthState.code_verifier;
    const userId = oauthState.user_id;

    // Exchange the code for tokens
    const tokenResponse = await axios.post(
      `https://${DOCUSIGN_AUTH_SERVER}/oauth/token`,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: DOCUSIGN_CLIENT_ID,
        client_secret: DOCUSIGN_CLIENT_SECRET,
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
      console.error('No default DocuSign account found');
      return res.redirect('/integrations/docusign-complete?error=account_error&message=No+default+DocuSign+account+found');
    }

    // Calculate token expiration time
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + expires_in);

    // Check if a connection already exists for this user and account
    const { data: existingConnection } = await supabase
      .from('docusign_connections')
      .select('id')
      .eq('user_id', userId)
      .eq('docusign_account_id', account.account_id)
      .maybeSingle();

    let connectionId;

    if (existingConnection) {
      // Update existing connection
      const { error: updateError } = await supabase
        .from('docusign_connections')
        .update({
          docusign_account_name: account.account_name,
          docusign_base_uri: account.base_uri,
          access_token,
          refresh_token,
          expires_at: expiresAt.toISOString(),
          email: userInfo.email,
          name: userInfo.name,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingConnection.id);

      if (updateError) {
        console.error('Failed to update DocuSign connection:', updateError);
        return res.redirect('/integrations/docusign-complete?error=database_error&message=Failed+to+update+connection');
      }

      connectionId = existingConnection.id;
    } else {
      // Create new connection
      const { data: newConnection, error: insertError } = await supabase
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
        })
        .select('id')
        .single();

      if (insertError || !newConnection) {
        console.error('Failed to store DocuSign connection:', insertError);
        return res.redirect('/integrations/docusign-complete?error=database_error&message=Failed+to+store+connection');
      }

      connectionId = newConnection.id;
    }

    // Create an audit log entry
    await supabase
      .from('audit_logs')
      .insert({
        user_id: userId,
        action: 'docusign_connected',
        resource_type: 'docusign_account',
        resource_id: account.account_id,
        metadata: {
          account_name: account.account_name,
          email: userInfo.email,
          connection_id: connectionId
        }
      });

    // Clean up the OAuth state
    await supabase
      .from('oauth_states')
      .delete()
      .eq('state', state);

    // Redirect to success page
    return res.redirect(`/integrations/docusign-complete?success=true&account=${encodeURIComponent(account.account_name)}`);
  } catch (error: any) {
    console.error('DocuSign callback error:', error.message);
    return res.redirect(`/integrations/docusign-complete?error=server_error&message=${encodeURIComponent(error.message)}`);
  }
}
