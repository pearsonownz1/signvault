import express from 'express';
import { createClient } from '@supabase/supabase-js';
import * as docusignService from '../lib/docusignService';

// Initialize Express router
const router = express.Router();

/**
 * DocuSign webhook handler
 * 
 * This endpoint receives webhook notifications from DocuSign when an envelope
 * status changes. It processes the notification and vaults the signed documents
 * if the envelope is completed.
 */
router.post('/webhooks/docusign', async (req, res) => {
  try {
    console.log('Received DocuSign webhook:', req.body);
    
    // Initialize Supabase client
    const supabaseUrl = process.env.VITE_SUPABASE_URL as string;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY as string;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Validate the webhook payload
    if (!req.body || !req.body.envelopeStatus) {
      return res.status(400).json({ error: 'Invalid webhook payload' });
    }
    
    // Extract envelope information
    const {
      envelopeId,
      envelopeStatus,
      subject,
      statusChangedDateTime,
      sender,
      recipients
    } = req.body;
    
    // Store the webhook event in the database
    const { data: eventData, error: eventError } = await supabase
      .from('docusign_webhook_events')
      .insert({
        envelope_id: envelopeId,
        event_type: envelopeStatus,
        event_timestamp: statusChangedDateTime || new Date().toISOString(),
        status: envelopeStatus,
        raw_data: req.body,
        processed: false
      })
      .select()
      .single();
    
    if (eventError) {
      console.error('Error storing webhook event:', eventError);
      return res.status(500).json({ error: 'Failed to store webhook event' });
    }
    
    // If the envelope is completed, process it
    if (envelopeStatus === 'Completed') {
      try {
        // Find the DocuSign connection for this envelope
        const { data: connections, error: connectionError } = await supabase
          .from('docusign_connections')
          .select('*')
          .eq('docusign_account_id', req.body.accountId)
          .limit(1);
        
        if (connectionError || !connections || connections.length === 0) {
          throw new Error(`No DocuSign connection found for account ${req.body.accountId}`);
        }
        
        const connection = connections[0];
        
        // Get a valid access token
        const accessToken = await docusignService.getValidAccessToken(connection.user_id);
        
        // Get envelope information
        const envelopeInfo = await docusignService.getEnvelopeInfo(
          accessToken,
          connection.docusign_base_uri,
          connection.docusign_account_id,
          envelopeId
        );
        
        // Download the documents
        const documentBytes = await docusignService.downloadEnvelopeDocuments(
          accessToken,
          connection.docusign_base_uri,
          connection.docusign_account_id,
          envelopeId
        );
        
        // Create a file name for the document
        const fileName = `${envelopeInfo.emailSubject || 'DocuSign Document'} - ${envelopeId}.pdf`;
        
        // Upload the document to storage
        const { data: fileData, error: fileError } = await supabase.storage
          .from('documents')
          .upload(`${connection.user_id}/${envelopeId}.pdf`, documentBytes, {
            contentType: 'application/pdf',
            upsert: true
          });
        
        if (fileError) {
          throw new Error(`Failed to upload document: ${fileError.message}`);
        }
        
        // Create a document record
        const { data: documentData, error: documentError } = await supabase
          .from('documents')
          .insert({
            user_id: connection.user_id,
            name: fileName,
            description: `DocuSign document: ${envelopeInfo.emailSubject || 'No subject'}`,
            file_path: fileData.path,
            file_type: 'application/pdf',
            file_size: documentBytes.length,
            source: 'docusign',
            source_id: envelopeId,
            metadata: {
              envelopeId,
              envelopeStatus,
              completedAt: envelopeInfo.completedDateTime,
              sender: envelopeInfo.sender,
              recipients: envelopeInfo.recipients
            },
            status: 'active'
          })
          .select()
          .single();
        
        if (documentError) {
          throw new Error(`Failed to create document record: ${documentError.message}`);
        }
        
        // Create an envelope record
        const { data: envelopeData, error: envelopeError } = await supabase
          .from('docusign_envelopes')
          .insert({
            user_id: connection.user_id,
            connection_id: connection.id,
            envelope_id: envelopeId,
            envelope_status: envelopeStatus,
            subject: envelopeInfo.emailSubject,
            sent_at: envelopeInfo.sentDateTime,
            completed_at: envelopeInfo.completedDateTime,
            document_id: documentData.id
          })
          .select()
          .single();
        
        if (envelopeError) {
          throw new Error(`Failed to create envelope record: ${envelopeError.message}`);
        }
        
        // Mark the webhook event as processed
        await supabase
          .from('docusign_webhook_events')
          .update({
            processed: true
          })
          .eq('id', eventData.id);
        
        console.log(`Successfully processed DocuSign envelope ${envelopeId}`);
      } catch (processingError: any) {
        console.error('Error processing completed envelope:', processingError);
        
        // Update the webhook event with the error
        await supabase
          .from('docusign_webhook_events')
          .update({
            processing_error: processingError.message
          })
          .eq('id', eventData.id);
      }
    }
    
    // Always return a 200 response to DocuSign to acknowledge receipt
    return res.status(200).json({ status: 'success' });
  } catch (error: any) {
    console.error('Error processing DocuSign webhook:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;
