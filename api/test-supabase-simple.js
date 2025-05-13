/**
 * This script tests if we can connect to Supabase
 */

const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  try {
    // Initialize Supabase client
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Try to get the storage buckets
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();

    if (bucketsError) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to connect to Supabase storage',
        error: bucketsError.message
      });
    }

    // Try to query the database
    const { data: tables, error: tablesError } = await supabase
      .from('vault_documents')
      .select('count')
      .limit(1);

    if (tablesError) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to query the database',
        error: tablesError.message,
        buckets: buckets
      });
    }

    // Return the results
    return res.status(200).json({
      status: 'success',
      message: 'Successfully connected to Supabase',
      buckets: buckets,
      tables: tables
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Unexpected error',
      error: error.message
    });
  }
};
