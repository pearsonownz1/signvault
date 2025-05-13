# SignNow Integration Setup Guide

This guide provides detailed instructions for setting up the SignNow integration with SignVault.

## 1. Configure the Webhook in SignNow Developer Portal

1. **Log in to your SignNow account**
   - Go to [https://app.signnow.com/](https://app.signnow.com/) and log in with your credentials

2. **Access the Developer Portal**
   - Click on your profile icon in the top-right corner
   - Select "Developer Portal" from the dropdown menu
   - If you don't see this option, you may need to contact SignNow support to enable API access for your account

3. **Navigate to Webhooks**
   - In the Developer Portal, find and click on the "Webhooks" section in the left sidebar

4. **Create a New Webhook**
   - Click the "Add Webhook" or "Create New Webhook" button
   - Fill in the following details:
     - **URL**: `https://your-domain.com/api/webhooks/signnow` (replace `your-domain.com` with your actual domain)
     - **Events**: Select "document.completed" from the available options
     - **Format**: Choose "JSON"
     - **Authentication**: Leave as default or select "None" (authentication is handled internally)

5. **Save the Webhook Configuration**
   - Click "Save" or "Create Webhook" to finalize the setup
   - SignNow may send a test event to verify the endpoint is accessible

6. **Verify Webhook Status**
   - The webhook should show as "Active" in the webhooks list
   - You can test the webhook by signing a document in your SignNow account

## 2. Run the Database Setup Script

1. **Open your terminal**
   - Navigate to your project directory: `cd /path/to/signvault`

2. **Run the setup script**
   - Execute the following command:
     ```
     node setup-signnow-tables.js
     ```
   - This script will:
     - Create the `signnow_connections` table to store user connections
     - Create the `signnow_webhook_events` table to log webhook events
     - Set up appropriate indexes and security policies

3. **Verify the tables were created**
   - You can check your database using the Supabase dashboard or by running:
     ```
     node run-sql.js "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'signnow%';"
     ```
   - You should see both `signnow_connections` and `signnow_webhook_events` in the results

## 3. Test the Integration

1. **Start your application**
   - Run your development server: `npm run dev` or equivalent command

2. **Connect a SignNow account**
   - Navigate to the Integrations page in your application
   - Click on "Connect SignNow Account"
   - Follow the OAuth flow to authorize the application

3. **Sign a document in SignNow**
   - Create and sign a document in your SignNow account
   - The webhook should trigger and the document should be automatically vaulted

4. **Verify the document was vaulted**
   - Check the `vault_documents` table in your database
   - Check the `audit_logs` table for the vaulting event
   - Check the `signnow_webhook_events` table for the webhook event

## Troubleshooting

If you encounter issues:

1. **Check the logs**
   - Look for errors in your application logs
   - Check the `signnow_webhook_events` table for any failed events

2. **Verify environment variables**
   - Ensure all SignNow-related environment variables are correctly set in your `.env` file

3. **Test the webhook endpoint**
   - Use a tool like Postman to send a test webhook payload to your endpoint
   - Example payload:
     ```json
     {
       "document_id": "test-document-id",
       "user_id": "test-user-id",
       "event_type": "document.completed"
     }
     ```

4. **Check database connectivity**
   - Verify your application can connect to the database
   - Ensure the Supabase service role key has the necessary permissions
