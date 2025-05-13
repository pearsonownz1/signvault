import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * This component handles the OAuth callback from SignNow.
 * It extracts the authorization code and state from the URL,
 * then redirects to our backend API endpoint to complete the OAuth flow.
 */
export default function SignNowCallback() {
  const location = useLocation();

  useEffect(() => {
    // Extract the code and state from the URL
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');
    const errorDescription = params.get('error_description');

    // If there's an error, redirect to the completion page with the error
    if (error) {
      window.location.href = `/integrations/signnow-complete?error=${error}&message=${errorDescription || 'Unknown error'}`;
      return;
    }

    // If code or state is missing, redirect with an error
    if (!code || !state) {
      window.location.href = '/integrations/signnow-complete?error=invalid_request&message=Missing+required+parameters';
      return;
    }

    // Redirect to our backend API endpoint with the code and state
    window.location.href = `/api/signnow/callback?code=${code}&state=${state}`;
  }, [location]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
      <h1 className="text-2xl font-bold mb-2">Connecting to SignNow</h1>
      <p className="text-center text-muted-foreground">
        Please wait while we complete your connection...
      </p>
    </div>
  );
}
