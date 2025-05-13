# PandaDoc Integration

This document provides an overview of the PandaDoc integration with SignVault.

## Overview

The PandaDoc integration allows users to connect their PandaDoc account to SignVault, enabling automatic vaulting of signed documents. When a document is completed in PandaDoc, it is automatically downloaded and stored in SignVault, providing an immutable record of the signed document.

## Authentication

The integration uses OAuth 2.0 for authentication. The flow is as follows:

1. User initiates the connection from the SignVault interface
2. User is redirected to PandaDoc to authorize the connection
3. PandaDoc redirects back to SignVault with an authorization code
4. SignVault exchanges the authorization code for access and refresh tokens
5. SignVault stores the tokens securely and uses them to access the PandaDoc API

## Webhook Integration

PandaDoc sends webhook events to SignVault when certain actions occur, such as when a document is completed. SignVault processes these events and takes appropriate actions, such as downloading and vaulting the signed document.

To set up the webhook in PandaDoc:

1. Log in to your PandaDoc account
2. Go to Settings > API & Webhooks
3. Click on "Add Webhook"
4. Enter the webhook URL: `https://signvault.co/api/webhooks/pandadoc`
5. Select the events you want to receive (at minimum, select "document.completed")
6. Copy the webhook key provided by PandaDoc (e.g., `nmN8uqRUiRQJNeRGCBc5Nh`)
7. Add the webhook key to your environment variables:
   ```
   VITE_PANDADOC_WEBHOOK_KEY=your_webhook_key
   PANDADOC_WEBHOOK_KEY=your_webhook_key
   ```
8. Save the webhook configuration

## Database Tables

The integration uses the following database tables:

- `pandadoc_connections`: Stores the connection information for each user, including access and refresh tokens
- `pandadoc_webhook_events`: Stores the webhook events received from PandaDoc

## Environment Variables

The following environment variables are required for the PandaDoc integration:

- `VITE_PANDADOC_CLIENT_ID`: The client ID for the PandaDoc OAuth application
- `VITE_PANDADOC_SECRET_KEY`: The client secret for the PandaDoc OAuth application
- `VITE_PANDADOC_REDIRECT_URI`: The redirect URI for the PandaDoc OAuth flow
- `VITE_PANDADOC_API_BASE_URL`: The base URL for the PandaDoc API

For Vercel serverless functions, the following environment variables are also required:

- `PANDADOC_CLIENT_ID`: Same as `VITE_PANDADOC_CLIENT_ID`
- `PANDADOC_SECRET_KEY`: Same as `VITE_PANDADOC_SECRET_KEY`
- `PANDADOC_REDIRECT_URI`: Same as `VITE_PANDADOC_REDIRECT_URI`
- `PANDADOC_API_BASE_URL`: Same as `VITE_PANDADOC_API_BASE_URL`

## API Endpoints

The integration provides the following API endpoints:

- `/api/pandadoc-oauth-start`: Initiates the OAuth flow
- `/api/pandadoc/callback`: Handles the OAuth callback from PandaDoc
- `/api/webhooks/pandadoc`: Receives webhook events from PandaDoc

## Frontend Components

The integration includes the following frontend components:

- `PandaDocIntegration.tsx`: The main integration page where users can connect their PandaDoc account
- `PandaDocCallback.tsx`: Handles the OAuth callback from PandaDoc
- `PandaDocComplete.tsx`: Displays the result of the OAuth flow

## Service Files

The integration includes the following service files:

- `pandaDocService.ts`: Provides functions for interacting with the PandaDoc API
- `pandaDocWebhookProcessor.ts`: Processes webhook events from PandaDoc

## Setup Instructions

1. Create the required database tables by running the SQL files:
   - `create-pandadoc-connections-table.sql`
   - `create-pandadoc-webhook-events-table.sql`

2. Set up the environment variables in your `.env` file.

3. Register an OAuth application in PandaDoc:
   - Go to the [PandaDoc Developer Dashboard](https://app.pandadoc.com/developers/)
   - Create a new application
   - Set the redirect URI to `https://signvault.co/api/pandadoc/callback`
   - Copy the client ID and client secret to your environment variables

4. Set up the webhook in PandaDoc as described in the Webhook Integration section.

5. Deploy the application.

## Testing

To test the integration:

1. Connect your PandaDoc account to SignVault
2. Create and send a document for signature in PandaDoc
3. Once the document is signed, verify that it appears in your SignVault account

## Troubleshooting

If you encounter issues with the integration, check the following:

- Verify that the environment variables are set correctly
- Check the webhook configuration in PandaDoc
- Check the logs for any error messages
- Verify that the database tables are created correctly
- Check the access and refresh tokens in the database
