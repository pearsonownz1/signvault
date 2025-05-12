import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/AuthContext';
import { Loader2, CheckCircle, XCircle, Trash2, Copy, Key, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function ApiIntegration() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyPermissions, setNewKeyPermissions] = useState({
    read: true,
    write: true
  });
  const [newKeyDialogOpen, setNewKeyDialogOpen] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [showCreatedKey, setShowCreatedKey] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('keys');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadApiKeys();
  }, [user, navigate]);

  const loadApiKeys = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Fetching API keys...');
      const response = await fetch('/api/api-keys', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(errorText || `Failed to load API keys: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API keys data:', data);
      
      setApiKeys(data.apiKeys || []);
    } catch (err: any) {
      console.error('Error loading API keys:', err);
      setError(err.message || 'Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      setError('API key name is required');
      return;
    }

    try {
      console.log('Creating new API key with name:', newKeyName);
      console.log('Permissions:', newKeyPermissions);
      
      const requestBody = {
        name: newKeyName.trim(),
        permissions: newKeyPermissions
      };
      
      console.log('Request body:', JSON.stringify(requestBody));
      
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody),
      });
      
      console.log('Create API key response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(errorText || `Failed to create API key: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API key created successfully:', data);
      console.log('API key response structure:', JSON.stringify(data, null, 2));
      
      // Store the created key to display to the user
      if (data.apiKey && data.apiKey.key) {
        setCreatedKey(data.apiKey.key);
        setShowCreatedKey(false);
      } else {
        console.error('API key response missing expected data:', data);
        throw new Error('API key response missing expected data');
      }
      
      // Reset form
      setNewKeyName('');
      setNewKeyPermissions({ read: true, write: true });
      
      // Close dialog
      setNewKeyDialogOpen(false);
      
      // Reload API keys
      await loadApiKeys();
      
      toast({
        title: 'API Key Created',
        description: 'Your new API key has been created successfully.',
      });
    } catch (err: any) {
      console.error('Error creating API key:', err);
      setError(err.message || 'Failed to create API key');
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    setDeleteLoading(keyId);
    setError(null);

    try {
      console.log('Deleting API key with ID:', keyId);
      
      const response = await fetch(`/api/api-keys?id=${keyId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      console.log('Delete API key response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(errorText || `Failed to delete API key: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API key deleted successfully:', data);
      
      // Reload API keys
      await loadApiKeys();
      
      toast({
        title: 'API Key Deleted',
        description: 'Your API key has been deleted successfully.',
      });
    } catch (err: any) {
      console.error('Error deleting API key:', err);
      setError(err.message || 'Failed to delete API key');
    } finally {
      setDeleteLoading(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: 'Copied to Clipboard',
        description: 'API key copied to clipboard.',
      });
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">API Integration</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {createdKey && (
        <Alert className="mb-6 bg-yellow-50 border-yellow-200">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Important: Save Your API Key</AlertTitle>
          <AlertDescription className="text-yellow-700">
            <p className="mb-2">This is the only time your full API key will be displayed. Please save it securely.</p>
            <div className="flex items-center gap-2 bg-white p-2 rounded border mt-2">
              <div className="flex-1 font-mono text-sm overflow-x-auto whitespace-nowrap">
                {showCreatedKey ? createdKey : '•'.repeat(createdKey.length)}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowCreatedKey(!showCreatedKey)}
              >
                {showCreatedKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => copyToClipboard(createdKey)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="keys" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="keys">API Keys</TabsTrigger>
          <TabsTrigger value="docs">Documentation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="keys">
          <Card className="mb-8">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>API Keys</CardTitle>
                  <CardDescription>
                    Manage your API keys for external integrations
                  </CardDescription>
                </div>
                <Dialog open={newKeyDialogOpen} onOpenChange={setNewKeyDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>Create New API Key</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New API Key</DialogTitle>
                      <DialogDescription>
                        Create a new API key to integrate with external applications.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="key-name">API Key Name</Label>
                        <Input 
                          id="key-name" 
                          placeholder="e.g., Production API Key" 
                          value={newKeyName}
                          onChange={(e) => setNewKeyName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Permissions</Label>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="read-permission" className="flex items-center gap-2">
                              <span>Read Access</span>
                              <span className="text-xs text-muted-foreground">(Get documents)</span>
                            </Label>
                            <Switch 
                              id="read-permission" 
                              checked={newKeyPermissions.read}
                              onCheckedChange={(checked) => setNewKeyPermissions({...newKeyPermissions, read: checked})}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="write-permission" className="flex items-center gap-2">
                              <span>Write Access</span>
                              <span className="text-xs text-muted-foreground">(Vault documents)</span>
                            </Label>
                            <Switch 
                              id="write-permission" 
                              checked={newKeyPermissions.write}
                              onCheckedChange={(checked) => setNewKeyPermissions({...newKeyPermissions, write: checked})}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setNewKeyDialogOpen(false)}>Cancel</Button>
                      <Button onClick={handleCreateKey}>Create API Key</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : apiKeys.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Key className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No API keys found. Create your first API key to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {apiKeys.map((key) => (
                    <Card key={key.id} className="border rounded-lg">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Key className="h-4 w-4 text-primary" />
                            <CardTitle className="text-lg">{key.name}</CardTitle>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteKey(key.id)}
                            disabled={deleteLoading === key.id}
                          >
                            {deleteLoading === key.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            <span className="ml-2">Delete</span>
                          </Button>
                        </div>
                        <CardDescription>
                          Created on {formatDate(key.created_at)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium">Permissions</p>
                            <div className="flex gap-2 mt-1">
                              {key.permissions.read && (
                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Read</span>
                              )}
                              {key.permissions.write && (
                                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">Write</span>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Last Used</p>
                            <p className="text-sm text-muted-foreground">
                              {key.last_used_at ? formatDate(key.last_used_at) : 'Never used'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="docs">
          <Card>
            <CardHeader>
              <CardTitle>API Documentation</CardTitle>
              <CardDescription>
                Learn how to integrate with SignVault's API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Authentication</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  All API requests require authentication using an API key. Include your API key in the Authorization header:
                </p>
                <div className="bg-muted p-3 rounded-md font-mono text-sm">
                  Authorization: Bearer sv_live_your_api_key
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Vault a Document</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload and vault a document securely with blockchain anchoring.
                </p>
                <div className="space-y-2">
                  <p className="font-medium">Endpoint</p>
                  <div className="bg-muted p-3 rounded-md font-mono text-sm">
                    POST /api/vault-document
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <p className="font-medium">Request Format</p>
                  <p className="text-sm text-muted-foreground">
                    Send as multipart/form-data with the following fields:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li><span className="font-mono">file</span> - The document file to vault (required)</li>
                    <li><span className="font-mono">metadata</span> - JSON string with additional metadata (optional)</li>
                    <li><span className="font-mono">source</span> - Source of the document (optional, default: "api")</li>
                    <li><span className="font-mono">retention_period</span> - How long to retain the document (optional, default: "7 years")</li>
                  </ul>
                </div>
                <div className="space-y-2 mt-4">
                  <p className="font-medium">Example Response</p>
                  <div className="bg-muted p-3 rounded-md font-mono text-sm overflow-x-auto">
                    {`{
  "success": true,
  "document": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "file_name": "contract.pdf",
    "vault_time": "2025-05-11T21:38:27.892Z",
    "file_hash": "8a9d5a6c8b9e2f4a3b7c6d5e4f3a2b1c",
    "blockchain_txid": "0x1234567890abcdef1234567890abcdef"
  }
}`}
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Get Documents</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Retrieve a list of vaulted documents.
                </p>
                <div className="space-y-2">
                  <p className="font-medium">Endpoint</p>
                  <div className="bg-muted p-3 rounded-md font-mono text-sm">
                    GET /api/get-documents
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <p className="font-medium">Query Parameters</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li><span className="font-mono">limit</span> - Number of documents to return (default: 10)</li>
                    <li><span className="font-mono">offset</span> - Pagination offset (default: 0)</li>
                    <li><span className="font-mono">source</span> - Filter by document source (optional)</li>
                  </ul>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Get Document</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Retrieve a specific document by ID.
                </p>
                <div className="space-y-2">
                  <p className="font-medium">Endpoint</p>
                  <div className="bg-muted p-3 rounded-md font-mono text-sm">
                    GET /api/get-document?id=document_id
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <p className="font-medium">Query Parameters</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li><span className="font-mono">id</span> - Document ID (required)</li>
                    <li><span className="font-mono">download</span> - Set to "true" to include a download URL (optional)</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-6">
                <h3 className="text-md font-semibold text-blue-800 mb-2">Need More Help?</h3>
                <p className="text-sm text-blue-700">
                  For more detailed documentation and code examples, check out our comprehensive 
                  <a href="#" className="text-blue-600 underline ml-1">API Reference</a>.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
