# SignVault DocuSign Webhook Server

This server handles webhook notifications from DocuSign when documents are signed. It automatically downloads the signed documents and vaults them in SignVault.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the `src/server` directory with the following variables:

```
PORT=3001
VITE_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

The `SUPABASE_SERVICE_KEY` should be a service role key with full access to the database. This is necessary to read and write data to the database on behalf of users.

## Running the Server

### Development

```bash
npm run dev
```

This will start the server with nodemon, which will automatically restart the server when changes are made.

### Production

```bash
npm start
```

## Deployment

For production, you should deploy this server to a service like Vercel, Heroku, or AWS Lambda. Make sure to set the environment variables in your deployment environment.

### Vercel

1. Install the Vercel CLI:

```bash
npm install -g vercel
```

2. Create a `vercel.json` file in the `src/server` directory:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "docusignWebhook.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/docusignWebhook.js"
    }
  ]
}
```

3. Deploy to Vercel:

```bash
vercel
```

### Heroku

1. Install the Heroku CLI:

```bash
npm install -g heroku
```

2. Create a `Procfile` in the `src/server` directory:

```
web: node docusignWebhook.js
```

3. Deploy to Heroku:

```bash
heroku create
git push heroku main
```

## Webhook URL

The webhook URL that DocuSign will send notifications to is:

```
https://your-server-url/api/webhooks/docusign
```

This URL should be configured in the DocuSign Connect settings. The SignVault application will automatically configure this when a user connects their DocuSign account.

## Testing

You can test the webhook by sending a POST request to the webhook URL with a sample payload:

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"event":"envelope-completed","data":{"envelopeId":"12345","accountId":"67890"}}' \
  http://localhost:3001/api/webhooks/docusign
```

## Logs

The server logs all webhook events to the console. In production, you should configure a proper logging solution.
