import { ethers } from 'ethers';

/**
 * Blockchain service for interacting with Polygon network
 * Handles wallet connection, transaction signing, and blockchain anchoring
 */

// Polygon network configuration
const POLYGON_MAINNET = {
  chainId: '0x89', // 137 in decimal
  chainName: 'Polygon Mainnet',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18
  },
  rpcUrls: [
    'https://polygon-rpc.com/',
    'https://polygon-bor.publicnode.com',
    'https://polygon.blockpi.network/v1/rpc/public'
  ],
  blockExplorerUrls: ['https://polygonscan.com/']
};

const POLYGON_MUMBAI = {
  chainId: '0x13881', // 80001 in decimal
  chainName: 'Polygon Mumbai Testnet',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18
  },
  rpcUrls: [
    'https://polygon-testnet.public.blastapi.io',
    'https://polygon-mumbai-bor.publicnode.com',
    'https://polygon-mumbai.blockpi.network/v1/rpc/public'
  ],
  blockExplorerUrls: ['https://mumbai.polygonscan.com/']
};

// Use testnet for development, mainnet for production
const NETWORK = import.meta.env.PROD ? POLYGON_MAINNET : POLYGON_MUMBAI;

/**
 * Check if MetaMask is installed
 * @returns {boolean} Whether MetaMask is installed
 */
export const isMetaMaskInstalled = (): boolean => {
  return window.ethereum !== undefined;
};

/**
 * Connect to MetaMask wallet
 * @returns {Promise<string>} Connected wallet address
 */
export const connectWallet = async (): Promise<string> => {
  try {
    if (!isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed');
    }
    
    // Request account access
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    if (accounts.length === 0) {
      throw new Error('No accounts found');
    }
    
    // Switch to Polygon network
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: NETWORK.chainId }]
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [NETWORK]
          });
        } catch (addError) {
          throw new Error('Failed to add Polygon network to MetaMask');
        }
      } else {
        throw new Error('Failed to switch to Polygon network');
      }
    }
    
    return accounts[0];
  } catch (error) {
    console.error('Error connecting to wallet:', error);
    throw error;
  }
};

/**
 * Get the current wallet address
 * @returns {Promise<string|null>} Current wallet address or null if not connected
 */
export const getCurrentWalletAddress = async (): Promise<string | null> => {
  try {
    if (!isMetaMaskInstalled()) {
      return null;
    }
    
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    
    if (accounts.length === 0) {
      return null;
    }
    
    return accounts[0];
  } catch (error) {
    console.error('Error getting wallet address:', error);
    return null;
  }
};

/**
 * Get a signer for transactions
 * @returns {Promise<ethers.Signer>} Signer for transactions
 */
export const getSigner = async (): Promise<ethers.Signer> => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  return provider.getSigner();
};

/**
 * Check if a wallet has sufficient MATIC for a transaction
 * @param {ethers.Provider} provider - The Ethereum provider
 * @param {string} walletAddress - The wallet address to check
 * @param {bigint} estimatedGasCost - The estimated gas cost in wei
 * @returns {Promise<boolean>} Whether the wallet has sufficient funds
 */
export const checkWalletBalance = async (
  provider: ethers.Provider,
  walletAddress: string,
  estimatedGasCost?: bigint
): Promise<{ hasEnoughFunds: boolean; balance: string; requiredAmount?: string }> => {
  try {
    // Get wallet balance
    const balance = await provider.getBalance(walletAddress);
    const balanceInMatic = ethers.formatEther(balance);
    console.log(`MATIC Balance: ${balanceInMatic}`);
    
    // If we have an estimated gas cost, check if balance is sufficient
    if (estimatedGasCost) {
      const requiredAmountInMatic = ethers.formatEther(estimatedGasCost);
      console.log(`Required MATIC: ${requiredAmountInMatic}`);
      
      if (balance < estimatedGasCost) {
        return { 
          hasEnoughFunds: false, 
          balance: balanceInMatic,
          requiredAmount: requiredAmountInMatic
        };
      }
    } else {
      // If no estimated gas cost provided, check if balance is at least 0.01 MATIC
      const minBalance = ethers.parseEther("0.01");
      if (balance < minBalance) {
        return { 
          hasEnoughFunds: false, 
          balance: balanceInMatic,
          requiredAmount: "0.01"
        };
      }
    }
    
    return { hasEnoughFunds: true, balance: balanceInMatic };
  } catch (error) {
    console.error('Error checking wallet balance:', error);
    throw error;
  }
};

/**
 * Publish a document hash to the blockchain
 * @param {string} documentHash - The document hash to publish
 * @returns {Promise<string>} Transaction ID
 */
export const publishHashToBlockchain = async (documentHash: string): Promise<string> => {
  try {
    console.log('⛓️ Publishing hash to Polygon blockchain...');
    
    // Connect wallet if not already connected
    const walletAddress = await getCurrentWalletAddress();
    
    if (!walletAddress) {
      await connectWallet();
    }
    
    // Get provider
    const provider = new ethers.BrowserProvider(window.ethereum);
    
    // Check if we're on the correct network
    const network = await provider.getNetwork();
    const chainId = `0x${network.chainId.toString(16)}`;
    
    if (chainId !== NETWORK.chainId) {
      console.log(`Switching from chain ${chainId} to ${NETWORK.chainId}`);
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: NETWORK.chainId }]
        });
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [NETWORK]
            });
          } catch (addError) {
            throw new Error('Failed to add Polygon network to MetaMask');
          }
        } else {
          throw new Error('Failed to switch to Polygon network');
        }
      }
      
      // Reload the page after network switch to ensure everything is in sync
      window.location.reload();
      return ''; // This will never be reached due to the reload
    }
    
    // Get signer after ensuring we're on the correct network
    const signer = await getSigner();
    
    // Prepare transaction
    const txRequest = {
      to: '0x0000000000000000000000000000000000000000', // "burn" address
      value: 0n, // 0 MATIC
      data: `0x${documentHash}`, // Add document hash as data
    };
    
    // Estimate gas
    let gasLimit: bigint;
    let gasCost: bigint;
    
    try {
      // Estimate gas for the transaction
      const gasEstimate = await provider.estimateGas({
        ...txRequest,
        from: walletAddress
      });
      
      // Add 20% buffer to gas estimate
      gasLimit = gasEstimate * 120n / 100n;
      console.log(`Estimated gas: ${gasEstimate.toString()}, with buffer: ${gasLimit.toString()}`);
      
      // Get current gas price
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice || ethers.parseUnits("50", "gwei"); // Fallback gas price
      
      // Calculate total gas cost
      gasCost = gasLimit * gasPrice;
      console.log(`Gas price: ${ethers.formatUnits(gasPrice, "gwei")} gwei`);
      console.log(`Estimated gas cost: ${ethers.formatEther(gasCost)} MATIC`);
      
      // Check if wallet has enough MATIC
      const balanceCheck = await checkWalletBalance(provider, walletAddress, gasCost);
      
      if (!balanceCheck.hasEnoughFunds) {
        throw new Error(`Insufficient funds for gas. Need at least ${balanceCheck.requiredAmount} MATIC, but have ${balanceCheck.balance} MATIC`);
      }
    } catch (gasError) {
      console.error('Error estimating gas:', gasError);
      
      // If we can't estimate gas, check if wallet has minimum balance
      const balanceCheck = await checkWalletBalance(provider, walletAddress);
      
      if (!balanceCheck.hasEnoughFunds) {
        throw new Error(`Insufficient funds. Need at least 0.01 MATIC, but have ${balanceCheck.balance} MATIC`);
      }
      
      // Use a safe default gas limit
      gasLimit = 100000n;
      console.log(`Using default gas limit: ${gasLimit.toString()}`);
    }
    
    // Send transaction with gas limit
    const tx = await signer.sendTransaction({
      ...txRequest,
      gasLimit
    });
    
    console.log('🔗 Transaction sent! Hash:', tx.hash);
    console.log('⛓️ Document hash anchored to Polygon blockchain');
    
    // Wait for transaction confirmation
    console.log('⏳ Waiting for transaction confirmation...');
    const receipt = await tx.wait();
    console.log('✅ Transaction confirmed in block:', receipt?.blockNumber);
    
    return tx.hash;
  } catch (error) {
    console.error('❌ Failed to publish hash to blockchain:', error);
    throw error;
  }
};

/**
 * Verify a document hash on the blockchain
 * @param {string} txid - Transaction ID to verify
 * @param {string} documentHash - Document hash to verify
 * @returns {Promise<boolean>} Whether the hash matches
 */
export const verifyHashOnBlockchain = async (txid: string, documentHash: string): Promise<boolean> => {
  try {
    if (!txid) {
      throw new Error('Transaction ID is required');
    }
    
    if (!documentHash) {
      throw new Error('Document hash is required');
    }
    
    // Connect to Polygon network
    const provider = new ethers.JsonRpcProvider(NETWORK.rpcUrls[0]);
    
    // Get transaction
    const tx = await provider.getTransaction(txid);
    
    if (!tx) {
      throw new Error('Transaction not found');
    }
    
    // Check if the transaction data contains the document hash
    const txData = tx.data.toLowerCase();
    const hashToCheck = `0x${documentHash.toLowerCase()}`;
    
    return txData.includes(documentHash.toLowerCase());
  } catch (error) {
    console.error('Error verifying hash on blockchain:', error);
    throw error;
  }
};

// Add MetaMask event listeners
if (typeof window !== 'undefined' && window.ethereum) {
  window.ethereum.on('accountsChanged', (accounts: string[]) => {
    console.log('MetaMask account changed:', accounts[0]);
    // You can dispatch an event or update state here
  });
  
  window.ethereum.on('chainChanged', (chainId: string) => {
    console.log('MetaMask chain changed:', chainId);
    // Reload the page when the chain changes
    window.location.reload();
  });
}

// Add TypeScript interface for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
