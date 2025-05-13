// src/pages/api/webhooks/docusign.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    const { event, data } = req.body;

    if (event !== 'envelope-completed') {
      return res.status(400).json({ message: 'Invalid event type' });
    }

    const envelopeId = data?.envelopeId;
    const documentsUri = data?.envelopeSummary?.documentsUri;

    if (!envelopeId || !documentsUri) {
      return res.status(400).json({ message: 'Missing envelope information' });
    }

    // Fetch access token from Supabase
    const { data: connection, error: connectionError } = await supabase
      .from('docusign_connections')
      .select('*')
      .eq('email', 'guy@gcs.org') // Temporary hardcode since we know the email
      .single();

    if (connectionError || !connection) {
      console.error('Failed to fetch DocuSign connection:', connectionError);
      return res.status(500).json({ message: 'Internal error fetching DocuSign connection' });
    }

    const { access_token, docusign_base_uri } = connection;

    // Download document from DocuSign
    const fileResponse = await fetch(`${docusign_base_uri}${documentsUri}/combined`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!fileResponse.ok) {
      console.error('Failed to download document:', await fileResponse.text());
      return res.status(500).json({ message: 'Failed to download document' });
    }

    const pdfBuffer = Buffer.from(await fileResponse.arrayBuffer());

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(`signed/${envelopeId}.pdf`, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.error('Failed to upload document to Supabase:', uploadError);
      return res.status(500).json({ message: 'Failed to upload to storage' });
    }

    console.log('Successfully uploaded document:', uploadData);
    return res.status(200).json({ message: 'Webhook processed and document uploaded' });

  } catch (error) {
    console.error('Unexpected server error:', error);
    return res.status(500).json({ message: 'Unexpected server error' });
  }
}
