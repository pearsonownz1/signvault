import { createClient } from '@supabase/supabase-js';

const DOCUSIGN_ACCOUNT_ID = process.env.DOCUSIGN_ACCOUNT_ID!;

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  // Always respond 200 OK immediately to DocuSign
  res.status(200).send('Webhook received');
  console.log('✅ Sent 200 OK response to DocuSign immediately');

  try {
    console.log('🔄 Starting DocuSign webhook processing...');
    
    const { event, data } = req.body;
    console.log('📄 Webhook payload:', JSON.stringify(req.body, null, 2));

    if (event !== 'envelope-completed') {
      console.log('⏭️ Ignoring event:', event);
      return;
    }

    const envelopeId = data.envelopeId;
    console.log(`📦 Processing completed envelope: ${envelopeId}`);

    // 1. Find the user's OAuth token (we assume you stored it in Supabase)
    console.log('🔑 Fetching OAuth token for user...');
    const { data: tokenData, error: tokenError } = await supabase
      .from('docusign_connections')
      .select('access_token, docuSign_base_uri')
      .single();

    if (tokenError || !tokenData) {
      console.error('❌ No DocuSign access token found in Supabase.');
      console.error('Token error:', tokenError);
      return;
    }

    console.log('✅ OAuth token retrieved successfully');
    const { access_token, docuSign_base_uri } = tokenData;

    // 2. Build the correct URL to download the combined document
    const documentsCombinedUri = data.envelopeSummary?.documentsCombinedUri;
    const downloadUrl = `${docuSign_base_uri}${documentsCombinedUri}`;
    console.log('📥 Downloading document from DocuSign... URL:', downloadUrl);

    const downloadResponse = await fetch(downloadUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Accept': 'application/pdf',
      },
    });

    if (!downloadResponse.ok) {
      console.error('❌ Failed to download document:', downloadResponse.status);
      console.error('Response status:', downloadResponse.status);
      console.error('Response status text:', downloadResponse.statusText);
      return;
    }

    console.log('✅ Document downloaded successfully from DocuSign');
    const fileBuffer = await downloadResponse.arrayBuffer();
    console.log(`📊 Document size: ${fileBuffer.byteLength} bytes`);

    // 3. Upload to Supabase Storage
    const uploadPath = `docusign/${envelopeId}.pdf`;
    console.log(`📤 Uploading document to Supabase Storage... Path: ${uploadPath}`);

    const { error: uploadError } = await supabase
      .storage
      .from('documents')
      .upload(uploadPath, Buffer.from(fileBuffer), {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.error('❌ Failed to upload document to Supabase:', uploadError);
      return;
    }

    console.log(`✅ Document ${uploadPath} saved to Supabase Storage.`);

    // 4. Insert metadata into vault_documents table
    console.log('📝 Inserting document metadata into vault_documents table...');
    const metadata = {
      document_name: uploadPath,
      envelope_id: envelopeId,
      signed_date: new Date().toISOString(),
      source: 'docusign',
      status: 'completed',
    };
    console.log('Document metadata:', metadata);
    
    const { error: metadataError } = await supabase.from('vault_documents').insert(metadata);
    
    if (metadataError) {
      console.error('❌ Failed to insert metadata:', metadataError);
      return;
    }

    console.log(`✅ Metadata inserted for document: ${uploadPath}`);
    console.log('🎉 DocuSign webhook processing completed successfully!');

  } catch (err) {
    console.error('❌ Error processing DocuSign webhook:', err);
  }
}
