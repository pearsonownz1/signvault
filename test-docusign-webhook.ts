import fetch from 'node-fetch';

async function simulateDocusignWebhook() {
  const response = await fetch('https://signvault.co/api/webhooks/docusign', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-docusign-signature-1': 'test-signature', // Optional if you want
    },
    body: JSON.stringify({
      event: "envelope-completed",
      apiVersion: "v2.1",
      uri: "/restapi/v2.1/accounts/adbce049-7d35-4cca-834b-59da859a6c65/envelopes/test-envelope-id",
      retryCount: 0,
      configurationId: 10140648,
      generatedDateTime: new Date().toISOString(),
      data: {
        accountId: "adbce049-7d35-4cca-834b-59da859a6c65",
        userId: "4bab81d9-df25-45c5-ab9a-09b8ffb2bd09",
        envelopeId: "test-envelope-id",
        envelopeSummary: {
          status: "completed",
          documentsUri: "/envelopes/test-envelope-id/documents",
          envelopeUri: "/envelopes/test-envelope-id",
          completedDateTime: new Date().toISOString(),
          documentsCombinedUri: "/envelopes/test-envelope-id/documents/combined",
          certificateUri: "/envelopes/test-envelope-id/documents/certificate",
          emailSubject: "Test Envelope Completed",
        },
        envelopeDocuments: [
          {
            documentId: "1",
            name: "TestDoc.pdf",
            uri: "/envelopes/test-envelope-id/documents/1",
            type: "content",
          },
        ],
      },
    }),
  });

  console.log('Status:', response.status);
  const text = await response.text();
  console.log('Response body:', text);
}

simulateDocusignWebhook();
