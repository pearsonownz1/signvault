/**
 * This script helps you run all the SQL scripts to set up the necessary database tables
 * for the DocuSign integration.
 * 
 * Usage:
 * 1. Make sure you have the Supabase CLI installed
 * 2. Run this script with: node create-tables.js
 */

import fs from 'fs';
import { execSync } from 'child_process';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// List of SQL scripts to run
const sqlScripts = [
  'create-audit-logs-table.sql',
  'create-storage-bucket.sql',
  'create-docusign-connections-table.sql',
  'create-oauth-states-table.sql',
  'create-blockchain-txid-column.sql'
];

// Function to run a SQL script
function runSqlScript(scriptPath) {
  console.log(`Running SQL script: ${scriptPath}`);
  
  try {
    // Read the SQL script
    const sqlContent = fs.readFileSync(scriptPath, 'utf8');
    
    // Display the SQL content
    console.log('\n--- SQL Script Content ---');
    console.log(sqlContent);
    console.log('-------------------------\n');
    
    // Ask for confirmation
    return new Promise((resolve) => {
      rl.question(`Do you want to run this script? (y/n): `, (answer) => {
        if (answer.toLowerCase() === 'y') {
          try {
            // Write the SQL to a temporary file
            const tempFile = `temp_${Date.now()}.sql`;
            fs.writeFileSync(tempFile, sqlContent);
            
            // Run the SQL script using Supabase CLI
            console.log('Executing SQL script...');
            execSync(`supabase db execute --file ${tempFile}`, { stdio: 'inherit' });
            
            // Clean up the temporary file
            fs.unlinkSync(tempFile);
            
            console.log(`✅ Successfully executed ${scriptPath}`);
            resolve(true);
          } catch (error) {
            console.error(`❌ Error executing ${scriptPath}:`, error.message);
            resolve(false);
          }
        } else {
          console.log(`Skipped ${scriptPath}`);
          resolve(false);
        }
      });
    });
  } catch (error) {
    console.error(`❌ Error reading ${scriptPath}:`, error.message);
    return Promise.resolve(false);
  }
}

// Main function to run all SQL scripts
async function main() {
  console.log('=== DocuSign Integration Database Setup ===\n');
  console.log('This script will help you set up the necessary database tables for the DocuSign integration.\n');
  
  // Check if Supabase CLI is installed
  try {
    execSync('supabase --version', { stdio: 'ignore' });
  } catch (error) {
    console.error('❌ Supabase CLI is not installed. Please install it first:');
    console.error('npm install -g supabase');
    rl.close();
    return;
  }
  
  // Run each SQL script
  for (const script of sqlScripts) {
    await runSqlScript(script);
    console.log(''); // Add a blank line for readability
  }
  
  console.log('\n=== Database Setup Complete ===');
  console.log('You can now use the DocuSign integration with SignVault.');
  
  rl.close();
}

// Run the main function
main().catch(error => {
  console.error('Unexpected error:', error);
  rl.close();
});
