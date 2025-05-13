// Debug SignNow OAuth Flow

// According to SignNow API documentation:
// https://docs.signnow.com/docs/signnow/reference/authentication

// The error code 1537 (invalid_request) could be due to:
// 1. Incorrect client ID or secret
// 2. Incorrect redirect URI (must be registered in the SignNow developer portal)
// 3. Incorrect scope format

// Let's check the correct OAuth parameters:

// 1. Authorization URL: https://api.signnow.com/oauth2/authorize
// 2. Required parameters:
//    - response_type: code
//    - client_id: your client ID
//    - redirect_uri: must match exactly what's registered in the SignNow developer portal
//    - scope: space-separated list of scopes (document:read document:write)

// Let's try a different scope format:
// Instead of: document:read document:write
// Try: document_read document_write (with underscore instead of colon)
// Or: all (if supported by SignNow)

// Also, check if the redirect URI is correctly registered in the SignNow developer portal:
// https://signvault.co/api/signnow/callback

// Let's modify the api/signnow-oauth-start.js file to try different scope formats
