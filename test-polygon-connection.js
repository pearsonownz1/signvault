import { ethers } from 'ethers';

/**
 * Simple script to test connection to Polygon networks
 * This script tries multiple RPC endpoints to find one that works
 */

// List of public RPC endpoints to try
const rpcEndpoints = {
  mumbai: [
    'https://polygon-testnet.public.blastapi.io',
    'https://polygon-mumbai-bor.publicnode.com',
    'https://polygon-mumbai.blockpi.network/v1/rpc/public',
    'https://rpc-mumbai.maticvigil.com',
    'https://polygon-mumbai.g.alchemy.com/v2/demo'
  ],
  mainnet: [
    'https://polygon-rpc.com',
    'https://polygon-bor.publicnode.com',
    'https://polygon.blockpi.network/v1/rpc/public',
    'https://polygon.g.alchemy.com/v2/demo',
    'https://polygon.llamarpc.com'
  ]
};

// Test connection to a specific endpoint
async function testEndpoint(url, networkName) {
  try {
    console.log(`Testing connection to ${networkName} via ${url}...`);
    
    const provider = new ethers.JsonRpcProvider(url);
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();
    
    console.log(`✅ Successfully connected to ${networkName}!`);
    console.log(`Network Name: ${network.name}`);
    console.log(`Chain ID: ${network.chainId}`);
    console.log(`Latest Block: ${blockNumber}`);
    
    return {
      success: true,
      url,
      networkName,
      chainId: network.chainId,
      blockNumber
    };
  } catch (error) {
    console.log(`❌ Failed to connect to ${url}: ${error.message}`);
    return {
      success: false,
      url,
      error: error.message
    };
  }
}

// Test all endpoints for a network
async function testNetwork(networkName) {
  console.log(`\n🔍 Testing ${networkName} endpoints...\n`);
  
  const endpoints = rpcEndpoints[networkName];
  const results = [];
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint, networkName);
    results.push(result);
    
    if (result.success) {
      console.log(`\n✅ Found working ${networkName} endpoint: ${endpoint}\n`);
      break;
    }
  }
  
  const successfulConnections = results.filter(r => r.success);
  
  if (successfulConnections.length === 0) {
    console.log(`\n❌ Could not connect to any ${networkName} endpoints. Please check your internet connection.\n`);
  }
  
  return {
    networkName,
    results,
    success: successfulConnections.length > 0
  };
}

// Main function to test all networks
async function testAllNetworks() {
  console.log('🌐 Testing Polygon Network Connectivity\n');
  
  try {
    // Test Mumbai Testnet
    const mumbaiResults = await testNetwork('mumbai');
    
    // Test Polygon Mainnet
    const mainnetResults = await testNetwork('mainnet');
    
    // Summary
    console.log('\n📊 Connection Test Summary:');
    console.log(`Mumbai Testnet: ${mumbaiResults.success ? '✅ Connected' : '❌ Failed'}`);
    console.log(`Polygon Mainnet: ${mainnetResults.success ? '✅ Connected' : '❌ Failed'}`);
    
    if (mumbaiResults.success || mainnetResults.success) {
      console.log('\n✅ Your system can connect to the Polygon blockchain!');
      
      // Provide the working endpoints
      console.log('\nWorking endpoints:');
      if (mumbaiResults.success) {
        const workingMumbai = mumbaiResults.results.find(r => r.success);
        console.log(`Mumbai: ${workingMumbai.url}`);
      }
      if (mainnetResults.success) {
        const workingMainnet = mainnetResults.results.find(r => r.success);
        console.log(`Mainnet: ${workingMainnet.url}`);
      }
    } else {
      console.log('\n❌ Could not connect to any Polygon networks.');
      console.log('Please check your internet connection or firewall settings.');
    }
  } catch (error) {
    console.error('An unexpected error occurred:', error);
  }
}

// Run the tests
testAllNetworks();
