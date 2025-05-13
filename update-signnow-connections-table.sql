-- Update the signnow_connections table to include additional fields
ALTER TABLE IF EXISTS signnow_connections 
ADD COLUMN IF NOT EXISTS signnow_user_id TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS name TEXT;
