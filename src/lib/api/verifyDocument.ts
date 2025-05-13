import { verifyDocumentIntegrity } from '../vaultService';

/**
 * API handler for document verification
 * Verifies the integrity of a document by comparing its hash with the stored hash
 */
export const verifyDocument = async (req: Request): Promise<Response> => {
  try {
    // Check if it's a POST request
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get the form data from the request
    const formData = await req.formData();
    
    // Get the file from the form data
    const file = formData.get('file') as File;
    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get the document ID from the form data (optional)
    const documentId = formData.get('documentId') as string;
    
    // Verify the document integrity
    const result = await verifyDocumentIntegrity(file, documentId || undefined);
    
    // Return the verification result
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error verifying document:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to verify document',
      details: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
