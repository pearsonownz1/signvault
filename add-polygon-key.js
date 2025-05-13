/**
 * This script helps you add the Polygon API key to your environment variables
 * 
 * Usage:
 * 1. Run this script with: node add-polygon-key.js
 * 2. Follow the prompts to add the key to your .env file
 */

import fs from 'fs';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Default Polygon API key from the task
const DEFAULT_POLYGON_API_KEY = 'BB1CI8RDV9Z73AQRTDZ1VZ7WU6J9H4H54C';

// Function to add the Polygon API key to .env file
async function addPolygonKeyToEnv() {
  console.log('=== Add Polygon API Key to Environment Variables ===\n');
  
  // Check if .env file exists
  const envExists = fs.existsSync('.env');
  
  if (!envExists) {
    console.log('❌ .env file not found. Creating a new one...');
    
    // If .env.example exists, copy it
    if (fs.existsSync('.env.example')) {
      fs.copyFileSync('.env.example', '.env');
      console.log('✅ Created .env file from .env.example');
    } else {
      // Create an empty .env file
      fs.writeFileSync('.env', '');
      console.log('✅ Created empty .env file');
    }
  }
  
  // Read the current .env file
  const envContent = fs.readFileSync('.env', 'utf8');
  
  // Check if POLYGON_API_KEY already exists
  if (envContent.includes('POLYGON_API_KEY=')) {
    console.log('⚠️ POLYGON_API_KEY already exists in .env file.');
    
    const answer = await new Promise((resolve) => {
      rl.question('Do you want to update it? (y/n): ', resolve);
    });
    
    if (answer.toLowerCase() !== 'y') {
      console.log('Skipped updating POLYGON_API_KEY');
      return;
    }
  }
  
  // Ask for the Polygon API key
  const apiKey = await new Promise((resolve) => {
    rl.question(`Enter your Polygon API key (press Enter to use default: ${DEFAULT_POLYGON_API_KEY}): `, (answer) => {
      resolve(answer || DEFAULT_POLYGON_API_KEY);
    });
  });
  
  // Generate a random private key for testing if needed
  let privateKey = '';
  const generatePrivateKey = await new Promise((resolve) => {
    rl.question('Do you want to generate a random private key for testing? (y/n): ', resolve);
  });
  
  if (generatePrivateKey.toLowerCase() === 'y') {
    // Generate a random 64-character hex string
    privateKey = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    console.log(`\nGenerated private key: ${privateKey}\n`);
    console.log('⚠️ WARNING: This is a randomly generated key for testing only.');
    console.log('⚠️ Do NOT use this for production or with real funds!\n');
  } else {
    privateKey = await new Promise((resolve) => {
      rl.question('Enter your Polygon wallet private key (without 0x prefix): ', resolve);
    });
  }
  
  // Add the keys to the .env file
  let newEnvContent = envContent;
  
  // Update or add POLYGON_API_KEY
  if (newEnvContent.includes('POLYGON_API_KEY=')) {
    newEnvContent = newEnvContent.replace(/POLYGON_API_KEY=.*$/m, `POLYGON_API_KEY=${apiKey}`);
  } else {
    newEnvContent += `\n# Polygon configuration\nPOLYGON_API_KEY=${apiKey}\n`;
  }
  
  // Update or add POLYGON_PRIVATE_KEY
  if (newEnvContent.includes('POLYGON_PRIVATE_KEY=')) {
    newEnvContent = newEnvContent.replace(/POLYGON_PRIVATE_KEY=.*$/m, `POLYGON_PRIVATE_KEY=${privateKey}`);
  } else {
    newEnvContent += `POLYGON_PRIVATE_KEY=${privateKey}\n`;
  }
  
  // Write the updated content back to the .env file
  fs.writeFileSync('.env', newEnvContent);
  
  console.log('\n✅ Successfully added Polygon configuration to .env file.');
  console.log('✅ You can now use the blockchain anchoring feature.');
  
  rl.close();
}

// Run the main function
addPolygonKeyToEnv().catch(error => {
  console.error('Unexpected error:', error);
  rl.close();
});
