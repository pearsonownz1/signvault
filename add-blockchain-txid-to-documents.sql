-- Add blockchain_txid column to documents table
ALTER TABLE documents ADD COLUMN IF NOT EXISTS blockchain_txid TEXT;

-- Add comment explaining the blockchain_txid column
COMMENT ON COLUMN documents.blockchain_txid IS 'Polygon blockchain transaction ID containing the document hash';
