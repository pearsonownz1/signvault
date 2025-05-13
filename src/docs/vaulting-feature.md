# SignVault — Vaulting Feature Implementation

## Overview

The vaulting feature in SignVault provides a secure, tamper-evident storage solution for important documents. When a document is "vaulted", it is:

- Securely stored (encrypted at rest)
- Cryptographically sealed (hash recorded immutably)
- Tagged with metadata (source, time vaulted, vault ID)
- Tracked with an audit trail
- Optionally watermarked for display

## Technical Implementation

### Database Schema

The vaulting feature uses three main tables:

1. **documents** - Stores document metadata and file references
   - `id`: UUID primary key
   - `user_id`: Owner of the document
   - `file_path`: Path to the original file in storage
   - `file_name`: Original filename
   - `file_hash`: SHA-256 hash of the document
   - `source`: Origin of the document (upload, adobe_sign, pandadoc, etc.)
   - `vault_time`: When the document was vaulted
   - `status`: Current status (vaulted, pending)
   - `retention_period`: How long to keep the document
   - `watermarked_path`: Path to the watermarked version

2. **audit_log** - Tracks all actions performed on a document
   - `id`: UUID primary key
   - `document_id`: Reference to the document
   - `event_type`: Type of event (vaulted, viewed, downloaded, shared, verified)
   - `actor`: Who performed the action (user ID or "system")
   - `event_time`: When the action occurred
   - `metadata`: Additional information about the event (JSONB)
   - `ip_address`: IP address of the actor
   - `user_agent`: Browser/client information

3. **document_tags** - Manages tags associated with documents
   - `id`: UUID primary key
   - `document_id`: Reference to the document
   - `tag_name`: Name of the tag
   - `created_at`: When the tag was added

### Core Services

#### Vault Service (`vaultService.ts`)

Handles the core vaulting functionality:

- `vaultDocument()`: Securely stores a document and generates its hash
- `generateFileHash()`: Creates a SHA-256 hash of a file
- `createAuditLogEntry()`: Records actions in the audit log
- `verifyDocumentIntegrity()`: Verifies a document against its stored hash
- `getDocumentUrl()`: Retrieves a URL for accessing a document
- `getDocument()`: Retrieves document metadata
- `getDocumentAuditLog()`: Retrieves the audit trail for a document

#### Watermark Service (`watermarkService.ts`)

Manages document watermarking:

- `addWatermarkToPdf()`: Adds a watermark to a PDF document
- `createWatermarkedVersion()`: Creates and stores a watermarked copy
- `getOrCreateWatermarkedVersion()`: Retrieves or creates a watermarked version

### API Endpoints

- `/api/verify-document`: Verifies document integrity by comparing hashes

### User Interface Components

- `UploadDocument.tsx`: Component for uploading and vaulting documents
- `VerifyDocument.tsx`: Component for verifying document integrity
- `DocumentList.tsx`: Lists vaulted documents with their status
- `DocumentViewer.tsx`: Displays documents with watermarking and verification options

## Security Considerations

1. **Original Document Integrity**
   - Original documents are never modified
   - SHA-256 hash is generated immediately upon upload
   - Hash is stored in the database for future verification

2. **Watermarking**
   - Watermarked copies are created separately
   - Original document remains untouched
   - Watermarked versions are used for display and downloads

3. **Access Control**
   - Row-Level Security (RLS) policies restrict access to documents
   - Users can only access their own documents
   - All document access is logged in the audit trail

4. **Audit Trail**
   - Every action on a document is recorded
   - Includes timestamp, user, action type, and metadata
   - Provides a complete history of document activity

## Usage Flow

1. **Document Upload**
   - User uploads a document
   - System generates a SHA-256 hash
   - Document is stored in Supabase Storage
   - Document metadata and hash are saved to the database
   - First audit log entry is created

2. **Document Viewing**
   - User requests to view a document
   - System retrieves or creates a watermarked version
   - Watermarked version is displayed to the user
   - View action is recorded in the audit log

3. **Document Verification**
   - User uploads a document for verification
   - System generates a hash of the uploaded document
   - Hash is compared with stored hash(es)
   - Verification result is displayed to the user
   - Verification attempt is recorded in the audit log

## Future Enhancements

- Blockchain anchoring for additional proof
- Digital certificates for legal eVault compliance
- Advanced retention policy management
- Multi-factor authentication for document access
- Batch operations for multiple documents
