import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

export default function DocuSignComplete() {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<'success' | 'error' | 'loading'>('loading');
  const [message, setMessage] = useState('');
  const [accountName, setAccountName] = useState('');

  useEffect(() => {
    // Parse query parameters
    const params = new URLSearchParams(location.search);
    const success = params.get('success');
    const error = params.get('error');
    const errorMessage = params.get('message');
    const account = params.get('account');

    if (success === 'true') {
      setStatus('success');
      setAccountName(account || 'your DocuSign account');
    } else if (error) {
      setStatus('error');
      setMessage(errorMessage || `Error: ${error}`);
    } else {
      setStatus('loading');
    }
  }, [location]);

  const handleBackToIntegrations = () => {
    navigate('/integrations');
  };

  return (
    <div className="container mx-auto py-16 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {status === 'success' ? 'Connection Successful' : 
             status === 'error' ? 'Connection Failed' : 
             'Processing...'}
          </CardTitle>
          <CardDescription className="text-center">
            {status === 'success' ? 'Your DocuSign account has been connected' : 
             status === 'error' ? 'There was a problem connecting your account' : 
             'Please wait while we complete the connection...'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-6">
          {status === 'success' && (
            <>
              <div className="bg-green-100 p-3 rounded-full mb-4">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <p className="text-center mb-4">
                You've successfully connected {accountName} to SignVault.
              </p>
              <p className="text-center text-sm text-muted-foreground">
                When documents are signed in DocuSign, they will be automatically vaulted in your SignVault account.
              </p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="bg-red-100 p-3 rounded-full mb-4">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Connection Error</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
              <p className="text-center text-sm text-muted-foreground">
                Please try again or contact support if the problem persists.
              </p>
            </>
          )}
          
          {status === 'loading' && (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-center">Completing your connection...</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            onClick={handleBackToIntegrations}
            disabled={status === 'loading'}
            className="flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Integrations
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
