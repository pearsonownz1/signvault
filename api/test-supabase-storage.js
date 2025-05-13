/**
 * This script tests if documents are being saved to Supabase storage
 * It will check the 'documents' bucket for files in the 'signed/' folder
 */

const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  try {
    // Initialize Supabase client
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Check if we can connect to Supabase
    const { data: bucketData, error: bucketError } = await supabase
      .storage
      .getBucket('documents');

    if (bucketError) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to connect to Supabase storage',
        error: bucketError.message
      });
    }

    // List files in the 'signed/' folder
    const { data: files, error: listError } = await supabase
      .storage
      .from('documents')
      .list('signed', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (listError) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to list files in Supabase storage',
        error: listError.message
      });
    }

    // Check if there are any files
    if (!files || files.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No files found in the signed/ folder',
        bucketInfo: bucketData
      });
    }

    // Check the database for document records
    const { data: documents, error: dbError } = await supabase
      .from('vault_documents')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (dbError) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to query the database',
        error: dbError.message,
        storageFiles: files
      });
    }

    // Return the results
    return res.status(200).json({
      status: 'success',
      message: 'Test completed successfully',
      storageFiles: files,
      databaseRecords: documents || [],
      bucketInfo: bucketData
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Unexpected error',
      error: error.message
    });
  }
};
