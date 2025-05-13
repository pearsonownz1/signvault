import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle } from 'lucide-react';

/**
 * This component displays the result of the PandaDoc OAuth flow.
 * It shows a success or error message based on the URL parameters.
 */
export default function PandaDocComplete() {
  const location = useLocation();
  const [status, setStatus] = useState<'success' | 'error' | null>(null);
  const [message, setMessage] = useState<string>('');
  const [account, setAccount] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    if (params.get('success') === 'true') {
      setStatus('success');
      setAccount(params.get('account') || 'your PandaDoc account');
    } else if (params.get('error')) {
      setStatus('error');
      setMessage(params.get('message') || 'An unknown error occurred');
    }
  }, [location]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            {status === 'success' ? 'Connection Successful' : 'Connection Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {status === 'success' ? (
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <p className="mb-2">
                Your PandaDoc account has been successfully connected to SignVault.
              </p>
              <p className="text-sm text-muted-foreground">
                Connected account: <span className="font-medium">{account}</span>
              </p>
            </div>
          ) : status === 'error' ? (
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Connection Error</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
              <p className="text-sm text-muted-foreground">
                Please try connecting again. If the problem persists, contact support.
              </p>
            </div>
          ) : (
            <p className="text-center">Loading...</p>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link to="/integrations/pandadoc">
            <Button>
              {status === 'success' ? 'Manage Connection' : 'Try Again'}
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
