// The correct SignNow OAuth endpoints according to their documentation
// https://docs.signnow.com/docs/signnow/reference/authentication

// The auth server should be api.signnow.com (without /oauth2)
// The full authorization URL should be https://api.signnow.com/oauth2/authorize
// The token URL should be https://api.signnow.com/oauth2/token

// Let's update the SIGNNOW_AUTH_SERVER environment variable
// From: api.signnow.com/oauth2
// To: api.signnow.com

// Let's also check the redirect URI
// It should be: https://signvault.co/api/signnow/callback
// Make sure it's registered in the SignNow developer portal

// The scope parameter should be: document:read document:write
// Which is what we're currently using
