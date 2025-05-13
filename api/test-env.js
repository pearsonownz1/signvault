/**
 * This script tests if the environment variables are set
 */

module.exports = async (req, res) => {
  try {
    // Check if the necessary environment variables are set
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];

    const envVarStatus = {};
    
    for (const envVar of requiredEnvVars) {
      envVarStatus[envVar] = {
        set: !!process.env[envVar],
        length: process.env[envVar] ? process.env[envVar].length : 0
      };
    }

    // Return the results
    return res.status(200).json({
      status: 'success',
      message: 'Environment variables check',
      envVarStatus: envVarStatus,
      nodeVersion: process.version,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Unexpected error',
      error: error.message
    });
  }
};
