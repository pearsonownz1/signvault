#!/bin/bash

# Script to add SignNow environment variables to Vercel project

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Vercel CLI is not installed. Installing..."
    npm install -g vercel
fi

# Login to Vercel (if not already logged in)
echo "Logging in to Vercel..."
vercel login

# Get the project name
PROJECT_NAME="signvault"
echo "Using project: $PROJECT_NAME"

# Add environment variables
echo "Adding environment variables to Vercel project..."

# Supabase variables
echo "Adding Supabase variables..."
vercel env add SUPABASE_URL production
vercel env add SUPABASE_SERVICE_KEY production

# SignNow variables
echo "Adding SignNow variables..."
vercel env add SIGNNOW_CLIENT_ID production
vercel env add SIGNNOW_SECRET_KEY production
vercel env add SIGNNOW_REDIRECT_URI production
vercel env add SIGNNOW_AUTH_SERVER production
vercel env add SIGNNOW_API_BASE_URL production

# Deploy the changes
echo "Deploying the changes..."
vercel --prod

echo "Environment variables have been added to your Vercel project!"
