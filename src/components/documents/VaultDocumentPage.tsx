import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { vaultDocument, createAuditLogEntry, publishHashToBlockchain } from "@/lib/vaultService";
import { getOrCreateWatermarkedVersion } from "@/lib/watermarkService";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  X,
  FileText,
  CheckCircle2,
  Shield,
  ArrowRight,
  FileCheck,
  AlertTriangle,
  Link,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function VaultDocumentPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [tags, setTags] = useState<string>("");
  const [retention, setRetention] = useState<string>("7 years");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [vaultedDocument, setVaultedDocument] = useState<any | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<
    "upload" | "processing" | "complete"
  >("upload");
  const [error, setError] = useState<string | null>(null);
  const [blockchainError, setBlockchainError] = useState<string | null>(null);
  const [isPublishingToBlockchain, setIsPublishingToBlockchain] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) {
      setError("Please select a file to vault");
      return;
    }

    setIsUploading(true);
    setCurrentStep("processing");
    setUploadProgress(10);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      // Vault the document
      const vaultedDoc = await vaultDocument(
        file,
        user.id,
        "upload",
        retention
      );

      setUploadProgress(95);

      // Get the watermarked version URL
      const watermarkedUrl = await getOrCreateWatermarkedVersion(
        user.id,
        vaultedDoc.id,
        vaultedDoc.file_path,
        vaultedDoc.vault_time
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Create document object for UI
      const newDocument = {
        id: vaultedDoc.id,
        name: file.name,
        source: "Manual Upload",
        signedDate: new Date().toISOString().split("T")[0],
        vaultedDate: vaultedDoc.vault_time,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag !== ""),
        retention,
        status: "vaulted",
        isAuthoritative: true,
        fileHash: vaultedDoc.file_hash,
        blockchain_txid: vaultedDoc.blockchain_txid,
      };

      setVaultedDocument(newDocument);
      setDocumentUrl(watermarkedUrl);
      setCurrentStep("complete");
    } catch (error) {
      console.error("Error vaulting document:", error);
      setError("Failed to vault document. Please try again.");
      setCurrentStep("upload");
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setTags("");
    setRetention("7 years");
    setVaultedDocument(null);
    setDocumentUrl(null);
    setCurrentStep("upload");
    setError(null);
    setUploadProgress(0);
  };

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Vault a Document</h1>
      <p className="text-muted-foreground mb-8">
        Securely store, hash, and watermark your important documents with
        SignVault's vaulting technology.
      </p>

      {currentStep === "upload" && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Document</CardTitle>
            <CardDescription>
              Upload a document to securely vault it. The document will be
              cryptographically sealed and stored with an immutable audit trail.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="file">Document File</Label>
                {!file ? (
                  <div className="flex justify-center rounded-lg border border-dashed border-gray-300 px-6 py-10">
                    <div className="text-center">
                      <FileText className="mx-auto h-12 w-12 text-gray-300" />
                      <div className="mt-4 flex justify-center">
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
                        >
                          <span>Select PDF to Vault</span>
                          <Input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            onChange={handleFileChange}
                            accept=".pdf"
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        PDF files up to 10MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between rounded-md border border-gray-200 p-4">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-10 w-10 text-primary/80" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Contract, Legal, HR"
                />
                <p className="text-xs text-muted-foreground">
                  Add tags to help organize and find your documents later
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="retention">Retention Period</Label>
                <Select value={retention} onValueChange={setRetention}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select retention period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1 year">1 year</SelectItem>
                    <SelectItem value="3 years">3 years</SelectItem>
                    <SelectItem value="5 years">5 years</SelectItem>
                    <SelectItem value="7 years">7 years</SelectItem>
                    <SelectItem value="10 years">10 years</SelectItem>
                    <SelectItem value="Permanent">Permanent</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  How long the document should be retained in the vault
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/documents")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!file || isUploading}
                className="bg-primary hover:bg-primary/90"
              >
                <Shield className="mr-2 h-4 w-4" />
                Vault Document
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {currentStep === "processing" && (
        <Card>
          <CardHeader>
            <CardTitle>Vaulting Document</CardTitle>
            <CardDescription>
              Your document is being securely vaulted. Please wait...
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {uploadProgress < 30
                    ? "Uploading document..."
                    : uploadProgress < 60
                    ? "Generating cryptographic hash..."
                    : uploadProgress < 80
                    ? "Creating watermarked copy..."
                    : uploadProgress < 90
                    ? "Anchoring to blockchain..."
                    : "Finalizing vault process..."}
                </span>
                <span className="text-sm">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-2">
                <div
                  className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center ${
                    uploadProgress >= 20
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {uploadProgress >= 20 ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <span className="text-xs">1</span>
                  )}
                </div>
                <div>
                  <p
                    className={`text-sm font-medium ${
                      uploadProgress >= 20
                        ? "text-green-600"
                        : "text-gray-600"
                    }`}
                  >
                    Upload Document
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Securely uploading to encrypted storage
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <div
                  className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center ${
                    uploadProgress >= 50
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {uploadProgress >= 50 ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <span className="text-xs">2</span>
                  )}
                </div>
                <div>
                  <p
                    className={`text-sm font-medium ${
                      uploadProgress >= 50
                        ? "text-green-600"
                        : "text-gray-600"
                    }`}
                  >
                    Generate SHA-256 Hash
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Creating cryptographic seal for verification
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <div
                  className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center ${
                    uploadProgress >= 80
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {uploadProgress >= 80 ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <span className="text-xs">3</span>
                  )}
                </div>
                <div>
                  <p
                    className={`text-sm font-medium ${
                      uploadProgress >= 80
                        ? "text-green-600"
                        : "text-gray-600"
                    }`}
                  >
                    Create Watermarked Copy
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Generating watermarked version for viewing
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <div
                  className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center ${
                    uploadProgress >= 90
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {uploadProgress >= 90 ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <span className="text-xs">4</span>
                  )}
                </div>
                <div>
                  <p
                    className={`text-sm font-medium ${
                      uploadProgress >= 90
                        ? "text-green-600"
                        : "text-gray-600"
                    }`}
                  >
                    Anchor to Blockchain
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Publishing document hash to Polygon blockchain
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <div
                  className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center ${
                    uploadProgress >= 100
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {uploadProgress >= 100 ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <span className="text-xs">5</span>
                  )}
                </div>
                <div>
                  <p
                    className={`text-sm font-medium ${
                      uploadProgress >= 100
                        ? "text-green-600"
                        : "text-gray-600"
                    }`}
                  >
                    Record Audit Trail
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Creating immutable audit record
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === "complete" && vaultedDocument && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="bg-green-50 border-b border-green-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                <CardTitle>Document Successfully Vaulted</CardTitle>
              </div>
              <CardDescription>
                Your document has been securely vaulted and is now protected by
                SignVault's cryptographic technology.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{vaultedDocument.name}</h3>
                <Badge className="bg-primary text-primary-foreground">
                  <Shield className="mr-1 h-3 w-3" /> Authoritative Copy
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Vault Date
                  </p>
                  <p className="text-sm">
                    {new Date(vaultedDocument.vaultedDate).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Retention Period
                  </p>
                  <p className="text-sm">{vaultedDocument.retention}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {vaultedDocument.tags.length > 0 ? (
                      vaultedDocument.tags.map((tag: string) => (
                        <Badge key={tag} variant="outline" className="mr-1">
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        No tags
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Document ID
                  </p>
                  <p className="text-sm font-mono">{vaultedDocument.id}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  SHA-256 Hash
                </p>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-xs font-mono break-all">
                    {vaultedDocument.fileHash}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  This cryptographic hash uniquely identifies your document and
                  can be used to verify its integrity in the future.
                </p>
              </div>

              {vaultedDocument.blockchain_txid ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground flex items-center">
                    <span className="mr-1">Blockchain Transaction</span>
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                      Polygon
                    </span>
                  </p>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-mono break-all">
                        {vaultedDocument.blockchain_txid}
                      </p>
                      <a
                        href={`https://polygonscan.com/tx/${vaultedDocument.blockchain_txid}`}
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
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your document hash has been permanently anchored to the Polygon blockchain,
                    providing immutable proof of its existence and integrity.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 border border-amber-200 bg-amber-50 p-4 rounded-md">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    <p className="text-sm font-medium text-amber-800">
                      Blockchain Anchoring Pending
                    </p>
                  </div>
                  <p className="text-xs text-amber-700">
                    Your document has been securely vaulted, but the automatic blockchain anchoring process hasn't completed yet.
                    You can manually trigger the blockchain anchoring process.
                  </p>
                  
                  <div className="mt-3">
                    <Button
                      onClick={async () => {
                        if (!vaultedDocument.fileHash) {
                          setBlockchainError("Document hash is missing");
                          return;
                        }
                        
                        setIsPublishingToBlockchain(true);
                        setBlockchainError(null);
                        
                        try {
                          // Publish hash to blockchain using server-side wallet
                          const txid = await publishHashToBlockchain(vaultedDocument.fileHash);
                          
                          // Update the document with the new blockchain transaction ID
                          const { error } = await supabase
                            .from('documents')
                            .update({ blockchain_txid: txid })
                            .eq('id', vaultedDocument.id);
                            
                          if (error) {
                            throw new Error(`Failed to update document: ${error.message}`);
                          }
                          
                          // Update the local state
                          setVaultedDocument({
                            ...vaultedDocument,
                            blockchain_txid: txid
                          });
                          
                          // Create audit log entry
                          await createAuditLogEntry(vaultedDocument.id, 'blockchain_anchored', user?.id || 'user', {
                            blockchain: 'polygon',
                            txid: txid,
                            document_hash: vaultedDocument.fileHash,
                            method: 'manual'
                          });
                        } catch (error: any) {
                          console.error("Error publishing to blockchain:", error);
                          setBlockchainError(error.message || "Failed to publish to blockchain");
                        } finally {
                          setIsPublishingToBlockchain(false);
                        }
                      }}
                      disabled={isPublishingToBlockchain}
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      {isPublishingToBlockchain ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Publishing to Blockchain...
                        </>
                      ) : (
                        <>
                          <Link className="mr-2 h-4 w-4" />
                          Publish to Blockchain
                        </>
                      )}
                    </Button>
                    
                    {blockchainError && (
                      <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                        {blockchainError}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {documentUrl && (
                <div className="border rounded-md overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b">
                    <p className="text-sm font-medium">Document Preview</p>
                  </div>
                  <div className="h-[300px]">
                    <iframe
                      src={documentUrl}
                      className="w-full h-full border-0"
                      title={vaultedDocument.name}
                    />
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={resetForm}>
                Vault Another Document
              </Button>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/document/${vaultedDocument.id}`)}
                >
                  <FileCheck className="mr-2 h-4 w-4" />
                  View Details
                </Button>
                <Button
                  onClick={() => navigate("/documents")}
                  className="bg-primary hover:bg-primary/90"
                >
                  Go to Documents
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
