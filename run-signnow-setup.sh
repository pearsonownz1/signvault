#!/bin/bash

# SignNow Integration Setup Script

echo "===== SignNow Integration Setup ====="
echo ""

# Step 1: Create database tables
echo "Step 1: Creating database tables..."
node setup-signnow-tables.js
echo ""

# Step 2: Verify tables were created
echo "Step 2: Verifying tables were created..."
echo "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'signnow%';" > ./verify_tables.sql
node run-sql-file.js ./verify_tables.sql
rm ./verify_tables.sql
echo ""

# Step 3: Provide next steps
echo "Step 3: Next steps..."
echo "1. Configure the webhook in the SignNow developer portal (see signnow-setup-guide.md)"
echo "2. Start your application and test the integration"
echo ""

echo "===== Setup Complete ====="
echo "For detailed instructions, refer to signnow-setup-guide.md"
