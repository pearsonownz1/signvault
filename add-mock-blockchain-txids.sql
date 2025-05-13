-- Add mock blockchain transaction IDs to existing documents
-- This is for testing purposes only

-- Update documents that don't have a blockchain_txid yet
UPDATE documents
SET blockchain_txid = '0x' || encode(gen_random_bytes(32), 'hex')
WHERE blockchain_txid IS NULL;

-- Add a comment to explain this is for testing
COMMENT ON COLUMN documents.blockchain_txid IS 'Polygon blockchain transaction ID containing the document hash. Mock values added for testing.';
