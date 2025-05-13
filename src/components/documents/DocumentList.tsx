import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search,
  Download,
  Share2,
  Tag,
  Clock,
  Eye,
  FileText,
  Shield,
  CheckCircle,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import UploadDocument from "./UploadDocument";

interface Document {
  id: string;
  name: string;
  source: string;
  signedDate: string;
  tags: string[];
  retention: string;
  status: "signed" | "pending";
  isAuthoritative?: boolean;
  blockchain_txid?: string;
}

const mockDocuments: Document[] = [
  {
    id: "1",
    name: "NDA-CompanyX-2023.pdf",
    source: "PandaDoc",
    signedDate: "2023-05-15",
    tags: ["NDA", "Legal"],
    retention: "7 years",
    status: "signed",
    isAuthoritative: true,
  },
  {
    id: "2",
    name: "Employment-Contract-Jane-Doe.pdf",
    source: "DocuSign",
    signedDate: "2023-06-22",
    tags: ["Contract", "HR"],
    retention: "10 years",
    status: "signed",
  },
  {
    id: "3",
    name: "Service-Agreement-2023.pdf",
    source: "PandaDoc",
    signedDate: "2023-07-10",
    tags: ["Agreement", "Services"],
    retention: "5 years",
    status: "pending",
  },
];

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

function getStatusBadge(status: "signed" | "pending") {
  if (status === "signed") {
    return (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
        Signed ✓
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
    >
      Pending ⏳
    </Badge>
  );
}

export default function DocumentList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch documents from Supabase
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        if (data) {
          // Transform the data to match our Document interface
          const formattedDocs = data.map(doc => ({
            id: doc.id,
            name: doc.file_name,
            source: doc.source || 'Manual Upload',
            signedDate: new Date(doc.vault_time).toISOString().split('T')[0],
            tags: [], // We'll need to fetch tags separately if needed
            retention: doc.retention_period || '7 years',
            status: doc.status as 'signed' | 'pending',
            isAuthoritative: true,
            blockchain_txid: doc.blockchain_txid || null,
          }));
          
          setDocuments(formattedDocs);
        }
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError('Failed to load documents');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocuments();
  }, [user]);

  const handleUploadComplete = (newDocument: Document) => {
    setDocuments([newDocument, ...documents]);
  };
  return (
    <div className="space-y-4">
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Documents</CardTitle>
          <CardDescription>
            View and manage all your securely stored documents.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search documents..." className="pl-8" />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => navigate("/verify")}
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" /> Verify Document
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate("/vault-document")}
                className="flex items-center gap-2"
              >
                <Shield className="h-4 w-4" /> Vault Document
              </Button>
              <UploadDocument onUploadComplete={handleUploadComplete} />
            </div>
          </div>

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Document Name</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Signed Date</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Retention</TableHead>
                  <TableHead>Blockchain</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                        <p className="text-sm text-muted-foreground">Loading documents...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center">
                        <p className="text-sm text-red-500 mb-2">{error}</p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.location.reload()}
                        >
                          Try Again
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : documents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center">
                        <FileText className="h-12 w-12 text-muted-foreground/30 mb-2" />
                        <p className="text-sm text-muted-foreground mb-4">No documents found</p>
                        <Button 
                          onClick={() => navigate("/vault-document")}
                          className="flex items-center gap-2"
                        >
                          <Shield className="h-4 w-4" /> Vault Your First Document
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : documents.map((doc) => (
                  <TableRow key={doc.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium flex items-center gap-2">
                      <Link
                        to={`/document/${doc.id}`}
                        className="hover:underline hover:text-primary cursor-pointer"
                      >
                        {doc.name}
                      </Link>
                      {doc.isAuthoritative && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div>
                                <Shield className="h-4 w-4 text-primary ml-1" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Authoritative Copy</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getSourceIcon(doc.source)}
                        <span>{doc.source}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(doc.status)}</TableCell>
                    <TableCell>{doc.signedDate}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {doc.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="mr-1">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{doc.retention}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {doc.blockchain_txid ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <a
                                href={`https://polygonscan.com/tx/${doc.blockchain_txid}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-green-600 hover:text-green-800"
                              >
                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M13 7L22 12L13 17V7Z"></path>
                                    <path d="M2 17L7 12L2 7"></path>
                                  </svg>
                                </div>
                                <span className="ml-1 text-xs">Anchored</span>
                              </a>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Anchored to Polygon blockchain</p>
                              <p className="text-xs font-mono">{doc.blockchain_txid.substring(0, 10)}...{doc.blockchain_txid.substring(doc.blockchain_txid.length - 8)}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link to={`/document/${doc.id}`}>
                                <Button variant="ghost" size="icon">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">View</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Download className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Download</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Share2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Share</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Tag className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Manage Tags</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
