/**
 * This is a simple test endpoint to verify that the DocuSign integration is working correctly.
 * It will check if the necessary environment variables are set and if the DocuSign API is accessible.
 * 
 * Usage:
 * 1. Deploy this endpoint to Vercel
 * 2. Visit https://your-domain.com/api/docusign-test
 */

const axios = require('axios');

module.exports = async (req, res) => {
  try {
    // Check if the necessary environment variables are set
    const requiredEnvVars = [
      'DOCUSIGN_CLIENT_ID',
      'DOCUSIGN_CLIENT_SECRET',
      'DOCUSIGN_REDIRECT_URI',
      'SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];

    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

    if (missingEnvVars.length > 0) {
      return res.status(500).json({
        status: 'error',
        message: 'Missing required environment variables',
        missingEnvVars
      });
    }

    // Check if the DocuSign API is accessible
    try {
      const response = await axios.get('https://account-d.docusign.com/oauth/userinfo', {
        validateStatus: () => true
      });

      // We expect a 401 error because we're not authenticated
      if (response.status === 401) {
        return res.status(200).json({
          status: 'success',
          message: 'DocuSign API is accessible',
          environmentVariables: {
            DOCUSIGN_CLIENT_ID: maskString(process.env.DOCUSIGN_CLIENT_ID),
            DOCUSIGN_REDIRECT_URI: process.env.DOCUSIGN_REDIRECT_URI
          },
          docusignApiStatus: 'accessible'
        });
      } else {
        return res.status(500).json({
          status: 'error',
          message: 'Unexpected response from DocuSign API',
          response: {
            status: response.status,
            statusText: response.statusText
          }
        });
      }
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to connect to DocuSign API',
        error: error.message
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Unexpected error',
      error: error.message
    });
  }
};

// Helper function to mask sensitive strings
function maskString(str) {
  if (!str) return null;
  if (str.length <= 8) return '****';
  return str.substring(0, 4) + '****' + str.substring(str.length - 4);
}
