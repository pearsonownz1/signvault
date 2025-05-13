import { processPandaDocWebhook } from '../../src/lib/pandaDocWebhookProcessor';

// Get the webhook key from environment variables
const WEBHOOK_KEY = process.env.PANDADOC_WEBHOOK_KEY || process.env.VITE_PANDADOC_WEBHOOK_KEY;

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify the webhook signature if a webhook key is configured
    if (WEBHOOK_KEY) {
      const signature = req.headers['x-pandadoc-signature'];
      
      if (!signature) {
        console.warn('Missing PandaDoc signature header');
        // We'll continue processing even without a signature for now,
        // but in production you might want to reject requests without signatures
      } else if (signature !== WEBHOOK_KEY) {
        console.error('Invalid PandaDoc webhook signature');
        return res.status(401).json({
          success: false,
          message: 'Invalid webhook signature'
        });
      }
    }

    // Get the webhook payload
    const payload = req.body;

    // Validate the webhook payload
    if (!payload || !payload.event_id || !payload.event) {
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook payload'
      });
    }

    // Log the webhook event for debugging
    console.log(`Received PandaDoc webhook event: ${payload.event} for document: ${payload.data?.id}`);

    // Process the webhook event
    const result = await processPandaDocWebhook(payload);

    // Return the result
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error('Error processing PandaDoc webhook:', error);
    return res.status(500).json({
      success: false,
      message: `Error processing webhook: ${error.message}`
    });
  }
}
