#!/bin/bash

# Generate current timestamp in ISO format
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")

# Create the JSON payload
JSON_PAYLOAD=$(cat <<EOF
{
  "event": "envelope-completed",
  "apiVersion": "v2.1",
  "uri": "/restapi/v2.1/accounts/adbce049-7d35-4cca-834b-59da859a6c65/envelopes/test-envelope-id",
  "retryCount": 0,
  "configurationId": 10140648,
  "generatedDateTime": "$TIMESTAMP",
  "data": {
    "accountId": "adbce049-7d35-4cca-834b-59da859a6c65",
    "userId": "4bab81d9-df25-45c5-ab9a-09b8ffb2bd09",
    "envelopeId": "test-envelope-id",
    "envelopeSummary": {
      "status": "completed",
      "documentsUri": "/envelopes/test-envelope-id/documents",
      "envelopeUri": "/envelopes/test-envelope-id",
      "completedDateTime": "$TIMESTAMP",
      "documentsCombinedUri": "/envelopes/test-envelope-id/documents/combined",
      "certificateUri": "/envelopes/test-envelope-id/documents/certificate",
      "emailSubject": "Test Envelope Completed"
    },
    "envelopeDocuments": [
      {
        "documentId": "1",
        "name": "TestDoc.pdf",
        "uri": "/envelopes/test-envelope-id/documents/1",
        "type": "content"
      }
    ]
  }
}
EOF
)

# Send the request using curl
curl -X POST \
  -H "Content-Type: application/json" \
  -H "x-docusign-signature-1: test-signature" \
  -d "$JSON_PAYLOAD" \
  https://signvault.co/api/webhooks/docusign

echo # Add a newline after the response
