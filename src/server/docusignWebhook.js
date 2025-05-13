const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// DocuSign webhook endpoint
app.post('/api/webhooks/docusign', async (req, res) => {
  try {
    console.log('Received DocuSign webhook:', JSON.stringify(req.body, null, 2));
    
    // Parse the webhook payload
    const payload = req.body;
    
    // Validate the webhook payload
    if (!payload || !payload.event || !payload.data) {
      console.error('Invalid webhook payload');
      return res.status(400).json({ error: 'Invalid webhook payload' });
    }

    // Check if this is an envelope completed event
    if (payload.event !== 'envelope-completed') {
      // Acknowledge receipt but don't process other event types
      console.log(`Received event ${payload.event}, not processing`);
      return res.status(200).json({ message: 'Event acknowledged but not processed' });
    }

    const { envelopeId, accountId } = payload.data;
    
    if (!envelopeId || !accountId) {
      console.error('Missing envelope or account information');
      return res.status(400).json({ error: 'Missing envelope or account information' });
    }

    // Find the connection for this account
    const { data: connection, error: connectionError } = await supabase
      .from('docusign_connections')
      .select('*')
      .eq('docusign_account_id', accountId)
      .single();

    if (connectionError || !connection) {
      console.error('Connection not found:', connectionError);
      return res.status(404).json({ error: 'DocuSign connection not found' });
    }

    console.log(`Processing envelope ${envelopeId} for account ${accountId}`);

    // Import the DocuSign service
    const docusignService = require('../lib/docusignService');
    const vaultService = require('../lib/vaultService');

    // Get a valid access token
    const accessToken = await docusignService.getValidAccessToken(connection.user_id);

    // Download the signed document
    console.log('Downloading envelope documents...');
    const documentData = await docusignService.downloadEnvelopeDocuments(
      accessToken,
      connection.docusign_base_uri,
      accountId,
      envelopeId
    );

    // Get envelope information
    console.log('Getting envelope information...');
    const envelopeInfo = await docusignService.getEnvelopeInfo(
      accessToken,
      connection.docusign_base_uri,
      accountId,
      envelopeId
    );

    // Vault the document
    console.log('Vaulting document...');
    const vaultResult = await vaultService.vaultDocument({
      userId: connection.user_id,
      fileName: `${envelopeInfo.emailSubject || 'DocuSign Document'}.pdf`,
      fileContent: documentData,
      metadata: {
        source: 'docusign',
        envelopeId,
        accountId,
        completedAt: envelopeInfo.completedDateTime,
        status: envelopeInfo.status,
        subject: envelopeInfo.emailSubject,
        sender: envelopeInfo.sender,
        recipients: envelopeInfo.recipients
      }
    });

    // Update the docusign_documents table
    console.log('Updating document record...');
    await supabase
      .from('docusign_documents')
      .upsert({
        user_id: connection.user_id,
        connection_id: connection.id,
        docusign_envelope_id: envelopeId,
        docusign_document_id: envelopeId, // Using envelope ID as document ID for combined document
        document_name: envelopeInfo.emailSubject || 'DocuSign Document',
        status: 'completed',
        signed_at: envelopeInfo.completedDateTime,
        vaulted_at: new Date().toISOString(),
        vault_status: 'success',
        vault_document_id: vaultResult.documentId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    console.log('Document successfully vaulted!');
    
    // Return success
    return res.status(200).json({ 
      message: 'Document successfully vaulted',
      documentId: vaultResult.documentId
    });
  } catch (error) {
    console.error('Error processing DocuSign webhook:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`DocuSign webhook server running on port ${PORT}`);
});

module.exports = app;
