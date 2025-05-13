// Script to create all SignNow-related tables
import fs from 'fs';
import { execSync } from 'child_process';

// Read the SQL files
const connectionsSql = fs.readFileSync('./create-signnow-connections-table.sql', 'utf8');
const webhookEventsSql = fs.readFileSync('./create-signnow-webhook-events-table.sql', 'utf8');

// Combine the SQL statements
const combinedSql = connectionsSql + '\n\n' + webhookEventsSql;

// Write the combined SQL to a temporary file
fs.writeFileSync('./temp_signnow_tables.sql', combinedSql);

// Execute the SQL using the run-sql-file.js script
console.log('Creating SignNow tables...');
try {
  execSync('node run-sql-file.js ./temp_signnow_tables.sql', { stdio: 'inherit' });
  console.log('SignNow tables created successfully!');
} catch (error) {
  console.error('Error creating SignNow tables:', error);
} finally {
  // Clean up the temporary file
  fs.unlinkSync('./temp_signnow_tables.sql');
}
