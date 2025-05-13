# DocuSign Webhook Test Tools

This directory contains tools to test the DocuSign webhook integration for SignVault.

## Option 1: Using the Shell Script (Curl)

The simplest way to test the webhook is using the shell script:

```bash
# Make the script executable (if not already)
chmod +x test-docusign-webhook.sh

# Run the script
./test-docusign-webhook.sh
```

This will send a simulated DocuSign webhook notification to the endpoint.

## Option 2: Using TypeScript/Node.js

For a more programmatic approach, you can use the TypeScript version:

```bash
# Install dependencies
npm install --prefix . -g ts-node
npm install --prefix .

# Run the test
npx ts-node --esm test-docusign-webhook.ts
```

Or you can use the provided package.json:

```bash
# Install dependencies
npm install --prefix .

# Run the test
npm test
```

## What These Tests Do

Both tests simulate a DocuSign "envelope-completed" webhook notification by:

1. Creating a JSON payload that mimics a real DocuSign webhook notification
2. Sending a POST request to `https://signvault.co/api/webhooks/docusign`
3. Displaying the response from the server

## Expected Response

If the webhook is configured correctly, you should receive a `200 OK` response with the message "Webhook received".

## Troubleshooting

If you encounter issues:

1. Check that the webhook URL is correct
2. Verify that the webhook handler is deployed and accessible
3. Check the Vercel logs for any errors
4. Ensure the DocuSign account ID and other constants are correct

## Note

These tests only verify that the webhook endpoint is responding correctly. They don't test the full document processing flow since they don't provide actual document content that can be downloaded.
