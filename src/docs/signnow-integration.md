# SignNow Integration

This document outlines the integration of SignNow with our application, which allows users to connect their SignNow accounts, sign documents, and vault signed documents.

## Configuration

The SignNow integration uses the following environment variables:

```
# SignNow Integration
VITE_SIGNNOW_APPLICATION_ID=c5f254c55ee74b999c7161f7a49350605f0edbba
VITE_SIGNNOW_CLIENT_ID=b1839d7bb7be4833d831601afd32e195
VITE_SIGNNOW_SECRET_KEY=aaa5bcb1adb0f7bc3708a4ef17517bd5
VITE_SIGNNOW_REDIRECT_URI=https://signvault.co/api/signnow/callback
VITE_SIGNNOW_AUTH_SERVER=https://app.signnow.com
VITE_SIGNNOW_API_BASE_URL=https://api.signnow.com/api
VITE_SIGNNOW_API_KEY=900a09a74d7790b50bb72fdddf6c3878068b48ae0910b074cb934627a78ddded

# For Vercel serverless functions
SIGNNOW_CLIENT_ID=b1839d7bb7be4833d831601afd32e195
SIGNNOW_SECRET_KEY=aaa5bcb1adb0f7bc3708a4ef17517bd5
SIGNNOW_REDIRECT_URI=https://signvault.co/api/signnow/callback
SIGNNOW_AUTH_SERVER=https://app.signnow.com
SIGNNOW_API_BASE_URL=https://api.signnow.com/api
```

## Database Tables

The SignNow integration uses the following database tables:

1. `oauth_states` - Stores OAuth state parameters for CSRF protection
2. `signnow_connections` - Stores user connections to SignNow accounts
3. `signnow_webhook_events` - Stores webhook events from SignNow

## OAuth Flow

The SignNow OAuth flow works as follows:

1. User initiates the connection by clicking "Connect SignNow" in the UI
2. The application generates a state parameter and stores it in the `oauth_states` table
3. The user is redirected to SignNow's authorization page
4. After authorization, SignNow redirects back to our callback URL with a code
5. The application exchanges the code for access and refresh tokens
6. The tokens and user information are stored in the `signnow_connections` table

## API Endpoints

The SignNow integration uses the following API endpoints:

1. `/api/signnow-oauth-start.js` - Initiates the OAuth flow
2. `/api/signnow/callback.js` - Handles the OAuth callback
3. `/api/webhooks/signnow.js` - Handles webhook events from SignNow

## Components

The SignNow integration includes the following components:

1. `SignNowIntegration.tsx` - UI for connecting to SignNow
2. `SignNowCallback.tsx` - Handles the OAuth callback UI
3. `SignNowComplete.tsx` - Shows completion status after OAuth

## Services

The SignNow integration includes the following services:

1. `signNowService.ts` - Handles SignNow API interactions
2. `signNowWebhookProcessor.ts` - Processes webhook events from SignNow

## Document Vaulting

Documents signed with SignNow can be vaulted in our application. The vaulting process includes:

1. Downloading the signed document from SignNow
2. Storing the document in Supabase Storage
3. Creating a record in the `documents` table
4. Optionally anchoring the document hash to the blockchain

## Webhook Integration

SignNow can send webhook notifications when documents are signed. The webhook flow works as follows:

1. SignNow sends a POST request to our webhook endpoint
2. The webhook handler validates the request
3. The event is stored in the `signnow_webhook_events` table
4. The event is processed asynchronously
5. The signed document is downloaded and vaulted

## Testing

To test the SignNow integration:

1. Connect your SignNow account in the Integrations page
2. Upload a document for signing
3. Sign the document in SignNow
4. Verify the document appears in your vault

## Troubleshooting

Common issues with the SignNow integration:

1. OAuth errors - Check the client ID and secret in the environment variables
2. API errors - Verify the API base URL and endpoints
3. Webhook errors - Ensure the webhook URL is correctly configured in SignNow
