export interface Document {
  id: string;
  name: string;
  source: string; // PandaDoc, DocuSign, Adobe Sign, etc.
  signedDate: string;
  tags: string[];
  retention: string;
  url?: string;
  status?: "signed" | "pending";
  isAuthoritative?: boolean;
  size?: string;
  signers?: string[];
  encryptionType?: string;
  storageLocation?: string;
  blockchainVerification?: string;
  lastAccessed?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "auditor";
}

export interface Connection {
  id: string;
  platform: string;
  connected: boolean;
  lastSync?: string;
}

export interface AuditLogEntry {
  id: string;
  documentId: string;
  documentName: string;
  action: "view" | "download" | "share" | "upload" | "delete";
  user: string;
  timestamp: string;
  details?: string;
}

export interface RetentionPolicy {
  id: string;
  name: string;
  duration: string; // e.g., "7 years"
  action: "delete" | "archive";
}
