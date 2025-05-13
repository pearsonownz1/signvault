# DocuSign Integration Guide

This guide explains how to set up and use the DocuSign integration with SignVault.

## Overview

The DocuSign integration allows you to automatically vault signed documents from DocuSign into SignVault. When a document is signed in DocuSign, it will be automatically downloaded and stored in SignVault's secure vault, with a complete audit trail.

## Setup Process

### 1. Connect Your DocuSign Account

1. Navigate to the Integrations page in SignVault
2. Click on "Connect DocuSign" under the DocuSign card
3. You'll be redirected to DocuSign to authorize SignVault
4. Log in to your DocuSign account and approve the authorization
5. You'll be redirected back to SignVault with a success message

### 2. Configure DocuSign Connect

For the automatic vaulting to work, you need to set up DocuSign Connect to send webhook notifications to SignVault when documents are signed.

1. Log in to the [DocuSign Admin console](https://admin.docusign.com/)
2. Navigate to "Settings > Connect"
3. Click "Add Configuration"
4. Configure the following settings:

#### Basic Settings
- **Name**: SignVault Integration
- **URL to Publish**: `https://signvault.co/api/webhooks/docusign`
- **Require Acknowledgement**: Yes
- **Include Documents**: Yes
- **Include Certificate of Completion**: Yes
- **Include SOAP Documents**: No
- **Include Document Fields**: No

#### Authentication
- **Authentication Type**: None (handled by our backend)

#### Triggers
- **Envelope Events**: Select "Envelope Complete"

5. Click "Save" to activate the configuration

## How It Works

1. When you send a document for signature in DocuSign, the process works as normal
2. Once all parties have signed the document and it's marked as "Completed" in DocuSign
3. DocuSign sends a webhook notification to SignVault
4. SignVault downloads the signed document from DocuSign
5. The document is stored in SignVault's secure vault
6. An audit log entry is created to track the vaulting action
7. The document is now available in your SignVault dashboard

## Security Considerations

- SignVault uses OAuth 2.0 with PKCE for secure authentication with DocuSign
- Access tokens are securely stored and automatically refreshed when needed
- All documents are stored in a private storage bucket with strict access controls
- Complete audit logs are maintained for all actions

## Troubleshooting

If documents aren't being automatically vaulted:

1. Check that your DocuSign account is properly connected in the Integrations page
2. Verify that DocuSign Connect is properly configured
3. Check the DocuSign Connect logs in the DocuSign Admin console
4. Contact SignVault support if you continue to experience issues

## API Reference

If you're a developer integrating with our system, you can find the API reference for the DocuSign integration in our [API documentation](https://signvault.co/api-docs).
