// Script to create the signnow_connections table
const fs = require('fs');
const { execSync } = require('child_process');

// Read the SQL file
const sql = fs.readFileSync('./create-signnow-connections-table.sql', 'utf8');

// Write the SQL to a temporary file
fs.writeFileSync('./temp_signnow_table.sql', sql);

// Execute the SQL using the run-sql.js script
console.log('Creating signnow_connections table...');
try {
  execSync('node run-sql.js ./temp_signnow_table.sql', { stdio: 'inherit' });
  console.log('SignNow connections table created successfully!');
} catch (error) {
  console.error('Error creating SignNow connections table:', error);
} finally {
  // Clean up the temporary file
  fs.unlinkSync('./temp_signnow_table.sql');
}
