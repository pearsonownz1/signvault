import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const DOCUSIGN_ACCESS_TOKEN = process.env.DOCUSIGN_ACCESS_TOKEN;
const DOCUSIGN_ACCOUNT_ID = process.env.DOCUSIGN_ACCOUNT_ID!;

export async function POST(req: NextRequest) {
  console.log('📥 Received DocuSign webhook');

  // Always immediately respond to DocuSign first
  const { data } = await req.json();
  const envelopeId = data?.envelopeId;
  console.log('📄 Envelope ID:', envelopeId);

  if (!envelopeId) {
    console.error('❌ No envelopeId found');
    return NextResponse.json({ message: 'No envelopeId' }, { status: 400 });
  }

  // Start background async task
  processEnvelope(envelopeId).catch((error) => {
    console.error('❌ Error processing envelope:', error);
  });

  return NextResponse.json({ message: 'Webhook received' });
}

async function processEnvelope(envelopeId: string) {
  console.log('🔗 Downloading combined document from DocuSign...');

  const downloadUrl = `https://demo.docusign.net/restapi/v2.1/accounts/${DOCUSIGN_ACCOUNT_ID}/envelopes/${envelopeId}/documents/combined`;

  const response = await fetch(downloadUrl, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${DOCUSIGN_ACCESS_TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download document: ${response.status}`);
  }

  const pdfBuffer = await response.arrayBuffer();
  console.log(`📄 Document downloaded, size ${pdfBuffer.byteLength} bytes`);

  const hash = crypto.createHash('sha256').update(Buffer.from(pdfBuffer)).digest('hex');
  console.log('🔑 Document SHA-256 hash:', hash);

  const filePath = `vault/${envelopeId}.pdf`;
  const { error } = await supabase.storage.from('documents').upload(filePath, Buffer.from(pdfBuffer), {
    contentType: 'application/pdf',
    upsert: true,
  });

  if (error) {
    throw new Error(`Failed to upload to Supabase: ${error.message}`);
  }

  console.log('✅ Uploaded to Supabase:', filePath);

  const { error: insertError } = await supabase.from('vault_documents').insert([
    {
      envelope_id: envelopeId,
      document_path: filePath,
      document_hash: hash,
      source: 'docusign',
      status: 'completed',
      created_at: new Date().toISOString()
    }
  ]);

  if (insertError) {
    throw new Error(`Failed to insert document metadata: ${insertError.message}`);
  }

  console.log('✅ Document metadata saved to database');
  console.log('🎉 Document processing completed successfully');
}
