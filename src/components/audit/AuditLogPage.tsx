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
  Eye,
  FileText,
  User,
  Calendar,
  Filter,
} from "lucide-react";

interface AuditEvent {
  id: string;
  timestamp: string;
  user: string;
  action: "view" | "download" | "share" | "upload" | "delete" | "login";
  documentName?: string;
  documentId?: string;
  ipAddress: string;
  userAgent: string;
}

const mockAuditEvents: AuditEvent[] = [
  {
    id: "1",
    timestamp: "2023-07-15 14:32:45",
    user: "admin@example.com",
    action: "upload",
    documentName: "NDA-CompanyX-2023.pdf",
    documentId: "1",
    ipAddress: "192.168.1.1",
    userAgent: "Chrome/Windows",
  },
  {
    id: "2",
    timestamp: "2023-07-15 15:10:22",
    user: "user@example.com",
    action: "view",
    documentName: "NDA-CompanyX-2023.pdf",
    documentId: "1",
    ipAddress: "192.168.1.2",
    userAgent: "Safari/MacOS",
  },
  {
    id: "3",
    timestamp: "2023-07-16 09:45:11",
    user: "admin@example.com",
    action: "download",
    documentName: "Employment-Contract-Jane-Doe.pdf",
    documentId: "2",
    ipAddress: "192.168.1.1",
    userAgent: "Chrome/Windows",
  },
  {
    id: "4",
    timestamp: "2023-07-16 10:22:33",
    user: "auditor@example.com",
    action: "login",
    ipAddress: "192.168.1.3",
    userAgent: "Firefox/Linux",
  },
  {
    id: "5",
    timestamp: "2023-07-16 11:05:17",
    user: "user@example.com",
    action: "share",
    documentName: "Service-Agreement-2023.pdf",
    documentId: "3",
    ipAddress: "192.168.1.2",
    userAgent: "Safari/MacOS",
  },
];

function getActionBadge(action: AuditEvent["action"]) {
  switch (action) {
    case "view":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
          <Eye className="h-3 w-3 mr-1" /> View
        </Badge>
      );
    case "download":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
          <Download className="h-3 w-3 mr-1" /> Download
        </Badge>
      );
    case "share":
      return (
        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
          <Eye className="h-3 w-3 mr-1" /> Share
        </Badge>
      );
    case "upload":
      return (
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
          <FileText className="h-3 w-3 mr-1" /> Upload
        </Badge>
      );
    case "delete":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
          <FileText className="h-3 w-3 mr-1" /> Delete
        </Badge>
      );
    case "login":
      return (
        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
          <User className="h-3 w-3 mr-1" /> Login
        </Badge>
      );
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
}

export default function AuditLogPage() {
  return (
    <div className="space-y-4">
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Audit Log</CardTitle>
          <CardDescription>
            Track all activities within your document vault.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search audit logs..." className="pl-8" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex gap-2">
                <Calendar className="h-4 w-4" />
                <span>Date Range</span>
              </Button>
              <Button variant="outline" className="flex gap-2">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </Button>
              <Button variant="outline" className="flex gap-2">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </Button>
            </div>
          </div>

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>User Agent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAuditEvents.map((event) => (
                  <TableRow key={event.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-xs">
                      {event.timestamp}
                    </TableCell>
                    <TableCell>{event.user}</TableCell>
                    <TableCell>{getActionBadge(event.action)}</TableCell>
                    <TableCell>
                      {event.documentName ? event.documentName : "-"}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {event.ipAddress}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {event.userAgent}
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
