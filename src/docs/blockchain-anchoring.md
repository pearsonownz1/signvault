# Blockchain Anchoring for Document Verification

This document explains how SignVault uses blockchain anchoring to provide immutable proof of document existence and integrity.

## Overview

When a document is signed in DocuSign and automatically vaulted in SignVault, we also create a cryptographic hash of the document and publish it to the Polygon blockchain. This creates a permanent, tamper-proof record of the document's existence and content at a specific point in time.

## How It Works

### 1. Document Hashing

When a signed document is received from DocuSign:

- We calculate a SHA-256 hash of the document
- This hash is a unique "fingerprint" of the document content
- Any change to the document, no matter how small, would result in a completely different hash

### 2. Blockchain Anchoring

The document hash is then published to the Polygon blockchain:

- We create a zero-value transaction to a burn address (0x0000000000000000000000000000000000000000)
- The document hash is included in the transaction data field
- This creates a permanent, immutable record on the blockchain
- The transaction ID (TXID) is stored in our database along with the document hash

### 3. Document Verification

Anyone with the original document can verify its authenticity:

- Upload the document to our verification page
- The system calculates the SHA-256 hash of the uploaded document
- It checks if this hash exists in our database and on the blockchain
- If found, it confirms the document is authentic and shows when it was vaulted
- The verification process is completely secure - the document never leaves the user's browser

## Security Benefits

- **Immutable Proof**: Once recorded on the blockchain, the document hash cannot be altered or deleted
- **Tamper Evidence**: Any modification to the document will change its hash, making it fail verification
- **Public Verifiability**: Anyone can verify a document's authenticity without needing access to our systems
- **Privacy Preserving**: The document itself is never stored on the blockchain, only its hash

## Technical Implementation

- Document hashing is performed using the standard SHA-256 algorithm
- Blockchain transactions are created using ethers.js
- The Polygon blockchain was chosen for its low transaction costs and high reliability
- All transactions can be viewed on [PolygonScan](https://polygonscan.com/)

## Verification Process

To verify a document:

1. Go to the [Verify Document](https://signvault.co/verify) page
2. Upload the document you want to verify
3. The system will calculate the document's hash and check it against our blockchain records
4. If verified, you'll see the blockchain transaction ID and when the document was vaulted
5. You can click the link to view the transaction on PolygonScan

## API Access

For developers who want to integrate with our verification system, we provide an API endpoint:

```
GET /api/verify-hash?hash={documentHash}
```

Response (success):
```json
{
  "valid": true,
  "txid": "0x1234...",
  "created_at": "2025-05-01T12:00:00Z"
}
```

Response (not found):
```json
{
  "valid": false,
  "reason": "Hash not found"
}
```
