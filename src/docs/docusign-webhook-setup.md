# Setting Up DocuSign Connect Webhook

This guide explains how to set up the DocuSign Connect webhook to automatically vault signed documents.

## Overview

DocuSign Connect is a webhook service that sends notifications to your application when events occur in DocuSign, such as when an envelope is completed. By setting up Connect, you can automatically vault signed documents without requiring any user action.

## Prerequisites

1. A DocuSign account with administrator access
2. Your SignVault application deployed to a publicly accessible URL

## Setup Steps

### 1. Log in to DocuSign Admin

1. Go to [DocuSign Admin](https://admin.docusign.com/)
2. Log in with your DocuSign administrator credentials

### 2. Navigate to Connect

1. In the left sidebar, click on "Settings"
2. Select "Connect" from the dropdown menu

### 3. Create a New Connect Configuration

1. Click "Add Configuration"
2. Fill in the following settings:

#### Basic Settings
- **Name**: SignVault Integration
- **URL to Publish**: `https://your-domain.com/api/webhooks/docusign` (replace with your actual domain)
- **Require Acknowledgement**: Yes
- **Include Documents**: Yes (select "Include Document PDFs")
- **Include Certificate of Completion**: Yes
- **Include SOAP Documents**: No
- **Include Document Fields**: No

#### Authentication
- **Authentication Type**: None (handled by our backend)

#### Triggers
- **Envelope Events**: Select "Envelope Complete"

3. Click "Save" to activate the configuration

## Testing the Webhook

To test that your webhook is working correctly:

1. Send a test envelope in DocuSign
2. Complete the signing process for all recipients
3. Check your application logs for webhook events
4. Verify that the document appears in your SignVault dashboard

## Troubleshooting

If documents aren't being automatically vaulted:

1. Check the DocuSign Connect logs in the DocuSign Admin console
   - Go to DocuSign Admin > Settings > Connect > Logs
   - Look for your envelope ID and check if the delivery was successful
   - If it shows "Redirecting..." instead of a 200 OK response, there may be an issue with your webhook handler

2. Verify that your webhook URL is publicly accessible
   - The URL should be `https://your-domain.com/api/webhooks/docusign` (no redirects)
   - Make sure there are no redirects from non-www to www or http to https

3. Ensure that your application is correctly processing the webhook events
   - The webhook handler should immediately return a 200 OK response
   - DocuSign expects a quick acknowledgment, so process the webhook asynchronously

4. Check that your Supabase storage bucket is properly configured
   - The bucket should be named "vault" and be private
   - Ensure the RLS policies allow your service role to upload documents

5. Check the webhook payload structure
   - DocuSign Connect sends a specific JSON structure
   - The envelope data is nested under `data.envelopeSummary`
   - The envelope ID is at `data.envelopeId`
   - The account ID is at `data.accountId`

## Security Considerations

- The webhook endpoint does not require authentication from DocuSign, as it verifies the connection based on the account ID
- All documents are stored in a private storage bucket with strict access controls
- Complete audit logs are maintained for all vaulting actions
