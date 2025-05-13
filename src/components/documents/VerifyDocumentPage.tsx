import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDocument, verifyDocumentIntegrity } from "@/lib/vaultService";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Shield,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Link,
  Upload,
  FileText,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

/**
 * Document verification page
 * This page is accessed via the QR code on the certificate
 */
export default function VerifyDocumentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "verifying" | "success" | "failed"
  >("idle");
  const [verificationMessage, setVerificationMessage] = useState<string | null>(
    null
  );

  // Fetch document data
  useEffect(() => {
    const fetchDocument = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const documentData = await getDocument(id);
        setDocument(documentData);
      } catch (error: any) {
        console.error("Error fetching document:", error);
        setError(
          "Could not retrieve document information. Please check the document ID and try again."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocument();
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setVerificationStatus("idle");
      setVerificationMessage(null);
    }
  };

  const handleVerify = async () => {
    if (!file || !id) {
      setVerificationMessage("Please select a file to verify");
      return;
    }

    setVerificationStatus("verifying");

    try {
      const result = await verifyDocumentIntegrity(file, id);

      if (result.status === "match") {
        setVerificationStatus("success");
        setVerificationMessage(
          "Document verified successfully! The document is authentic and matches the original vaulted document."
        );
      } else {
        setVerificationStatus("failed");
        setVerificationMessage(
          "Verification failed. The document does not match the original vaulted document and may have been tampered with."
        );
      }
    } catch (error: any) {
      console.error("Error verifying document:", error);
      setVerificationStatus("failed");
      setVerificationMessage(
        `Verification error: ${error.message || "Unknown error"}`
      );
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading document information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Document Verification</CardTitle>
            <CardDescription>
              Verify the authenticity of a vaulted document
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Document Verification</CardTitle>
          </div>
          <CardDescription>
            Verify the authenticity of a vaulted document
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {document && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{document.file_name}</h3>
                <Badge className="bg-primary text-primary-foreground">
                  <Shield className="mr-1 h-3 w-3" /> Vaulted Document
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Vault Date
                  </p>
                  <p className="text-sm">
                    {new Date(document.vault_time).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Document ID
                  </p>
                  <p className="text-sm font-mono">{document.id}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  SHA-256 Hash
                </p>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-xs font-mono break-all">
                    {document.file_hash}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  This cryptographic hash uniquely identifies the document and
                  can be used to verify its integrity.
                </p>
              </div>

              {document.blockchain_txid && (
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
                        {document.blockchain_txid}
                      </p>
                      <a
                        href={`https://polygonscan.com/tx/${document.blockchain_txid}`}
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
                    This document hash has been permanently anchored to the Polygon blockchain,
                    providing immutable proof of its existence and integrity.
                  </p>
                </div>
              )}

              <div className="border-t border-gray-100 pt-4 mt-4">
                <h4 className="text-md font-semibold mb-2">Verify Your Copy</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload your copy of this document to verify its authenticity
                  against the original vaulted document.
                </p>

                {!file ? (
                  <div className="flex justify-center rounded-lg border border-dashed border-gray-300 px-6 py-8">
                    <div className="text-center">
                      <FileText className="mx-auto h-12 w-12 text-gray-300" />
                      <div className="mt-4 flex justify-center">
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
                        >
                          <span>Select PDF to Verify</span>
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
                  <div className="space-y-4">
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
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </Button>
                    </div>

                    <Button
                      onClick={handleVerify}
                      className="w-full"
                      disabled={verificationStatus === "verifying"}
                    >
                      {verificationStatus === "verifying" ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Verifying...
                        </>
                      ) : (
                        <>
                          <FileCheck className="mr-2 h-4 w-4" />
                          Verify Document
                        </>
                      )}
                    </Button>

                    {verificationStatus === "verifying" && (
                      <div className="mt-2">
                        <Progress value={50} className="h-1" />
                        <p className="text-xs text-center mt-1 text-muted-foreground">
                          Verifying document integrity...
                        </p>
                      </div>
                    )}

                    {verificationStatus === "success" && (
                      <Alert className="mt-2 bg-green-50 border-green-200">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-700 text-sm">
                          {verificationMessage}
                        </AlertDescription>
                      </Alert>
                    )}

                    {verificationStatus === "failed" && (
                      <Alert className="mt-2 bg-red-50 border-red-200">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-700 text-sm">
                          {verificationMessage}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t bg-gray-50 flex justify-between">
          <Button variant="outline" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Return to Home
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open("https://signvault.com", "_blank")}
          >
            <Link className="mr-2 h-4 w-4" /> About SignVault
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
