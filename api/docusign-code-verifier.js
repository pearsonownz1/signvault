export default async function handler(req, res) {
  try {
    // This endpoint is called by the frontend to provide the code verifier
    // It should be called immediately after the user is redirected back from DocuSign
    
    console.log('Received code verifier request:', {
      method: req.method,
      hasBody: !!req.body,
      contentType: req.headers['content-type']
    });
    
    // Get the code verifier and state from the request body
    const { codeVerifier, state } = req.body;
    
    if (!codeVerifier) {
      console.error('No code verifier provided in request');
      return res.status(400).json({ error: 'No code verifier provided' });
    }
    
    if (!state) {
      console.error('No state provided in request');
      return res.status(400).json({ error: 'No state provided' });
    }
    
    console.log('Received code verifier details:', {
      statePrefix: state.substring(0, 10) + '...',
      codeVerifierLength: codeVerifier.length,
      codeVerifierPrefix: codeVerifier.substring(0, 10) + '...'
    });
    
    // Store the code verifier in a temporary storage keyed by state
    // In a production environment, you would use a more secure storage like Redis
    // For this example, we'll use a global variable (not ideal for production)
    global.codeVerifiers = global.codeVerifiers || {};
    global.codeVerifiers[state] = codeVerifier;
    
    console.log(`Stored code verifier for state: ${state.substring(0, 10)}...`);
    console.log('Current stored states:', Object.keys(global.codeVerifiers).map(s => s.substring(0, 10) + '...'));
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error storing code verifier:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ 
      error: error.message || 'Internal server error',
      stack: error.stack
    });
  }
}
