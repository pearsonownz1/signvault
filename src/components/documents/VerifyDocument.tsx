import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2, ExternalLink } from 'lucide-react';

export default function VerifyDocument() {
  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'verifying' | 'valid' | 'invalid'>('idle');
  const [txid, setTxid] = useState<string | null>(null);
  const [verifiedDate, setVerifiedDate] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    setHash(null);
    setStatus('idle');
    setTxid(null);
    setVerifiedDate(null);
  };

  const verifyDocument = async () => {
    if (!file) return;

    setStatus('verifying');

    try {
      // Hash the file using SHA-256
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      console.log('Document Hash:', hashHex);
      setHash(hashHex);

      // Call API to check if this hash exists in our records
      const response = await fetch(`/api/verify-hash?hash=${hashHex}`);
      const result = await response.json();

      if (result.valid) {
        setStatus('valid');
        setTxid(result.txid);
        setVerifiedDate(result.created_at || new Date().toISOString());
      } else {
        setStatus('invalid');
      }
    } catch (error) {
      console.error('Error verifying document:', error);
      setStatus('invalid');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 flex flex-col items-center justify-center p-8">
      <div className="bg-white shadow-xl rounded-2xl p-10 max-w-xl w-full text-center">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Verify Document Authenticity</h1>
        
        <CardDescription className="mb-8">
          Upload a document to verify if it has been securely vaulted and anchored to the blockchain.
        </CardDescription>

        <div className="mb-8">
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="mb-4 block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
          />

          <Button 
            onClick={verifyDocument}
            disabled={!file || status === 'verifying'}
            className="mt-4 w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {status === 'verifying' ? (
              <span className="flex items-center justify-center">
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                Verifying...
              </span>
            ) : (
              'Verify Document'
            )}
          </Button>
        </div>

        {status === 'valid' && (
          <div className="bg-green-50 p-6 rounded-xl border border-green-100">
            <div className="flex flex-col items-center text-green-600 mb-4">
              <CheckCircle className="h-16 w-16 mb-4" />
              <h2 className="text-2xl font-bold">Document Verified!</h2>
            </div>
            
            <p className="text-gray-700 mb-4">
              This document has been securely vaulted and its authenticity is verified on the Polygon blockchain.
            </p>
            
            {hash && (
              <div className="mb-3 text-left">
                <p className="text-sm font-medium text-gray-500">Document Hash:</p>
                <p className="text-xs bg-gray-50 p-2 rounded font-mono break-all">{hash}</p>
              </div>
            )}
            
            {txid && (
              <div className="mb-3 text-left">
                <p className="text-sm font-medium text-gray-500">Blockchain Transaction:</p>
                <div className="flex items-center">
                  <a
                    href={`https://polygonscan.com/tx/${txid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm flex items-center"
                  >
                    View on PolygonScan
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              </div>
            )}
            
            {verifiedDate && (
              <div className="text-left">
                <p className="text-sm font-medium text-gray-500">Vaulted On:</p>
                <p className="text-sm">{new Date(verifiedDate).toLocaleString()}</p>
              </div>
            )}
          </div>
        )}

        {status === 'invalid' && (
          <div className="bg-red-50 p-6 rounded-xl border border-red-100">
            <div className="flex flex-col items-center text-red-600 mb-4">
              <XCircle className="h-16 w-16 mb-4" />
              <h2 className="text-2xl font-bold">Document Not Verified</h2>
            </div>
            
            <p className="text-gray-700 mb-4">
              This document could not be verified in our system. It may not have been vaulted or may have been modified since it was vaulted.
            </p>
            
            {hash && (
              <div className="mb-3 text-left">
                <p className="text-sm font-medium text-gray-500">Document Hash:</p>
                <p className="text-xs bg-gray-50 p-2 rounded font-mono break-all">{hash}</p>
              </div>
            )}
            
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Not Verified</AlertTitle>
              <AlertDescription>
                No matching blockchain record found for this document.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </div>
  );
}
