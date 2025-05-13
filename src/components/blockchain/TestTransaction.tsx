import { useState } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Wallet, Link, AlertTriangle, CheckCircle2, ExternalLink } from "lucide-react";

export default function TestTransaction() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [txid, setTxid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [networkName, setNetworkName] = useState<string>("");
  const [walletBalance, setWalletBalance] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };
  
  // Connect to wallet
  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      addLog("Connecting to wallet...");
      
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed");
      }
      
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts.length === 0) {
        throw new Error("No accounts found");
      }
      
      const address = accounts[0];
      setWalletAddress(address);
      addLog(`Connected to wallet: ${address}`);
      
      // Get provider
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Check network
      const network = await provider.getNetwork();
      const chainId = network.chainId;
      setNetworkName(`${network.name} (Chain ID: ${chainId})`);
      addLog(`Connected to network: ${network.name} (Chain ID: ${chainId})`);
      
      // Check if we're on Polygon
      const isPolygon = chainId === 137n || chainId === 80001n;
      if (!isPolygon) {
        addLog("⚠️ Not connected to Polygon network. Please switch to Polygon Mainnet or Mumbai Testnet.");
      }
      
      // Check balance
      const balance = await provider.getBalance(address);
      const balanceInMatic = ethers.formatEther(balance);
      setWalletBalance(balanceInMatic);
      addLog(`Wallet balance: ${balanceInMatic} MATIC`);
      
    } catch (error: any) {
      setError(error.message || "Failed to connect wallet");
      addLog(`Error: ${error.message}`);
    } finally {
      setIsConnecting(false);
    }
  };
  
  // Send test transaction
  const sendTestTransaction = async () => {
    try {
      setIsSending(true);
      setError(null);
      addLog("Preparing test transaction...");
      
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }
      
      // Get provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Prepare transaction
      const txRequest = {
        to: walletAddress, // Send to yourself
        value: ethers.parseEther('0.0001'), // Very small amount
        gasLimit: 21000, // Standard for simple transfers
      };
      
      // Estimate gas
      try {
        const gasEstimate = await provider.estimateGas({
          ...txRequest,
          from: walletAddress
        });
        
        addLog(`Estimated gas: ${gasEstimate.toString()}`);
        
        // Get current gas price
        const feeData = await provider.getFeeData();
        const gasPrice = feeData.gasPrice || ethers.parseUnits('50', 'gwei');
        
        // Calculate total gas cost
        const gasCost = gasEstimate * gasPrice;
        addLog(`Gas price: ${ethers.formatUnits(gasPrice, 'gwei')} gwei`);
        addLog(`Estimated gas cost: ${ethers.formatEther(gasCost)} MATIC`);
        
        // Check if we have enough balance for gas
        const balance = await provider.getBalance(walletAddress);
        if (balance < gasCost + txRequest.value) {
          throw new Error(`Insufficient funds for gas. Need at least ${ethers.formatEther(gasCost + txRequest.value)} MATIC, but have ${ethers.formatEther(balance)} MATIC`);
        }
      } catch (gasError: any) {
        addLog(`Error estimating gas: ${gasError.message}`);
        throw gasError;
      }
      
      // Send transaction
      addLog('📦 Sending test transaction...');
      const tx = await signer.sendTransaction(txRequest);
      
      setTxid(tx.hash);
      addLog(`🔗 Transaction sent! Hash: ${tx.hash}`);
      
      // Wait for transaction confirmation
      addLog('⏳ Waiting for transaction confirmation...');
      const receipt = await tx.wait();
      addLog(`✅ Transaction confirmed in block: ${receipt?.blockNumber}`);
      
    } catch (error: any) {
      setError(error.message || "Failed to send transaction");
      addLog(`Error: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };
  
  // Get explorer URL for transaction
  const getExplorerUrl = (txid: string) => {
    // Check if we're on Mumbai testnet
    if (networkName.toLowerCase().includes('mumbai')) {
      return `https://mumbai.polygonscan.com/tx/${txid}`;
    }
    return `https://polygonscan.com/tx/${txid}`;
  };
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Blockchain Test Transaction
        </CardTitle>
        <CardDescription>
          Test your blockchain connectivity by sending a minimal transaction to yourself
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
              <span className="text-sm font-mono">{walletAddress}</span>
            </div>
          ) : (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Not Connected
            </Badge>
          )}
        </div>
        
        {/* Network Information */}
        {networkName && (
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Network:</span>
            <Badge>
              {networkName}
            </Badge>
          </div>
        )}
        
        {/* Wallet Balance */}
        {walletAddress && walletBalance && (
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Balance:</span>
            <span className="text-sm font-mono">
              {parseFloat(walletBalance).toFixed(6)} MATIC
            </span>
          </div>
        )}
        
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
                Test transaction completed successfully
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <Alert className="bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700 text-sm">
              {error}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Progress Indicator */}
        {(isConnecting || isSending) && (
          <div className="space-y-2">
            <Progress value={50} className="h-1" />
            <p className="text-xs text-center text-muted-foreground">
              {isConnecting ? "Connecting to wallet..." : "Sending transaction..."}
            </p>
          </div>
        )}
        
        {/* Logs */}
        <div className="space-y-1">
          <span className="text-sm font-medium">Logs:</span>
          <div className="p-2 bg-gray-50 rounded border text-xs font-mono h-40 overflow-y-auto">
            {logs.length === 0 ? (
              <span className="text-gray-400">No logs yet...</span>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="py-0.5">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end gap-2">
        {!walletAddress && (
          <Button 
            variant="outline" 
            onClick={connectWallet}
            disabled={isConnecting}
          >
            <Wallet className="h-4 w-4 mr-2" />
            Connect Wallet
          </Button>
        )}
        
        {walletAddress && (
          <Button 
            onClick={sendTestTransaction}
            disabled={isSending}
          >
            <Link className="h-4 w-4 mr-2" />
            Send Test Transaction
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
