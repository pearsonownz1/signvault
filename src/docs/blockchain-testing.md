# Blockchain Integration Testing Guide

This guide explains how to test the blockchain integration in SignVault to ensure proper functionality of document anchoring to the Polygon blockchain.

## Overview

SignVault uses the Polygon blockchain to anchor document hashes, providing an immutable record of document existence and integrity. The blockchain integration consists of:

1. Client-side integration with MetaMask wallet
2. Gas estimation and transaction management
3. Transaction confirmation and verification
4. Error handling and user feedback

## Testing Tools

We've created two testing tools to verify the blockchain integration:

### 1. Browser-Based Test Component

The browser-based test component provides a UI for testing blockchain connectivity and transactions directly in the application.

**Access URL:** `/test-blockchain`

This component allows you to:
- Connect to MetaMask
- Check wallet balance and network
- Send a minimal test transaction to yourself
- View detailed logs of the process
- See transaction confirmation

### 2. Node.js Test Script

For server-side or command-line testing, we've created a Node.js script that can be run locally.

**File:** `test-blockchain-transaction.js`

To use this script:

```bash
# Install dependencies
npm install ethers

# Run with your private key (for Node.js environment)
node test-blockchain-transaction.js YOUR_PRIVATE_KEY

# Or run without arguments in a browser environment
node test-blockchain-transaction.js
```

## Testing Process

### 1. Verify Wallet Connection

- Ensure MetaMask is installed and unlocked
- Connect your wallet to the application
- Verify the correct network is selected (Polygon Mainnet for production, Mumbai Testnet for development)

### 2. Check Wallet Balance

- Ensure your wallet has sufficient MATIC for gas fees
- For Mumbai Testnet, you can get test MATIC from the [Mumbai Faucet](https://mumbaifaucet.com/)
- For Mainnet, you'll need real MATIC (at least 0.01 MATIC recommended)

### 3. Test Transaction

- Send a minimal test transaction (0.0001 MATIC) to yourself
- Monitor the gas estimation process
- Verify transaction submission
- Confirm transaction is included in a block

### 4. Check Error Handling

Test various error scenarios:
- Insufficient balance
- Network disconnection
- User rejection of transaction
- Gas estimation failures

## Common Issues and Solutions

### Insufficient Funds

**Symptom:** Transaction fails with "insufficient funds" error

**Solution:**
- For Mumbai Testnet: Get test MATIC from the [Mumbai Faucet](https://mumbaifaucet.com/)
- For Mainnet: Add MATIC to your wallet through an exchange or bridge

### Wrong Network

**Symptom:** Wallet is connected to the wrong network

**Solution:**
- Use the "Switch Network" button to switch to the correct network
- Ensure your MetaMask has the Polygon network configured correctly

### Gas Estimation Failures

**Symptom:** Transaction fails during gas estimation

**Solution:**
- Check if the RPC endpoint is responsive
- Try using a different RPC URL
- Verify your transaction parameters are valid

### Transaction Stuck Pending

**Symptom:** Transaction is submitted but remains pending for a long time

**Solution:**
- Check the network status for congestion
- Consider submitting a new transaction with higher gas price
- For testing purposes, you can reset your MetaMask account to clear pending transactions

## Production Deployment Checklist

Before deploying to production:

1. ✅ Verify blockchain integration works on Polygon Mainnet
2. ✅ Ensure gas estimation includes sufficient buffer (20% recommended)
3. ✅ Implement proper error handling and user feedback
4. ✅ Test with real MATIC on Mainnet
5. ✅ Verify transaction confirmation and receipt handling
6. ✅ Check balance requirements are clearly communicated to users

## Resources

- [Polygon Documentation](https://wiki.polygon.technology/)
- [MetaMask Documentation](https://docs.metamask.io/)
- [Ethers.js Documentation](https://docs.ethers.org/v6/)
- [Polygon Gas Station](https://polygonscan.com/gastracker)
- [Mumbai Faucet](https://mumbaifaucet.com/)
