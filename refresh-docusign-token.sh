#!/bin/bash

# =============== CONFIG ===============
INTEGRATION_KEY="923951ff-0900-4890-b6b5-d9b5bf926c65"     # DocuSign Integration Key (Client ID)
USER_ID="4bab81d9-df25-45c5-ab9a-09b8ffb2bd09"
PRIVATE_KEY_PATH="path/to/private.key"    # <-- Where you save your Private Key (you must have it from Apps & Keys page)
AUTH_SERVER="account-d.docusign.com"      # Developer sandbox environment
BASE_URI="https://demo.docusign.net"      # Developer sandbox API endpoint
# =======================================

echo "Generating JWT Assertion..."

HEADER=$(echo -n '{"alg":"RS256","typ":"JWT"}' | openssl base64 -e | tr -d '=' | tr '/+' '_-' | tr -d '\n')
NOW=$(date +%s)
EXP=$(($NOW + 3600))

PAYLOAD=$(echo -n '{"iss":"'"$INTEGRATION_KEY"'","sub":"'"$USER_ID"'","aud":"'"$AUTH_SERVER"'","scope":"signature","iat":'"$NOW"',"exp":'"$EXP"'}' | openssl base64 -e | tr -d '=' | tr '/+' '_-' | tr -d '\n')

DATA_TO_SIGN="$HEADER.$PAYLOAD"
SIGNATURE=$(echo -n "$DATA_TO_SIGN" | openssl dgst -sha256 -sign "$PRIVATE_KEY_PATH" | openssl base64 -e | tr -d '=' | tr '/+' '_-' | tr -d '\n')

JWT="$DATA_TO_SIGN.$SIGNATURE"

echo "Requesting access token..."

RESPONSE=$(curl -s -X POST "https://${AUTH_SERVER}/oauth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${JWT}")

ACCESS_TOKEN=$(echo $RESPONSE | jq -r '.access_token')

if [[ "$ACCESS_TOKEN" == "null" || -z "$ACCESS_TOKEN" ]]; then
  echo "❌ Failed to get access token."
  echo "$RESPONSE"
else
  echo "✅ New Access Token:"
  echo "$ACCESS_TOKEN"

  echo "$ACCESS_TOKEN" > docusign_token.txt
  echo "📂 Saved access token to docusign_token.txt"
fi
