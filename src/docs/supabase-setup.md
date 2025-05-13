# Supabase Setup Guide for SignVault

This guide explains how to set up the necessary Supabase resources for the SignVault application, including storage buckets and Row Level Security (RLS) policies.

## Storage Buckets Setup

### 1. Create the Documents Bucket

1. Log in to your Supabase dashboard
2. Navigate to Storage in the left sidebar
3. Click "Create Bucket"
4. Enter the following details:
   - Bucket Name: `documents`
   - Public Bucket: Unchecked (private)
   - File Size Limit: 10MB (or your preferred limit)
5. Click "Create Bucket"

### 2. Configure RLS Policies for the Documents Bucket

After creating the bucket, you need to set up RLS policies to control access:

1. Navigate to the "documents" bucket
2. Go to the "Policies" tab
3. Create the following policies:

#### Policy for Authenticated Users to Upload Files

```sql
CREATE POLICY "Users can upload their own documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  -- Extract user_id from the path pattern: vaulted/{user_id}/...
  auth.uid()::text = (storage.foldername(name))[2]
);
```

#### Policy for Authenticated Users to Read Their Own Files

```sql
CREATE POLICY "Users can view their own documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  -- Extract user_id from the path pattern: vaulted/{user_id}/...
  auth.uid()::text = (storage.foldername(name))[2]
);
```

#### Policy for Authenticated Users to Update Their Own Files

```sql
CREATE POLICY "Users can update their own documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  -- Extract user_id from the path pattern: vaulted/{user_id}/...
  auth.uid()::text = (storage.foldername(name))[2]
);
```

#### Policy for Authenticated Users to Delete Their Own Files

```sql
CREATE POLICY "Users can delete their own documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  -- Extract user_id from the path pattern: vaulted/{user_id}/...
  auth.uid()::text = (storage.foldername(name))[2]
);
```

## Database Tables Setup

Run the SQL migration script from `src/db/migrations/01_create_vaulting_tables.sql` in the Supabase SQL Editor to create the necessary tables and RLS policies.

## Environment Variables

Ensure your `.env` file contains the correct Supabase URL and anon key:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Folder Structure

The application uses the following folder structure in the storage bucket:

- `/vaulted/{userId}/{documentId}/{filename}` - Original documents
- `/vaulted/watermarked/{userId}/{documentId}/{filename}` - Watermarked versions

## Testing the Setup

To test if your setup is working correctly:

1. Navigate to the SignVault application
2. Log in with a valid user account
3. Go to the "Vault Document" page
4. Upload a PDF document
5. Check the Supabase Storage dashboard to verify the file was uploaded to the correct path
6. Check the Supabase Database to verify the document metadata was stored

## Troubleshooting

### "Bucket not found" Error

If you encounter a "Bucket not found" error:

1. Verify the bucket name is exactly `documents` (case-sensitive)
2. Check that the bucket was created in the same Supabase project referenced in your environment variables
3. Ensure your Supabase client is initialized correctly in `src/lib/supabase.ts`

### Permission Denied Errors

If you encounter permission errors:

1. Verify the RLS policies are correctly set up
2. Check that the user is authenticated
3. Ensure the file path follows the expected pattern: `vaulted/{userId}/{documentId}/{filename}`
4. Verify the user ID in the path matches the authenticated user's ID

### File Upload Errors

If files fail to upload:

1. Check the file size against your bucket's size limit
2. Verify the file type is supported (PDF, DOC, DOCX)
3. Check browser console for specific error messages
