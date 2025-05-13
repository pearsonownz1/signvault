-- This script checks the blockchain implementation status
-- It verifies if the blockchain_txid column exists and if documents have blockchain transaction IDs

-- Check if blockchain_txid column exists in documents table
SELECT EXISTS (
   SELECT 1
   FROM information_schema.columns
   WHERE table_name = 'documents'
   AND column_name = 'blockchain_txid'
) AS blockchain_txid_column_exists;

-- Count documents with and without blockchain transaction IDs
SELECT
  COUNT(*) AS total_documents,
  COUNT(blockchain_txid) AS documents_with_txid,
  COUNT(*) - COUNT(blockchain_txid) AS documents_without_txid
FROM documents;

-- Sample of documents with blockchain transaction IDs
SELECT
  id,
  file_name,
  SUBSTRING(file_hash, 1, 10) || '...' AS file_hash_preview,
  SUBSTRING(blockchain_txid, 1, 10) || '...' AS blockchain_txid_preview,
  vault_time
FROM documents
WHERE blockchain_txid IS NOT NULL
ORDER BY vault_time DESC
LIMIT 5;

-- Check audit log entries for blockchain anchoring
SELECT
  al.document_id,
  d.file_name,
  al.event_time,
  al.metadata->>'blockchain' AS blockchain,
  SUBSTRING(al.metadata->>'txid', 1, 10) || '...' AS txid_preview,
  al.metadata->>'simulated' AS is_simulated
FROM audit_log al
JOIN documents d ON al.document_id = d.id
WHERE al.event_type = 'blockchain_anchored'
ORDER BY al.event_time DESC
LIMIT 5;
