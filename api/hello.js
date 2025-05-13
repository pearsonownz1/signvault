/**
 * Simple hello world endpoint
 */

module.exports = async (req, res) => {
  try {
    return res.status(200).json({
      status: 'success',
      message: 'Hello World!',
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
