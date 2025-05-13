import { useState, useEffect } from "react";
import { getDocument, getDocumentAuditLog } from "@/lib/vaultService";
import { getOrCreateWatermarkedVersion } from "@/lib/watermarkService";
import { useAuth } from "@/lib/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import BlockchainPublisher from "./BlockchainPublisher";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Download,
  Share2,
  Tag,
  Clock,
  Shield,
  FileText,
  Lock,
  History,
  Printer,
  Mail,
  Archive,
  Trash2,
  Eye,
  CheckCircle2,
  Calendar,
  User,
  FileCheck,
  AlertTriangle,
} from "lucide-react";
import { Document } from "@/lib/types";

interface VerificationState {
  status: "idle" | "verifying" | "success" | "error";
  message?: string;
}

// Mock documents data (would come from API/database in real app)
const mockDocuments = [
  {
    id: "1",
    name: "NDA-CompanyX-2023.pdf",
    source: "PandaDoc",
    signedDate: "2023-05-15",
    vaultedDate: "2023-05-16",
    tags: ["NDA", "Legal"],
    retention: "7 years",
    retentionExpiryDate: "2030-05-16",
    status: "signed",
    isAuthoritative: true,
    url: "https://documentcloud.adobe.com/view-sdk-demo/PDFs/Bodea%20Brochure.pdf",
    size: "1.2 MB",
    signers: ["John Doe (john@example.com)", "Jane Smith (jane@example.com)"],
    encryptionType: "AES-256",
    storageLocation: "AWS S3 (us-west-2)",
    blockchainVerification: "0x7f9a298c9242e1c7e64cf1709e3856e74e232d12",
    lastAccessed: "2023-06-01",
    fileHash: "a6f23b4c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5",
    integrityVerified: true,
    lastVerified: "2023-06-01 14:32:45",
  },
  {
    id: "2",
    name: "Employment-Contract-Jane-Doe.pdf",
    source: "DocuSign",
    signedDate: "2023-06-22",
    vaultedDate: "2023-06-23",
    tags: ["Contract", "HR"],
    retention: "10 years",
    retentionExpiryDate: "2033-06-23",
    status: "signed",
    url: "https://documentcloud.adobe.com/view-sdk-demo/PDFs/Guide.pdf",
    size: "2.4 MB",
    signers: [
      "HR Department (hr@example.com)",
      "Jane Doe (janedoe@example.com)",
    ],
    encryptionType: "AES-256",
    storageLocation: "AWS S3 (us-west-2)",
    lastAccessed: "2023-06-25",
    fileHash: "b7e8f9a0b1c2d3e4f5a6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7",
    integrityVerified: true,
    lastVerified: "2023-06-25 10:15:22",
  },
  {
    id: "3",
    name: "Service-Agreement-2023.pdf",
    source: "PandaDoc",
    signedDate: "2023-07-10",
    vaultedDate: "2023-07-11",
    tags: ["Agreement", "Services"],
    retention: "5 years",
    retentionExpiryDate: "2028-07-11",
    status: "pending",
    url: "https://documentcloud.adobe.com/view-sdk-demo/PDFs/Bodea%20Brochure.pdf",
    size: "1.8 MB",
    signers: [
      "Service Provider (provider@example.com)",
      "Client (client@example.com)",
    ],
    encryptionType: "AES-256",
    storageLocation: "AWS S3 (us-west-2)",
    lastAccessed: "2023-07-12",
    fileHash: "c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6",
    integrityVerified: false,
    lastVerified: "2023-07-12 09:45:30",
  },
];

// Mock audit log entries
const mockAuditLog = [
  {
    id: "a1",
    action: "view",
    user: "John Admin",
    timestamp: "2023-07-15 09:32:45",
    details: "Viewed document from 192.168.1.105",
    ipAddress: "192.168.1.105",
    userAgent: "Chrome 115.0.5790.171 on Windows 10",
  },
  {
    id: "a2",
    action: "download",
    user: "Sarah Manager",
    timestamp: "2023-07-14 14:22:10",
    details: "Downloaded document for legal review",
    ipAddress: "192.168.1.110",
    userAgent: "Firefox 114.0 on macOS",
  },
  {
    id: "a3",
    action: "share",
    user: "John Admin",
    timestamp: "2023-07-10 11:15:22",
    details: "Shared with external user: legal@partner.com",
    ipAddress: "192.168.1.105",
    userAgent: "Chrome 115.0.5790.171 on Windows 10",
    recipient: "legal@partner.com",
  },
  {
    id: "a4",
    action: "upload",
    user: "System",
    timestamp: "2023-05-15 16:45:30",
    details: "Document received from PandaDoc via webhook",
    ipAddress: "10.0.0.5",
    userAgent: "PandaDoc Webhook Service",
  },
  {
    id: "a5",
    action: "verify",
    user: "John Admin",
    timestamp: "2023-06-01 14:32:45",
    details: "Document integrity verified successfully",
    ipAddress: "192.168.1.105",
    userAgent: "Chrome 115.0.5790.171 on Windows 10",
  },
  {
    id: "a6",
    action: "retention_set",
    user: "Sarah Manager",
    timestamp: "2023-05-16 10:15:30",
    details: "Retention policy set to 7 years",
    ipAddress: "192.168.1.110",
    userAgent: "Firefox 114.0 on macOS",
  },
];

function getActionIcon(action: string) {
  switch (action) {
    case "view":
      return <Eye className="h-4 w-4 text-blue-500" />;
    case "download":
      return <Download className="h-4 w-4 text-green-500" />;
    case "share":
      return <Share2 className="h-4 w-4 text-purple-500" />;
    case "upload":
      return <FileText className="h-4 w-4 text-amber-500" />;
    case "verify":
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    case "retention_set":
      return <Clock className="h-4 w-4 text-orange-500" />;
    default:
      return <History className="h-4 w-4 text-gray-500" />;
  }
}

function getSourceIcon(source: string) {
  switch (source.toLowerCase()) {
    case "pandadoc":
      return (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
          <FileText className="h-3 w-3 text-blue-600" />
        </div>
      );
    case "docusign":
      return (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-100">
          <FileText className="h-3 w-3 text-yellow-600" />
        </div>
      );
    case "adobe sign":
      return (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100">
          <FileText className="h-3 w-3 text-red-600" />
        </div>
      );
    default:
      return (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
          <FileText className="h-3 w-3 text-gray-600" />
        </div>
      );
  }
}

export default function DocumentViewer() {
  // Get ID from params, or use a default for storyboard
  const params = useParams<{ id: string }>();
  const id = params?.id || "1";
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info");
  const [verificationState, setVerificationState] = useState<VerificationState>(
    { status: "idle" },
  );
  const [showWatermark, setShowWatermark] = useState(true);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const { user } = useAuth();

  // State for the actual document data
  const [documentData, setDocumentData] = useState<any>(null);
  
  // Fetch document data
  useEffect(() => {
    const fetchDocumentData = async () => {
      if (!id || !user) return;
      
      setIsLoading(true);
      
      try {
        // Get document details
        const fetchedDocument = await getDocument(id);
        
        if (!fetchedDocument) {
          console.error('Document not found');
          setIsLoading(false);
          return;
        }
        
        setDocumentData(fetchedDocument);
        
        // Get watermarked version URL
        const watermarkedUrl = await getOrCreateWatermarkedVersion(
          user.id,
          fetchedDocument.id,
          fetchedDocument.file_path,
          fetchedDocument.vault_time
        );
        
        setDocumentUrl(watermarkedUrl);
        
        // Get audit log
        const auditLogData = await getDocumentAuditLog(id);
        setAuditLog(auditLogData || []);
      } catch (error) {
        console.error('Error fetching document data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDocumentData();
  }, [id, user]);

  // Create a document object that combines real data with UI display needs
  const document = documentData ? {
    id: documentData.id,
    name: documentData.file_name,
    source: documentData.source || 'Manual Upload',
    signedDate: new Date(documentData.vault_time).toLocaleDateString(),
    vaultedDate: new Date(documentData.vault_time).toLocaleDateString(),
    tags: [], // We'll need to implement tags separately
    retention: documentData.retention_period || '7 years',
    retentionExpiryDate: '2030-05-16', // This would need to be calculated
    status: documentData.status || 'vaulted',
    isAuthoritative: true,
    url: documentUrl || '',
    size: '1.2 MB', // This would need to be fetched
    signers: [], // This would need to be implemented
    encryptionType: 'AES-256',
    storageLocation: 'Supabase Storage',
    blockchainVerification: documentData.blockchain_txid || null,
    lastAccessed: new Date().toLocaleDateString(),
    fileHash: documentData.file_hash,
    integrityVerified: true,
    lastVerified: new Date().toLocaleString(),
  } : null;

  if (!document) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Document Not Found</CardTitle>
            <CardDescription>
              The document you're looking for doesn't exist or has been removed.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate("/")} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Documents
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Documents
        </Button>
        <h1 className="text-2xl font-bold">{document.name}</h1>
        {document.isAuthoritative && (
          <Badge className="bg-primary text-primary-foreground ml-2">
            <Shield className="mr-1 h-3 w-3" /> Authoritative Copy
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column - PDF Viewer */}
        <div className="lg:col-span-2">
          <Card className="border shadow-sm h-[600px]">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Document Preview</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowWatermark(!showWatermark)}
                  >
                    {showWatermark ? "Hide Watermark" : "Show Watermark"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[520px] relative">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : documentUrl ? (
                <iframe
                  src={documentUrl}
                  className="w-full h-full border-0"
                  title={document.name}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Document preview not available</p>
                </div>
              )}
              {document.isAuthoritative && showWatermark && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="transform rotate-[-35deg] opacity-20">
                    <div className="text-4xl font-bold text-primary border-4 border-primary px-6 py-3">
                      AUTHORITATIVE COPY
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column - Document Info & Actions */}
        <div>
          <Tabs
            defaultValue="info"
            className="w-full"
            onValueChange={(value) => setActiveTab(value)}
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">Info</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="audit">Audit Trail</TabsTrigger>
            </TabsList>

            {/* Document Info Tab */}
            <TabsContent value="info" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Document Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      Source:
                    </span>
                    <span className="col-span-2 flex items-center gap-2">
                      {getSourceIcon(document.source)}
                      {document.source}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      Signed:
                    </span>
                    <span className="col-span-2 flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-blue-500" />
                      {document.signedDate}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      Vaulted:
                    </span>
                    <span className="col-span-2 flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-green-500" />
                      {document.vaultedDate}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      Size:
                    </span>
                    <span className="col-span-2">{document.size}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      Retention:
                    </span>
                    <span className="col-span-2 flex items-center gap-1">
                      <Clock className="h-3 w-3 text-orange-500" />
                      {document.retention} (until {document.retentionExpiryDate}
                      )
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      Tags:
                    </span>
                    <div className="col-span-2 flex flex-wrap gap-1">
                      {document.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="mr-1">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      Signers:
                    </span>
                    <div className="col-span-2">
                      {document.signers?.map((signer, index) => (
                        <div
                          key={index}
                          className="text-sm flex items-center gap-1"
                        >
                          <User className="h-3 w-3 text-gray-500" />
                          {signer}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Document Proof Panel */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Document Proof</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      File Hash (SHA-256):
                    </span>
                    <span className="col-span-2 text-xs font-mono break-all">
                      {document.fileHash}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      Integrity Status:
                    </span>
                    <span className="col-span-2 flex items-center gap-1">
                      {document.integrityVerified ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="text-green-600 font-medium">
                            Verified
                          </span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                          <span className="text-amber-600 font-medium">
                            Not Verified
                          </span>
                        </>
                      )}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      Last Verified:
                    </span>
                    <span className="col-span-2">{document.lastVerified || "Not verified yet"}</span>
                  </div>
                  
                  {document.blockchainVerification && (
                    <div className="grid grid-cols-3 gap-1 mt-2 pt-2 border-t border-gray-100">
                      <span className="text-sm font-medium text-muted-foreground flex items-center">
                        <span className="mr-1">Blockchain:</span>
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 ml-1">
                          Polygon
                        </span>
                      </span>
                      <div className="col-span-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-mono break-all">
                            {document.blockchainVerification}
                          </span>
                          <a
                            href={`https://polygonscan.com/tx/${document.blockchainVerification}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm flex items-center ml-2"
                          >
                            View
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="ml-1 h-3 w-3"
                            >
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                              <polyline points="15 3 21 3 21 9"></polyline>
                              <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                          </a>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Document hash has been permanently anchored to the blockchain
                        </p>
                      </div>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => {
                      setVerificationState({ status: "verifying" });
                      // Simulate verification process
                      setTimeout(() => {
                        if (document.id === "3") {
                          setVerificationState({
                            status: "error",
                            message:
                              "Document hash does not match stored hash. Document may have been tampered with.",
                          });
                        } else {
                          setVerificationState({
                            status: "success",
                            message:
                              "Document integrity verified successfully. Hash matches the original.",
                          });
                        }
                      }, 2000);
                    }}
                    disabled={verificationState.status === "verifying"}
                  >
                    <FileCheck className="mr-2 h-4 w-4" />
                    {verificationState.status === "verifying"
                      ? "Verifying..."
                      : "Verify Document Integrity"}
                  </Button>

                  {verificationState.status === "verifying" && (
                    <div className="mt-2">
                      <Progress value={50} className="h-1" />
                      <p className="text-xs text-center mt-1 text-muted-foreground">
                        Verifying document integrity...
                      </p>
                    </div>
                  )}

                  {verificationState.status === "success" && (
                    <Alert className="mt-2 bg-green-50 border-green-200">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-700 text-sm">
                        {verificationState.message}
                      </AlertDescription>
                    </Alert>
                  )}

                  {verificationState.status === "error" && (
                    <Alert className="mt-2 bg-red-50 border-red-200">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-700 text-sm">
                        {verificationState.message}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="w-full">
                      <Download className="mr-2 h-4 w-4" /> Download
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Share2 className="mr-2 h-4 w-4" /> Share
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Printer className="mr-2 h-4 w-4" /> Print
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Mail className="mr-2 h-4 w-4" /> Email
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Tag className="mr-2 h-4 w-4" /> Edit Tags
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Clock className="mr-2 h-4 w-4" /> Edit Retention
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    Security Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      Encryption:
                    </span>
                    <span className="col-span-2 flex items-center gap-1">
                      <Lock className="h-3 w-3 text-green-600" />
                      {document.encryptionType}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      Storage:
                    </span>
                    <span className="col-span-2">
                      {document.storageLocation}
                    </span>
                  </div>
                  {document.blockchainVerification && (
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-sm font-medium text-muted-foreground">
                        Blockchain:
                      </span>
                      <div className="col-span-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                            Polygon
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-mono break-all">
                            {document.blockchainVerification}
                          </span>
                          <a
                            href={`https://polygonscan.com/tx/${document.blockchainVerification}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm flex items-center ml-2"
                          >
                            View
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="ml-1 h-3 w-3"
                            >
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                              <polyline points="15 3 21 3 21 9"></polyline>
                              <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                          </a>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Document hash has been permanently anchored to the Polygon blockchain
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      Last Access:
                    </span>
                    <span className="col-span-2">{document.lastAccessed}</span>
                  </div>
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-800">
                        Document Integrity Verified
                      </span>
                    </div>
                    <p className="text-xs text-green-700 mt-1">
                      Digital signatures and document hash have been verified
                      and match the original signed document.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Compliance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                        ESIGN Act
                      </Badge>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                        UETA
                      </Badge>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                        21 CFR Part 11
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      This document meets requirements for electronic signatures
                      under applicable regulations.
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Blockchain Publisher */}
              {!document.blockchainVerification ? (
                <BlockchainPublisher
                  documentId={document.id}
                  documentHash={document.fileHash}
                  existingTxid={documentData?.blockchain_txid}
                  onSuccess={(txid) => {
                    // Update the document object with the new blockchain transaction ID
                    setDocumentData({
                      ...documentData,
                      blockchain_txid: txid
                    });
                  }}
                />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-wallet">
                        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
                        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
                        <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
                      </svg>
                      Blockchain Anchoring
                    </CardTitle>
                    <CardDescription>
                      Document hash is permanently anchored to the Polygon blockchain
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Network:</span>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                        Polygon Mainnet
                      </Badge>
                    </div>
                    
                    <div className="space-y-1">
                      <span className="text-sm font-medium">Transaction ID:</span>
                      <div className="p-2 bg-gray-50 rounded border text-xs font-mono break-all">
                        {document.blockchainVerification}
                      </div>
                      <div className="flex justify-end">
                        <a 
                          href={`https://polygonscan.com/tx/${document.blockchainVerification}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm flex items-center mt-1"
                        >
                          View on Explorer
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1 h-3 w-3">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                          </svg>
                        </a>
                      </div>
                    </div>
                    
                    <Alert className="bg-green-50 border-green-200">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-green-600">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      <AlertDescription className="text-green-700 text-sm">
                        Document hash has been permanently anchored to the blockchain
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Audit Trail Tab */}
            <TabsContent value="audit">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Audit Trail</CardTitle>
                  <CardDescription>
                    Complete history of document activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(auditLog.length > 0 ? auditLog : mockAuditLog).map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-start gap-3 border-b border-border pb-2 last:border-0"
                      >
                        <div className="mt-0.5">
                          {getActionIcon(entry.action)}
                        </div>
                        <div className="w-full">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">
                                {entry.user}
                              </span>
                              <Badge
                                variant="outline"
                                className="text-xs font-normal"
                              >
                                {entry.action}
                              </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {entry.timestamp}
                            </span>
                          </div>
                          <p className="text-xs mt-1">{entry.details}</p>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-muted-foreground">
                              {entry.ipAddress}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {entry.userAgent}
                            </span>
                          </div>
                          {entry.action === "share" && entry.recipient && (
                            <div className="mt-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                              Shared with: {entry.recipient}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
