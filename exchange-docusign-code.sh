#!/bin/bash

# This script exchanges a DocuSign authorization code for an access token
# Usage: ./exchange-docusign-code.sh <authorization_code>

# =============== CONFIG ===============
CLIENT_ID="923951ff-0900-4890-b6b5-d9b5bf926c65"
REDIRECT_URI="https://signvault.co/api/docusign/callback"
AUTH_SERVER="account-d.docusign.com"
CODE_VERIFIER="$2"  # Pass the code verifier as the second argument
# =======================================

if [ -z "$1" ]; then
  echo "❌ Error: Authorization code is required"
  echo "Usage: ./exchange-docusign-code.sh <authorization_code> [code_verifier]"
  exit 1
fi

AUTH_CODE="$1"

echo "🔄 Exchanging authorization code for access token..."

# If code verifier is not provided, use a default message
if [ -z "$CODE_VERIFIER" ]; then
  echo "⚠️ Warning: No code verifier provided. Using the code from the database is recommended."
  echo "If the exchange fails, retrieve the code_verifier from the oauth_states table in your database."
fi

# Make the token exchange request
RESPONSE=$(curl -s -X POST "https://${AUTH_SERVER}/oauth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code&code=${AUTH_CODE}&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&code_verifier=${CODE_VERIFIER}")

# Extract the access token
ACCESS_TOKEN=$(echo $RESPONSE | jq -r '.access_token')
REFRESH_TOKEN=$(echo $RESPONSE | jq -r '.refresh_token')
ERROR=$(echo $RESPONSE | jq -r '.error')
ERROR_DESCRIPTION=$(echo $RESPONSE | jq -r '.error_description')

if [[ "$ACCESS_TOKEN" == "null" || -z "$ACCESS_TOKEN" ]]; then
  echo "❌ Failed to get access token."
  echo "Error: $ERROR"
  echo "Description: $ERROR_DESCRIPTION"
  echo "Full response: $RESPONSE"
else
  echo "✅ Access token received successfully!"
  echo "Access Token: $ACCESS_TOKEN"
  echo "Refresh Token: $REFRESH_TOKEN"
  
  # Save tokens to file
  echo "$ACCESS_TOKEN" > docusign_access_token.txt
  echo "$REFRESH_TOKEN" > docusign_refresh_token.txt
  echo "📂 Saved tokens to docusign_access_token.txt and docusign_refresh_token.txt"
fi
