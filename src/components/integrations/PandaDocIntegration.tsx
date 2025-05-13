import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/lib/AuthContext';
import { getUserPandaDocConnections, deletePandaDocConnection } from '@/lib/pandaDocService';
import { Loader2, CheckCircle, XCircle, Trash2 } from 'lucide-react';

export default function PandaDocIntegration() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [connectLoading, setConnectLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadConnections();
  }, [user, navigate]);

  const loadConnections = async () => {
    setLoading(true);
    setError(null);

    try {
      const { connections: userConnections } = await getUserPandaDocConnections(user!.id);
      setConnections(userConnections);
    } catch (err: any) {
      setError(err.message || 'Failed to load PandaDoc connections');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!user) return;

    setConnectLoading(true);
    setError(null);

    try {
      // Call the backend API to get the authorization URL
      const response = await fetch(`/api/pandadoc-oauth-start?userId=${user.id}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate PandaDoc authorization URL');
      }
      
      if (!data.url) {
        throw new Error('No authorization URL returned from server');
      }
      
      // Redirect to PandaDoc for authorization
      window.location.href = data.url;
    } catch (err: any) {
      console.error('Error connecting to PandaDoc:', err);
      setError(err.message || 'Failed to connect to PandaDoc');
      setConnectLoading(false);
    }
  };

  const handleDelete = async (connectionId: string) => {
    if (!user) return;

    setDeleteLoading(connectionId);
    setError(null);

    try {
      const { success } = await deletePandaDocConnection(connectionId, user.id);
      if (!success) {
        throw new Error('Failed to delete connection');
      }
      
      // Reload connections
      await loadConnections();
    } catch (err: any) {
      setError(err.message || 'Failed to delete connection');
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">PandaDoc Integration</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Connect with PandaDoc</CardTitle>
          <CardDescription>
            Connect your PandaDoc account to automatically vault signed documents.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            When you connect your PandaDoc account, SignVault will be able to:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>Access your PandaDoc account information</li>
            <li>Download completed documents when they are signed</li>
            <li>Securely vault these documents in your SignVault account</li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleConnect} 
            disabled={connectLoading}
          >
            {connectLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Connect PandaDoc Account
          </Button>
        </CardFooter>
      </Card>

      <h2 className="text-2xl font-semibold mb-4">Your Connected Accounts</h2>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : connections.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              No PandaDoc accounts connected yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {connections.map((connection) => (
            <Card key={connection.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">{connection.name || 'PandaDoc Account'}</CardTitle>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(connection.id)}
                    disabled={deleteLoading === connection.id}
                  >
                    {deleteLoading === connection.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    <span className="ml-2">Disconnect</span>
                  </Button>
                </div>
                <CardDescription>
                  Connected on {new Date(connection.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">User ID</p>
                    <p className="text-sm text-muted-foreground">{connection.pandadoc_user_id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{connection.email}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex items-center text-sm text-green-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Active
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
