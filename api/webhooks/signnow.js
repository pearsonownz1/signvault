import { processSignNowWebhook } from '../../src/lib/signNowWebhookProcessor';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the webhook payload
    const payload = req.body;

    // Validate the webhook payload
    if (!payload || !payload.document_id) {
      return res.status(400).json({ error: 'Invalid webhook payload' });
    }

    // Respond immediately with 200 OK to acknowledge receipt
    res.status(200).json({ success: true });

    // Process the webhook asynchronously
    // This allows us to return a response quickly while processing continues
    processWebhookAsync(payload);
  } catch (error) {
    console.error('Error handling SignNow webhook:', error);
    
    // Always return 200 OK to prevent retries
    // We'll log the error internally
    res.status(200).json({ success: true });
  }
}

/**
 * Process the webhook asynchronously
 */
async function processWebhookAsync(payload) {
  try {
    await processSignNowWebhook(payload);
  } catch (error) {
    console.error('Error processing SignNow webhook asynchronously:', error);
  }
}
