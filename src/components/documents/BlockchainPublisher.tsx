import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Wallet, Link, AlertTriangle, CheckCircle2, ExternalLink } from "lucide-react";
import { isMetaMaskInstalled, connectWallet, getCurrentWalletAddress, publishHashToBlockchain } from "@/lib/blockchainService";
import { createAuditLogEntry } from "@/lib/vaultService";
import { supabase } from "@/lib/supabase";

interface BlockchainPublisherProps {
  documentId: string;
  documentHash: string;
  existingTxid?: string;
  onSuccess?: (txid: string) => void;
}

export default function BlockchainPublisher({ 
  documentId, 
  documentHash, 
  existingTxid,
  onSuccess 
}: BlockchainPublisherProps) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [txid, setTxid] = useState<string | null>(existingTxid || null);
  const [error, setError] = useState<string | null>(null);
  const [networkName, setNetworkName] = useState<string>(import.meta.env.PROD ? "Polygon Mainnet" : "Polygon Mumbai");
  const [walletBalance, setWalletBalance] = useState<string | null>(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean>(false);
  const [showFaucetButton, setShowFaucetButton] = useState<boolean>(false);
  
  // Check if we already have a transaction ID
  useEffect(() => {
    if (existingTxid) {
      console.log("Found existing blockchain transaction ID:", existingTxid);
      setTxid(existingTxid);
    }
  }, [existingTxid]);
  
  // Check if wallet is already connected
  useEffect(() => {
    const checkWalletConnection = async () => {
      try {
        // If we already have a transaction ID, we don't need to connect the wallet
        if (existingTxid) {
          return;
        }
        
        const address = await getCurrentWalletAddress();
        setWalletAddress(address);
        
        if (address) {
          // Check wallet balance and network
          await checkWalletDetails(address);
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    };
    
    checkWalletConnection();
    
    // Listen for network changes
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('chainChanged', () => {
        // When the network changes, check wallet details again
        if (walletAddress) {
          checkWalletDetails(walletAddress);
        }
      });
    }
    
    return () => {
      // Clean up listeners
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeListener('chainChanged', () => {});
      }
    };
  }, [walletAddress]);
  
  // Check wallet balance and network
  const checkWalletDetails = async (address: string) => {
    try {
      if (!address) return;
      
      // Get provider
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Check balance using the improved checkWalletBalance function
      const { hasEnoughFunds, balance } = await import('@/lib/blockchainService')
        .then(module => module.checkWalletBalance(provider, address));
      
      setWalletBalance(balance);
      
      // Show warning if balance is too low
      if (!hasEnoughFunds) {
        setError("Your wallet doesn't have enough MATIC tokens. You need at least 0.01 MATIC to pay for gas fees.");
        
        // Check if we're on Mumbai testnet to show faucet button
        const network = await provider.getNetwork();
        const chainId = `0x${network.chainId.toString(16)}`;
        if (chainId === '0x13881') {
          setShowFaucetButton(true);
        }
      } else {
        // Clear error if balance is sufficient
        if (error && error.includes("enough MATIC")) {
          setError(null);
          setShowFaucetButton(false);
        }
      }
      
      // Check network
      const network = await provider.getNetwork();
      const chainId = `0x${network.chainId.toString(16)}`;
      
      // Set network name based on chain ID
      if (chainId === '0x89') {
        setNetworkName('Polygon Mainnet');
        setIsCorrectNetwork(import.meta.env.PROD);
      } else if (chainId === '0x13881') {
        setNetworkName('Polygon Mumbai');
        setIsCorrectNetwork(!import.meta.env.PROD);
      } else {
        setNetworkName(`Unknown (${chainId})`);
        setIsCorrectNetwork(false);
      }
    } catch (error) {
      console.error("Error checking wallet details:", error);
    }
  };
  
  // Handle wallet connection
  const handleConnectWallet = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      
      if (!isMetaMaskInstalled()) {
        setError("MetaMask is not installed. Please install MetaMask to continue.");
        return;
      }
      
      const address = await connectWallet();
      setWalletAddress(address);
    } catch (error: any) {
      setError(error.message || "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };
  
  // Handle publishing document hash to blockchain
  const handlePublishToBlockchain = async () => {
    try {
      setIsPublishing(true);
      setError(null);
      
      if (!walletAddress) {
        await handleConnectWallet();
        if (!walletAddress) {
          throw new Error("Wallet not connected");
        }
      }
      
      if (!documentHash) {
        throw new Error("Document hash is required");
      }
      
      try {
        // Publish hash to blockchain
        const transactionId = await publishHashToBlockchain(documentHash);
        setTxid(transactionId);
        
        // Update document with blockchain transaction ID
        const { error: updateError } = await supabase
          .from('documents')
          .update({ blockchain_txid: transactionId })
          .eq('id', documentId);
          
        if (updateError) {
          console.error("Error updating document:", updateError);
        }
        
        // Create audit log entry
        await createAuditLogEntry(documentId, 'blockchain_anchored', walletAddress, {
          blockchain: 'polygon',
          txid: transactionId,
          document_hash: documentHash,
          wallet_address: walletAddress
        });
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess(transactionId);
        }
      } catch (txError: any) {
        // Handle specific blockchain errors
        if (txError.code === 'INSUFFICIENT_FUNDS') {
          setError(
            "Your wallet doesn't have enough MATIC tokens to pay for gas fees. " +
            "Please add MATIC to your wallet and try again."
          );
          
          // Check if we're on Mumbai testnet
          const network = await (new ethers.BrowserProvider(window.ethereum)).getNetwork();
          const chainId = `0x${network.chainId.toString(16)}`;
          if (chainId === '0x13881') {
            setShowFaucetButton(true);
          }
        } else if (txError.message && txError.message.includes("user rejected")) {
          setError("Transaction was rejected. Please try again and approve the transaction in your wallet.");
        } else {
          setError(txError.message || "Failed to publish to blockchain");
        }
        console.error("❌ Failed to publish hash to blockchain:", txError);
      }
    } catch (error: any) {
      setError(error.message || "Failed to connect wallet or prepare transaction");
    } finally {
      setIsPublishing(false);
    }
  };
  
  // Format wallet address for display
  const formatWalletAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Get explorer URL for transaction
  const getExplorerUrl = (txid: string) => {
    return `https://polygonscan.com/tx/${txid}`;
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Blockchain Anchoring
        </CardTitle>
        <CardDescription>
          Permanently anchor document hash to the Polygon blockchain
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Wallet Connection Status */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Wallet Status:</span>
          {walletAddress ? (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Connected
              </Badge>
              <span className="text-sm font-mono">{formatWalletAddress(walletAddress)}</span>
            </div>
          ) : (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Not Connected
            </Badge>
          )}
        </div>
        
        {/* Network Information */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Network:</span>
          <Badge 
            className={`${
              isCorrectNetwork 
                ? "bg-green-100 text-green-800 hover:bg-green-200" 
                : "bg-amber-100 text-amber-800 hover:bg-amber-200"
            }`}
          >
            {networkName}
            {!isCorrectNetwork && walletAddress && (
              <AlertTriangle className="h-3 w-3 ml-1" />
            )}
          </Badge>
        </div>
        
        {/* Wallet Balance */}
        {walletAddress && walletBalance && (
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Balance:</span>
            <span className="text-sm font-mono">
              {parseFloat(walletBalance).toFixed(6)} MATIC
            </span>
          </div>
        )}
        
        {/* Document Hash Preview */}
        <div className="space-y-1">
          <span className="text-sm font-medium">Document Hash:</span>
          <div className="p-2 bg-gray-50 rounded border text-xs font-mono break-all">
            {documentHash}
          </div>
        </div>
        
        {/* Transaction Status */}
        {txid && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Transaction ID:</span>
              <a 
                href={getExplorerUrl(txid)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm flex items-center"
              >
                View on Explorer
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
            <div className="p-2 bg-gray-50 rounded border text-xs font-mono break-all">
              {txid}
            </div>
            
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700 text-sm">
                Document hash has been permanently anchored to the blockchain
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        {/* Network Warning */}
        {walletAddress && !isCorrectNetwork && (
          <Alert className="bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700 text-sm flex justify-between items-center">
              <span>
                You are connected to {networkName}. Please switch to {import.meta.env.PROD ? "Polygon Mainnet" : "Polygon Mumbai Testnet"} to continue.
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-2 h-7 bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200"
                onClick={() => {
                  if (window.ethereum) {
                    window.ethereum.request({
                      method: 'wallet_switchEthereumChain',
                      params: [{ chainId: import.meta.env.PROD ? '0x89' : '0x13881' }]
                    }).catch(console.error);
                  }
                }}
              >
                Switch Network
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        {/* Error Message */}
        {error && (
          <Alert className="bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700 text-sm">
              {error}
              
              {/* Faucet Button for Mumbai Testnet */}
              {showFaucetButton && (
                <div className="mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200"
                    onClick={() => window.open('https://mumbaifaucet.com/', '_blank')}
                  >
                    Get Test MATIC from Faucet
                  </Button>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Progress Indicator */}
        {(isConnecting || isPublishing) && (
          <div className="space-y-2">
            <Progress value={50} className="h-1" />
            <p className="text-xs text-center text-muted-foreground">
              {isConnecting ? "Connecting to wallet..." : "Publishing to blockchain..."}
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-end gap-2">
        {!walletAddress && (
          <Button 
            variant="outline" 
            onClick={handleConnectWallet}
            disabled={isConnecting}
          >
            <Wallet className="h-4 w-4 mr-2" />
            Connect Wallet
          </Button>
        )}
        
        {!txid && (
          <Button 
            onClick={handlePublishToBlockchain}
            disabled={isPublishing || (!walletAddress && isConnecting)}
          >
            <Link className="h-4 w-4 mr-2" />
            {walletAddress ? "Publish to Blockchain" : "Connect & Publish"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
