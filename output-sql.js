/**
 * This script outputs the SQL commands from the blockchain-txid-column.sql file
 * so you can copy and paste them into the Supabase SQL Editor manually.
 * 
 * Usage:
 * 1. Run this script with: node output-sql.js
 * 2. Copy the output and paste it into the Supabase SQL Editor
 */

import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the SQL file
const sqlFile = 'create-blockchain-txid-column.sql';
try {
  const sqlContent = fs.readFileSync(sqlFile, 'utf8');
  
  console.log('\n=== SQL Commands for Blockchain Anchoring ===\n');
  console.log(sqlContent);
  console.log('\n=== End of SQL Commands ===\n');
  console.log('Copy the SQL commands above and paste them into the Supabase SQL Editor.');
  console.log('Then click "Run" to execute the commands and set up the blockchain anchoring feature.');
} catch (error) {
  console.error(`Error reading ${sqlFile}:`, error.message);
}
