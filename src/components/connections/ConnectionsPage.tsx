import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, ExternalLink, Trash2 } from "lucide-react";

interface Connection {
  id: string;
  platform: string;
  accountName: string;
  status: "active" | "expired";
  connectedDate: string;
  documentsCount: number;
}

const mockConnections: Connection[] = [
  {
    id: "1",
    platform: "PandaDoc",
    accountName: "company@example.com",
    status: "active",
    connectedDate: "2023-04-15",
    documentsCount: 24,
  },
  {
    id: "2",
    platform: "DocuSign",
    accountName: "legal@example.com",
    status: "active",
    connectedDate: "2023-05-22",
    documentsCount: 18,
  },
  {
    id: "3",
    platform: "Adobe Sign",
    accountName: "contracts@example.com",
    status: "expired",
    connectedDate: "2023-02-10",
    documentsCount: 7,
  },
];

function getPlatformLogo(platform: string) {
  switch (platform.toLowerCase()) {
    case "pandadoc":
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
          <span className="font-semibold text-blue-600">P</span>
        </div>
      );
    case "docusign":
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
          <span className="font-semibold text-yellow-600">D</span>
        </div>
      );
    case "adobe sign":
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
          <span className="font-semibold text-red-600">A</span>
        </div>
      );
    default:
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
          <span className="font-semibold text-gray-600">?</span>
        </div>
      );
  }
}

function getStatusBadge(status: "active" | "expired") {
  if (status === "active") {
    return (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
        Active
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="border-red-300 bg-red-50 text-red-800 hover:bg-red-100"
    >
      Expired
    </Badge>
  );
}

export default function ConnectionsPage() {
  return (
    <div className="space-y-4">
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Connections</CardTitle>
          <CardDescription>
            Manage your connections to eSignature platforms.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" /> Connect Platform
            </Button>
          </div>

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Platform</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Connected Since</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockConnections.map((connection) => (
                  <TableRow key={connection.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getPlatformLogo(connection.platform)}
                        <span className="font-medium">
                          {connection.platform}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{connection.accountName}</TableCell>
                    <TableCell>{getStatusBadge(connection.status)}</TableCell>
                    <TableCell>{connection.connectedDate}</TableCell>
                    <TableCell>{connection.documentsCount}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
