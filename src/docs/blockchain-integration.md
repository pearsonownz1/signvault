# Blockchain Integration

This document explains how the blockchain integration works in SignVault, allowing document hashes to be permanently anchored to the Polygon blockchain.

## Overview

SignVault uses blockchain technology to provide an immutable record of document existence and integrity. When a document is vaulted, its SHA-256 hash can be published to the Polygon blockchain, creating a permanent, tamper-proof record that can be independently verified.

## Implementation Details

### Database Schema

Documents are stored in the Supabase database with a `blockchain_txid` column that stores the Polygon transaction ID after a document hash has been published to the blockchain.

```sql
-- Add blockchain_txid column to documents table
ALTER TABLE documents ADD COLUMN IF NOT EXISTS blockchain_txid TEXT;

-- Add comment explaining the blockchain_txid column
COMMENT ON COLUMN documents.blockchain_txid IS 'Polygon blockchain transaction ID containing the document hash';
```

### Components

1. **BlockchainService**: A service that handles wallet connection and blockchain interactions.
   - Located at: `src/lib/blockchainService.ts`
   - Provides functions for connecting to MetaMask, publishing document hashes to the blockchain, and verifying hashes.

2. **BlockchainPublisher**: A UI component that allows users to connect their wallet and publish document hashes to the blockchain.
   - Located at: `src/components/documents/BlockchainPublisher.tsx`
   - Integrated into the DocumentViewer component in the Security tab.

### User Flow

1. User uploads and vaults a document
2. Document is stored in Supabase with its SHA-256 hash
3. User views the document in the DocumentViewer
4. If the document doesn't have a blockchain transaction ID yet, the BlockchainPublisher component is displayed in the Security tab
5. User connects their MetaMask wallet and clicks "Publish to Blockchain"
6. Document hash is published to the Polygon blockchain
7. Transaction ID is stored in the database and displayed in the UI
8. An audit log entry is created for the blockchain anchoring event

## Technical Implementation

### Publishing to Blockchain

When a user publishes a document hash to the blockchain, the following happens:

1. User connects their MetaMask wallet
2. A transaction is created with:
   - To: 0x0000000000000000000000000000000000000000 (burn address)
   - Value: 0 MATIC
   - Data: The document hash
3. User signs the transaction with their wallet
4. Transaction is submitted to the Polygon network
5. Transaction ID is stored in the database
6. Audit log entry is created

### Verification

Document integrity can be verified in two ways:

1. **Hash Verification**: The document's current hash is compared with the stored hash
2. **Blockchain Verification**: The transaction on the blockchain is checked to confirm it contains the document hash

## Development vs. Production

- Development: Uses Polygon Mumbai Testnet
- Production: Uses Polygon Mainnet

### Getting Test MATIC for Mumbai Testnet

During development, you'll need test MATIC tokens to pay for gas fees on the Mumbai testnet. You can get these for free from faucets:

1. Go to the [Polygon Faucet](https://faucet.polygon.technology/)
2. Select "Mumbai" network
3. Enter your wallet address
4. Complete the captcha and click "Submit"
5. You'll receive test MATIC tokens in your wallet

Alternatively, you can use these other faucets:
- [Alchemy Faucet](https://mumbaifaucet.com/)
- [QuickNode Faucet](https://faucet.quicknode.com/polygon/mumbai)

### Common Errors

1. **Insufficient Funds**: If you see an "insufficient funds" error, it means your wallet doesn't have enough MATIC tokens to pay for gas fees. Get more test MATIC from a faucet.

2. **User Rejected Request**: This happens when you reject the transaction in your MetaMask wallet. Simply try again and approve the transaction.

3. **Network Error**: Make sure you're connected to the correct network (Mumbai for development, Polygon Mainnet for production).

## Testing with Mock Data

For testing purposes, you can use the `add-mock-blockchain-txids.sql` script to add mock blockchain transaction IDs to documents:

```sql
-- Update documents that don't have a blockchain_txid yet
UPDATE documents
SET blockchain_txid = '0x' || random_hex(64)
WHERE blockchain_txid IS NULL;

-- Create audit log entries for the blockchain anchoring
INSERT INTO audit_log (id, document_id, event_type, actor, event_time, metadata)
SELECT 
  gen_random_uuid(),
  d.id,
  'blockchain_anchored',
  'system',
  NOW(),
  jsonb_build_object(
    'blockchain', 'polygon',
    'txid', d.blockchain_txid,
    'document_hash', d.file_hash,
    'simulated', true
  )
FROM documents d
WHERE d.blockchain_txid IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM audit_log al
    WHERE al.document_id = d.id
    AND al.event_type = 'blockchain_anchored'
  );
```

## Future Improvements

1. **Multi-chain Support**: Add support for other blockchains like Ethereum, Solana, etc.
2. **Smart Contract Integration**: Develop a smart contract to store document hashes with additional metadata
3. **Batch Publishing**: Allow publishing multiple document hashes in a single transaction to save on gas fees
4. **Automated Publishing**: Option to automatically publish document hashes to the blockchain when they are vaulted
5. **Verification Widget**: Create a standalone widget that allows third parties to verify document authenticity

## Resources

- [Polygon Documentation](https://polygon.technology/developers)
- [MetaMask Documentation](https://docs.metamask.io/)
- [Ethers.js Documentation](https://docs.ethers.org/)
