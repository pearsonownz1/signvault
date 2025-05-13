import { supabase } from './supabase';
import { getValidAccessToken, downloadDocument, getDocumentDetails } from './pandaDocService';

/**
 * Process a PandaDoc webhook event
 */
export async function processPandaDocWebhook(payload: any): Promise<{ success: boolean; message: string }> {
  try {
    // Extract event data
    const eventId = payload.event_id || payload.id;
    const eventType = payload.event || payload.event_type;
    const documentId = payload.data?.id;
    const documentStatus = payload.data?.status;
    const documentName = payload.data?.name;
    
    // Validate required fields
    if (!eventId || !eventType || !documentId) {
      return {
        success: false,
        message: 'Missing required fields in webhook payload'
      };
    }

    // Check if this event has already been processed
    const { data: existingEvent } = await supabase
      .from('pandadoc_webhook_events')
      .select('id, processed')
      .eq('event_id', eventId)
      .maybeSingle();

    if (existingEvent) {
      if (existingEvent.processed) {
        return {
          success: true,
          message: 'Event already processed'
        };
      }
    } else {
      // Store the webhook event
      const { error: insertError } = await supabase
        .from('pandadoc_webhook_events')
        .insert({
          event_id: eventId,
          event_type: eventType,
          document_id: documentId,
          document_status: documentStatus,
          document_name: documentName,
          raw_data: payload
        });

      if (insertError) {
        console.error('Error storing webhook event:', insertError);
        return {
          success: false,
          message: `Failed to store webhook event: ${insertError.message}`
        };
      }
    }

    // Only process document.completed events
    if (eventType !== 'document.completed') {
      return {
        success: true,
        message: `Event type ${eventType} does not require processing`
      };
    }

    // Find a user with a PandaDoc connection
    const { data: connections, error: connectionsError } = await supabase
      .from('pandadoc_connections')
      .select('user_id')
      .limit(1);

    if (connectionsError || !connections || connections.length === 0) {
      return {
        success: false,
        message: 'No PandaDoc connections found'
      };
    }

    const userId = connections[0].user_id;

    try {
      // Get a valid access token
      const accessToken = await getValidAccessToken(userId);

      // Get document details
      const documentDetails = await getDocumentDetails(accessToken, documentId);

      // Download the document
      const documentBuffer = await downloadDocument(accessToken, documentId);

      // Store the document in Supabase Storage
      const fileName = `pandadoc_${documentId}_${Date.now()}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(`${userId}/${fileName}`, documentBuffer, {
          contentType: 'application/pdf',
          upsert: true
        });

      if (uploadError) {
        throw new Error(`Failed to upload document: ${uploadError.message}`);
      }

      // Get the public URL for the document
      const { data: publicUrlData } = supabase.storage
        .from('documents')
        .getPublicUrl(`${userId}/${fileName}`);

      const documentUrl = publicUrlData.publicUrl;

      // Store document metadata in the database
      const { error: docInsertError } = await supabase
        .from('documents')
        .insert({
          user_id: userId,
          name: documentDetails.name || documentName || 'PandaDoc Document',
          description: `Document ID: ${documentId}`,
          file_path: `${userId}/${fileName}`,
          file_url: documentUrl,
          file_type: 'application/pdf',
          source: 'pandadoc',
          source_id: documentId,
          metadata: {
            pandadoc_id: documentId,
            status: documentStatus,
            event_type: eventType,
            event_id: eventId
          }
        });

      if (docInsertError) {
        throw new Error(`Failed to store document metadata: ${docInsertError.message}`);
      }

      // Mark the webhook event as processed
      await supabase
        .from('pandadoc_webhook_events')
        .update({
          processed: true,
          updated_at: new Date().toISOString()
        })
        .eq('event_id', eventId);

      return {
        success: true,
        message: 'Document processed and stored successfully'
      };
    } catch (error: any) {
      console.error('Error processing document:', error);

      // Update the webhook event with the error
      await supabase
        .from('pandadoc_webhook_events')
        .update({
          error: error.message,
          updated_at: new Date().toISOString()
        })
        .eq('event_id', eventId);

      return {
        success: false,
        message: `Error processing document: ${error.message}`
      };
    }
  } catch (error: any) {
    console.error('Error in webhook processor:', error);
    return {
      success: false,
      message: `Error in webhook processor: ${error.message}`
    };
  }
}
