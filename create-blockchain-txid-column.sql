-- Add blockchain_txid column to audit_logs table
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS blockchain_txid TEXT;

-- Add blockchain_txid column to vault_documents table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'vault_documents') THEN
        ALTER TABLE vault_documents ADD COLUMN IF NOT EXISTS blockchain_txid TEXT;
        ALTER TABLE vault_documents ADD COLUMN IF NOT EXISTS document_hash TEXT;
    END IF;
END
$$;

-- Create vault_documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS vault_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    envelope_id TEXT,
    document_name TEXT NOT NULL,
    vault_path TEXT NOT NULL,
    document_hash TEXT,
    blockchain_txid TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment explaining the blockchain_txid column
COMMENT ON COLUMN audit_logs.blockchain_txid IS 'Polygon blockchain transaction ID containing the document hash';
COMMENT ON COLUMN vault_documents.blockchain_txid IS 'Polygon blockchain transaction ID containing the document hash';
COMMENT ON COLUMN vault_documents.document_hash IS 'SHA-256 hash of the document';
